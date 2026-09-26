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

async function adminToken() {
  const response = await fetch(
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
  const token = await json(response, 'Keycloak admin authentication failed');
  return token.access_token;
}

async function createWrongAudienceClient(token) {
  const response = await fetch(base + '/admin/realms/seta-expreso/clients', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      clientId: 'seta-expreso-integration-wrong-aud',
      enabled: true,
      protocol: 'openid-connect',
      publicClient: true,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: false,
      redirectUris: ['http://127.0.0.1:3000/callback-wrong']
    })
  });
  assert(response.status === 201, 'Wrong-audience client creation failed: ' + response.status);
  const clients = await json(
    await fetch(base + '/admin/realms/seta-expreso/clients?clientId=seta-expreso-integration-wrong-aud', {
      headers: { authorization: 'Bearer ' + token }
    }),
    'Wrong-audience client lookup failed'
  );
  assert(clients.length === 1, 'Wrong-audience client lookup returned unexpected result');
  const scope = await json(
    await fetch(base + '/admin/realms/seta-expreso/client-scopes', {
      headers: { authorization: 'Bearer ' + token }
    }),
    'Client scope lookup failed'
  );
  const apiScope = scope.find((item) => item.name === 'api-audience');
  assert(apiScope?.id, 'api-audience scope not found');
  const remove = await fetch(
    base + '/admin/realms/seta-expreso/clients/' + clients[0].id + '/default-client-scopes/' + apiScope.id,
    { method: 'DELETE', headers: { authorization: 'Bearer ' + token } }
  );
  assert(remove.status === 204, 'Failed to remove API audience default scope');
  return clients[0].id;
}

async function rotateRealmSigningKey(token) {
  const realm = await json(
    await fetch(base + '/admin/realms/seta-expreso', {
      headers: { authorization: 'Bearer ' + token }
    }),
    'Realm lookup for signing-key rotation failed'
  );
  assert(realm.id, 'Realm internal ID missing');

  const response = await fetch(base + '/admin/realms/seta-expreso/components', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      name: 'integration-rsa-rotation',
      providerId: 'rsa-generated',
      providerType: 'org.keycloak.keys.KeyProvider',
      parentId: realm.id,
      config: {
        priority: ['200'],
        enabled: ['true'],
        active: ['true'],
        keySize: ['2048']
      }
    })
  });
  assert(response.status === 201, 'Real Keycloak signing-key rotation failed: ' + response.status);
}

async function getSigningKids(token) {
  const response = await fetch(base + '/admin/realms/seta-expreso/keys', {
    headers: { authorization: 'Bearer ' + token }
  });
  const metadata = await json(response, 'Key metadata lookup failed');
  const activeKids = Object.values(metadata.active ?? {}).filter((kid) => typeof kid === 'string');
  return new Set([
    ...activeKids,
    ...(metadata.keys ?? []).filter((key) => key.status === 'ACTIVE').map((key) => key.kid)
  ]);
}

