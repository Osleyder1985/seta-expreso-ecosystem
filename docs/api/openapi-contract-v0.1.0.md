# OpenAPI 3.1 Contract — v0.1.0

**Issue:** #189  
**Status:** Implemented baseline; contract is generated from the NestJS route metadata and validated in CI.

## Contract source of truth

The executable NestJS controllers and decorators are the source of truth. CI regenerates and validates the document so the contract cannot silently drift from the implementation.

## Current documented surface

Only implemented endpoints are documented:

- GET /api/health — public health status.
- GET /api/auth/me — authenticated operator principal.
- GET /api/auth/admin-probe — authenticated admin authorization probe.

Paquetería endpoints are intentionally absent until their executable HTTP implementation exists.

## OpenAPI version

The contract is explicitly OpenAPI 3.1.0.

## Authentication

Protected endpoints use HTTP Bearer authentication with JWT access tokens. The runtime OIDC/RBAC implementation remains the authority for token verification and authorization; OpenAPI describes the HTTP contract only.

## Errors

The current baseline documents the authentication and authorization failure classes exposed by the NestJS guards:

- 401 — authentication required or access token rejected.
- 403 — authenticated principal lacks the required role.

Validation and domain-specific error schemas will be expanded as those HTTP contracts are implemented.

## Versioning policy

The current API uses the /api global prefix without a URI version component because no stable public resource contract has yet been released. A breaking public API change must introduce an explicit versioning decision and update the OpenAPI contract, compatibility policy, acceptance tests and clients together.

## Documentation endpoint

Swagger/OpenAPI serving is opt-in through OPENAPI_ENABLED=true. The default is disabled so production deployments do not expose interactive API documentation unless explicitly enabled.

When enabled, the documentation is served below the global /api prefix.

## Validation

CI performs:

1. NestJS build.
2. OpenAPI document generation from the executable application.
3. OpenAPI 3.1 schema validation.
4. Required implemented routes verification.
5. Bearer-security verification on protected operations.
6. Public-health verification.