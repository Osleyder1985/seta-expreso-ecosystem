# XLSX reader comparison protocol v0.1.0

**Estado:** Propuesto
**Fecha:** 2026-09-25

## Candidates

- ExcelJS 4.4.0
- SheetJS CE 0.20.3
- read-excel-file 9.3.10

Forks are excluded from the first controlled comparison unless a specific maintenance/security justification is documented.

## Experimental design

Each candidate receives the same logical XLSX fixture set F01–F20 and must expose the same adapter contract.

### Functional track

For every fixture:
1. read the workbook;
2. produce ImportSnapshot;
3. canonicalize the snapshot;
4. compare structural, value and provenance invariants;
5. record losses, ambiguities and errors.

### Performance track

Repeat each fixture at least 5 times after one warmup read.

Record median and p95 read time, peak memory, output size, cell count and formula count.

Large-workbook fixtures are tested separately from correctness fixtures.

### Security/supply-chain track

Capture exact package version, package manager and lockfile, dependency tree, audit/scanner output, license, known upstream advisories and maintenance activity.

## Fairness rules

- Same Node.js 24.21.0 baseline.
- Same Windows 11 benchmark host.
- Same fixtures.
- Same repetitions.
- No candidate-specific optimization that changes semantic output.
- Required adapter-specific options must be documented.
- Different fixture sizes are not collapsed into one raw throughput number.

## Acceptance

A candidate is functionally acceptable only when all critical provenance and structural invariants pass.

A candidate can be functionally acceptable yet fail the technology gate because of reproducibility, security, maintenance or resource constraints.

## Current status

No library is selected by this protocol. ExcelJS remains the current PoC adapter only.
