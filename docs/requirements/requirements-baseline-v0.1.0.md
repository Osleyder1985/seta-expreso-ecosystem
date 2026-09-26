# Requirements Baseline — SETA EXPRESO SURL / Zpress Ecosystem

**Revision:** 0.1.1 — D12 closed; D09 remains open

**Version:** 0.1.0
**Status:** Baseline for engineering traceability
**Date:** 2026-09-26
**Primary issue:** #177
**Scope:** Web + Android + iOS + API/backend; first vertical: Paquetería.

## Purpose

This is the controlled requirements baseline. It links business objectives, system/software requirements, acceptance criteria, domain rules, implementation issues and verification evidence.

Documentation alone never establishes implementation.

## Requirement states

- BASELINED: wording and acceptance intent defined.
- PARTIAL: definition exists but a dependency or decision remains.
- BLOCKED: implementation must not be frozen until the stated blocker is resolved.
- IMPLEMENTED: implementation and reproducible verification evidence exist.
- DEFERRED: intentionally outside the current release.

## Business objectives

| ID | Objective | Evidence |
|---|---|---|
| BO-001 | Digitize the Paquetería lifecycle from manifest ingestion through delivery/return. | End-to-end verification |
| BO-002 | Preserve source information and operational traceability. | Source/hash/lineage tests |
| BO-003 | Detect and manage reception/document discrepancies. | AT-03…AT-05, AT-18…AT-21 |
| BO-004 | Maintain custody, customs and distribution state independently. | State/invariant tests |
| BO-005 | Support address normalization, geolocation and routing. | AT-09, AT-10, route tests |
| BO-006 | Control delivery execution and evidence. | AT-11…AT-16, AT-26 |
| BO-007 | Make critical operations attributable and auditable. | AT-17 and audit tests |

## Paquetería functional requirements

| ID | Requirement | UC | Acceptance | State |
|---|---|---|---|---|
| RF-PQ-001 | Import manifests preserving source file, hash, sheet, rows, columns and original values. | UC-01 | AT-01,02 | BASELINED |
| RF-PQ-002 | Validate manifest structure and row semantics. | UC-02 | AT-01,05 | BASELINED |
| RF-PQ-003 | Record discrepancies without destroying valid source information. | UC-03 | AT-03,04,18…21 | BASELINED |
| RF-PQ-004 | Represent Master AWB, House and PhysicalUnit separately. | UC-04…06 | AT-06 | PARTIAL |
| RF-PQ-005 | Model Person independently from Sender/Recipient roles. | UC-07 | AT-08 | BASELINED |
| RF-PQ-006 | Preserve original address and normalized/validated address. | UC-08 | AT-09 | BASELINED |
| RF-PQ-007 | Resolve versioned geolocation without destroying an address on failure. | UC-09 | AT-10,25 | BASELINED |
| RF-PQ-008 | Record custody/storage movements separately from delivery addresses. | UC-11,13 | AT-22 | BASELINED |
| RF-PQ-009 | Record relevant customs actions without replacing customs authority. | UC-11 | AT-23,24 | PARTIAL |
| RF-PQ-010 | Evaluate distribution eligibility and explain blocking conditions. | UC-11 | AT-15,16,25 | PARTIAL |
| RF-PQ-011 | Plan and execute routes with ordered stops, vehicle and driver. | UC-12,13 | AT-15,16 | BASELINED |
| RF-PQ-012 | Preserve each delivery attempt independently and support retries. | UC-14,16 | AT-11,12 | BASELINED |
| RF-PQ-013 | Record delivery completion and operational POD, including the established mandatory recipient-ID photograph. | UC-15 | AT-13 | BASELINED |
| RF-PQ-014 | Manage returns separately from delivery failure and abandonment. | UC-17 | AT-23 | BASELINED |
| RF-PQ-015 | Register incidents with actor, time, evidence and resolution. | UC-18 | AT-18…21 | BASELINED |
| RF-PQ-016 | Provide authorized end-to-end traceability. | UC-19 | AT-17 | BASELINED |
| RF-PQ-017 | Authorize operations by role, permission, context and object state. | UC-20 | AT-15,16 | PARTIAL |
| RF-PQ-018 | Preserve status-transition history. | UC-20 | AT-15,16 | BASELINED |
| RF-PQ-019 | Audit critical operations with actor, timestamp, object, operation, reason and result. | UC-19 | AT-17 | BASELINED |
| RF-PQ-020 | Support Delivery ↔ House N:M until D09 is operationally closed. | UC-14,15 | AT-26 | BLOCKED |

## Cross-cutting system requirements

