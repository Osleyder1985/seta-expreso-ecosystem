import { comprehensiveEvidenceFixture } from './common-evidence-fixture';

describe('comprehensive XLSX evidence fixture', () => {
  it('contains provider-neutral structural evidence for the reader comparison', () => {
    const fixture = comprehensiveEvidenceFixture();
    const sheet = fixture.sheets[0];

    expect(fixture.sourceFormat).toBe('XLSX');
    expect(sheet.rows.map((row) => row.kind)).toEqual([
      'HEADER',
      'DATA',
      'DATA',
      'DATA',
      'EMPTY',
      'SUBTOTAL',
      'TOTAL',
    ]);

    expect(sheet.rows[1].cells[2].rawValue).toBe('DIRECCION_TEST_001');
    expect(sheet.rows[2].cells[2].rawValue).toBe('DIRECCION_TEST_001');
    expect(sheet.rows[3].cells[0].formula).toBe('UPPER("CACC-00000003")');
    expect(sheet.rows[3].cells[0].formulaResult).toBe('CACC-00000003');
    expect(sheet.rows[1].cells[8].numberFormat).toBe('0.00');

    expect(fixture.sheets.map((value) => value.visibility)).toEqual([
      'VISIBLE',
      'HIDDEN',
      'VERY_HIDDEN',
    ]);
  });

  it('keeps missing coordinates as explicit blank source observations', () => {
    const fixture = comprehensiveEvidenceFixture();
    const row = fixture.sheets[0].rows[2];

    expect(row.cells[4].rawValue).toBeNull();
    expect(row.cells[5].rawValue).toBeNull();
  });

  it('preserves source provenance fields required by ImportSnapshot', () => {
    const fixture = comprehensiveEvidenceFixture();

    expect(fixture.importSnapshotId).toBeTruthy();
    expect(fixture.sourceDocumentId).toBeTruthy();
    expect(fixture.contentHash).toBeTruthy();
    expect(fixture.mappingProfileId).toBeTruthy();
    expect(fixture.mappingProfileVersion).toBeTruthy();
    expect(fixture.sheets[0].rows[0].cells[0].ref).toEqual({
      sheetName: 'Manifiesto',
      rowNumber: 1,
      columnIndex: 1,
      columnHeaderRaw: 'House',
      cellAddress: 'A1',
    });
  });
});
