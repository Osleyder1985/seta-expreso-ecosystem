# Real-manifest fixture profile — 649-31382945

**Source:** anonymized structural inspection of the Library workbook `649-31382945.xlsx`  
**Purpose:** define a production-like acceptance fixture without committing personal data to Git.

## Observed workbook structure

- One worksheet: `Manifiesto`.
- 134 rows and 12 columns in the inspected workbook.
- Metadata occupies rows 1–5.
- Canonical tabular header is row 6.
- Data begins at row 7.
- Header contains 12 operational columns.
- Workbook therefore explicitly exercises the requirement that the reader must not assume row 1 is the header.
- Numeric fields include decimal weights and integer counts.
- Address, recipient, telephone and destination-code columns are textual.
- Repeated addresses occur across multiple House records.
- Destination codes are textual and must be preserved without interpretation.
- The workbook contains no requirement that every sheet be a canonical data sheet; sheet identification remains part of inspection.

## Acceptance implications

A candidate reader must preserve enough information to support:

1. header-row detection at row 6;
2. workbook/sheet identity;
3. row/cell provenance;
4. numeric values without destructive coercion;
5. textual identifiers;
6. formulas/cached results where present in other fixtures;
7. repeated addresses without accidental deduplication;
8. destination codes exactly as declared;
9. distinction between workbook metadata and operational rows.

## Privacy

No real recipient names, identity numbers, telephone numbers or addresses are committed to the repository. This document records only structural properties and acceptance criteria.

## Required next experiment

The exact workbook should be processed locally by each candidate adapter after the dependency lock is established. The resulting reports must be anonymized before repository publication.


## Raw-byte inspection completed locally

The Library workbook was materialized and inspected without committing it to Git. Verified properties:

- worksheet: `Manifiesto`;
- dimensions: 134 rows × 12 columns;
- operational header: row 6;
- first operational record: row 7;
- merged-cell ranges: 0;
- hidden worksheets: none;
- formulas: 0;
- cell value types across the inspected sheet: 915 strings, 521 integers, 118 floating-point values and 54 blank cells.

The workbook contains personal/operational data and therefore remains outside repository history. These measurements are structural evidence only.
