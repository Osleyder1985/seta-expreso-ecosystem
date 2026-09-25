import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const dir = new URL('./fixtures/', import.meta.url);
const fixtureFiles = (await readdir(dir)).filter(f => /^F\d\d\.xlsx$/.test(f)).sort();
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
  return wb.worksheets.map(s => ({
    name: s.name,
    state: s.state,
    rowCount: s.rowCount,
    columnCount: s.columnCount,
    merged: [...s.mergedCells],
    rows: s.actualRows.map(r => r.values.slice(1).map(v =>
      typeof v === 'object' && v?.formula
        ? { formula: v.formula, result: v.result, numFmt: v.numFmt }
        : v
    ))
  }));
}

async function sheetjsRead(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellNF: true, cellDates: true });
  return wb.SheetNames.map(name => {
    const s = wb.Sheets[name];
    return {
      name,
      rows: XLSX.utils.sheet_to_json(s, { header: 1, raw: true, defval: null }),
      range: s['!ref'] ?? null,
      merges: s['!merges'] ?? []
    };
  });
}

async function readExcelFile(buffer) {
  const rows = await readXlsxFile(buffer);
  return [{ name: 'first-sheet', rows }];
}

const readers = {
  exceljs: exceljsRead,
  sheetjs: sheetjsRead,
  'read-excel-file': readExcelFile
};

const results = [];

for (const file of fixtureFiles) {
  const buffer = await readFile(new URL(file, dir));

  for (const [reader, fn] of Object.entries(readers)) {
    const samples = [];
    const snapshotHashes = [];
    const errors = [];

    for (let i = 0; i < 6; i++) {
      global.gc?.();
      const before = rss();
      const start = process.hrtime.bigint();

      try {
        const result = await fn(buffer);
        snapshotHashes.push(hash(result));
      } catch (e) {
        errors.push({ iteration: i + 1, name: e.name, message: e.message });
        snapshotHashes.push(null);
      }

      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      samples.push({ durationMs, rssDelta: rss() - before });
    }

    const warm = samples.slice(1).map(x => x.durationMs);
    const warmSorted = [...warm].sort((a, b) => a - b);
    const stableHashes = snapshotHashes.slice(1).filter(Boolean);
    const deterministic = stableHashes.length > 0 && stableHashes.every(x => x === stableHashes[0]);

    results.push({
      fixture: file,
      reader,
      bytes: buffer.length,
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

const report = {
  protocol: 'xlsx-reader-comparison-v0.3.0',
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  fixtureCount: fixtureFiles.length,
  fixtures: fixtureFiles,
  results
};

await writeFile(new URL('comparison-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
