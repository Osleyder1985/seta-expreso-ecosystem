import { comprehensiveEvidenceFixture } from './common-evidence-fixture';
import type { ImportSnapshot } from './workbook-reader.types';

export const assertCommonEvidenceSnapshot = (
  actual: ImportSnapshot,
): void => {
  const expected = comprehensiveEvidenceFixture();

  expect(actual.sourceFormat).toBe('XLSX');
  expect(actual.sourceDocumentId).toBe(expected.sourceDocumentId);
  expect(actual.contentHash).toBe(expected.contentHash);
  expect(actual.mappingProfileId).toBe(expected.mappingProfileId);
  expect(actual.mappingProfileVersion).toBe(expected.mappingProfileVersion);

  const sheet = actual.sheets.find(({ name }) => name === 'Manifiesto');
  expect(sheet).toBeDefined();
  expect(sheet?.visibility).toBe('VISIBLE');

  const dataRows = sheet?.rows.filter(({ kind }) => kind === 'DATA') ?? [];
  expect(dataRows).toHaveLength(3);

  const addresses = dataRows.map((row) =>
    row.cells.find(({ ref }) => ref.columnHeaderRaw === 'Dirección')?.rawValue,
  );
  expect(addresses).toContain('DIRECCION_TEST_001');
  expect(addresses.filter((value) => value === 'DIRECCION_TEST_001')).toHaveLength(2);

  const formulaCell = dataRows[2]?.cells.find(({ ref }) => ref.columnHeaderRaw === 'House');
  expect(formulaCell?.formula).toBeDefined();
  expect(formulaCell?.formulaResult).toBe('CACC-00000003');

  const weightCell = dataRows[0]?.cells.find(({ ref }) => ref.columnHeaderRaw === 'Peso');
  expect(weightCell?.numberFormat).toBe('0.00');

  expect(sheet?.rows.some(({ kind }) => kind === 'EMPTY')).toBe(true);
  expect(sheet?.rows.some(({ kind }) => kind === 'SUBTOTAL')).toBe(true);
  expect(sheet?.rows.some(({ kind }) => kind === 'TOTAL')).toBe(true);

  expect(actual.sheets.find(({ name }) => name === 'Oculta')?.visibility).toBe('HIDDEN');
  expect(actual.sheets.find(({ name }) => name === 'MuyOculta')?.visibility).toBe('VERY_HIDDEN');
};
