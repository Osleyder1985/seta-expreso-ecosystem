import { readFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const [reader, input] = process.argv.slice(2);
if (!reader || !input) {
  process.stderr.write('Usage: node reader-worker.mjs <reader> <xlsx-path>\\n');
  process.exit(2);
}

const buffer = await readFile(input);
const hasZipSignature = buffer.length >= 4 &&
  buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
if (!hasZipSignature) {
  process.stdout.write(JSON.stringify({
    ok: false,
    preflightRejected: true,
    error: { name: 'InvalidXlsxContainer', message: 'Input does not have an XLSX ZIP container signature.' }
  }));
  process.exitCode = 1;
  process.exit();
}

async function exceljsRead() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const sheets = wb.worksheets.map(s => ({
    name: s.name, state: s.state, rowCount: s.rowCount, columnCount: s.columnCount,
    mergedCount: Object.keys(s._merges ?? {}).length,
    rows: Array.from({length: s.rowCount}, (_, i) => s.getRow(i + 1).values.slice(1).map(v =>
      typeof v === 'object' && v?.formula ? v.result : v))
  }));
  const formulas = [];
  for (const s of wb.worksheets) s.eachRow(row => row.eachCell(cell => {
    if (cell.value && typeof cell.value === 'object' && cell.value.formula)
      formulas.push({sheet:s.name,address:cell.address,formula:cell.value.formula,result:cell.value.result,numFmt:cell.numFmt ?? null});
  }));
  return {sheets, formulas};
}

async function sheetjsRead() {
  const wb = XLSX.read(buffer, {type:'buffer', cellFormula:true, cellNF:true, cellDates:true});
  const sheets = wb.SheetNames.map(name => {
    const s=wb.Sheets[name];
    return {name, rows:XLSX.utils.sheet_to_json(s,{header:1,raw:true,defval:null}), range:s['!ref'] ?? null, merges:s['!merges'] ?? []};
  });
  const formulas=[];
  for (const name of wb.SheetNames) for (const address of Object.keys(wb.Sheets[name])) {
    if (address.startsWith('!')) continue;
    const cell=wb.Sheets[name][address];
    if (cell?.f) formulas.push({sheet:name,address,formula:cell.f,result:cell.v,numFmt:cell.z ?? null});
  }
  return {sheets,formulas};
}

async function readExcelFile() {
  const parsed=await readXlsxFile(buffer);
  const rows=Array.isArray(parsed) ? parsed : [];
  return {sheets:[{name:'first-sheet',rows}],formulas:[]};
}

const readers={exceljs:exceljsRead,sheetjs:sheetjsRead,'read-excel-file':readExcelFile};
if (!readers[reader]) throw new Error('Unknown reader: '+reader);

try {
  const result=await readers[reader]();
  process.stdout.write(JSON.stringify({ok:true,result,rss:process.memoryUsage().rss,maxRssBytes:process.resourceUsage().maxRSS*1024}));
} catch (e) {
  process.stdout.write(JSON.stringify({ok:false,error:{name:e.name,message:e.message},rss:process.memoryUsage().rss,maxRssBytes:process.resourceUsage().maxRSS*1024}));
  process.exitCode=1;
}
