import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ExcelJS from 'exceljs';
import readXlsxFile from 'read-excel-file/node';
import * as XLSX from 'xlsx';

const dir=new URL('./fixtures/',import.meta.url);
const files=(await import('node:fs/promises')).readdir(new URL('./fixtures/',import.meta.url));
const fixtureFiles=files.filter(f=>/^F\d\d-.*\.xlsx$/.test(f)).sort();
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const rss=()=>process.memoryUsage().rss;

async function exceljsRead(buffer){
  const wb=new ExcelJS.Workbook(); await wb.xlsx.load(buffer);
  return wb.worksheets.map(s=>({name:s.name,state:s.state,hidden:s.state!=='visible',rowCount:s.rowCount,columnCount:s.columnCount,merged:[...s.mergedCells],rows:s.actualRows.map(r=>r.values.slice(1).map(v=>typeof v==='object'&&v?.formula?{formula:v.formula,result:v.result,numFmt:v.numFmt}:v))}));
}
async function sheetjsRead(buffer){
  const wb=XLSX.read(buffer,{type:'buffer',cellFormula:true,cellNF:true,cellDates:true});
  return wb.SheetNames.map(name=>{const s=wb.Sheets[name];return{name,rows:XLSX.utils.sheet_to_json(s,{header:1,raw:true,defval:null}),range:s['!ref']??null,merges:s['!merges']??[]};});
}
async function readExcelFile(buffer){
  const rows=await readXlsxFile(buffer); return [{name:'first-sheet',rows}];
}
const readers={exceljs:exceljsRead,sheetjs:sheetjsRead,'read-excel-file':readExcelFile};
const results=[];
for(const file of fixtureFiles){
  const buffer=await readFile(new URL(file,dir));
  for(const [reader,fn] of Object.entries(readers)){
    const samples=[]; let result; let error=null;
    for(let i=0;i<6;i++){global.gc?.(); const before=rss(); const start=process.hrtime.bigint(); try{result=await fn(buffer);}catch(e){error={name:e.name,message:e.message};} const durationMs=Number(process.hrtime.bigint()-start)/1e6; samples.push({durationMs,rssDelta: rss()-before});}
    const usable=samples.slice(1).map(x=>x.durationMs).sort((a,b)=>a-b);
    results.push({fixture:file,reader,bytes:buffer.length,durationMedianMs:usable[Math.floor(usable.length/2)],durationSamplesMs:samples.map(x=>x.durationMs),maxRssDelta:samples.reduce((m,x)=>Math.max(m,x.rssDelta),0),snapshotHash:error?null:hash(result),error});
  }
}
const report={node:process.version,platform:process.platform,arch:process.arch,fixtures:fixtureFiles,generatedAt:new Date().toISOString(),results};
await writeFile(new URL('comparison-report.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
