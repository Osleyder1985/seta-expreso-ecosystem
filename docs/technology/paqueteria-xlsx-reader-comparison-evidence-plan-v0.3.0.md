# XLSX Reader Comparison — Evidence Plan v0.3.0

## Purpose

Define the reproducible evidence required before selecting an XLSX reader for the Paquetería import pipeline.

## Candidate set

- ExcelJS 4.4.0
- SheetJS CE 0.20.3
- read-excel-file 9.3.10

## Acceptance protocol

F01–F20 are executable acceptance contracts. Each candidate/fixture pair produces exactly one status:

- **PASS** — the required source invariant is preserved.
- **FAIL** — the parser completes but the current adapter cannot preserve the required invariant.
- **ERROR** — the parser/adapter raises an execution error.

A FAIL is evidence of a capability gap; it is not converted into a performance score.

The contract intentionally tests source fidelity rather than business validation. Header detection, address normalization, geocoding, deduplication and route planning remain downstream domain responsibilities.

## F01–F20 coverage

| Fixture | Required invariant |
|---|---|
| F01 | Basic text, decimal number and address fidelity |
| F02 | Locale-formatted numeric text remains text |
| F03 | Repeated House/package rows remain distinct |
| F04 | Repeated addresses are not silently deduplicated |
| F05 | Phone values remain source text |
| F06 | Latitude/longitude numeric values are preserved |
| F07 | Blank coordinates remain blank |
| F08 | All workbook sheets and names are preserved |
| F09 | Worksheet name is preserved |
| F10 | Formula expression, cached result and number format are preserved |
| F11 | Literal TOTAL row is preserved |
| F12 | Metadata rows before the operational header are preserved |
| F13 | Similar-but-distinct headers remain distinct |
| F14 | Blank data cells do not shift adjacent values |
| F15 | Extra source columns are preserved |
| F16 | SUBTOTAL/TOTAL rows are preserved |
| F17 | Locale numeric text and non-numeric sentinel text remain literal |
| F18 | Repeated House identifiers with distinct row data remain distinct |
| F19 | Minimal valid manifest row is preserved |
| F20 | Accented/case-sensitive header text is preserved |

## Mandatory evidence tracks

| Track | Evidence | Gate |
|---|---|---|
| Structural fidelity | F01–F20 acceptance contract | required |
| Values/types | numbers, text, blanks, coordinates | required |
| Formulas | F10 formula + cached result + format | required |
| Workbook structure | F08–F09, sheet metadata | required |
| Provenance | source row/cell recoverability | required |
| Determinism | repeated identical input and snapshot hashes | required |
| Performance | median/p95, warmup, repeated runs | required |
| Memory | RSS plus stress-workbook execution | required |
| Robustness | malformed/edge-case XLSX execution | required |
| Security | dependency tree, advisories, parser resource limits | blocking |
| Supply chain | exact version, lockfile, license, provenance | blocking |
| Real manifests | anonymized production-like samples | required |
| Architecture fit | WorkbookReaderPort compatibility | required |
| Reversibility | adapter isolation and replacement cost | required |

## Reproducibility

The benchmark is executed by GitHub Actions using Node 24.21.0. The workflow:

1. installs the three candidate readers;
2. generates F01–F20;
3. generates stress fixtures;
4. generates malformed fixtures;
5. executes the acceptance/performance harness;
6. publishes comparison-report.json as a workflow artifact.

The current benchmark package intentionally has no lockfile yet. Therefore the supply-chain gate remains OPEN/BLOCKED until a reviewed lockfile and dependency provenance evidence are committed.

## Interpretation

No global score, ranking or winner is permitted.

A candidate can only be selected when every mandatory requirement is either satisfied or has an explicitly documented compensating control accepted by an ADR. Performance is supporting evidence, not the selection criterion.

## Current limitation

The source repository contains the executable protocol and fixture definitions, but measured CI results, dependency/security scans, lockfile evidence and real-manifest evidence must be obtained from execution/review. They must never be inferred from source code.
