import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';
import { evaluateFixture } from './acceptance-contract.mjs';

const fixtureSets = [
  { dir: new URL('./fixtures/', import.meta.url), filter: /^F\d\d\.xlsx$/, kind: 'acceptance' },
  { dir: new URL('./stress-fixtures/', import.meta.url), filter: /^ST\d\d-.*\.xlsx$/, kind: 'stress' }
];

const fixtureFiles = [];
for (const set of fixtureSets) {
  for (const file of (await readdir(set.dir)).filter(set.filter).sort()) {
    fixtureFiles.push({ file, dir: set.dir, kind: set.kind });
  }
}
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const rss = () => process.memoryUsage().rss;
const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
};

async function exceljsRead(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheets = wb.worksheets.map(s => ({
    name: s.name,
    state: s.state,
    rowCount: s.rowCount,
    columnCount: s.columnCount,
    merged: [...s.mergedCells],
    rows: s.actualRows.map(r => r.values.slice(1).map(v =>
      typeof v === 'object' && v?.formula
        ? v.result
        : v
    ))
  }));
  const formulas = [];
  for (const s of wb.worksheets) {
    s.eachRow(row => row.eachCell(cell => {
      if (cell.value && typeof cell.value === 'object' && cell.value.formula) {
        formulas.push({
          sheet: s.name,
          address: cell.address,
          formula: cell.value.formula,
          result: cell.value.result,
          numFmt: cell.numFmt ?? null
        });
      }
    }));
  }
  return { sheets, formulas };
}

async function sheetjsRead(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellNF: true, cellDates: true });
  const sheets = wb.SheetNames.map(name => {
    const s = wb.Sheets[name];
    return {
      name,
      rows: XLSX.utils.sheet_to_json(s, { header: 1, raw: true, defval: null }),
      range: s['!ref'] ?? null,
      merges: s['!merges'] ?? []
    };
  });
  const formulas = [];
  for (const name of wb.SheetNames) {
    const s = wb.Sheets[name];
    for (const address of Object.keys(s)) {
      if (address.startsWith('!')) continue;
      const cell = s[address];
      if (cell?.f) {
        formulas.push({
          sheet: name,
          address,
          formula: cell.f,
          result: cell.v,
          numFmt: cell.z ?? null
        });
      }
    }
  }
  return { sheets, formulas };
}

async function readExcelFile(buffer) {
  const rows = await readXlsxFile(buffer);
  return { sheets: [{ name: 'first-sheet', rows }], formulas: [] };
}

const readers = {
  exceljs: exceljsRead,
  sheetjs: sheetjsRead,
  'read-excel-file': readExcelFile
};

const results = [];

for (const fixture of fixtureFiles) {
  const { file, dir, kind } = fixture;
  const buffer = await readFile(new URL(file, dir));
  const fixtureId = file.slice(0, 3);

  for (const [reader, fn] of Object.entries(readers)) {
    const samples = [];
    const snapshotHashes = [];
    const errors = [];
    let lastResult = null;

    for (let i = 0; i < 6; i++) {
      global.gc?.();
      const before = rss();
      const start = process.hrtime.bigint();

      try {
        const result = await fn(buffer);
        lastResult = result;
        snapshotHashes.push(hash(result));
      } catch (e) {
        errors.push({ iteration: i + 1, name: e.name, message: e.message });
        snapshotHashes.push(null);
      }

      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      samples.push({ durationMs, rssDelta: rss() - before });
    }

    const warm = samples.slice(1).map(x => x.durationMs);
    const stableHashes = snapshotHashes.slice(1).filter(Boolean);
    const deterministic = stableHashes.length > 0 && stableHashes.every(x => x === stableHashes[0]);
    const acceptance = errors.length
      ? { status: kind === 'stress' && /^ST0[456]-/.test(file) ? 'EXPECTED_REJECTION' : 'ERROR',
          message: kind === 'stress' && /^ST0[456]-/.test(file)
            ? 'Malformed/non-XLSX fixture was rejected by the reader.'
            : 'Reader raised one or more execution errors.',
          details: { errors } }
      : kind === 'acceptance'
        ? evaluateFixture(fixtureId, reader, lastResult)
        : /^ST0[456]-/.test(file)
          ? { status: 'UNEXPECTED_ACCEPTANCE', message: 'Malformed/non-XLSX fixture was accepted by the reader.' }
          : { status: 'NOT_APPLICABLE', message: 'Stress fixture: performance/memory evidence only.' };

    results.push({
      fixture: file,
      fixtureKind: kind,
      reader,
      bytes: buffer.length,
      acceptance,
      durationMedianMs: percentile(warm, 0.5),
      durationP95Ms: percentile(warm, 0.95),
      durationSamplesMs: samples.map(x => x.durationMs),
      maxRssDelta: Math.max(...samples.map(x => x.rssDelta)),
      snapshotHash: stableHashes[stableHashes.length - 1] ?? null,
      snapshotHashes,
      deterministic,
      errors
    });
  }
}

const acceptanceSummary = results.reduce((acc, item) => {
  const status = item.acceptance.status;
  acc[status] = (acc[status] ?? 0) + 1;
  return acc;
}, { PASS: 0, FAIL: 0, ERROR: 0, EXPECTED_REJECTION: 0, UNEXPECTED_ACCEPTANCE: 0, NOT_APPLICABLE: 0 });

const robustnessSummary = results
  .filter(x => x.fixtureKind === 'stress')
  .reduce((acc, x) => {
    const key = x.acceptance.status === 'EXPECTED_REJECTION'
      ? 'EXPECTED_REJECTION'
      : x.acceptance.status === 'UNEXPECTED_ACCEPTANCE'
        ? 'UNEXPECTED_ACCEPTANCE'
        : x.errors.length
          ? 'ERROR'
          : 'EXECUTED';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, { EXECUTED: 0, EXPECTED_REJECTION: 0, UNEXPECTED_ACCEPTANCE: 0, ERROR: 0 });

const report = {
  protocol: 'xlsx-reader-comparison-v0.6.0',
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  fixtureCount: fixtureFiles.length,
  fixtures: fixtureFiles,
  acceptanceSummary,
  robustnessSummary,
  results
};

await writeFile(new URL('comparison-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
