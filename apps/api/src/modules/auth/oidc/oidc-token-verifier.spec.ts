import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { OidcTokenVerifier } from './oidc-token-verifier';

describe('OidcTokenVerifier', () => {
  const issuer = 'https://keycloak.example/realms/seta-expreso';
  const audience = 'seta-expreso-api';

  beforeEach(() => {
    process.env.OIDC_ISSUER = issuer;
    process.env.OIDC_AUDIENCE = audience;
  });

  afterEach(() => {
    delete process.env.OIDC_ISSUER;
    delete process.env.OIDC_AUDIENCE;
  });

  it('accepts a valid RS256 token and maps Keycloak roles and scopes', async () => {
    const { publicKey, privateKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = 'test-key';
    const previousFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ keys: [jwk] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })) as typeof fetch;

    try {
      const token = await new SignJWT({
        preferred_username: 'operator',
        scope: 'packages:read packages:write',
        realm_access: { roles: ['operator'] },
        resource_access: { [audience]: { roles: ['manifest:read'] } },
      })
        .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject('user-123')
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(privateKey);

      const principal = await new OidcTokenVerifier().verify(token);

      expect(principal.subject).toBe('user-123');
      expect(principal.username).toBe('operator');
      expect(principal.roles).toEqual(['operator', 'manifest:read']);
      expect(principal.scopes).toEqual(['packages:read', 'packages:write']);
    } finally {
      globalThis.fetch = previousFetch;
    }
  });

  it('rejects a token with an unexpected audience', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = 'unused';
    const previousFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ keys: [jwk] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })) as typeof fetch;

    try {
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', kid: 'unused' })
        .setIssuer(issuer)
        .setAudience('wrong-audience')
        .setSubject('user-123')
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(privateKey);

      await expect(new OidcTokenVerifier().verify(token)).rejects.toThrow(
        'Invalid access token',
      );
    } finally {
      globalThis.fetch = previousFetch;
    }
  });
});