| ID | Requirement | Verification | State |
|---|---|---|---|
| SYS-SEC-001 | Protected API operations require server-side authentication. | OIDC integration | IMPLEMENTED |
| SYS-SEC-002 | Authorization is server-side and independent of client controls. | Negative E2E | PARTIAL |
| SYS-SEC-003 | Object-level authorization prevents BOLA/IDOR. | Two-principal tests | BLOCKED by resource API |
| SYS-SEC-004 | Security-sensitive actions are attributable. | Audit-event tests | PARTIAL |
| SYS-DATA-001 | Source business data is not silently overwritten. | Import/domain tests | BASELINED |
| SYS-DATA-002 | Critical historical facts remain reconstructable. | History/traceability tests | BASELINED |
| SYS-API-001 | API contracts are explicit and versioned. | OpenAPI validation | PARTIAL |
| SYS-API-002 | Errors use a stable machine-readable contract. | HTTP tests | PARTIAL |
| SYS-API-003 | Collections use bounded pagination where applicable. | API tests | PARTIAL |
| SYS-FILE-001 | File ingestion enforces type, size and resource limits. | Hostile/oversized tests | OPEN |
| SYS-FILE-002 | File retrieval requires authorization. | Negative access tests | OPEN |
| SYS-MOB-001 | Offline mutations are authenticated and server-authorized. | Replay/sync E2E | OPEN |
| SYS-MOB-002 | Sensitive local data uses secure storage and minimization. | MASVS/MASTG | OPEN |
| SYS-EXT-001 | External provider responses are untrusted input. | Contract/error tests | BASELINED |
| SYS-EXT-002 | Provider failures cannot corrupt valid domain data. | Failure injection | BASELINED |
| SYS-OBS-001 | Security/operational events are observable without secrets. | Redaction/event tests | OPEN |
| SYS-OPS-001 | Backup/restore is tested and reproducible. | Restore drill | OPEN |

## Software quality requirements

| ID | Requirement | Verification |
|---|---|---|
| NFR-SEC-001 | Tokens use explicit issuer, audience and algorithm policy with cryptographic verification. | Unit + real Keycloak |
| NFR-SEC-002 | Secrets are absent from source control. | Secret scanning |
| NFR-SEC-003 | Security workflows use least privilege. | CI policy |
| NFR-SEC-004 | Dependencies receive vulnerability review when repository capability permits. | Dependency Review |
| NFR-PERF-001 | Manifest import has bounded CPU/memory behavior. | Representative benchmark |
| NFR-PERF-002 | Geocoding/routing has bounded timeout/retry behavior. | Integration tests |
| NFR-REL-001 | Specified imports/commands are idempotent. | AT-02 + command tests |
| NFR-REL-002 | Partial failures do not corrupt valid records. | Transaction tests |
| NFR-MAINT-001 | Domain logic remains independent of Keycloak-specific types. | Architecture review |
| NFR-PORT-001 | External providers are replaceable behind ports. | Architecture tests |
| NFR-AUD-001 | Critical transitions are reconstructable from historical facts. | Audit/history tests |

## Security and architecture linkage

Security requirements are governed by the OIDC/RBAC implementation, OWASP ASVS 5.0 baseline, OWASP MASVS v2.x baseline and docs/security/threat-model-v0.1.0.md.

The threat model keeps BOLA/IDOR, hostile XLSX processing, offline replay, audit completeness, rate limiting and mobile local-data protection OPEN until implementation evidence exists.

## Domain traceability

The controlled Paquetería mapping is:

RF-PQ → UC → invariant → event → acceptance test → candidate application contract

Source: docs/domain/paqueteria-traceability-matrix-v0.1.0.md

The candidate application contracts are not yet frozen REST/OpenAPI contracts.

## Acceptance baseline

AT-01 through AT-26 are the current Paquetería acceptance baseline:

- AT-01…05: ingestion, validation and reconciliation.
- AT-06…10: House, persons, addresses and geolocation.
- AT-11…16: attempts, delivery and transitions.
- AT-17: traceability/audit.
- AT-18…21: discrepancies/incidents.
- AT-22…25: custody/customs/geolocation failure.
- AT-26: multiple House per Delivery, conditional on D09.

A test is PASS only with executable evidence.

## Requirement → issue status

| Area | Issue | State |
|---|---:|---|
| OIDC/RBAC | #165 | Core authentication/RBAC on main; authorization audit remains |
| PostgreSQL/PostGIS | #179 | Foundation implemented and merged; production rollout/backup policy remains environment-specific |
| OpenAPI 3.1 | #189 | Controlled contract implementation/validation integrated; domain endpoints remain subject to domain readiness |
| Offline sync | #183 | Architecture/POC; production enforcement pending |
| Object storage | #187 | Architecture/POC; production adapter pending |
| Async jobs | #188 | Architecture/POC; production baseline pending |
| Observability | #184 | Operational baseline integrated; subsystem-specific instrumentation remains incremental |
| Testing strategy | #185 | Work ongoing |
| Threat model | #191 | Integrated on main |
| Dependency Review | #198 | Blocked by GitHub repository capability |
| Requirements baseline | #177 | This document |

## Current blockers to the first production vertical

1. D09 — multiple House per Delivery operational semantics.
2. Exact operational confirmation of House versus child air waybill.
3. Operational/customs catalogs requiring enforcement.
4. Final authorization scope/object ownership model.
5. Executable end-to-end Paquetería acceptance suite.

## Definition of Ready

A requirement is Ready when business intent, actor/authorization context, domain rules, acceptance tests, dependencies, ownership, error behavior and audit requirements are defined.

## Definition of Done

A requirement is Done only when implementation exists, automated verification exists where applicable, negative/security tests exist where applicable, traceability/documentation are synchronized, reproducible evidence exists, and applicable quality gates are satisfied or a documented platform limitation exists.

## Change control

Requirement changes follow:

proposal → impact analysis → decision → baseline update → implementation → test/evidence → traceability update

No implementation may silently reinterpret a baselined requirement.

## Baseline conclusion

This baseline separates business objectives, Paquetería requirements, cross-cutting system requirements, quality requirements, security requirements, acceptance criteria, implementation issues and explicit blockers.

The first vertical is not production-complete. D12 is now a closed operational POD rule; D09 remains an explicit domain constraint. The next engineering step is to close D09 and the remaining operational/catalog decisions before freezing irreversible physical domain rules.
