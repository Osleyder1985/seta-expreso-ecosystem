import { structuralFixture } from './workbook-reader.fixtures';

describe('Paqueteria XLSX structural fixture', () => {
  it('covers required structural conditions', () => {
    const snapshot = structuralFixture();
    expect(snapshot.sourceFormat).toBe('XLSX');
    expect(snapshot.sheets).toHaveLength(3);

    const [manifest, hidden, veryHidden] = snapshot.sheets;
    expect(manifest.visibility).toBe('VISIBLE');
    expect(hidden.visibility).toBe('HIDDEN');
    expect(veryHidden.visibility).toBe('VERY_HIDDEN');

    expect(manifest.rows.map((row) => row.kind)).toEqual([
      'HEADER', 'DATA', 'DATA', 'EMPTY', 'SUBTOTAL', 'TOTAL', 'DATA',
    ]);

    const formulaCell = manifest.rows[6].cells[0];
    expect(formulaCell.formula).toBe('UPPER("CACC-00000003")');
    expect(formulaCell.formulaResult).toBe('CACC-00000003');
    expect(manifest.rows[1].cells[1].numberFormat).toBe('0.00');
  });

  it('preserves repeated addresses as distinct source observations', () => {
    const rows = structuralFixture().sheets[0].rows.filter(
      (row) => row.kind === 'DATA',
    );
    const addresses = rows
      .map((row) => row.cells[2].rawValue)
      .filter((value): value is string => typeof value === 'string');

    expect(addresses.filter((address) => address === 'DIRECCION_TEST_001')).toHaveLength(2);
  });
});
