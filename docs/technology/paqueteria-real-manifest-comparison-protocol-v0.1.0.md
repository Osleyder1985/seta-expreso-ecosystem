# Real manifest comparison protocol v0.1.0

## Purpose

Compare reader behavior against production-like manifest structure without committing recipient PII or raw workbook values.

## Source fixture

The Library contains workbook **649-31382945.xlsx**. A structural inspection reports one sheet named `Manifiesto`, 134 rows, 12 columns, metadata in rows 1–5, and the operational header on row 6. The workbook contains textual identifiers, addresses, phone fields and destination codes, plus numeric weights/counts.

## Procedure

Run locally against the raw workbook:

```powershell
node compare-real-manifest.mjs "C:\path\649-31382945.xlsx"
```

The generated report contains only:

- input byte size;
- SHA-256;
- sheet names/counts;
- row/column metadata;
- merged-cell count;
- formula capability;
- cell-address/provenance capability;
- parser errors;
- elapsed time.

Raw names, IDs, phones, addresses and cargo descriptions are never emitted.

## Required comparison

The real workbook must be tested by all candidate readers after dependency resolution. The report is evidence of parser behavior, not a business-validation result.

## Privacy

The source workbook contains personal and operational data. It must remain outside Git history. Only redacted structural reports may be committed.

## Current state

Fixture available; execution evidence pending.
