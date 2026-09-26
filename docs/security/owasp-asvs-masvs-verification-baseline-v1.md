# OWASP ASVS 5.0 / MASVS Verification Baseline

**Baseline:** v1.0 — 2026-09-26  
**Scope:** SETA EXPRESO SURL / Zpress ecosystem — Web, API, Android, iOS, Keycloak, CI/CD and security-sensitive infrastructure.  
**Standards:** OWASP ASVS 5.0.0 and OWASP MASVS v2.x.  
**Evidence rule:** A control is not considered PASS from documentation alone. PASS requires implementation evidence plus a reproducible test, configuration inspection, or other explicit verification artifact.

## 1. Verification model

Every row follows:

**Control → implementation → test/verification → evidence → status**

Status values:
- **PASS** — implementation and verification evidence exist.
- **PARTIAL** — part of the control is evidenced, but the complete requirement is not.
- **OPEN** — requirement is applicable but implementation/evidence is still pending.
- **N/A** — not applicable to the current architecture, with a documented reason.

The matrix is intentionally scoped to controls relevant to the current ecosystem stage. It is not a claim of full ASVS/MASVS compliance.

## 2. ASVS 5.0 — current verified baseline

| Control | Requirement focus | Implementation / evidence | Test / verification | Status |
|---|---|---|---|---|
| v5.0.0-V9.1.1 | Validate self-contained token signature | `OidcTokenVerifier` uses `jwtVerify` with remote JWKS | OIDC real integration + crypto unit tests | PASS |
| v5.0.0-V9.1.2 | Algorithm allowlist; reject `none` / confusion | RS256 explicitly configured | Unit + real Keycloak token verification | PASS |
| v5.0.0-V9.1.3 | Trusted token key source | JWKS URL derives only from configured OIDC issuer; no token-controlled `jku/x5u/jwk` source | Code inspection + real Keycloak JWKS | PASS |
| v5.0.0-V9.2.1 | Validate token validity period | JWT verification validates expiration | Expired-token unit test | PASS |
| v5.0.0-V9.2.3 | Validate audience | API validates configured audience | Real wrong-audience Keycloak token returns 401 | PASS |
| v5.0.0-V10.1.2 | Bind authorization response to initiated transaction | PKCE verifier + state validation in integration harness | Real Authorization Code + PKCE S256 flow | PASS |
| v5.0.0-V10.2.1 | Protect OAuth code flow from browser request forgery | PKCE S256 and state | Real Keycloak Authorization Code + PKCE test | PASS |
| v5.0.0-V10.3.1 | Resource server accepts only intended audience | `OIDC_AUDIENCE` validation | Real wrong-audience gate: 401 | PASS |
| v5.0.0-V10.3.2 | Authorization based on delegated token claims | Principal maps `sub`, roles and scopes; RBAC guard enforces permissions | Real role mapping + insufficient-role 403 | PASS |
| v5.0.0-V10.3.3 | Stable subject identity | Internal principal is derived from issuer + subject and is decoupled from Keycloak model | Real `sub` mapping test | PASS |
| v5.0.0-V10.4.1 | Exact registered redirect URI policy | Keycloak clients are provisioned with explicit callback URIs | Real browser-like authorization flow | PARTIAL |
| v5.0.0-V8.2.1 | Function-level authorization | `@Roles(...)` + server-side RBAC guard | Operator token against admin endpoint → 403 | PASS |
| v5.0.0-V8.2.2 | Object/data-level authorization (BOLA/IDOR) | Domain object authorization is not yet implemented for all resources | Dedicated object-level tests pending | OPEN |
| v5.0.0-V8.3.1 | Authorization at trusted service layer | Global API guards, not client-side checks | E2E authorization boundary tests | PASS |
| v5.0.0-V2.2.2 | Trusted service-layer input validation | API validation baseline exists, but complete domain coverage is pending | Domain/API validation suite expansion | PARTIAL |
| v5.0.0-V2.4.1 | Anti-automation / excessive-call protection | Rate-limit policy not yet established globally | Rate-limit tests pending | OPEN |
| v5.0.0-V3.4.1 | HSTS | Production web security posture not yet finalized | Header integration test pending | OPEN |
| v5.0.0-V3.4.2 | Restricted/allowlisted CORS | Final web/API origin policy pending | CORS negative/positive tests pending | OPEN |
| v5.0.0-V3.4.3 | CSP | Production web frontend not yet finalized | Header/CSP test pending | OPEN |
| v5.0.0-V3.4.4 | `nosniff` | Final HTTP security-header baseline pending | Header test pending | OPEN |
| v5.0.0-V7.x | Security/audit logging | Audit trail design exists as a project concern; complete security-event coverage is pending | Authentication/authorization audit tests pending | OPEN |
| v5.0.0-V5.2.x | Secure file/XLSX acceptance | XLSX import is under active development; file limits/content validation need security gates | Malformed/oversized/malicious-file tests pending | OPEN |
| v5.0.0-V6.1.1 | Authentication attack protections | Authentication is delegated to Keycloak; rate limiting/adaptive-response policy still needs explicit verification | Keycloak/API auth abuse tests pending | PARTIAL |

