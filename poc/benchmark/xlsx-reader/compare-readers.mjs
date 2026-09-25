import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const dir = new URL('./fixtures/', import.meta.url);
const files = ['F01-minimal.xlsx','F04-shared-address.xlsx','F10-formula.xlsx','F12-header-alias.xlsx','F16-total.xlsx'];

function hash(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function exceljsRead(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb.worksheets.map(s => ({
    name: s.name,
    state: s.state,
    rows: s.actualRows.map(r => r.values.slice(1).map(v => typeof v === 'object' && v?.formula ? {formula:v.formula,result:v.result} : v))
  }));
}

async function sheetjsRead(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellNF: true, cellDates: true });
  return wb.SheetNames.map(name => {
    const s = wb.Sheets[name];
    return { name, rows: XLSX.utils.sheet_to_json(s, { header: 1, raw: true, defval: null }) };
  });
}

async function readExcelFile(buffer) {
  const rows = await readXlsxFile(buffer);
  return [{ name: 'first-sheet', rows }];
}

const readers = { exceljs: exceljsRead, sheetjs: sheetjsRead, 'read-excel-file': readExcelFile };
const output = [];
for (const file of files) {
  const buffer = await readFile(new URL(file, dir));
  for (const [name, reader] of Object.entries(readers)) {
    const start = process.hrtime.bigint();
    const result = await reader(buffer);
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    output.push({ fixture:file, reader:name, durationMs, snapshotHash:hash(result), result });
  }
}
console.log(JSON.stringify({ node:process.version, results:output }, null, 2));
