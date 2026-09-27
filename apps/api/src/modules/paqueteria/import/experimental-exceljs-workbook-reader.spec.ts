import { assertF01F20Ledger, certifyF01F20 } from './f01-f20-certification';
import ExcelJS from 'exceljs';
import { ExperimentalExcelJsWorkbookReader } from './experimental-exceljs-workbook-reader';

async function workbookBuffer(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Manifiesto');
  sheet.addRow(['House', 'Bultos', 'Dirección', 'Teléfono', 'Latitud', 'Longitud', 'Aduana', 'Consolidado', 'Peso']);
  const firstDataRow = sheet.addRow(['CACC-00000001', 3, 'DIRECCION_TEST_001', '+5350000001', 21.38, -77.92, 'Aduana Camagüey', 'CONSOLIDADO-001', 12.5]);
  firstDataRow.getCell(9).numFmt = '0.00';
  sheet.addRow(['CACC-00000002', 1, 'DIRECCION_TEST_001', '+5350000002', null, null, 'Aduana Camagüey', 'CONSOLIDADO-001', 7.5]);
  sheet.addRow([]);
  sheet.addRow(['SUBTOTAL Habana', null, null, null, null, null, null, null, 20]);
  sheet.addRow(['TOTAL', null, null, null, null, null, null, null, 20]);
  const formulaRow = sheet.addRow([null, 2, 'DIRECCION_TEST_002', '+5350000003', 23.1, -82.3666, 'Aduana Habana', 'CONSOLIDADO-002', 3.25]);
  formulaRow.getCell(1).value = { formula: 'UPPER("CACC-00000003")', result: 'CACC-00000003' };
  formulaRow.getCell(9).numFmt = '0.00';

  const hidden = workbook.addWorksheet('Oculta');
  hidden.state = 'hidden';
  const veryHidden = workbook.addWorksheet('MuyOculta');
  veryHidden.state = 'veryHidden';

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
describe('ExperimentalExcelJsWorkbookReader', () => {
  const metadata = {
    importSnapshotId: 'IMP-EXCELJS-001',
    sourceDocumentId: 'DOC-EXCELJS-001',
    contentHash: 'sha256-fixture',
    sourceFileName: 'manifest-fixture.xlsx',
    mappingProfileId: 'manifest-default',
    mappingProfileVersion: '1.0.0',
  };

  it('maps the real workbook structure into the provider-neutral contract', async () => {
    const reader = new ExperimentalExcelJsWorkbookReader();
    const snapshot = await reader.read(await workbookBuffer(), metadata);

    expect(snapshot.sourceFormat).toBe('XLSX');
    expect(snapshot.sheets.map((sheet) => sheet.visibility)).toEqual([
      'VISIBLE',
      'HIDDEN',
      'VERY_HIDDEN',
    ]);

    expect(snapshot.sheets[0].rows.map((row) => row.kind)).toEqual([
      'HEADER',
      'DATA',
      'DATA',
      'EMPTY',
      'SUBTOTAL',
      'TOTAL',
      'DATA',
    ]);

    expect(snapshot.sheets[0].rows[1].cells[0].ref.columnHeaderRaw).toBe('House');
    expect(snapshot.sheets[0].rows[1].cells[2].ref.columnHeaderRaw).toBe('Dirección');
    expect(snapshot.sheets[0].rows[6].cells[8].ref.columnHeaderRaw).toBe('Peso');
    expect(snapshot.sheets[0].rows.filter(row => row.kind === 'DATA').map(row => row.cells[2].rawValue).filter(value => value === 'DIRECCION_TEST_001')).toHaveLength(2);

    expect(snapshot.sheets[0].rows[6].cells[8].numberFormat).toBe('0.00');

    const formula = snapshot.sheets[0].rows[6].cells[0];
    expect(formula.detectedType).toBe('FORMULA');
    expect(formula.formula).toBe('UPPER("CACC-00000003")');
    expect(formula.formulaResult).toBe('CACC-00000003');
  });

  it('rejects sources above the configured byte limit before parsing', async () => {
    const reader = new ExperimentalExcelJsWorkbookReader();
    await expect(
      reader.read(Buffer.alloc(11), metadata, { maxSourceBytes: 10 }),
    ).rejects.toThrow('XLSX source exceeds configured byte limit');
  });

  it('rejects a workbook above the configured sheet limit', async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('A');
    workbook.addWorksheet('B');
    const source = Buffer.from(await workbook.xlsx.writeBuffer());
    const reader = new ExperimentalExcelJsWorkbookReader();

    await expect(
      reader.read(source, metadata, { maxSheets: 1 }),
    ).rejects.toThrow('XLSX workbook exceeds configured sheet limit');
  });


  it('executes the provider-neutral conformance gate against an XLSX workbook', async () => {
    const { assertCommonEvidenceSnapshot } = await import('./workbook-reader-conformance');
    const reader = new ExperimentalExcelJsWorkbookReader();
    const snapshot = await reader.read(await workbookBuffer(), {
      importSnapshotId: 'IMP-FIXTURE-F01-F20-001',
      sourceDocumentId: 'DOC-FIXTURE-F01-F20-001',
      contentHash: 'fixture-f01-f20-sha256',
      sourceFileName: 'manifest-f01-f20.xlsx',
      mappingProfileId: 'manifest-default',
      mappingProfileVersion: '1.0.0',
    });

    expect(() => assertCommonEvidenceSnapshot(snapshot)).not.toThrow();
  });

  it('preserves number formats and date/error cell types', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tipos');
    sheet.addRow(['Fecha', 'Peso', 'Error']);
    const date = new Date('2026-09-27T00:00:00.000Z');
    sheet.addRow([date, 12.5, { error: '#DIV/0!' }]);
    sheet.getCell('B2').numFmt = '0.00';
    const source = Buffer.from(await workbook.xlsx.writeBuffer());
    const snapshot = await new ExperimentalExcelJsWorkbookReader().read(source, metadata);
    const cells = snapshot.sheets[0].rows[1].cells;
    expect(cells[0].detectedType).toBe('DATE');
    expect(cells[1].numberFormat).toBe('0.00');
    expect(cells[2].detectedType).toBe('ERROR');
  });

  it('enforces row and cell limits', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Limites');
    sheet.addRow(['A']);
    sheet.addRow(['B']);
    const source = Buffer.from(await workbook.xlsx.writeBuffer());
    const reader = new ExperimentalExcelJsWorkbookReader();
    await expect(reader.read(source, metadata, { maxRowsPerSheet: 1 })).rejects.toThrow('row limit');
    await expect(reader.read(source, metadata, { maxCellsPerSheet: 1 })).rejects.toThrow('cell limit');
  });

  it('certifies the complete F01-F20 ledger with explicit statuses', async () => {
    const snapshot = await new ExperimentalExcelJsWorkbookReader().read(await workbookBuffer(), { importSnapshotId: 'IMP-FIXTURE-F01-F20-001', sourceDocumentId: 'DOC-FIXTURE-F01-F20-001', contentHash: 'fixture-f01-f20-sha256', sourceFileName: 'manifest-f01-f20.xlsx', mappingProfileId: 'manifest-default', mappingProfileVersion: '1.0.0' });
    const evidence = certifyF01F20(snapshot, 'exceljs');
    assertF01F20Ledger(evidence);
    expect(evidence.map(e => e.status)).toEqual(['PASS','PASS','PASS','NOT_EXECUTED','PASS','PASS','PASS','PASS','PASS','PARTIAL','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','PASS','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','PARTIAL']);
    console.log(JSON.stringify({ adapter: 'exceljs', evidence }, null, 2));
  });
});
