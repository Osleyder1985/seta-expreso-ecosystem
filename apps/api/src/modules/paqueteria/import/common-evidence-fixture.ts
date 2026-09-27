import type { ImportSnapshot, SourceCell } from './workbook-reader.types';

const makeCell = (sheetName: string, rowNumber: number, columnIndex: number, rawValue: unknown, columnHeaderRaw?: string, extra: Partial<SourceCell> = {}): SourceCell => ({
  ref: { sheetName, rowNumber, columnIndex, columnHeaderRaw, cellAddress: String.fromCharCode(64 + columnIndex) + rowNumber },
  rawValue,
  displayedValue: rawValue === null || rawValue === undefined ? undefined : String(rawValue),
  detectedType: rawValue === null || rawValue === undefined ? 'BLANK' : rawValue instanceof Date ? 'DATE' : typeof rawValue === 'number' ? 'NUMBER' : typeof rawValue === 'boolean' ? 'BOOLEAN' : typeof rawValue === 'string' ? 'STRING' : 'UNKNOWN',
  ...extra,
});

const row = (sheetName: string, rowNumber: number, kind: 'HEADER' | 'DATA' | 'EMPTY' | 'TOTAL' | 'SUBTOTAL', cells: SourceCell[]) => ({ sheetName, rowNumber, kind, cells });

export const comprehensiveEvidenceFixture = (): ImportSnapshot => ({
  importSnapshotId: 'IMP-FIXTURE-F01-F20-001', sourceDocumentId: 'DOC-FIXTURE-F01-F20-001', contentHash: 'fixture-f01-f20-sha256', sourceFileName: 'manifest-f01-f20.xlsx', sourceFormat: 'XLSX', mappingProfileId: 'manifest-default', mappingProfileVersion: '1.0.0',
  sheets: [{
    name: 'Manifiesto', ordinal: 1, visibility: 'VISIBLE',
    rows: [
      row('Manifiesto', 1, 'HEADER', ['House','Bultos','Dirección','Teléfono','Latitud','Longitud','Aduana','Consolidado','Peso'].map((v,i) => makeCell('Manifiesto',1,i+1,v,v))),
      row('Manifiesto', 2, 'DATA', [makeCell('Manifiesto',2,1,'CACC-00000001','House'),makeCell('Manifiesto',2,2,3,'Bultos'),makeCell('Manifiesto',2,3,'DIRECCION_TEST_001','Dirección'),makeCell('Manifiesto',2,4,'+5350000001','Teléfono'),makeCell('Manifiesto',2,5,21.38,'Latitud'),makeCell('Manifiesto',2,6,-77.92,'Longitud'),makeCell('Manifiesto',2,7,'Aduana Camagüey','Aduana'),makeCell('Manifiesto',2,8,'CONSOLIDADO-001','Consolidado'),makeCell('Manifiesto',2,9,12.5,'Peso',{numberFormat:'0.00'})]),
      row('Manifiesto', 3, 'DATA', [makeCell('Manifiesto',3,1,'CACC-00000002','House'),makeCell('Manifiesto',3,2,1,'Bultos'),makeCell('Manifiesto',3,3,'DIRECCION_TEST_001','Dirección'),makeCell('Manifiesto',3,4,'+5350000002','Teléfono'),makeCell('Manifiesto',3,5,null,'Latitud'),makeCell('Manifiesto',3,6,null,'Longitud'),makeCell('Manifiesto',3,7,'Aduana Camagüey','Aduana'),makeCell('Manifiesto',3,8,'CONSOLIDADO-001','Consolidado'),makeCell('Manifiesto',3,9,7.5,'Peso',{numberFormat:'0.00'})]),
      row('Manifiesto', 4, 'DATA', [makeCell('Manifiesto',4,1,'CACC-00000003','House',{formula:'UPPER("CACC-00000003")',formulaResult:'CACC-00000003'}),makeCell('Manifiesto',4,2,2,'Bultos'),makeCell('Manifiesto',4,3,'DIRECCION_TEST_002','Dirección'),makeCell('Manifiesto',4,4,'+5350000003','Teléfono'),makeCell('Manifiesto',4,5,23.1,'Latitud'),makeCell('Manifiesto',4,6,-82.3666,'Longitud'),makeCell('Manifiesto',4,7,'Aduana Habana','Aduana'),makeCell('Manifiesto',4,8,'CONSOLIDADO-002','Consolidado'),makeCell('Manifiesto',4,9,3.25,'Peso',{numberFormat:'0.00'})]),
      row('Manifiesto',5,'EMPTY',[makeCell('Manifiesto',5,1,null,'House'),makeCell('Manifiesto',5,2,null,'Bultos'),makeCell('Manifiesto',5,3,null,'Dirección')]),
      row('Manifiesto',6,'SUBTOTAL',[makeCell('Manifiesto',6,1,'SUBTOTAL Habana','House'),makeCell('Manifiesto',6,9,23.25,'Peso')]),
      row('Manifiesto',7,'TOTAL',[makeCell('Manifiesto',7,1,'TOTAL','House'),makeCell('Manifiesto',7,9,23.25,'Peso')]),
    ],
  }, {name:'Oculta',ordinal:2,visibility:'HIDDEN',rows:[]}, {name:'MuyOculta',ordinal:3,visibility:'VERY_HIDDEN',rows:[]}],
});