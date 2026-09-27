import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ExperimentalExcelJsWorkbookReader } from './experimental-exceljs-workbook-reader';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';
import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';
import type { ImportSnapshot, SourceCell, SourceRow, SourceSheet } from './workbook-reader.types';

type ReaderName = 'exceljs' | 'sheetjs' | 'read-excel-file';
type DiffSeverity = 'CRITICAL' | 'SIGNIFICANT' | 'INFORMATIONAL';

interface SnapshotDiff {
  readonly path: string;
  readonly severity: DiffSeverity;
  readonly left: unknown;
  readonly right: unknown;
  readonly reason: string;
}

interface ReaderResult {
  readonly reader: ReaderName;
  readonly snapshot: ImportSnapshot;
}

const metadata = {
  importSnapshotId: 'EQUIVALENCE-CERT',
  sourceDocumentId: 'DOC-EQUIVALENCE-CERT',
  contentHash: 'reader-equivalence-fixture-sha',
  sourceFileName: 'reader-equivalence.xlsx',
  mappingProfileId: 'manifest-default',
  mappingProfileVersion: '1.0.0',
};

async function sourceBuffer(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Manifiesto');
  ws.addRow(['House', 'Bultos', 'Dirección', 'Destinatario', 'Peso', 'Extra']);
  ws.addRow(['CACC-00000001', 3, 'DIRECCION_TEST_001', 'JUAN', 12.5, 'KEEP']);
  ws.addRow(['CACC-00000002', 1, 'DIRECCION_TEST_001', 'ANA', 7.5, 'KEEP']);
  ws.addRow(['CACC-00000003', 2, 'DIRECCION_TEST_002', 'LUIS', 3.25, 'KEEP']);
  const formulaRow = ws.addRow(['FORMULA-001', 4, 'DIRECCION_TEST_003', 'FORMULA', 10, 'FORMULA']);
  formulaRow.getCell(5).value = { formula: 'SUM(1,2,3,4)', result: 10 };
  formulaRow.getCell(5).numFmt = '0.00';
  const dateRow = ws.addRow(['DATE-001', 1, 'DIRECCION_TEST_004', 'FECHA', new Date('2026-09-27T12:00:00.000Z'), 'DATE']);
  dateRow.getCell(5).numFmt = 'dd/mm/yyyy';
  const errorRow = ws.addRow(['ERROR-001', 1, 'DIRECCION_TEST_005', 'ERROR', { error: '#DIV/0!' }, 'ERROR']);
  ws.getCell('F7').value = null;
  ws.addRow(['TOTAL', null, null, null, 33.25, 'KEEP']);

  const hidden = wb.addWorksheet('Oculta');
  hidden.state = 'hidden';
  hidden.addRow(['House', 'Bultos']);
  hidden.addRow(['HIDDEN-001', 1]);

  const veryHidden = wb.addWorksheet('MuyOculta');
  veryHidden.state = 'veryHidden';
  veryHidden.addRow(['House', 'Bultos']);
  veryHidden.addRow(['VERY-HIDDEN-001', 2]);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

const readers: readonly [ReaderName, { read: (...args: any[]) => Promise<ImportSnapshot> }][] = [
  ['exceljs', new ExperimentalExcelJsWorkbookReader()],
  ['sheetjs', new ExperimentalSheetJsWorkbookReader()],
  ['read-excel-file', new ExperimentalReadExcelFileWorkbookReader()],
];

const scalar = (value: unknown): unknown => {
  if (value instanceof Date) return { __type: 'Date', value: value.toISOString() };
  if (typeof value === 'number' && Object.is(value, -0)) return 0;
  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }
  return value;
};

const cellProjection = (cell: SourceCell) => ({
  address: cell.ref.cellAddress,
  columnIndex: cell.ref.columnIndex,
  columnHeaderRaw: cell.ref.columnHeaderRaw ?? null,
  rawValue: scalar(cell.rawValue),
  displayedValue: cell.displayedValue ?? null,
  detectedType: cell.detectedType,
  formula: cell.formula ?? null,
  formulaResult: scalar(cell.formulaResult),
  numberFormat: cell.numberFormat ?? null,
});

