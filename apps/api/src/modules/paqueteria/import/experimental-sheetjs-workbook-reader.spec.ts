import ExcelJS from 'exceljs';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';

const metadata = { importSnapshotId: 'IMP-SHEETJS-001', sourceDocumentId: 'DOC-SHEETJS-001', contentHash: 'sheetjs-fixture', sourceFileName: 'manifest-sheetjs-fixture.xlsx', mappingProfileId: 'manifest-default', mappingProfileVersion: '1.0.0' };

const createFixture = async (): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Manifiesto');
  sheet.addRow(['House', 'Peso', 'Dirección']);
  sheet.addRow(['CACC-00000001', 12.5, 'DIRECCION_TEST_001']);
  sheet.addRow(['CACC-00000002', 7.5, 'DIRECCION_TEST_001']);
  sheet.addRow([]);
  sheet.addRow(['SUBTOTAL Habana', 20, null]);
  sheet.addRow(['TOTAL', 20, null]);
  const formulaRow = sheet.addRow(['CACC-00000003', 3.25, 'DIRECCION_TEST_002']);
  formulaRow.getCell(1).value = { formula: 'UPPER("CACC-00000003")', result: 'CACC-00000003' };
  sheet.getCell('B2').numFmt = '0.00';
  workbook.addWorksheet('Oculta').state = 'hidden';
  workbook.addWorksheet('MuyOculta').state = 'veryHidden';
  return Buffer.from(await workbook.xlsx.writeBuffer());
};

describe('Experimental SheetJS workbook reader', () => {
  it('maps structural rows, formulas, formats, visibility and repeated addresses', async () => {
    const snapshot = await new ExperimentalSheetJsWorkbookReader().read(await createFixture(), metadata);
    expect(snapshot.sheets.map((sheet) => sheet.visibility)).toEqual(['VISIBLE', 'HIDDEN', 'VERY_HIDDEN']);
    expect(snapshot.sheets[0].rows.map((row) => row.kind)).toEqual(['HEADER', 'DATA', 'DATA', 'EMPTY', 'SUBTOTAL', 'TOTAL', 'DATA']);
    const formulaCell = snapshot.sheets[0].rows[6].cells[0];
    expect(formulaCell.formula).toBe('UPPER("CACC-00000003")');
    expect(formulaCell.formulaResult).toBe('CACC-00000003');
    expect(snapshot.sheets[0].rows[1].cells[1].numberFormat).toBe('0.00');
    const addresses = snapshot.sheets[0].rows.filter((row) => row.kind === 'DATA').map((row) => row.cells[2].rawValue);
    expect(addresses.filter((value) => value === 'DIRECCION_TEST_001')).toHaveLength(2);
  });
  it('enforces the experimental source-size limit', async () => {
    await expect(new ExperimentalSheetJsWorkbookReader().read(Buffer.alloc(11), metadata, { maxSourceBytes: 10 })).rejects.toThrow('configured byte limit');
  });


  it('executes the provider-neutral conformance gate against an XLSX workbook', async () => {
    const { assertCommonEvidenceSnapshot } = await import('./workbook-reader-conformance');
    const snapshot = await new ExperimentalSheetJsWorkbookReader().read(await createFixture(), {
      importSnapshotId: 'IMP-FIXTURE-F01-F20-001',
      sourceDocumentId: 'DOC-FIXTURE-F01-F20-001',
      contentHash: 'fixture-f01-f20-sha256',
      sourceFileName: 'manifest-f01-f20.xlsx',
      mappingProfileId: 'manifest-default',
      mappingProfileVersion: '1.0.0',
    });

    assertCommonEvidenceSnapshot(snapshot);
  });

  it('enforces row and cell limits from the shared contract', async () => {
    const source = await createFixture();
    const reader = new ExperimentalSheetJsWorkbookReader();
    await expect(reader.read(source, metadata, { maxRowsPerSheet: 1 })).rejects.toThrow('row limit');
    await expect(reader.read(source, metadata, { maxCellsPerSheet: 2 })).rejects.toThrow('cell limit');
  });
});