import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { ExcelJsWorkbookReader } from '../../src/paqueteria-import/exceljs-workbook-reader';

describe('ExcelJsWorkbookReader', () => {
  it('preserves sheet, row, cell and formula metadata', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Manifiesto');
    sheet.addRow(['House', 'Peso', 'Dirección']);
    sheet.addRow(['CACC-00000001', 12.5, 'DIRECCION_TEST_001']);
    sheet.addRow(['TOTAL', 12.5, '']);
    sheet.getCell('B2').numFmt = '0.00';
    sheet.getCell('B3').value = { formula: 'SUM(B2:B2)', result: 12.5 };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const snapshot = await new ExcelJsWorkbookReader().read(buffer, {
      importSnapshotId: 'IMP-TEST-XLSX-001',
      sourceDocumentId: 'DOC-TEST-XLSX-001',
      contentHash: '',
      sourceFileName: 'manifest-test.xlsx',
      mappingProfileId: 'profile-test',
      mappingProfileVersion: '0.1.0',
    });

    expect(snapshot.sheets).toHaveLength(1);
    expect(snapshot.sheets[0].rows[1].kind).toBe('DATA');
    expect(snapshot.sheets[0].rows[1].cells[0].rawValue).toBe('CACC-00000001');
    expect(snapshot.sheets[0].rows[2].kind).toBe('TOTAL');
    expect(snapshot.sheets[0].rows[2].cells[1].formula).toBe('SUM(B2:B2)');
    expect(snapshot.sheets[0].rows[2].cells[1].formulaResult).toBe(12.5);
    expect(snapshot.sheets[0].rows[1].cells[1].numberFormat).toBe('0.00');
    expect(snapshot.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
