import ExcelJS from 'exceljs';
import { ExperimentalExcelJsWorkbookReader } from './experimental-exceljs-workbook-reader';

describe('ExperimentalExcelJsWorkbookReader', () => {
  const metadata = {
    importSnapshotId: 'IMP-EXCELJS-001',
    sourceDocumentId: 'DOC-EXCELJS-001',
    contentHash: 'sha256-fixture',
    sourceFileName: 'manifest-fixture.xlsx',
    mappingProfileId: 'manifest-default',
    mappingProfileVersion: '1.0.0',
  };

  async function workbookBuffer(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Manifiesto');
    sheet.addRow(['House', 'Peso', 'Dirección']);
    sheet.addRow(['CACC-00000001', 12.5, 'DIRECCION_TEST_001']);
    sheet.addRow(['CACC-00000002', 7.5, 'DIRECCION_TEST_001']);
    sheet.addRow([]);
    sheet.addRow(['SUBTOTAL Habana', 20, null]);
    sheet.addRow(['TOTAL', 20, null]);
    const formulaRow = sheet.addRow([null, 3.25, 'DIRECCION_TEST_002']);
    formulaRow.getCell(1).value = { formula: 'UPPER("CACC-00000003")', result: 'CACC-00000003' };

    const hidden = workbook.addWorksheet('Oculta');
    hidden.state = 'hidden';
    const veryHidden = workbook.addWorksheet('MuyOculta');
    veryHidden.state = 'veryHidden';

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

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
});
