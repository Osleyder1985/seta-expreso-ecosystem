# XLSX reader comparative analysis — evidence baseline v0.1.0

**Evidence run:** GitHub Actions run #26, Node.js 24.21.0, Ubuntu 24.04 x64  
**Candidates:** ExcelJS 4.4.0; ExcelJS Hardened 5.0.0; SheetJS CE 0.20.3; read-excel-file 9.3.10

## 1. Functional acceptance

F01–F20, 20 contracts per candidate:

| Candidate | PASS | FAIL | ERROR | Deterministic |
|---|---:|---:|---:|---|
| ExcelJS 4.4.0 | 20 | 0 | 0 | 20/20 |
| ExcelJS Hardened 5.0.0 | 20 | 0 | 0 | 20/20 |
| SheetJS CE 0.20.3 | 20 | 0 | 0 | 20/20 |
| read-excel-file 9.3.10 | 1 | 19 | 0 | 20/20 |

The failures for read-excel-file are capability mismatches against this source-fidelity contract, not execution crashes. The most important gaps include workbook/sheet identity, multi-sheet preservation, formula/cached-result preservation, and source-cell fidelity.

## 2. Stress fixtures

Three synthetic stress workbooks were executed:

- ST01: 100,000 rows, 2.81 MB XLSX.
- ST02: 50,000 rows with header at row 6, 1.46 MB.
- ST03: 20,000 rows across two sheets, 0.62 MB.

Approximate median read time / peak RSS delta:

| Candidate | ST01 | ST02 | ST03 |
|---|---|---|---|
| ExcelJS | 1.94 s / 484 MB | 0.94 s / 18 MB | 0.48 s / 9 MB |
| ExcelJS Hardened | 1.90 s / 13 MB | 0.95 s / 19 MB | 0.49 s / 9 MB |
| SheetJS CE | 2.53 s / 108 MB | 1.31 s / 41 MB | 0.51 s / 17 MB |
| read-excel-file | 1.16 s / 42 MB | 0.60 s / 21 MB | 0.30 s / 6 MB |

RSS is process-level observational evidence, not a heap profile. Results are from one controlled CI host and should not be projected directly to the user's Windows host.

## 3. Malformed input

ST04–ST06 are rejected by the strict XLSX container gate for all candidates. The raw SheetJS parser is intentionally recorded separately because it can accept some non-XLSX/corrupted inputs. The production architecture must retain the strict container gate before parser invocation.

## 4. Supply chain

The generated lockfile resolves:

- ExcelJS 4.4.0 — MIT;
- ExcelJS Hardened 5.0.0 — MIT;
- SheetJS CE 0.20.3 — Apache-2.0;
- read-excel-file 9.3.10 — MIT.

`npm audit --omit=dev` reports 3 moderate findings when both ExcelJS variants are installed. The common finding is `uuid@8.3.2`; the audit identifies it as GHSA-w5hq-g745-h8pq. ExcelJS 4.4.0's dependency declaration still requests `uuid ^8.3.0`. The hardened fork patches parser-specific issues but does not eliminate this uuid finding.

## 5. Security

ExcelJS 4.4.0 is affected by the published uncontrolled-resource-consumption advisory for `Workbook.xlsx.load()`, with no upstream patch reported for 4.4.0. This is directly relevant to user-uploaded XLSX ingestion.

ExcelJS Hardened 5.0.0 is a non-upstream fork that specifically introduces parser resource limits and other security hardening. It therefore remains a separate candidate, not an official ExcelJS release.

## 6. Real manifest evidence

The actual Library workbook 649-31382945.xlsx was materialized and structurally inspected without committing it. Verified: one sheet (`Manifiesto`), 134 × 12 cells, metadata rows 1–5, operational header row 6, first data row 7, no merged ranges, no formulas, visible sheet, and mixed string/integer/float/blank values.

Actual parser execution against this private workbook is still a separate privacy-controlled gate; the raw workbook is not copied into GitHub.

## 7. Interpretation

No global score is used.

Current evidence establishes:

- read-excel-file does not satisfy the source-fidelity contract required by the current import model without a substantial adapter/model strategy change.
- ExcelJS and SheetJS satisfy all F01–F20 functional contracts in the current adapter experiment.
- ExcelJS 4.4.0 has a production-relevant parser security blocker unless isolated/limited or replaced.
- ExcelJS Hardened removes the specific parser hardening concern but remains non-upstream and still inherits the audited uuid finding.
- SheetJS satisfies the functional contract but has a distinct supply-chain model because the official Node tarball is distributed from the SheetJS CDN rather than the stale public npm registry.

## 8. Remaining decision gates

1. Execute the redacted/production-like real-manifest probe for all candidates.
2. Review the exact lockfile and audit artifacts.
3. Decide whether parser isolation/resource limits are acceptable.
4. Evaluate provenance/cell-address requirements in the actual `WorkbookReaderPort`.
5. Record the final choice and compensating controls in an ADR.

Until those gates are closed, this document is **evidence baseline, not final technology adoption**.
