import * as XLSX from 'xlsx';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';

const metadata = { importSnapshotId: 'IMP-SHEETJS-001', sourceDocumentId: 'DOC-SHEETJS-001', contentHash: 'sheetjs-fixture', sourceFileName: 'manifest-sheetjs-fixture.xlsx', mappingProfileId: 'manifest-default', mappingProfileVersion: '1.0.0' };

export const createFixture = async (): Promise<Buffer> => {
  const values = [
    ['House', 'Bultos', 'Dirección', 'Teléfono', 'Latitud', 'Longitud', 'Aduana', 'Consolidado', 'Peso'],
    ['CACC-00000001', 3, 'DIRECCION_TEST_001', '+5350000001', 21.38, -77.92, 'Aduana Camagüey', 'CONSOLIDADO-001', 12.5],
    ['CACC-00000002', 1, 'DIRECCION_TEST_001', '+5350000002', null, null, 'Aduana Camagüey', 'CONSOLIDADO-001', 7.5],
    [],
    ['SUBTOTAL Habana'],
    ['TOTAL'],
    ['CACC-00000003', 2, 'DIRECCION_TEST_002', '+5350000003', 23.1, -82.3666, 'Aduana Habana', 'CONSOLIDADO-002', 3.25],
  ];
  const sheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(values);
  sheet['I2'].z = '0.00';
  sheet['A7'] = { t: 's', f: 'UPPER("CACC-00000003")', v: 'CACC-00000003' };
  sheet['!ref'] = 'A1:I7';

  const workbook: XLSX.WorkBook = {
    SheetNames: ['Manifiesto', 'Oculta', 'MuyOculta'],
    Sheets: {
      Manifiesto: sheet,
      Oculta: { '!ref': 'A1:A1' },
      MuyOculta: { '!ref': 'A1:A1' },
    },
    Workbook: {
      Sheets: [
        { name: 'Manifiesto' },
        { name: 'Oculta', Hidden: 1 },
        { name: 'MuyOculta', Hidden: 2 },
      ],
    },
  };
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellFormula: true, cellNF: true, cellStyles: true });
};

describe('Experimental SheetJS workbook reader', () => {
  it('maps structural rows, formulas, formats, visibility and repeated addresses', async () => {
    const snapshot = await new ExperimentalSheetJsWorkbookReader().read(await createFixture(), metadata);
    expect(snapshot.sheets.map((sheet) => sheet.visibility)).toEqual(['VISIBLE', 'HIDDEN', 'VERY_HIDDEN']);
    expect(snapshot.sheets[0].rows.map((row) => row.kind)).toEqual(['HEADER', 'DATA', 'DATA', 'EMPTY', 'SUBTOTAL', 'TOTAL', 'DATA']);
    const formulaCell = snapshot.sheets[0].rows[6].cells[0];
    expect(formulaCell.formula).toBe('UPPER("CACC-00000003")');
    expect(formulaCell.formulaResult).toBe('CACC-00000003');
    expect(snapshot.sheets[0].rows[1].cells[8].numberFormat).toBe('0.00');
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