### ASVS evidence anchors

- OIDC implementation: `apps/api/src/modules/auth/oidc/`
- Authentication/RBAC controller: `apps/api/src/modules/auth/auth.controller.ts`
- Real Keycloak harness: `scripts/keycloak-pkce-integration.mjs`
- Keycloak realm: `infra/keycloak/realm-seta-expreso.json`
- CI: `.github/workflows/keycloak-oidc-integration.yml`
- Unit verification: `apps/api/src/modules/auth/oidc/oidc-token-verifier.spec.ts`

The latest real Keycloak CI gate produced:

```json
{
  "protocol": "keycloak-oidc-pkce-integration-v2",
  "authorizationCodePkce": "PASS",
  "apiAuthentication": "PASS",
  "roleMapping": "PASS",
  "insufficientRole": "PASS",
  "malformedToken": "PASS",
  "wrongAudience": "PASS",
  "realKeyRotation": "PASS"
}
```

## 3. MASVS — mobile security baseline

The Android and iOS applications are not yet at a mature implementation/testing stage. Therefore the mobile baseline records requirements now, but does not claim PASS before the mobile implementations and platform tests exist.

| Control | Requirement | Implementation / verification target | Status |
|---|---|---|---|
| MASVS-STORAGE-1 | Securely store sensitive data | Android Keystore / iOS Keychain; no sensitive plaintext storage | OPEN |
| MASVS-STORAGE-2 | Prevent sensitive-data leakage | Logs, backups, screenshots, clipboard and exported files reviewed | OPEN |
| MASVS-CRYPTO-1 | Use strong cryptography correctly | Platform cryptography APIs; algorithm inventory and tests | OPEN |
| MASVS-CRYPTO-2 | Secure key generation/storage/access | Platform keystore/keychain + lifecycle tests | OPEN |
| MASVS-AUTH-1 | Authenticate/authorize app components | OIDC/PKCE client integration + component exposure tests | OPEN |
| MASVS-AUTH-2 | Secure local authentication | Platform biometric/secure-lock controls where used | OPEN |
| MASVS-AUTH-3 | Protect sensitive functionality after authentication/session changes | Logout/session invalidation + step-up policy tests | OPEN |
| MASVS-NETWORK-1 | Secure all network traffic | TLS-only networking, platform validation, no insecure fallback | OPEN |
| MASVS-NETWORK-2 | Identity pinning where applicable | Decide per controlled endpoint; document exceptions | OPEN |
| MASVS-PLATFORM-1 | Secure platform interaction/deep links | App/universal links, exported components and IPC tests | OPEN |
| MASVS-CODE-3 | Secure APIs/dependencies/build configuration | SAST, dependency/SBOM, compiler/build hardening | OPEN |
| MASVS-CODE-4 | Validate/sanitize untrusted input | Client-side validation plus trusted API validation | OPEN |
| MASVS-RESILIENCE-1 | Address reverse-engineering/tampering requirements | Profile selected after threat model; platform tests | OPEN |
| MASVS-PRIVACY-1 | Minimize sensitive data/resource access | Permission/data inventory and privacy review | OPEN |
| MASVS-PRIVACY-2..4 | Prevent identification, transparency, user control | Privacy requirements and UX/data lifecycle controls | OPEN |

## 4. Verification workflow

1. **Requirement selection:** pin the standard version and control ID.
2. **Implementation mapping:** identify exact source/configuration paths.
3. **Test mapping:** identify unit, integration, E2E, static, dynamic or manual verification.
4. **Evidence capture:** CI run, test result, configuration snapshot, artifact or manual verification record.
5. **Status assignment:** PASS/PARTIAL/OPEN/N/A; never infer PASS from absence of a finding.
6. **Change impact:** security-sensitive changes must update the affected matrix rows and tests.
7. **Release gate:** applicable OPEN L1 controls block the relevant release/security milestone until explicitly accepted as risk or implemented.

## 5. Current gaps intentionally tracked

The baseline exposes, rather than hides, the remaining work:

- API object-level authorization / BOLA.
- API and authentication rate limiting / anti-automation.
- Complete security headers/CORS/CSP verification.
- Security-event audit logging coverage.
- Secure XLSX/file handling limits and malicious-content controls.
- Android/iOS secure storage, network, authentication, platform and privacy verification.
- Mobile MASTG/MASWE test mapping.
- Dependency Review remains blocked by the repository's GitHub capability/configuration state and is tracked separately in #198.

## 6. Standard references

- OWASP ASVS 5.0.0: https://owasp.org/www-project-application-security-verification-standard/
- OWASP ASVS requirements source: https://github.com/OWASP/ASVS/tree/v5.0.0/5.0
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP MASVS testing guidance: https://mas.owasp.org/MASTG/
- OWASP MASWE v1.0.0: https://mas.owasp.org/MASWE/

**Important:** This document establishes the verification baseline and traceability model. It does **not** declare the ecosystem ASVS/MASVS compliant. Compliance claims require all applicable rows to reach PASS with reproducible evidence.
