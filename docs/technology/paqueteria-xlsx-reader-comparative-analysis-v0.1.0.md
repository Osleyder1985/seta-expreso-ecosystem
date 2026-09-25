# XLSX reader comparative analysis — evidence baseline v0.1.0

**Evidence run:** GitHub Actions run #29, Node.js 24.21.0, Ubuntu 24.04 x64  
**Candidates:** ExcelJS 4.4.0; ExcelJS Hardened 5.0.0; SheetJS CE 0.20.3; read-excel-file 9.3.10

## 1. Functional acceptance

F01–F20, 20 contracts per candidate:

| Candidate | PASS | FAIL | ERROR | Deterministic |
|---|---:|---:|---:|---|
| ExcelJS 4.4.0 | 20 | 0 | 0 | 20/20 |
| ExcelJS Hardened 5.0.0 | 20 | 0 | 0 | 20/20 |
| SheetJS CE 0.20.3 | 20 | 0 | 0 | 20/20 |
| read-excel-file 9.3.10 | 19 | 1 | 0 | 20/20 |

The single remaining read-excel-file failure is F10: formula expression + cached result + number-format preservation. The earlier 19 failures were partly caused by the harness adapter shape and were corrected before Run #29; the corrected result is therefore the evidence to use.

## 2. Stress fixtures

Three synthetic stress workbooks were executed, plus three malformed inputs:

- ST01: 100,000 rows, 2.81 MB XLSX.
- ST02: 50,000 rows with header at row 6, 1.46 MB.
- ST03: 20,000 rows across two sheets, 0.62 MB.

Median read time / P95 / maximum observed RSS delta:

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

The private real-manifest evidence already recorded in the project remains separate from the public synthetic fixtures. In addition, eight representative local manifest workbooks were structurally inspected without committing raw data: they span 1–8 sheets, 84–419 maximum rows, 12–23 columns, 0–3 merged ranges and 0–1,829 formula cells. One multi-sheet workbook contains 8 sheets and 1,829 formulas; another contains 2 sheets and 290 formulas. This confirms that the production-like input can require substantially richer workbook metadata than a simple one-sheet table.

Actual parser execution against this private workbook is a separate privacy-controlled gate; the raw workbook is not copied into GitHub.

The real-manifest probe was strengthened to protocol **v0.2.0**. It now:
- detects the operational header row from normalized expected header vocabulary rather than assuming a fixed row number;
- verifies the complete 12-column operational header contract and its order;
- verifies data-row counts, non-empty House identity, numeric/decimal weight behavior and integer quantity behavior;
- verifies destination-code type/counts without emitting literal codes;
- measures repeated-address groups and maximum multiplicity without emitting addresses;
- records privacy-preserving per-cell type/fingerprint data so row fidelity can be compared across readers without publishing PII;
- captures formula metadata only for readers that expose it;
- compares the structural contract across successful reader executions.

The report uses a per-run random HMAC key for sensitive-value fingerprints and never writes the raw cell values, addresses, names, phones, passport/ID values or the hashing key. Therefore the fingerprints are suitable for within-run fidelity comparison, not as public identifiers.

## 7. Interpretation

No global score is used.

Current evidence establishes:

- read-excel-file does not satisfy the source-fidelity contract required by the current import model without a substantial adapter/model strategy change.
- ExcelJS and SheetJS satisfy all F01–F20 functional contracts in the current adapter experiment.
- ExcelJS 4.4.0 has a production-relevant parser security blocker unless isolated/limited or replaced.
- ExcelJS Hardened removes the specific parser hardening concern but remains non-upstream and still inherits the audited uuid finding.
- SheetJS satisfies the functional contract but has a distinct supply-chain model because the official Node tarball is distributed from the SheetJS CDN rather than the stale public npm registry.

## 8. Current technical direction

The current evidence supports **SheetJS CE 0.20.3 as the proposed primary reader**, behind `WorkbookReaderPort`. This is a requirements-and-risk decision, not a benchmark score.

ExcelJS 4.4.0 remains a reference/compatibility candidate but is not proposed as the primary parser for untrusted uploads because of the published uncontrolled-resource-consumption advisory affecting versions <=4.4.0. ExcelJS Hardened 5.0.0 is not a current reproducible candidate in this branch. read-excel-file remains unsuitable for the current structural fidelity contract because F10 remains a reproducible failure.

The proposed decision is recorded in **ADR-XLSX-001** with compensating controls and explicit certification gates.

## 9. Remaining certification gates

1. Execute the privacy-controlled real-manifest probe for the reproducible candidates.
2. Confirm lockfile and exact SheetJS artifact provenance/hash in CI.
3. Implement and test parser resource limits and isolation.
4. Enable GitHub Dependency Graph and rerun SEC-02 Dependency Review.
5. Change ADR-XLSX-001 from Proposed to Accepted only after the gates above are satisfied.

Until then, this document and ADR represent the **current technical direction**, not final production certification.