async function authorizeAndGetToken(metadata, clientId, redirectUri, password, scopeValue = 'openid api-audience') {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('hex');
  const authUrl = new URL(metadata.authorization_endpoint);
  for (const [key, value] of Object.entries({
    client_id: clientId, redirect_uri: redirectUri, response_type: 'code',
    scope: scopeValue, state, code_challenge: challenge,
    code_challenge_method: 'S256'
  })) authUrl.searchParams.set(key, value);

  let response = await http(authUrl);
  assert(response.ok || (response.status >= 300 && response.status < 400), 'Authorization endpoint failed: ' + response.status);
  let callback;
  for (let redirects = 0; response.status >= 300 && response.status < 400 && redirects < 10; redirects++) {
    const location = response.headers.get('location');
    assert(location, 'Keycloak redirect missing Location header: ' + response.status);
    const nextUrl = new URL(location, response.url);
    if (nextUrl.origin === new URL(redirectUri).origin &&
        nextUrl.searchParams.get('state') === state &&
        nextUrl.searchParams.get('code')) {
      callback = nextUrl;
      break;
    }
    response = await http(nextUrl);
  }

  if (!callback) {
    assert(response.ok, 'Keycloak login page failed: ' + response.status + ' ' + response.statusText + ' ' + (response.url ?? ''));
    const html = await response.text();
    const form = html.match(/<form[^>]+action="([^"]+)"[^>]*>/i);
    assert(form, 'Keycloak login form not found');
    const body = new URLSearchParams();
    for (const [, name, value] of html.matchAll(/<input[^>]+type="hidden"[^>]+name="([^"]+)"[^>]+value="([^"]*)"[^>]*>/gi)) body.set(name, value);
    body.set('username', 'operator');
    body.set('password', password);

    response = await http(new URL(form[1].replaceAll('&amp;', '&'), response.url), {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body
    });
    assert(response.status >= 300 && response.status < 400, 'Keycloak login did not redirect');
    callback = new URL(response.headers.get('location'));
  }

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
  return json(tokenResponse, 'Authorization Code + PKCE token exchange failed');
}

async function main() {
  assert(adminUser && adminPassword, 'Keycloak admin credentials are required');
  const password = await createIntegrationUser();
  const admin = await adminToken();
  const discoveryResponse = await fetch(issuer + '/.well-known/openid-configuration');
  assert(discoveryResponse.ok, 'OIDC discovery failed');
  const metadata = await discoveryResponse.json();

  const tokens = await authorizeAndGetToken(metadata, clientId, redirectUri, password);
  assert(tokens.access_token, 'Access token missing');
  const api = process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api';

  const me = await fetch(api + '/auth/me', { headers: { authorization: 'Bearer ' + tokens.access_token } });
  const principal = await json(me, 'API rejected a valid Keycloak access token');
  assert(principal.subject && principal.roles.includes('operator'), 'API did not map principal/realm role');

  const insufficient = await fetch(api + '/auth/admin-probe', {
    headers: { authorization: 'Bearer ' + tokens.access_token }
  });
  assert(insufficient.status === 403, 'Insufficient role was not rejected');

  const malformed = await fetch(api + '/auth/me', { headers: { authorization: 'Bearer ' + tokens.access_token + 'x' } });
  assert(malformed.status === 401, 'Malformed token was not rejected');

  await createWrongAudienceClient(admin);
  const wrongTokens = await authorizeAndGetToken(
    metadata,
    'seta-expreso-integration-wrong-aud',
    'http://127.0.0.1:3000/callback-wrong',
    password,
    'openid'
  );
  const wrongAudienceResponse = await fetch(api + '/auth/me', {
    headers: { authorization: 'Bearer ' + wrongTokens.access_token }
  });
  assert(wrongAudienceResponse.status === 401, 'Wrong audience token was not rejected');

  const beforeKids = await getSigningKids(admin);
  await rotateRealmSigningKey(admin);

  const rotatedTokens = await authorizeAndGetToken(metadata, clientId, redirectUri, password);
  assert(rotatedTokens.access_token, 'Rotated-key access token missing');
  const rotatedHeader = JSON.parse(Buffer.from(rotatedTokens.access_token.split('.')[0], 'base64url').toString());
  assert(rotatedHeader.kid && !beforeKids.has(rotatedHeader.kid), 'New token was not signed with a new Keycloak signing key');
  const rotatedMe = await fetch(api + '/auth/me', {
    headers: { authorization: 'Bearer ' + rotatedTokens.access_token }
  });
  assert(rotatedMe.ok, 'API failed to refresh JWKS after real Keycloak key rotation');

  console.log(JSON.stringify({
    protocol: 'keycloak-oidc-pkce-integration-v2',
    authorizationCodePkce: 'PASS',
    apiAuthentication: 'PASS',
    roleMapping: 'PASS',
    insufficientRole: 'PASS',
    malformedToken: 'PASS',
    wrongAudience: 'PASS',
    realKeyRotation: 'PASS'
  }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
