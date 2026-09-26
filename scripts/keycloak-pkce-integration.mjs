import { createHash, randomBytes } from 'node:crypto';

const base = process.env.KEYCLOAK_BASE_URL ?? 'http://127.0.0.1:8081';
const issuer = base + '/realms/seta-expreso';
const clientId = 'seta-expreso-web';
const redirectUri = 'http://127.0.0.1:3000/callback';
const adminUser = process.env.KEYCLOAK_ADMIN_USERNAME;
const adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;
const testPassword = randomBytes(24).toString('base64url');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
async function json(response, message) {
  assert(response.ok, message + ': ' + response.status);
  return response.status === 204 ? null : response.json();
}

async function createIntegrationUser() {
  const adminTokenResponse = await fetch(
    base + '/realms/master/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: adminUser,
        password: adminPassword
      })
    }
  );
  const adminToken = await json(adminTokenResponse, 'Keycloak admin authentication failed');
  const userResponse = await fetch(base + '/admin/realms/seta-expreso/users', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + adminToken.access_token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'operator',
      enabled: true,
      email: 'operator@example.invalid',
      emailVerified: true,
      firstName: 'Integration',
      lastName: 'Operator',
      credentials: [{ type: 'password', value: testPassword, temporary: false }]
    })
  });
  assert(userResponse.status === 201, 'Integration user creation failed: ' + userResponse.status);

  const usersResponse = await fetch(
    base + '/admin/realms/seta-expreso/users?username=operator&exact=true',
    { headers: { authorization: 'Bearer ' + adminToken.access_token } }
  );
  const users = await json(usersResponse, 'Integration user lookup failed');
  assert(users.length === 1, 'Integration user lookup returned unexpected result');

  const roleResponse = await fetch(base + '/admin/realms/seta-expreso/roles/operator', {
    headers: { authorization: 'Bearer ' + adminToken.access_token }
  });
  const role = await json(roleResponse, 'Realm role lookup failed');
  const mapping = await fetch(
    base + '/admin/realms/seta-expreso/users/' + users[0].id + '/role-mappings/realm',
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer ' + adminToken.access_token,
        'content-type': 'application/json'
      },
      body: JSON.stringify([role])
    }
  );
  assert(mapping.ok, 'Realm role mapping failed');
  return testPassword;
}

const jar = new Map();
function storeCookies(response) {
  for (const value of response.headers.getSetCookie?.() ?? []) {
    const pair = value.split(';', 1)[0];
    jar.set(pair.split('=', 1)[0], pair);
  }
}
function cookies() { return [...jar.values()].join('; '); }
async function http(url, options = {}) {
  const headers = new Headers(options.headers);
  if (cookies()) headers.set('cookie', cookies());
  const response = await fetch(url, { ...options, headers, redirect: 'manual' });
  storeCookies(response);
  return response;
}

async function main() {
  assert(adminUser && adminPassword, 'Keycloak admin credentials are required');
  const password = await createIntegrationUser();

  const discoveryResponse = await fetch(issuer + '/.well-known/openid-configuration');
  assert(discoveryResponse.ok, 'OIDC discovery failed');
  const metadata = await discoveryResponse.json();

  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('hex');

  const authUrl = new URL(metadata.authorization_endpoint);
  for (const [key, value] of Object.entries({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: 'openid api-audience', state, code_challenge: challenge,
    code_challenge_method: 'S256'
  })) authUrl.searchParams.set(key, value);

  let response = await http(authUrl);
  assert(response.ok || (response.status >= 300 && response.status < 400), 'Authorization endpoint failed');
  if (response.status >= 300 && response.status < 400) {
    const loginUrl = new URL(response.headers.get('location'), base);
    response = await http(loginUrl);
  }
  assert(response.ok, 'Keycloak login page failed');

  const loginUrl = authUrl;
  const html = await response.text();
  const form = html.match(/<form[^>]+action="([^"]+)"[^>]*>/i);
  assert(form, 'Keycloak login form not found');
  const body = new URLSearchParams();
  for (const [, name, value] of html.matchAll(/<input[^>]+type="hidden"[^>]+name="([^"]+)"[^>]+value="([^"]*)"[^>]*>/gi)) body.set(name, value);
  body.set('username', 'operator');
  body.set('password', password);

  response = await http(new URL(form[1].replaceAll('&amp;', '&'), loginUrl), {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  assert(response.status >= 300 && response.status < 400, 'Keycloak login did not redirect');

  const callback = new URL(response.headers.get('location'));
  console.log(JSON.stringify({ callbackOrigin: callback.origin, callbackPath: callback.pathname }));
  assert(callback.origin === new URL(redirectUri).origin, 'Unexpected callback origin');
  assert(callback.searchParams.get('state') === state, 'OIDC state mismatch');
  const code = callback.searchParams.get('code');
  assert(code, 'Authorization code missing');

  const tokenResponse = await fetch(metadata.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', client_id: clientId,
      redirect_uri: redirectUri, code, code_verifier: verifier
    })
  });
  const tokens = await json(tokenResponse, 'Authorization Code + PKCE token exchange failed');
  assert(tokens.access_token, 'Access token missing');

  const api = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api';
  const me = await fetch(api + '/auth/me', { headers: { authorization: 'Bearer ' + tokens.access_token } });
  const principal = await json(me, 'API rejected a valid Keycloak access token');
  assert(principal.subject && principal.roles.includes('operator'), 'API did not map principal/realm role');

  const malformed = await fetch(api + '/auth/me', { headers: { authorization: 'Bearer ' + tokens.access_token + 'x' } });
  assert(malformed.status === 401, 'Malformed token was not rejected');

  console.log(JSON.stringify({
    protocol: 'keycloak-oidc-pkce-integration-v1',
    authorizationCodePkce: 'PASS',
    apiAuthentication: 'PASS',
    roleMapping: 'PASS',
    malformedToken: 'PASS'
  }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
