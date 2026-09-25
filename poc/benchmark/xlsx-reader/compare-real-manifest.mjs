import { readFile, writeFile } from 'node:fs/promises';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const input = process.argv[2];
if (!input) throw new Error('Usage: node compare-real-manifest.mjs <path-to-xlsx>');

const buffer = await readFile(input);
const sourceHash = createHash('sha256').update(buffer).digest('hex');
const hmacKey = randomBytes(32);

const EXPECTED_HEADERS = [
  'House',
  'Naturaleza y Cantidad',
  'Peso (Kg)',
  'Bultos (Cant.)',
  'Nombre y Apellidos del REMITENTE:',
  'Passport',
  'Nombre y Apellidos del DESTINATARIO:',
  'No. de Carnet de Identidad:',
  'Teléfono del DESTINATARIO',
  'Dirección del DESTINATARIO:',
  'Identificación si el House está "COBRADO" ó "NO COBRADO" en origen',
  'Unidad de destino'
];

const normalizeHeader = value =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"']/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

const expectedHeaderSet = new Set(EXPECTED_HEADERS.map(normalizeHeader));

function privacyToken(value) {
  const type = value === null || value === undefined ? 'blank' : typeof value;
  return createHmac('sha256', hmacKey)
    .update(type)
    .update('\0')
    .update(String(value ?? ''))
    .digest('hex');
}

function scalar(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'result')) return value.result;
    if (Object.prototype.hasOwnProperty.call(value, 'text')) return value.text;
    if (Object.prototype.hasOwnProperty.call(value, 'richText')) {
      return value.richText.map(x => x.text ?? '').join('');
    }
    return JSON.stringify(value);
  }
  return value;
}

function valueType(value) {
  const v = scalar(value);
  if (v === null || v === '') return 'blank';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'decimal';
  if (typeof v === 'boolean') return 'boolean';
  return 'string';
}

function rowFingerprint(row) {
  return row.map(value => ({
    type: valueType(value),
    token: privacyToken(scalar(value))
  }));
}

function detectHeaderRow(rows) {
  let best = null;
  for (let i = 0; i < rows.length; i += 1) {
    const normalized = rows[i].map(normalizeHeader);
    const matches = normalized.filter(value => expectedHeaderSet.has(value)).length;
    if (matches === EXPECTED_HEADERS.length) {
      return i;
    }
    if (!best || matches > best.matches) best = { row: i, matches };
  }
  return best?.matches >= Math.ceil(EXPECTED_HEADERS.length * 0.75) ? best.row : -1;
}

function summarizeRows(rows, headerIndex) {
  const header = rows[headerIndex] ?? [];
  const data = rows.slice(headerIndex + 1).filter(row => row.some(v => scalar(v) !== null && scalar(v) !== ''));
  const headerMatches = header.map(normalizeHeader);
  const columnIndexes = new Map(headerMatches.map((h, i) => [h, i]));

  const houseIndex = columnIndexes.get(normalizeHeader('House'));
  const weightIndex = columnIndexes.get(normalizeHeader('Peso (Kg)'));
  const destinationIndex = columnIndexes.get(normalizeHeader('Unidad de destino'));
  const addressIndex = columnIndexes.get(normalizeHeader('Dirección del DESTINATARIO:'));

  const houses = houseIndex === undefined ? [] : data.map(r => scalar(r[houseIndex])).filter(v => v !== null && v !== '');
  const weights = weightIndex === undefined ? [] : data.map(r => scalar(r[weightIndex])).filter(v => v !== null && v !== '');
  const destinations = destinationIndex === undefined ? [] : data.map(r => scalar(r[destinationIndex])).filter(v => v !== null && v !== '');
  const addresses = addressIndex === undefined ? [] : data.map(r => scalar(r[addressIndex])).filter(v => v !== null && v !== '');

  const addressGroups = new Map();
  for (const address of addresses) {
    const token = privacyToken(address);
    addressGroups.set(token, (addressGroups.get(token) ?? 0) + 1);
  }

  const repeatedGroups = [...addressGroups.values()].filter(n => n > 1);
  const decimalWeights = weights.filter(v => typeof v === 'number' && !Number.isInteger(v)).length;
  const integerQuantities = headerMatches
    .map((h, i) => ({ h, i }))
    .find(({ h }) => h === normalizeHeader('Bultos (Cant.)'));

  const quantityValues = integerQuantities
    ? data.map(r => scalar(r[integerQuantities.i])).filter(v => v !== null && v !== '')
    : [];

  return {
    totalRows: rows.length,
    headerRow1Based: headerIndex + 1,
    headerColumnCount: header.length,
    matchedExpectedHeaders: headerMatches.filter(h => expectedHeaderSet.has(h)).length,
    exactExpectedHeaderOrder: headerMatches.slice(0, EXPECTED_HEADERS.length)
      .every((h, i) => h === normalizeHeader(EXPECTED_HEADERS[i])),
    dataRowCount: data.length,
    nonEmptyHouseCount: houses.length,
    uniqueHouseCount: new Set(houses.map(privacyToken)).size,
    repeatedAddressGroupCount: repeatedGroups.length,
    maxAddressMultiplicity: repeatedGroups.length ? Math.max(...repeatedGroups) : 0,
    numericWeightCount: weights.filter(v => typeof v === 'number').length,
    decimalWeightCount: decimalWeights,
    integerQuantityCount: quantityValues.filter(v => typeof v === 'number' && Number.isInteger(v)).length,
    destinationCodeTypeCounts: Object.fromEntries(
      [...new Set(destinations.map(valueType))].map(type => [
        type,
        destinations.filter(v => valueType(v) === type).length
      ])
    ),
    blankCellCount: data.reduce((sum, row) =>
      sum + row.slice(0, EXPECTED_HEADERS.length).filter(v => scalar(v) === null || scalar(v) === '').length, 0),
    rowFingerprints: data.map(rowFingerprint),
    addressTokens: [...addressGroups.keys()].sort(),
  };
}

