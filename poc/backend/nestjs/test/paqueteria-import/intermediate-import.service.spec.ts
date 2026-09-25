import { describe, expect, it } from 'vitest';
import { PaqueteriaImportIntermediateService, MappingProfile } from '../../src/paqueteria-import/intermediate-import.service';
import { ImportSnapshot } from '../../src/paqueteria-import/intermediate-import.model';

const profile: MappingProfile = {
  id: 'manifest-real-evidence',
  version: '0.1.0',
  aliases: {
    HOUSE: ['NO. HOUSE', 'HOUSE NO'],
    'PESO (KG)': ['PESO', 'WEIGHT KG'],
    'DIRECCION DEL DESTINATARIO': ['DIRECCIÓN DEL DESTINATARIO', 'DIRECCION'],
  },
  criticalFields: ['HOUSE', 'DIRECCION DEL DESTINATARIO'],
};

const cell = (row: number, columnIndex: number, address: string, header: string, rawValue: unknown) => ({
  ref: { sheetName: 'Manifiesto', rowNumber: row, columnIndex, cellAddress: address },
  columnHeaderRaw: header,
  rawValue,
});

const snapshot: ImportSnapshot = {
  importSnapshotId: 'IMP-TEST-001',
  sourceDocumentId: 'DOC-TEST-001',
  contentHash: 'sha256:test',
  sourceFileName: 'manifest-test.xlsx',
  sourceFormat: 'XLSX',
  mappingProfileId: profile.id,
  mappingProfileVersion: profile.version,
  sheets: [{
    name: 'Manifiesto',
    ordinal: 1,
    rows: [
      { sheetName: 'Manifiesto', rowNumber: 2, kind: 'DATA', cells: [
        cell(2, 1, 'A2', 'House', 'CACC-00000001'),
        cell(2, 2, 'B2', 'Peso', 12.5),
        cell(2, 3, 'C2', 'Dirección', 'DIRECCION_TEST_001'),
      ]},
      { sheetName: 'Manifiesto', rowNumber: 3, kind: 'DATA', cells: [
        cell(3, 1, 'A3', 'House', 'CACC-00000002'),
        cell(3, 2, 'B3', 'Peso', 7.5),
        cell(3, 3, 'C3', 'Dirección', 'DIRECCION_TEST_001'),
      ]},
    ],
  }],
};

describe('PaqueteriaImportIntermediateService', () => {
  it('maps textual House values and preserves shared address provenance', () => {
    const result = new PaqueteriaImportIntermediateService().inspect(snapshot, profile);

    expect(result.extractedRecords).toHaveLength(2);
    expect(result.extractedRecords[0].fields.find((field) => field.targetField === 'HOUSE')?.rawValue)
      .toBe('CACC-00000001');
    expect(result.reconciliation.distinctAddressCount).toBe(1);
    expect(result.extractedRecords[0].fields[0].provenance[0].cellAddress).toBe('A2');
    expect(result.findings).toHaveLength(0);
  });

  it('blocks ambiguous mapping of a critical field', () => {
    const row = snapshot.sheets[0].rows[0];
    const ambiguousSnapshot: ImportSnapshot = {
      ...snapshot,
      sheets: [{
        ...snapshot.sheets[0],
        rows: [{
          ...row,
          cells: [...row.cells, cell(2, 4, 'D2', 'NO. HOUSE', 'CACC-00000001')],
        }],
      }],
    };

    const result = new PaqueteriaImportIntermediateService().inspect(ambiguousSnapshot, profile);
    expect(result.findings.some((finding) => finding.code === 'AMBIGUOUS_CRITICAL_MAPPING')).toBe(true);
  });
});
