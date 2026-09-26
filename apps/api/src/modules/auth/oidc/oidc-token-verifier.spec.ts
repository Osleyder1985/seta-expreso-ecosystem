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
  it('rejects an expired RS256 token', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256');
    const jwk = await exportJWK(publicKey);
    jwk.kid = 'expired-key';
    const previousFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ keys: [jwk] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })) as typeof fetch;

    try {
      const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', kid: 'expired-key' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject('user-expired')
        .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
        .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
        .sign(privateKey);

      await expect(new OidcTokenVerifier().verify(token)).rejects.toThrow(
        'Invalid access token',
      );
    } finally {
      globalThis.fetch = previousFetch;
    }
  });


  it('refreshes JWKS when a token uses a newly rotated key', async () => {
    const first = await generateKeyPair('RS256');
    const second = await generateKeyPair('RS256');
    const firstJwk = await exportJWK(first.publicKey);
    const secondJwk = await exportJWK(second.publicKey);
    firstJwk.kid = 'rotation-key-1';
    secondJwk.kid = 'rotation-key-2';

    let fetchCount = 0;
    const previousFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      fetchCount += 1;
      const keys = fetchCount === 1 ? [firstJwk] : [firstJwk, secondJwk];
      return new Response(JSON.stringify({ keys }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;

    try {
      const verifier = new OidcTokenVerifier();
      const token1 = await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', kid: 'rotation-key-1' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject('rotation-1')
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(first.privateKey);

      const token2 = await new SignJWT({})
        .setProtectedHeader({ alg: 'RS256', kid: 'rotation-key-2' })
        .setIssuer(issuer)
        .setAudience(audience)
        .setSubject('rotation-2')
        .setIssuedAt()
        .setExpirationTime('5m')
        .sign(second.privateKey);

      await expect(verifier.verify(token1)).resolves.toMatchObject({ subject: 'rotation-1' });
      await expect(verifier.verify(token2)).resolves.toMatchObject({ subject: 'rotation-2' });
      expect(fetchCount).toBeGreaterThanOrEqual(2);
    } finally {
      globalThis.fetch = previousFetch;
    }
  });

});
