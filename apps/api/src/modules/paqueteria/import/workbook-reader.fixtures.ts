import type { ImportSnapshot, SourceCell } from './workbook-reader.types';

const makeCell = (
  sheetName: string,
  rowNumber: number,
  columnIndex: number,
  rawValue: unknown,
  columnHeaderRaw?: string,
  extra: Partial<SourceCell> = {},
): SourceCell => ({
  ref: {
    sheetName,
    rowNumber,
    columnIndex,
    columnHeaderRaw,
    cellAddress: String.fromCharCode(64 + columnIndex) + rowNumber,
  },
  rawValue,
  displayedValue:
    rawValue === null || rawValue === undefined ? undefined : String(rawValue),
  detectedType:
    rawValue === null || rawValue === undefined
      ? 'BLANK'
      : rawValue instanceof Date
        ? 'DATE'
        : typeof rawValue === 'number'
          ? 'NUMBER'
          : typeof rawValue === 'boolean'
            ? 'BOOLEAN'
            : typeof rawValue === 'string'
              ? 'STRING'
              : 'UNKNOWN',
  ...extra,
});

export const structuralFixture = (): ImportSnapshot => ({
  importSnapshotId: 'IMP-FIXTURE-STRUCTURAL-001',
  sourceDocumentId: 'DOC-FIXTURE-STRUCTURAL-001',
  contentHash: 'fixture-structural-sha256',
  sourceFileName: 'manifest-structural-fixture.xlsx',
  sourceFormat: 'XLSX',
  mappingProfileId: 'manifest-default',
  mappingProfileVersion: '1.0.0',
  sheets: [
    {
      name: 'Manifiesto',
      ordinal: 1,
      visibility: 'VISIBLE',
      rows: [
        {
          sheetName: 'Manifiesto',
          rowNumber: 1,
          kind: 'HEADER',
          cells: [
            makeCell('Manifiesto', 1, 1, 'House', 'House'),
            makeCell('Manifiesto', 1, 2, 'Peso', 'Peso'),
            makeCell('Manifiesto', 1, 3, 'Dirección', 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 2,
          kind: 'DATA',
          cells: [
            makeCell('Manifiesto', 2, 1, 'CACC-00000001', 'House'),
            makeCell('Manifiesto', 2, 2, 12.5, 'Peso', { numberFormat: '0.00' }),
            makeCell('Manifiesto', 2, 3, 'DIRECCION_TEST_001', 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 3,
          kind: 'DATA',
          cells: [
            makeCell('Manifiesto', 3, 1, 'CACC-00000002', 'House'),
            makeCell('Manifiesto', 3, 2, 7.5, 'Peso', { numberFormat: '0.00' }),
            makeCell('Manifiesto', 3, 3, 'DIRECCION_TEST_001', 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 4,
          kind: 'EMPTY',
          cells: [
            makeCell('Manifiesto', 4, 1, null, 'House'),
            makeCell('Manifiesto', 4, 2, null, 'Peso'),
            makeCell('Manifiesto', 4, 3, null, 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 5,
          kind: 'SUBTOTAL',
          cells: [
            makeCell('Manifiesto', 5, 1, 'SUBTOTAL Habana', 'House'),
            makeCell('Manifiesto', 5, 2, 20, 'Peso'),
            makeCell('Manifiesto', 5, 3, null, 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 6,
          kind: 'TOTAL',
          cells: [
            makeCell('Manifiesto', 6, 1, 'TOTAL', 'House'),
            makeCell('Manifiesto', 6, 2, 20, 'Peso'),
            makeCell('Manifiesto', 6, 3, null, 'Dirección'),
          ],
        },
        {
          sheetName: 'Manifiesto',
          rowNumber: 7,
          kind: 'DATA',
          cells: [
            makeCell('Manifiesto', 7, 1, 'CACC-00000003', 'House', {
              formula: 'UPPER("CACC-00000003")',
              formulaResult: 'CACC-00000003',
            }),
            makeCell('Manifiesto', 7, 2, 3.25, 'Peso'),
            makeCell('Manifiesto', 7, 3, 'DIRECCION_TEST_002', 'Dirección'),
          ],
        },
      ],
    },
    { name: 'Oculta', ordinal: 2, visibility: 'HIDDEN', rows: [] },
    { name: 'MuyOculta', ordinal: 3, visibility: 'VERY_HIDDEN', rows: [] },
  ],
});
