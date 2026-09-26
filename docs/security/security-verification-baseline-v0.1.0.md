# Security Verification Baseline — ASVS 5.0 / MASVS

**Estado:** Baseline de verificación inicial  
**Fecha:** 2026-09-26  
**Issue:** #176

## Objetivo

Convertir las referencias OWASP adoptadas por el Ecosistema en controles verificables. Este documento no declara conformidad ASVS/MASVS; define la evidencia que deberá obtenerse.

## API/Web — controles iniciales

| ID | Control | Evidencia requerida | Estado |
|---|---|---|---|
| SEC-AUTH-01 | Validación criptográfica de tokens OIDC | test de firma/JWKS + issuer | Pendiente |
| SEC-AUTH-02 | Validación de audience/client | tests positivos/negativos | Pendiente |
| SEC-AUTH-03 | Expiración/not-before | tests temporales | Pendiente |
| SEC-AUTHZ-01 | Autorización por operación | tests de roles/policies | Pendiente |
| SEC-AUTHZ-02 | Protección contra acceso a objetos ajenos | tests de IDOR/BOLA | Pendiente |
| SEC-HTTP-01 | ValidationPipe estricto | tests de payloads inválidos | Inicial |
| SEC-HTTP-02 | CORS y security headers | test/integration evidence | Pendiente |
| SEC-HTTP-03 | Rate limiting | test de límites | Pendiente |
| SEC-DATA-01 | Gestión de secretos | revisión de configuración/CI | Pendiente |
| SEC-AUDIT-01 | Auditoría de operaciones sensibles | eventos y tests | Pendiente |
| SEC-ERR-01 | Errores sin fuga de información | contract tests | Pendiente |
| SEC-DEP-01 | Dependencias auditadas | CI Dependency Review + npm audit policy | Pendiente |

## Mobile — MASVS

| ID | Control | Evidencia requerida | Estado |
|---|---|---|---|
| SEC-MOB-01 | Tokens/secretos en almacenamiento seguro | test de secure storage | Pendiente |
| SEC-MOB-02 | No registrar secretos/PII sensible | revisión + tests | Pendiente |
| SEC-MOB-03 | Integridad de sincronización | pruebas de idempotencia/conflicto | Pendiente |
| SEC-MOB-04 | Protección de datos offline | revisión de DB/cache y threat model | Pendiente |

## Supply chain

- versiones fijadas;
- lockfile reproducible;
- Dependency Review;
- auditoría de dependencias;
- permisos mínimos de GitHub Actions;
- secretos fuera del repositorio;
- revisión de scripts de instalación.

## Regla

Un control pasa a **Verificado** sólo cuando existe evidencia reproducible. La ausencia de vulnerabilidades reportadas por una herramienta no equivale por sí sola a conformidad ASVS/MASVS.
