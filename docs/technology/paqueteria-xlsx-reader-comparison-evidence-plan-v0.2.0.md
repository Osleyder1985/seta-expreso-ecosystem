# XLSX Reader Comparison — Evidence Plan v0.2.0

## Purpose

Define the evidence required before selecting an XLSX reader for the Paquetería import pipeline.

## Candidate set

- ExcelJS 4.4.0
- SheetJS CE 0.20.3
- read-excel-file 9.3.10

## Mandatory evidence tracks

| Track | Evidence | Gate |
|---|---|---|
| Structural fidelity | F01–F20 | required |
| Values/types | numbers, dates, errors, blanks | required |
| Formulas | formula + cached result + format | required |
| Workbook structure | sheets, visibility, merged cells | required |
| Provenance | source coordinates/row/cell recoverability | required |
| Determinism | repeated identical input | required |
| Performance | median/p95, warmup, repeated runs | required |
| Memory | RSS plus large-workbook stress | required |
| Robustness | malformed/edge-case XLSX | required |
| Security | dependency tree, advisories, parser resource limits | blocking |
| Supply chain | exact version, lockfile, license, provenance | blocking |
| Real manifests | anonymized production-like samples | required |
| Architecture fit | WorkbookReaderPort compatibility | required |
| Reversibility | adapter isolation and replacement cost | required |

## Interpretation

No global score is permitted. A candidate is acceptable only if it satisfies all mandatory requirements or has an explicitly documented compensating control accepted by an ADR.

Performance is evidence, not the sole selection criterion.

## Current limitation

The repository harness now prepares F01–F20 and records functional/performance evidence when executed. Actual measured results, security scans, dependency lock evidence and anonymized real-manifest evidence must come from execution and review; they must not be inferred from source code.
