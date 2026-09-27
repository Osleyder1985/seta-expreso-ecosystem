# ASVS/MASVS verification addendum — Manifest contextual authorization v0.1.0

**Related:** #176, #221, #223  
**Scope:** first real Paquetería API resource (`Manifest`)  
**Status:** partial implementation evidence; not a claim of full ASVS/MASVS compliance

## Verification matrix

| Control area | Implementation | Verification | Evidence status |
|---|---|---|---|
| Server-side object authorization | `ManifestService` evaluates `AuthorizationService` before read/update | Owner allow, cross-owner deny, archived mutation deny | PASS for Manifest service scope |
| Ownership cannot be client-assigned | `CreateManifestDto` excludes `ownerSubject`; service derives it from authenticated `sub` | Unit test asserts persisted ownerSubject equals principal subject | PASS for Manifest create |
| Collection authorization | Operator list is constrained by `ownerSubject`; admin may list all | Service policy + scoped query | PASS at service level |
| Security decision audit | Sensitive Manifest authorization decisions create `AuditRecord` | Unit/service tests mock and assert persistence path; integration persistence remains required | PARTIAL |
| BOLA/IDOR | UUID resource identifier plus server-side ownership check | Cross-principal Manifest access test | PARTIAL — not yet full multi-principal HTTP E2E |
| Function-level authorization | Auth guard establishes principal; contextual policy checks resource action | Policy unit tests and Manifest service integration | PARTIAL |
| Archived object protection | Authorization policy denies update/cancel/delete/archive for archived resource | Manifest service test verifies update is not persisted | PASS for Manifest mutation path |
| Mobile MASVS | No mobile resource implementation changed | Mobile tests not yet applicable to this server resource | OPEN |

## Security boundary

The control is enforced from the authenticated server principal and persisted domain ownership. Client-supplied object identifiers do not establish authorization. This addresses the first real resource scope of #223; it does not close BOLA/IDOR for the remaining Paquetería resources.

## Remaining evidence

- real HTTP E2E with two distinct principals;
- persistent AuditRecord assertions against PostgreSQL;
- contextual authorization for House, Delivery, Route, POD and Evidence;
- organization-scope enforcement once the identity contract defines an organization claim;
- broader ASVS/MASVS controls already tracked in the main baseline.