const rowProjection = (row: SourceRow) => ({
  rowNumber: row.rowNumber,
  kind: row.kind,
  cells: row.cells.map(cellProjection),
});

const sheetProjection = (sheet: SourceSheet) => ({
  name: sheet.name,
  ordinal: sheet.ordinal,
  visibility: sheet.visibility,
  rows: sheet.rows.map(rowProjection),
});

const snapshotProjection = (snapshot: ImportSnapshot) => ({
  sourceDocumentId: snapshot.sourceDocumentId,
  contentHash: snapshot.contentHash,
  sourceFileName: snapshot.sourceFileName,
  sourceFormat: snapshot.sourceFormat,
  mappingProfileId: snapshot.mappingProfileId,
  mappingProfileVersion: snapshot.mappingProfileVersion,
  sheets: snapshot.sheets.map(sheetProjection),
});

function diffValues(
  left: unknown,
  right: unknown,
  path: string,
  reason: string,
  severity: DiffSeverity,
  diffs: SnapshotDiff[],
): void {
  if (JSON.stringify(left) === JSON.stringify(right)) return;
  diffs.push({ path, severity, left, right, reason });
}

function compareSnapshots(left: ReaderResult, right: ReaderResult): SnapshotDiff[] {
  const diffs: SnapshotDiff[] = [];
  const a = snapshotProjection(left.snapshot);
  const b = snapshotProjection(right.snapshot);

  diffValues(a.sourceDocumentId, b.sourceDocumentId, 'sourceDocumentId', 'Source identity must remain stable across readers.', 'CRITICAL', diffs);
  diffValues(a.contentHash, b.contentHash, 'contentHash', 'The three readers consumed the same source bytes.', 'CRITICAL', diffs);
  diffValues(a.sourceFileName, b.sourceFileName, 'sourceFileName', 'Source provenance must remain stable.', 'CRITICAL', diffs);
  diffValues(a.sourceFormat, b.sourceFormat, 'sourceFormat', 'All readers must expose XLSX.', 'CRITICAL', diffs);
  diffValues(a.mappingProfileId, b.mappingProfileId, 'mappingProfileId', 'Mapping context is not reader-specific.', 'CRITICAL', diffs);
  diffValues(a.mappingProfileVersion, b.mappingProfileVersion, 'mappingProfileVersion', 'Mapping version is not reader-specific.', 'CRITICAL', diffs);

  if (a.sheets.length !== b.sheets.length) {
    diffs.push({
      path: 'sheets.length',
      severity: 'CRITICAL',
      left: a.sheets.length,
      right: b.sheets.length,
      reason: 'A reader must not silently lose workbook sheets.',
    });
  }

  const sheetCount = Math.max(a.sheets.length, b.sheets.length);
  for (let i = 0; i < sheetCount; i++) {
    const sa = a.sheets[i];
    const sb = b.sheets[i];
    if (!sa || !sb) continue;

    diffValues(sa.name, sb.name, `sheets[${i}].name`, 'Sheet identity/order must be preserved.', 'CRITICAL', diffs);
    diffValues(sa.ordinal, sb.ordinal, `sheets[${i}].ordinal`, 'Sheet ordinal must be preserved.', 'SIGNIFICANT', diffs);
    diffValues(sa.visibility, sb.visibility, `sheets[${i}].visibility`, 'Visibility is part of source evidence and must not be silently changed.', 'SIGNIFICANT', diffs);

    if (sa.rows.length !== sb.rows.length) {
      diffs.push({
        path: `sheets[${i}].rows.length`,
        severity: 'CRITICAL',
        left: sa.rows.length,
        right: sb.rows.length,
        reason: 'A reader must not silently lose or create source rows.',
      });
    }

    const rowCount = Math.max(sa.rows.length, sb.rows.length);
    for (let r = 0; r < rowCount; r++) {
      const ra = sa.rows[r];
      const rb = sb.rows[r];
      if (!ra || !rb) continue;

      diffValues(ra.rowNumber, rb.rowNumber, `sheets[${i}].rows[${r}].rowNumber`, 'Source row coordinates must be preserved.', 'CRITICAL', diffs);
      diffValues(ra.kind, rb.kind, `sheets[${i}].rows[${r}].kind`, 'Row classification drives mapping/reconciliation.', 'CRITICAL', diffs);

      if (ra.cells.length !== rb.cells.length) {
        diffs.push({
          path: `sheets[${i}].rows[${r}].cells.length`,
          severity: 'CRITICAL',
          left: ra.cells.length,
          right: rb.cells.length,
          reason: 'A reader must not silently lose source cells.',
        });
      }

      const cellCount = Math.max(ra.cells.length, rb.cells.length);
      for (let c = 0; c < cellCount; c++) {
        const ca = ra.cells[c];
        const cb = rb.cells[c];
        if (!ca || !cb) continue;
        const base = `sheets[${i}].rows[${r}].cells[${c}]`;
        diffValues(ca.address, cb.address, `${base}.address`, 'Cell coordinates must be preserved.', 'CRITICAL', diffs);
        diffValues(ca.columnIndex, cb.columnIndex, `${base}.columnIndex`, 'Column coordinates must be preserved.', 'CRITICAL', diffs);
        diffValues(ca.columnHeaderRaw, cb.columnHeaderRaw, `${base}.columnHeaderRaw`, 'Header provenance must remain stable.', 'SIGNIFICANT', diffs);
        diffValues(ca.rawValue, cb.rawValue, `${base}.rawValue`, 'Raw cell values are source evidence.', 'CRITICAL', diffs);
        diffValues(ca.displayedValue, cb.displayedValue, `${base}.displayedValue`, 'Displayed values are relevant when spreadsheet formatting changes interpretation.', 'SIGNIFICANT', diffs);
        diffValues(ca.detectedType, cb.detectedType, `${base}.detectedType`, 'Detected type can change downstream validation semantics.', 'CRITICAL', diffs);
        diffValues(ca.formula, cb.formula, `${base}.formula`, 'Formula provenance must not be silently discarded.', 'SIGNIFICANT', diffs);
        diffValues(ca.formulaResult, cb.formulaResult, `${base}.formulaResult`, 'Formula result must remain consistent where exposed.', 'CRITICAL', diffs);
        diffValues(ca.numberFormat, cb.numberFormat, `${base}.numberFormat`, 'Number format is source evidence and may affect interpretation.', 'SIGNIFICANT', diffs);
      }
    }
  }

  return diffs;
}