async function exceljsProbe() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheets = wb.worksheets.map(s => {
    const rows = [];
    s.eachRow({ includeEmpty: true }, row => {
      const values = [];
      for (let c = 1; c <= Math.max(s.columnCount, EXPECTED_HEADERS.length); c += 1) {
        values.push(row.getCell(c).value);
      }
      rows.push(values);
    });
    const formulas = [];
    s.eachRow({ includeEmpty: true }, row => row.eachCell({ includeEmpty: true }, cell => {
      if (cell.value && typeof cell.value === 'object' && cell.value.formula) {
        formulas.push({ address: cell.address, result: scalar(cell.value.result), numFmt: cell.numFmt });
      }
    }));
    return {
      name: s.name,
      state: s.state,
      rowCount: s.rowCount,
      columnCount: s.columnCount,
      mergedCount: s.mergedCells.length,
      formulas,
      summary: summarizeRows(rows, detectHeaderRow(rows))
    };
  });
  return { sheets };
}

async function sheetjsProbe() {
  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellNF: true, cellDates: true });
  const sheets = wb.SheetNames.map(name => {
    const s = wb.Sheets[name];
    const range = s['!ref'] ? XLSX.utils.decode_range(s['!ref']) : null;
    const rows = range ? XLSX.utils.sheet_to_json(s, { header: 1, raw: true, defval: null }) : [];
    const formulas = Object.entries(s)
      .filter(([address]) => !address.startsWith('!'))
      .filter(([, cell]) => cell?.f)
      .map(([address, cell]) => ({ address, formula: cell.f, result: cell.v, numFmt: cell.z ?? null }));
    return {
      name,
      range: s['!ref'] ?? null,
      mergedCount: (s['!merges'] ?? []).length,
      formulas,
      summary: summarizeRows(rows, detectHeaderRow(rows))
    };
  });
  return { sheets };
}

async function readExcelFileProbe() {
  const parsed = await readXlsxFile(buffer, { getSheets: true });
  const sheets = [];
  for (const sheet of parsed) {
    const rows = await readXlsxFile(buffer, { sheet: sheet.name, schema: undefined });
    sheets.push({
      name: sheet.name,
      summary: summarizeRows(rows, detectHeaderRow(rows))
    });
  }
  return { sheets };
}

const probes = {
  exceljs: exceljsProbe,
  sheetjs: sheetjsProbe,
  'read-excel-file': readExcelFileProbe
};

const results = {};
for (const [name, probe] of Object.entries(probes)) {
  const start = process.hrtime.bigint();
  try {
    const value = await probe();
    results[name] = {
      status: 'OK',
      elapsedMs: Number(process.hrtime.bigint() - start) / 1e6,
      probe: value
    };
  } catch (e) {
    results[name] = {
      status: 'ERROR',
      error: { name: e.name, message: e.message }
    };
  }
}

const successful = Object.entries(results)
  .filter(([, result]) => result.status === 'OK')
  .map(([name, result]) => ({ name, sheets: result.probe.sheets }));

const comparable = successful.length > 1;
let crossReader = null;
if (comparable) {
  const baseline = successful[0][1];
  crossReader = successful.slice(1).map(([name, sheets]) => ({
    reader: name,
    sameSheetCount: sheets.length === baseline.length,
    sameStructuralContract: JSON.stringify(
      sheets.map(s => ({
        name: s.name,
        summary: s.summary
      }))
    ) === JSON.stringify(
      baseline.map(s => ({
        name: s.name,
        summary: s.summary
      }))
    )
  }));
}

const report = {
  protocol: 'xlsx-real-manifest-probe-v0.2.0',
  inputBytes: buffer.length,
  sourceSha256: sourceHash,
  piiPolicy: 'raw cell values, addresses, names, phones, passport/ID values and tokens are never written to report',
  privacyHashing: 'per-run random HMAC key; report tokens are intentionally non-reproducible',
  contract: {
    headerDetection: 'operational header row detected from normalized expected vocabulary',
    requiredColumns: EXPECTED_HEADERS.length,
    repeatedAddressAnalysis: 'counts only; raw addresses never emitted',
    rowFidelity: 'privacy-preserving per-cell type/token fingerprints',
    literalCodeFidelity: 'destination-code type/counts plus row fingerprints',
    formulas: 'captured only as metadata by readers that expose them'
  },
  results,
  crossReader
};

await writeFile(
  new URL('./real-manifest-report.json', import.meta.url),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
