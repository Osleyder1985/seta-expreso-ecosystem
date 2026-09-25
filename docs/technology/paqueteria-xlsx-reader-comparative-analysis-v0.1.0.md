# XLSX reader comparative analysis — evidence baseline v0.1.0

**Evidence baseline:** GitHub Actions run #29, Node.js 24.21.0, Ubuntu 24.04 x64  
**Current reproducible candidates:** ExcelJS 4.4.0; SheetJS CE 0.20.3; read-excel-file 9.3.10  
**Historical experimental candidate:** ExcelJS Hardened 5.0.0 (Run #29 only; not reproducible/current in this branch)

## 1. Functional acceptance

F01–F20 were executed for the candidates available in Run #29:

| Candidate | PASS | FAIL | ERROR | Deterministic |
|---|---:|---:|---:|---|
| ExcelJS 4.4.0 | 20 | 0 | 0 | 20/20 |
| ExcelJS Hardened 5.0.0* | 20 | 0 | 0 | 20/20 |
| SheetJS CE 0.20.3 | 20 | 0 | 0 | 20/20 |
| read-excel-file 9.3.10 | 19 | 1 | 0 | 20/20 |

*Historical Run #29 evidence only. ExcelJS Hardened 5.0.0 is not currently pinned in package.json, no reproducible source/artifact has been established in the current branch, and it must not be treated as an available production candidate.

The single remaining read-excel-file failure is F10: formula expression + cached result + number-format preservation. The earlier 19 failures were partly caused by the harness adapter shape and were corrected before Run #29; the corrected result is therefore the evidence to use.

## 2. Stress fixtures

Three synthetic stress workbooks were executed, plus three malformed inputs:

- ST01: 100,000 rows, 2.81 MB XLSX.
- ST02: 50,000 rows with header at row 6, 1.46 MB.
- ST03: 20,000 rows across two sheets, 0.62 MB.

Historical Run #64 performance observations:

| Candidate | ST01 | ST02 | ST03 |
|---|---|---|---|
| ExcelJS 4.4.0 | 2.235 s median / 541.6 MiB maxRSS | 1.419 s / 391.0 MiB | 0.927 s / 247.4 MiB |
| SheetJS CE 0.20.3 | 2.959 s / 419.8 MiB | 1.728 s / 246.1 MiB | 0.891 s / 168.1 MiB |
| read-excel-file 9.3.10 | 1.545 s / 262.4 MiB | 0.974 s / 202.2 MiB | 0.645 s / 148.9 MiB |

These are process-level observations from controlled CI executions and are supporting evidence only; they are not a score or ranking and must not be projected directly to the user's Windows host. The current benchmark protocol also records process maximum RSS rather than the older Run #29 delta-RSS presentation, so the historical measurements must not be mixed as if they were identical metrics.

## 3. Malformed input

ST04–ST06 are handled by the strict XLSX container/resource gate. ST06 is rejected before parser invocation because its first four bytes are not the XLSX ZIP signature. ST04/ST05 are expected parser/container rejections.

Malformed-input behavior is supporting robustness evidence, not a ranking score. The production architecture must retain the strict container gate before parser invocation.

## 4. Supply chain

The generated lockfile resolves:

- ExcelJS 4.4.0 — MIT;
- SheetJS CE 0.20.3 — Apache-2.0;
- read-excel-file 9.3.10 — MIT.

The historical Run #29 experiment also installed ExcelJS Hardened 5.0.0 and recorded MIT licensing, but that package is not part of the current reproducible dependency set.

The historical npm audit reported 3 moderate findings associated with the experimental dependency set, including uuid@8.3.2. Supply-chain conclusions must be regenerated against the current lockfile before production certification.

## 5. Security

ExcelJS 4.4.0 is affected by the published uncontrolled-resource-consumption advisory for `Workbook.xlsx.load()`, with no upstream patch reported for 4.4.0. This is directly relevant to user-uploaded XLSX ingestion.

ExcelJS Hardened 5.0.0 was a non-upstream experimental fork intended to add parser resource limits and other hardening. Because its source/artifact provenance is not reproducible in the current branch, it is retained only as historical evidence and is not a production option.

## 6. Real manifest evidence

The private real-manifest evidence recorded in the project remains separate from the public synthetic fixtures. Representative local manifest workbooks span 1–8 sheets, 84–419 maximum rows, 12–23 columns, 0–3 merged ranges and 0–1,829 formula cells. This confirms that production-like input can require substantially richer workbook metadata than a simple one-sheet table.

The reference real workbook `649-31382945.xlsx` has:

- 1 sheet (`Manifiesto`);
- 134 total rows × 12 columns;
- operational header on row 6;
- 127 operational package rows (rows 7–133);
- one trailing total row (row 134), which must not be imported as a package;
- 70 unique addresses;
- 34 repeated-address groups;
- maximum address multiplicity of 5;
- 127 numeric weight cells, including 117 decimal values;
- 0 formula cells.

The reader must preserve source rows; a separate structural interpreter decides which rows are operational packages, totals/subtotals, metadata or anomalies. Repeated addresses are not collapsed into packages: geocoding should deduplicate normalized addresses independently from package-row identity.

Actual parser execution against the private workbook is a separate privacy-controlled gate; the raw workbook must not be copied into GitHub.

The real-manifest probe was strengthened to protocol **v0.2.0**. It now:
- detects the operational header row from normalized expected header vocabulary rather than assuming a fixed row number;
- verifies the complete 12-column operational header contract and its order;
- verifies data-row counts, non-empty House identity, numeric/decimal weight behavior and integer quantity behavior;
- verifies destination-code type/counts without emitting literal codes;
- measures repeated-address groups and maximum multiplicity without emitting addresses;
- records privacy-preserving per-cell type/fingerprint data so row fidelity can be compared across readers without publishing PII;
- captures formula metadata only for readers that expose it;
- compares the structural contract across successful reader executions;
- retains source-row fingerprints so non-operational rows such as trailing totals are not silently discarded.

The report uses a per-run random HMAC key for sensitive-value fingerprints and never writes raw cell values, addresses, names, phones, passport/ID values or the hashing key. Therefore fingerprints are suitable for within-run fidelity comparison, not as public identifiers.

## 7. Interpretation

No global score is used.

Current evidence establishes:

- read-excel-file does not satisfy the source-fidelity contract required by the current import model without a substantial adapter/model strategy change.
- ExcelJS and SheetJS satisfy all F01–F20 functional contracts in the current adapter experiment.
- ExcelJS 4.4.0 has a production-relevant parser security blocker unless isolated/limited or replaced.
- The historical ExcelJS Hardened experiment cannot currently be reproduced and therefore cannot support a production selection.
- SheetJS satisfies the functional contract but has a distinct supply-chain model because the official Node tarball is distributed from the SheetJS CDN rather than the stale public npm registry.

## 8. Current technical direction

The current evidence supports **SheetJS CE 0.20.3 as the proposed primary reader**, behind `WorkbookReaderPort`. This is a requirements-and-risk decision, not a benchmark score.

ExcelJS 4.4.0 remains a reference/compatibility candidate but is not proposed as the primary parser for untrusted uploads because of the published uncontrolled-resource-consumption advisory affecting versions <=4.4.0.

ExcelJS Hardened 5.0.0 is historical/non-reproducible in the current branch and is therefore excluded from the current production candidate set.

read-excel-file remains unsuitable for the current structural fidelity contract because F10 remains a reproducible failure.

The proposed decision is recorded in **ADR-XLSX-001** with compensating controls and explicit certification gates.

## 9. Remaining certification gates

1. Execute the privacy-controlled real-manifest probe for the reproducible candidates.
2. Confirm lockfile and exact SheetJS artifact provenance/hash in CI.
3. Implement and test parser resource limits and isolation.
4. Enable GitHub Dependency Graph and rerun SEC-02 Dependency Review.
5. Reconcile the final `WorkbookModel` / structural-interpreter contract against the real manifest, including trailing total rows.
6. Change ADR-XLSX-001 from Proposed to Accepted only after the gates above are satisfied.

Until then, this document and ADR represent the **current technical direction**, not final production certification.
