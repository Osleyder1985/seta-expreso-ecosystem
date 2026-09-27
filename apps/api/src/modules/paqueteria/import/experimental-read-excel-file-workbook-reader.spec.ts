import ExcelJS from 'exceljs';
import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';

describe('ExperimentalReadExcelFileWorkbookReader', () => {
  it('maps basic workbook rows through the common contract', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Manifiesto');
    sheet.addRow(['House', 'Peso', 'Dirección']);
    sheet.addRow(['CACC-00000001', 12.5, 'DIRECCION_TEST_001']);
    sheet.addRow(['CACC-00000002', 7.5, 'DIRECCION_TEST_001']);
    sheet.addRow([]);
    sheet.addRow(['SUBTOTAL Habana', 20, null]);
    sheet.addRow(['TOTAL', 20, null]);
    const source = Buffer.from(await workbook.xlsx.writeBuffer());

    const reader = new ExperimentalReadExcelFileWorkbookReader();
    const snapshot = await reader.read(source, {
      importSnapshotId: 'IMP-READ-EXCEL-FILE-001',
      sourceDocumentId: 'DOC-READ-EXCEL-FILE-001',
      contentHash: 'fixture',
      sourceFileName: 'fixture.xlsx',
      mappingProfileId: 'manifest-default',
      mappingProfileVersion: '1.0.0',
    });

    expect(snapshot.sheets).toHaveLength(1);
    expect(snapshot.sheets[0].rows.map(row => row.kind)).toEqual([
      'HEADER', 'DATA', 'DATA', 'EMPTY', 'SUBTOTAL', 'TOTAL',
    ]);
    expect(snapshot.sheets[0].rows[1].cells[1].rawValue).toBe(12.5);
  });

  it('enforces the source byte limit before parsing', async () => {
    const reader = new ExperimentalReadExcelFileWorkbookReader();
    await expect(reader.read(Buffer.alloc(11), {
      importSnapshotId: 'i', sourceDocumentId: 'd', contentHash: 'h',
      sourceFileName: 'f.xlsx', mappingProfileId: 'm', mappingProfileVersion: '1',
    }, { maxSourceBytes: 10 })).rejects.toThrow('XLSX source exceeds configured byte limit');
  });

  it('executes the common conformance gate and records the adapter gap', async () => {
    const { assertCommonEvidenceSnapshot } = await import('./workbook-reader-conformance');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Manifiesto');
    sheet.addRow(['House', 'Peso', 'Dirección']);
    sheet.addRow(['CACC-00000001', 12.5, 'DIRECCION_TEST_001']);
    sheet.addRow(['CACC-00000002', 7.5, 'DIRECCION_TEST_001']);
    sheet.addRow([]);
    sheet.addRow(['SUBTOTAL Habana', 20, null]);
    sheet.addRow(['TOTAL', 20, null]);
    const source = Buffer.from(await workbook.xlsx.writeBuffer());
    const snapshot = await new ExperimentalReadExcelFileWorkbookReader().read(source, {
      importSnapshotId: 'IMP-FIXTURE-F01-F20-001',
      sourceDocumentId: 'DOC-FIXTURE-F01-F20-001',
      contentHash: 'fixture-f01-f20-sha256',
      sourceFileName: 'manifest-f01-f20.xlsx',
      mappingProfileId: 'manifest-default',
      mappingProfileVersion: '1.0.0',
    });

    expect(() => assertCommonEvidenceSnapshot(snapshot)).toThrow();
  });
});