describe('XLSX reader semantic snapshot equivalence', () => {
  let results: ReaderResult[];

  beforeAll(async () => {
    const source = await sourceBuffer();
    results = [];
    for (const [reader, adapter] of readers) {
      results.push({ reader, snapshot: await adapter.read(source, metadata) });
    }

    const report = {
      protocol: 'xlsx-reader-snapshot-equivalence-v1.0.0',
      generatedAt: new Date().toISOString(),
      source: {
        fileName: metadata.sourceFileName,
        contentHash: metadata.contentHash,
        readerCount: results.length,
      },
      comparison: {
        metadata: 'strict',
        workbookStructure: 'strict',
        sourceCells: 'strict',
        readerSpecificMetadata: 'excluded',
        normalization: 'none-except-Date-and-negative-zero-serialization',
        characterization: ['formula-and-cache', 'dates', 'number-formats', 'blank-cells', 'error-values', 'hidden-and-very-hidden-sheets'],
      },
      readers: results.map(({ reader, snapshot }) => ({
        reader,
        sheetCount: snapshot.sheets.length,
        sheets: snapshot.sheets.map(sheet => ({
          name: sheet.name,
          ordinal: sheet.ordinal,
          visibility: sheet.visibility,
          rowCount: sheet.rows.length,
          cellCount: sheet.rows.reduce((n, row) => n + row.cells.length, 0),
        })),
      })),
      pairwise: results.flatMap((left, i) =>
        results.slice(i + 1).map(right => {
          const diffs = compareSnapshots(left, right);
          return {
            left: left.reader,
            right: right.reader,
            equivalent: diffs.length === 0,
            criticalDiffs: diffs.filter(d => d.severity === 'CRITICAL'),
            significantDiffs: diffs.filter(d => d.severity === 'SIGNIFICANT'),
            informationalDiffs: diffs.filter(d => d.severity === 'INFORMATIONAL'),
            diffCount: diffs.length,
          };
        }),
      ),
    };

    const outputDir = join(process.cwd(), 'certification-artifacts');
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      join(outputDir, 'xlsx-reader-snapshot-equivalence.json'),
      JSON.stringify(report, null, 2),
      'utf8',
    );
  });

  const expectedKnownGap = (left: ReaderName, right: ReaderName, diff: SnapshotDiff): boolean => {
    const pair = [left, right].sort().join('|');

    if (pair === 'exceljs|read-excel-file') {
      return (
        diff.path.includes('.formulaResult') ||
        diff.path.includes('.detectedType') && diff.path.includes('rows[4].cells[4]') ||
        diff.path.includes('rows[6].cells.length') ||
        diff.path.includes('rows[6].cells[4].rawValue') ||
        diff.path.includes('rows[6].cells[4].detectedType')
      );
    }

    if (pair === 'read-excel-file|sheetjs') {
      return (
        diff.path.includes('.formulaResult') ||
        diff.path.includes('.detectedType') && diff.path.includes('rows[4].cells[4]') ||
        diff.path.includes('rows[6].cells.length') ||
        diff.path.includes('rows[6].cells[4].rawValue') ||
        diff.path.includes('rows[6].cells[4].detectedType')
      );
    }

    if (pair === 'exceljs|sheetjs') {
      return (
        diff.path.includes('rows[6].cells.length') ||
        diff.path.includes('rows[6].cells[4].rawValue')
      );
    }

    return false;
  };

  const expectedKnownSignificantGap = (left: ReaderName, right: ReaderName, diff: SnapshotDiff): boolean => {
    const pair = [left, right].sort().join('|');

    if (pair === 'exceljs|sheetjs') {
      return (diff.path.endsWith('.numberFormat') && (diff.left === null || diff.left === undefined) && diff.right === 'General') || diff.path.endsWith('.displayedValue');
    }

    if (pair === 'exceljs|read-excel-file' || pair === 'read-excel-file|sheetjs') {
      return (
        diff.path.includes('.formula') ||
        diff.path.includes('.formulaResult') ||
        diff.path.includes('.numberFormat') ||
        diff.path.includes('.displayedValue') ||
        diff.path.includes('.visibility')
      );
    }

    return false;
  };

  test.each([
    ['exceljs', 'sheetjs'],
    ['exceljs', 'read-excel-file'],
    ['sheetjs', 'read-excel-file'],
  ] as const)('%s vs %s: no unclassified significant snapshot gaps', (leftName, rightName) => {
    const left = results.find(r => r.reader === leftName)!;
    const right = results.find(r => r.reader === rightName)!;
    const diffs = compareSnapshots(left, right);
    const significant = diffs.filter(d => d.severity === 'SIGNIFICANT');
    const unexpected = significant.filter(d => !expectedKnownSignificantGap(leftName, rightName, d));

    expect(unexpected).toEqual([]);
  });

  test.each([
    ['exceljs', 'sheetjs'],
    ['exceljs', 'read-excel-file'],
    ['sheetjs', 'read-excel-file'],
  ] as const)('%s vs %s: no unclassified critical snapshot gaps', (leftName, rightName) => {
    const left = results.find(r => r.reader === leftName)!;
    const right = results.find(r => r.reader === rightName)!;
    const diffs = compareSnapshots(left, right);
    const critical = diffs.filter(d => d.severity === 'CRITICAL');
    const unexpected = critical.filter(d => !expectedKnownGap(leftName, rightName, d));

    expect(unexpected).toEqual([]);
  });

  test.each([
    ['exceljs', 'sheetjs'],
    ['exceljs', 'read-excel-file'],
    ['sheetjs', 'read-excel-file'],
  ] as const)('%s vs %s: known critical gaps remain explicitly observable', (leftName, rightName) => {
    const left = results.find(r => r.reader === leftName)!;
    const right = results.find(r => r.reader === rightName)!;
    const diffs = compareSnapshots(left, right);
    const critical = diffs.filter(d => d.severity === 'CRITICAL');
    const known = critical.filter(d => expectedKnownGap(leftName, rightName, d));

    if (leftName === 'exceljs' && rightName === 'sheetjs') {
      expect(known.length).toBeGreaterThan(0);
    } else {
      expect(known.length).toBeGreaterThan(0);
    }
  });
});
