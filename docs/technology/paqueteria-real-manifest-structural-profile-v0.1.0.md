# Evidence — anonymized real-manifest structural profile v0.1.0

**Source policy:** inspection performed locally; no raw workbook or PII is committed.

The available representative workbooks were inspected only for structural properties required by the reader decision.

| Workbook | Size | Sheets | Max rows | Max cols | Merged ranges | Formula cells |
|---|---:|---:|---:|---:|---:|---:|
| 649-31382864 | 165,956 B | 8 | 419 | 23 | 3 | 1,829 |
| 649-31382875 | 23,599 B | 1 | 108 | 12 | 0 | 0 |
| 649-31382886 | 30,383 B | 1 | 162 | 12 | 0 | 0 |
| 649-31382890 | 20,836 B | 1 | 84 | 12 | 0 | 0 |
| 649-31382901 | 25,009 B | 1 | 114 | 12 | 0 | 0 |
| 649-31382912 | 32,621 B | 1 | 171 | 12 | 0 | 0 |
| 649-31382923 | 54,077 B | 2 | 152 | 21 | 0 | 290 |
| 649-31382934 | 28,847 B | 1 | 143 | 12 | 0 | 0 |

## Observed structural requirements

The real samples demonstrate that the production-like input is not limited to a simple one-sheet table:

- operational sheets commonly have metadata rows before the tabular header;
- workbook names include Manifiesto and, in some cases, Aduana;
- some samples contain multiple worksheets;
- some contain formulas and cached formula results;
- at least one representative workbook contains merged ranges;
- row counts overlap the expected 100–180 House range and also include smaller/larger workbooks;
- column counts vary;
- source structure must be preserved before domain extraction.

## Security/privacy

Only aggregate structural metadata is recorded here. Cell values, names, addresses, identity numbers, telephone numbers and other source data are intentionally excluded.

## Decision relevance

This evidence makes formula preservation, workbook structure, merged-cell handling and source-coordinate provenance mandatory evaluation dimensions. A reader that only returns normalized row values cannot be considered equivalent to a reader that exposes the metadata required by the SETA import intermediate model.
