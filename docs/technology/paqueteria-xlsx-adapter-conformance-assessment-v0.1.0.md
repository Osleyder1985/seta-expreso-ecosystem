# XLSX Adapter Conformance Assessment v0.1.0

Date: 2026-09-27

## Status

Assessment only. This document does not select a production XLSX parser and does not claim completion of F01-F20.

The provider-neutral conformance gate was merged by PR #241.

## Candidate assessment

| Capability | ExcelJS 4.4.0 adapter | read-excel-file 9.3.10 adapter | SheetJS CE 0.20.3 adapter |
|---|---|---|---|
| WorkbookReaderPort | Implemented | Implemented | Implemented |
| Source byte limit | Implemented | Implemented | Implemented |
| Sheet limit | Implemented | Implemented | Implemented |
| Row limit | Implemented | Not implemented in adapter | Implemented |
| Cell limit | Implemented | Not implemented in adapter | Implemented |
| Visible sheets | Preserved | Returned as visible | Preserved |
| Hidden sheets | Preserved | Not preserved | Preserved |
| Very hidden sheets | Preserved | Not preserved | Preserved |
| Formula expression | Preserved | Not preserved | Preserved |
| Formula result/cache | Preserved when exposed | Not preserved | Preserved when exposed |
| Number format | Preserved | Not preserved | Preserved |
| Error cell type | Mapped | Not preserved explicitly | Mapped |
| Cell provenance/address | Preserved | Preserved | Preserved |
| Repeated source observations | Preserved | Preserved | Preserved |

## Interpretation

These observations are derived from the experimental adapter implementations and their existing executable tests. They are not a substitute for running the common F01-F20 evidence fixture through each real adapter.

A GAP in the table means the current adapter implementation does not expose the required information through the provider-neutral contract. It does not by itself establish that the underlying library cannot provide the information.

## Next certification steps

1. Execute the common conformance gate against generated XLSX inputs for each adapter.
2. Record reproducible PASS/GAP/NOT EXECUTED results for F01-F20.
3. Execute resource-limit and large-workbook probes.
4. Verify end-to-end provenance fields.
5. Complete the privacy-preserving real-manifest probe tracked by #152.
6. Review dependency tree, lockfile, vulnerabilities and maintenance.
7. Update the decision record only after the evidence gates are complete.

Related: #228, #241, #243, #152, #198.
