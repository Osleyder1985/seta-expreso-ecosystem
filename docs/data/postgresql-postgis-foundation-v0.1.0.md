# PostgreSQL + PostGIS Persistence Foundation — v0.1.0

**Issue:** #179  
**Status:** Foundation implemented; production rollout pending executable environment evidence.

## What is established

The physical foundation separates stable concepts without freezing D09/D12:

- Manifest and source-file provenance.
- TransportDocument → MasterAwb → House → PhysicalUnit.
- Person and Address.
- Versioned Geolocation with PostGIS geography(Point,4326).
- StorageLocation / StorageMovement separate from DeliveryAddress.
- CustomsAction and AbandonmentRecord separate from operational delivery state.
- Route / RouteStop.
- Delivery ↔ House as N:M through DeliveryHouse.
- DeliveryAttempt as append-only history.
- AuditRecord.

## Deliberately not frozen

- final operational equivalence of House and child air waybill;
- business rule for grouping multiple House into one Delivery;
- minimum POD evidence;
- final customs/status catalogs;
- commercial/customer model;
- final authorization ownership scope.

Controlled strings are therefore used for unresolved status/type vocabularies instead of premature database enums.

## Spatial policy

Canonical coordinates use WGS84 / EPSG:4326. PostGIS points use longitude, latitude ordering. Explicit latitude/longitude decimals remain for API/reporting interoperability. The PostGIS geography column has a GiST index.

Prisma represents the PostGIS geography column as an Unsupported field; spatial writes/reads must use controlled SQL at the infrastructure boundary.

## Prisma boundary

Prisma is infrastructure-only. Domain/application code must depend on repository ports rather than generated Prisma types. The runtime client uses Prisma 7's PostgreSQL driver adapter with pg.

## Migration policy

- Development: prisma migrate dev.
- Staging/production: prisma migrate deploy.
- Migrations are source controlled.
- PostGIS SQL is manually reviewed.
- Destructive changes require migration review plus backup/restore evidence.
- prisma db push is not a production migration mechanism.

## Least privilege

Provisioning defines:
- seta_exp_app: runtime DML.
- seta_exp_migrator: controlled migration ownership, credentials external to Git.
- seta_exp_readonly: reporting/read-only.

## Backup / restore baseline

Production must provide base/physical backups or equivalent managed backups, WAL/PITR where justified, encrypted backup storage, isolated restore verification, explicit RPO/RTO, retention and periodic restore drills.

**Current status:** policy only. Executable backup/restore evidence remains OPEN.

## Closure evidence required

#179 must not be closed until all of these are reproducible:
1. clean PostgreSQL + PostGIS environment;
2. migration deploy from empty database;
3. Prisma client generation;
4. application connection through PrismaService;
5. spatial write/read using controlled SQL;
6. constraint/index verification;
7. least-privilege runtime connection;
8. backup and restore drill.

