import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const input = process.argv[2];
if (!input) throw new Error('Usage: node compare-real-manifest.mjs <path-to-xlsx>');

const buffer = await readFile(input);
const sourceHash = createHash('sha256').update(buffer).digest('hex');

async function exceljsProbe() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return {
    sheets: wb.worksheets.map(s => ({
      name: s.name,
      state: s.state,
      rowCount: s.rowCount,
      columnCount: s.columnCount,
      mergedCount: s.mergedCells.length
    })),
    cellAddressCapability: true,
    formulaCapability: wb.worksheets.some(s => {
      let found=false;
      s.eachRow(r => r.eachCell(c => { if (c.value && typeof c.value === 'object' && c.value.formula) found=true; }));
      return found;
    })
  };
}

async function sheetjsProbe() {
  const wb = XLSX.read(buffer, { type:'buffer', cellFormula:true, cellNF:true, cellDates:true });
  return {
    sheets: wb.SheetNames.map(name => {
      const s=wb.Sheets[name];
      return { name, range:s['!ref'] ?? null, mergedCount:(s['!merges'] ?? []).length };
    }),
    cellAddressCapability: true,
    formulaCapability: wb.SheetNames.some(name => Object.keys(wb.Sheets[name]).some(a => !a.startsWith('!') && !!wb.Sheets[name][a]?.f))
  };
}

async function readExcelFileProbe() {
  const rows = await readXlsxFile(buffer);
  return {
    sheets: [{ name:'first-sheet', rowCount:rows.length, columnCount:rows.reduce((m,r)=>Math.max(m,r.length),0) }],
    cellAddressCapability: false,
    formulaCapability: false
  };
}

const probes={exceljs:exceljsProbe,sheetjs:sheetjsProbe,'read-excel-file':readExcelFileProbe};
const results={};
for(const [name,probe] of Object.entries(probes)){
  const start=process.hrtime.bigint();
  try {
    results[name]={status:'OK',elapsedMs:Number(process.hrtime.bigint()-start)/1e6,probe:await probe()};
  } catch(e) {
    results[name]={status:'ERROR',error:{name:e.name,message:e.message}};
  }
}
const report={
  protocol:'xlsx-real-manifest-probe-v0.1.0',
  inputBytes:buffer.length,
  sourceSha256:sourceHash,
  piiPolicy:'raw cell values are never written to report',
  results
};
await writeFile(new URL('./real-manifest-report.json', import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
