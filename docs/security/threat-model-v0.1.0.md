# Threat Model — SETA EXPRESO SURL / Zpress Ecosystem

**Version:** 0.1.0  
**Status:** Proposed / verification baseline  
**Date:** 2026-09-26  
**Issues:** #191, #193

## 1. Purpose and scope

This living threat model covers Web, Android, iOS, API/backend, OIDC/Keycloak, persistence, XLSX/documents, offline synchronization, geocoding, maps, routing, operational evidence/POD and CI/CD.

It identifies assets, trust boundaries, STRIDE threats, mitigations, residual risks, abuse cases and verification requirements. It does not claim that every mitigation is already implemented.

## 2. Security objectives

| ID | Objective |
|---|---|
| SO-01 | Protected API access requires authenticated principals. |
| SO-02 | Authorization is enforced server-side. |
| SO-03 | Access is constrained by role, scope and business context. |
| SO-04 | Sensitive data is protected in transit, at rest and in logs. |
| SO-05 | File ingestion cannot compromise the parser, worker or persistence layer. |
| SO-06 | Offline synchronization cannot bypass authorization or integrity rules. |
| SO-07 | External providers cannot define application authorization. |
| SO-08 | Security-relevant actions remain attributable and auditable. |
| SO-09 | Abuse controls protect availability. |
| SO-10 | POD/evidence remains associated with the correct business operation and protected from unauthorized modification. |

## 3. Assets

| ID | Asset | Main risk |
|---|---|---|
| A-01 | Identity and subject identifiers | Spoofing/correlation |
| A-02 | Access tokens/sessions | Unauthorized access |
| A-03 | Roles/scopes/policies | Privilege escalation |
| A-04 | Manifest data | Disclosure/tampering |
| A-05 | Package, sender and recipient data | Privacy/disclosure |
| A-06 | Address/geolocation data | Privacy/operational exposure |
| A-07 | Route plans/schedules | Operational exposure |
| A-08 | Delivery/POD evidence | Fraud/repudiation |
| A-09 | XLSX/documents | Parser/resource abuse |
| A-10 | Offline mobile store | Device compromise |
| A-11 | Database | System-wide compromise |
| A-12 | Object/file storage | Disclosure/integrity |
| A-13 | Audit/security logs | Accountability/privacy |
| A-14 | OIDC/JWKS configuration | Authentication trust |
| A-15 | Provider secrets | Infrastructure compromise |
| A-16 | Repository/CI/CD | Supply-chain compromise |

## 4. Trust boundaries

### TB-01 — Client to API

Web, Android and iOS are untrusted from the API perspective. Client-side validation and authorization are not security boundaries.

Controls: TLS, token verification, server-side authorization, input validation, rate limiting, safe errors and audit events.

### TB-02 — API to Keycloak/OIDC

The API trusts cryptographically verified tokens from a configured issuer and expected audience.

Controls: fixed issuer, audience validation, algorithm allowlist, remote JWKS, key rotation handling and controlled configuration.

### TB-03 — API to database

The API is the application trust boundary for persistence.

Controls: parameterized access, least-privilege database credentials, transaction integrity, object-level authorization before access and migration controls.

### TB-04 — API/worker to file storage

Uploaded files and POD evidence cross into storage infrastructure.

Controls: type/content validation, size limits, safe paths, private storage, authorization and integrity metadata.

### TB-05 — API to external geocoding/maps/routing

Providers are outside the application trust domain.

Controls: ports/adapters, data minimization, isolated credentials, timeout/retry policies and response validation.

### TB-06 — Mobile device to offline store

A device is less trusted than the backend.

Controls: secure platform storage, minimal retained data, synchronization authorization, idempotency and replay controls.

### TB-07 — CI/CD to repository/artifacts

Automation can modify or distribute software.

Controls: least privilege, pinned actions, secret scanning, dependency analysis, branch protection and future provenance/SBOM controls.

## 5. Method

Threats use STRIDE:

- S — Spoofing
- T — Tampering
- R — Repudiation
- I — Information disclosure
- D — Denial of service
- E — Elevation of privilege

Priority is qualitative: impact × likelihood × exposure.

## 6. Threat register

