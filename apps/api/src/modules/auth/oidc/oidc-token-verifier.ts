import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { AuthPrincipal } from '../auth.types';

@Injectable()
export class OidcTokenVerifier {
  private readonly issuer = process.env.OIDC_ISSUER;
  private readonly audience = process.env.OIDC_AUDIENCE;
  private readonly jwks = this.issuer
    ? createRemoteJWKSet(new URL(this.issuer + '/protocol/openid-connect/certs'))
    : undefined;

  async verify(accessToken: string): Promise<AuthPrincipal> {
    if (!this.issuer || !this.audience || !this.jwks) {
      throw new UnauthorizedException('OIDC authentication is not configured');
    }

    try {
      const { payload } = await jwtVerify(accessToken, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: ['RS256'],
      });
      return this.toPrincipal(payload);
    } catch (error) {
      if (process.env.OIDC_DEBUG === 'true') {
        console.error('[OIDC_DEBUG]', error instanceof Error ? error.message : error);
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private toPrincipal(payload: JWTPayload): AuthPrincipal {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    const realmRoles = this.readRoles(payload.realm_access);
    const resourceAccess = this.readResourceAccess(payload.resource_access);
    const clientRoles = this.audience
      ? resourceAccess[this.audience] ?? []
      : [];

    return {
      subject: payload.sub,
      username: typeof payload.preferred_username === 'string'
        ? payload.preferred_username
        : undefined,
      roles: [...new Set([...realmRoles, ...clientRoles])],
      scopes: typeof payload.scope === 'string'
        ? payload.scope.split(' ').filter(Boolean)
        : [],
      claims: payload as Record<string, unknown>,
    };
  }

  private readRoles(value: unknown): string[] {
    if (!value || typeof value !== 'object' || !('roles' in value)) return [];
    const roles = (value as { roles?: unknown }).roles;
    return Array.isArray(roles) ? roles.filter((role): role is string => typeof role === 'string') : [];
  }

  private readResourceAccess(value: unknown): Record<string, string[]> {
    if (!value || typeof value !== 'object') return {};
    const result: Record<string, string[]> = {};
    for (const [client, entry] of Object.entries(value)) {
      result[client] = this.readRoles(entry);
    }
    return result;
  }
}
