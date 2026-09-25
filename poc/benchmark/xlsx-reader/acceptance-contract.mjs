const fail = (message, details = {}) => ({ status: 'FAIL', message, details });
const pass = (message, details = {}) => ({ status: 'PASS', message, details });

function firstSheet(workbook) {
  return workbook?.sheets?.[0] ?? null;
}

function cell(sheet, row, col) {
  return sheet?.rows?.[row - 1]?.[col - 1];
}

function expect(condition, message, details) {
  return condition ? pass(message, details) : fail(message, details);
}

/**
 * F01-F20 are acceptance contracts, not a score.
 * PASS means the candidate preserves the invariant required by the fixture.
 * FAIL means the candidate cannot satisfy that invariant through the current adapter.
 * ERROR is reserved for parser/execution errors and is produced by the harness.
 */
export function evaluateFixture(id, reader, workbook) {
  const s = firstSheet(workbook);

  switch (id) {
    case 'F01':
      return expect(
        s?.rows?.length === 2 &&
        cell(s, 1, 1) === 'House' &&
        cell(s, 2, 1) === 'CACC-00000001' &&
        cell(s, 2, 2) === 12.5 &&
        cell(s, 2, 3) === 'CAMAGUEY TEST 1',
        'Preserves basic headers, text, decimal number and address.'
      );

    case 'F02':
      return expect(
        cell(s, 2, 2) === '12,50' && typeof cell(s, 2, 2) === 'string',
        'Preserves locale-formatted numeric text literally; does not coerce it.'
      );

    case 'F03':
      return expect(
        s?.rows?.length === 3 &&
        cell(s, 2, 1) === 'H1' &&
        cell(s, 3, 1) === 'H1' &&
        cell(s, 2, 3) === 5 &&
        cell(s, 3, 3) === 7,
        'Preserves repeated package/house rows and numeric values.'
      );

    case 'F04':
      return expect(
        cell(s, 2, 3) === 'ADDRESS SHARED' &&
        cell(s, 3, 3) === 'ADDRESS SHARED',
        'Preserves repeated address values without deduplicating source rows.'
      );

    case 'F05':
      return expect(
        cell(s, 2, 2) === '555111' &&
        cell(s, 2, 3) === '555222',
        'Preserves phone values as source text.'
      );

    case 'F06':
      return expect(
        typeof cell(s, 2, 2) === 'number' &&
        typeof cell(s, 2, 3) === 'number' &&
        cell(s, 2, 2) === 21.3808 &&
        cell(s, 2, 3) === -77.9169,
        'Preserves latitude/longitude numeric values.'
      );

    case 'F07':
      return expect(
        (cell(s, 2, 2) === null || cell(s, 2, 2) === undefined || cell(s, 2, 2) === '') &&
        (cell(s, 2, 3) === null || cell(s, 2, 3) === undefined || cell(s, 2, 3) === ''),
        'Preserves blank coordinate cells without inventing values.'
      );

    case 'F08':
      return expect(
        workbook?.sheets?.length === 2 &&
        workbook.sheets.some(x => x.name === 'Manifest') &&
        workbook.sheets.some(x => x.name === 'Aduana'),
        'Preserves all workbook sheets and their names.'
      );

    case 'F09':
      return expect(
        s?.name === 'CONSOLIDADO',
        'Preserves the source worksheet name.'
      );

    case 'F10': {
      const formula = workbook?.formulas?.find(x => x.address === 'C2');
      return expect(
        !!formula &&
        formula.formula === 'B2*2' &&
        formula.result === 20 &&
        formula.numFmt === '0.00',
        'Preserves formula expression, cached result and number format.'
      );
    }

    case 'F11':
      return expect(
        cell(s, 4, 1) === 'TOTAL' &&
        cell(s, 4, 2) === 35,
        'Preserves literal total rows as source data.'
      );

    case 'F12':
      return expect(
        s?.rows?.length === 4 &&
        cell(s, 1, 1) === 'MANIFIESTO' &&
        cell(s, 2, 1) === 'Identificación' &&
        cell(s, 3, 1) === 'House' &&
        cell(s, 4, 1) === 'H1',
        'Preserves metadata rows before the operational header and data.'
      );

    case 'F13':
      return expect(
        cell(s, 1, 1) === 'House' &&
        cell(s, 1, 2) === 'Peso' &&
        cell(s, 1, 3) === 'Peso KG' &&
        cell(s, 2, 3) === 10,
        'Preserves distinct header labels even when they are semantically similar.'
      );

    case 'F14':
      return expect(
        cell(s, 2, 1) === 'H1' &&
        (cell(s, 2, 2) === null || cell(s, 2, 2) === undefined || cell(s, 2, 2) === '') &&
        cell(s, 2, 3) === 'ADDR',
        'Preserves a blank data field without shifting adjacent cells.'
      );

    case 'F15':
      return expect(
        s?.rows?.[0]?.length === 4 &&
        cell(s, 2, 4) === 'X',
        'Preserves unexpected/extra source columns.'
      );

    case 'F16':
      return expect(
        cell(s, 3, 1) === 'SUBTOTAL' &&
        cell(s, 4, 1) === 'TOTAL',
        'Preserves subtotal and total rows for downstream policy decisions.'
      );

    case 'F17':
      return expect(
        cell(s, 2, 2) === '1.234,56' &&
        cell(s, 3, 2) === 'N/A',
        'Preserves locale numeric text and non-numeric sentinel text literally.'
      );

    case 'F18':
      return expect(
        s?.rows?.length === 3 &&
        cell(s, 2, 1) === 'H1' &&
        cell(s, 3, 1) === 'H1' &&
        cell(s, 2, 2) === 'PERSON A' &&
        cell(s, 3, 2) === 'PERSON B',
        'Preserves repeated house identifiers with distinct row-level data.'
      );

    case 'F19':
      return expect(
        s?.rows?.length === 2 &&
        cell(s, 2, 1) === 'H1' &&
        cell(s, 2, 2) === 10,
        'Preserves the minimal valid manifest row.'
      );

    case 'F20':
      return expect(
        cell(s, 1, 1) === 'Código House' &&
        cell(s, 1, 2) === 'Peso kg',
        'Preserves accented and case-sensitive header text literally.'
      );

    default:
      return fail('No acceptance contract defined.', { fixture: id, reader });
  }
}
