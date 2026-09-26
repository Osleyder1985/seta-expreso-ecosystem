# PostgreSQL + PostGIS Persistence Foundation — v0.1.0

**Issue:** #179  
**Status:** Foundation implemented and CI-validated; production rollout/managed-backup evidence remains environment-specific.

## Established

- PostgreSQL persistence through Prisma 7 + `pg`.
- Versioned migration from an empty database.
- PostGIS enabled explicitly.
- `Geolocation.location` uses WGS84 `geography(Point,4326)`.
- GiST spatial index is verified in CI.
- Stable concepts are separated without freezing D09/D12.
- Runtime role baseline is DML-only; migrator ownership is separated from runtime.
- Backup/restore policy is defined.

## Deliberately unresolved

D09, D12, House/child-air-waybill equivalence, final customs/status catalogs, commercial/customer model and final authorization ownership are not frozen by this schema.

## Backup/restore

A reproducible CI drill uses a clean source database, deterministic probe data, `pg_dump`, restore into a second clean database, and verification of the probe after restore.

This proves the repository backup/restore mechanism. It does not prove production RPO/RTO, retention, encryption, off-site storage or PITR; those remain deployment responsibilities.

## Closure

The remaining production evidence is deployment-specific. The repository-level foundation is considered technically complete when the dedicated CI workflow passes.