| ID | STRIDE | Threat | Risk | Current evidence/mitigation | Residual |
|---|---|---|---|---|---|
| T-01 | S/E | Forged/manipulated access token | Critical | RS256/JWKS, issuer, audience, exp, sub; real Keycloak tests | Reduced |
| T-02 | E | Low-privilege token invokes admin operation | Critical | Global auth + role guard; operator to admin-probe returns 403 | Reduced |
| T-03 | E | BOLA/IDOR exposes another business object | Critical | Resource API not yet implemented completely | OPEN |
| T-04 | D | API/authentication flooding | High | Rate-limit policy not yet implemented | OPEN |
| T-05 | S/T | Wrong issuer/audience/algorithm trust | Critical | Issuer/audience + RS256 allowlist + wrong-audience real test | Reduced |
| T-06 | D | Key rotation causes authentication outage | High | Remote JWKS with bounded cooldown + real rotation test | Reduced |
| T-07 | T/E | Unauthorized manifest/package modification | High | Authorization architecture; resource policy incomplete | OPEN/PARTIAL |
| T-08 | I | Collection endpoint exposes unrelated records | High | Domain/API contracts still evolving | OPEN |
| T-09 | T/E | Hostile XLSX content reaches parser/worker | High | XLSX certification exists; hostile-file limits incomplete | OPEN |
| T-10 | D | XLSX CPU/memory exhaustion | High | Import resource quotas not finalized | OPEN |
| T-11 | I | Private file/evidence exposed by predictable access path | High | Storage architecture exists; final policy pending | OPEN |
| T-12 | I | Excessive address/customer data sent to geocoder | High | Provider abstraction exists | OPEN |
| T-13 | T | Invalid provider response corrupts state | High | Provider boundary planned; response validation pending | OPEN |
| T-14 | I | Stolen device exposes offline data | High | Mobile implementation not mature | OPEN |
| T-15 | T/E | Replayed/forged offline mutation | Critical | Sync protocol concepts exist; server enforcement pending | OPEN |
| T-16 | D/T | Sync conflict causes inconsistent operational state | High | Sync architecture/POC exists | PARTIAL |
| T-17 | T/E | Workflow gains excessive repository privileges | Critical | Workflow permission checks and least privilege | Reduced |
| T-18 | T | Compromised third-party CI action | Critical | Audited workflows pin actions to SHA | Reduced |
| T-19 | I | Secrets leak to logs/artifacts | Critical | Gitleaks/security assurance | Reduced |
| T-20 | R | Security action cannot be attributed | High | Audit architecture exists; complete event coverage pending | OPEN |
| T-21 | I | Logs contain tokens or excessive PII | High | Logging requirements identified; field policy pending | OPEN |
| T-22 | D/I | Missing HTTP security controls enlarge attack surface | High | Headers/CORS/CSP/rate limiting pending | OPEN |
| T-23 | T/E | Client changes protected ownership/security fields | High | Server-side authorization principle | OPEN |
| T-24 | E | Mass assignment changes ownership/tenant fields | Critical | DTO/domain resource model incomplete | OPEN |
| T-25 | T | Concurrency creates invalid business state | High | Transaction strategy planned; invariant tests pending | OPEN |
| T-26 | D | External provider outage cascades into API | Medium/High | Provider abstraction | PARTIAL |
| T-27 | S/E | Revoked role/session remains usable | High | Identity lifecycle exists; API revocation semantics pending | OPEN |
| T-28 | T/R | POD altered or attached to wrong package | Critical | Evidence architecture/governance exists | OPEN/PARTIAL |
| T-29 | I | Route/address data exposed outside operational context | High | Contextual authorization identified | OPEN |
| T-30 | T | Vulnerable dependency enters build | High | Dependency Review blocked by GitHub repository capability | OPEN (#198) |

## 7. Mandatory abuse cases

### AC-01 — Horizontal authorization

A principal authenticated as A requests a resource belonging to B.

Expected: 403 or 404 according to the API disclosure policy, never the protected object.

Status: **OPEN until resource endpoints exist and tests are implemented.**

### AC-02 — Vertical privilege escalation

An operator invokes an administrative endpoint.

Expected: 403.

Status: **VERIFIED** through the real Keycloak integration.

### AC-03 — Audience confusion

A valid token issued for another client is sent to the API.

Expected: 401.

Status: **VERIFIED** through the real Keycloak integration.

### AC-04 — Key rotation

Keycloak emits a token with a new signing key identifier.

Expected: API refreshes JWKS and validates the token.

Status: **VERIFIED** through the real Keycloak integration.

### AC-05 — Hostile XLSX

Malformed, oversized or hostile workbook.

Expected: bounded processing, safe parser behavior, no path traversal/macro execution, controlled error and audit event.

Status: **OPEN**.

### AC-06 — Offline replay

A captured mobile mutation is replayed after synchronization or authorization changes.

Expected: server-side authorization, idempotent handling and replay resistance.

Status: **OPEN**.

## 8. Security requirements derived from the model

1. Every protected resource must define its authorization subject/context.
2. Every mutation must authorize before persistence.
3. Collection queries must enforce authorization in the query/data-access boundary.
4. DTOs must prevent clients from assigning ownership, actor, tenant or security fields unless explicitly permitted.
5. Security-sensitive actions must emit structured audit events.
6. File ingestion must enforce size, type, content and processing-resource limits.
7. External provider responses are untrusted input.
8. Offline commands must be authenticated, authorized, idempotent and replay-resistant where required.
9. Sensitive local mobile data must use platform secure storage and data minimization.
10. Logs must exclude credentials, access tokens and unnecessary personal data.
11. HTTP headers, CORS and rate limiting must be explicit.
12. Security-sensitive architecture changes must update this threat model.

## 9. Risk treatment

| Risk | Treatment |
|---|---|
| BOLA/IDOR | Resource policy + two-principal E2E tests |
| Rate abuse | Endpoint-specific limits, quotas and abuse tests |
| Malicious files | Size/content validation and bounded processing |
| Offline replay | Server authorization + idempotency/replay controls |
| Provider leakage | Data minimization and provider contracts |
| Audit gaps | Structured security-event taxonomy |
| Mobile data exposure | Secure storage + minimization |
| Supply chain | Pinned actions + dependency review + provenance/SBOM |

Risk acceptance requires explicit owner, rationale, mitigation and review/expiry condition.

## 10. Verification plan

| Area | Verification |
|---|---|
| Authentication | Unit + real Keycloak integration |
| Authorization | Unit + positive/negative E2E |
| BOLA | Two-principal resource isolation tests |
| Input validation | DTO/domain negative tests |
| XLSX | Malformed, oversized and hostile-content tests |
| Files | Authorization, traversal, size and content tests |
| Offline | Replay, conflict and idempotency tests |
| Providers | Contract + timeout/error tests |
| Audit | Event completeness + sensitive-field redaction |
| Mobile | MASVS/MASTG mapped tests |
| CI/CD | Permissions, secrets, dependencies and provenance |

## 11. Change triggers

Revisit the model after:

- new domain aggregate/resource;
- new external provider;
- new offline capability;
- new file format/import path;
- new identity/authorization policy;
- new persistence boundary;
- new deployment topology;
- background worker introduction;
- AI processing of business/customer data;
- material data-classification change;
- security incident or significant vulnerability.

## 12. Residual-risk priorities

1. Object-level authorization / BOLA.
2. XLSX hostile-content and resource-exhaustion controls.
3. Offline replay and authorization semantics.
4. Security audit-event completeness.
5. Rate limiting and anti-automation.
6. Mobile local-data protection.
7. Dependency Review / dependency visibility (#198).

These are engineering risks, not claims that exploitation has occurred.

## 13. Traceability

- Architecture baseline: docs/architecture/architecture-baseline.md
- Architecture description: docs/architecture/architecture-description-v0.1.0.md
- Domain model: docs/domain/domain-model-baseline.md
- Security assurance: docs/security/security-assurance-v0.1.0.md
- ASVS/MASVS baseline: docs/security/owasp-asvs-masvs-verification-baseline-v1.md
- OIDC/RBAC: PR #200 / issue #180
- Dependency Review: #198
- Identity architecture: #165
- Threat-model issues: #191 and #193

## 14. Maintenance rule

A security-sensitive change is incomplete until its impact on this model is assessed.

Required flow:

Change → impact analysis → threat update → mitigation/test → evidence → PR.

**Status:** living threat-model baseline. It is not certification or complete security assurance.
