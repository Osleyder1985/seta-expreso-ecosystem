import * as XLSX from 'xlsx';
import type { ImportSnapshot, SourceCell, SourceRow, SourceSheet, SheetVisibility } from './workbook-reader.types';
import { columnLetter, classifyRow, type WorkbookReaderMetadata, type WorkbookReaderOptions, type WorkbookReaderPort } from './workbook-reader.port';

export class ExperimentalSheetJsWorkbookReader implements WorkbookReaderPort {
 async read(source:Buffer,metadata:WorkbookReaderMetadata,options:WorkbookReaderOptions={}):Promise<ImportSnapshot>{
  if(source.byteLength>(options.maxSourceBytes??50*1024*1024)) throw new RangeError('XLSX source exceeds the configured byte limit.');
  const workbook=XLSX.read(source,{type:'buffer',cellFormula:true,cellNF:true,cellDates:true,cellStyles:true,cellText:true});
  if(options.maxSheets!==undefined&&workbook.SheetNames.length>options.maxSheets) throw new RangeError('XLSX workbook exceeds the configured sheet limit.');
  const visibility=new Map<string,number>(); for(const s of workbook.Workbook?.Sheets??[]) if(s.name) visibility.set(s.name,s.Hidden??0);
  const sheets:SourceSheet[]=workbook.SheetNames.map((name,si)=>{
   const ws=workbook.Sheets[name]; const range=ws['!ref']?XLSX.utils.decode_range(ws['!ref']):{s:{r:0,c:0},e:{r:-1,c:-1}};
   const rows:SourceRow[]=[]; const headers=new Map<number,string>(); let count=0;
   for(let ri=range.s.r;ri<=range.e.r;ri++){if(rows.length>=(options.maxRowsPerSheet??Infinity)) throw new RangeError('XLSX sheet exceeds the configured row limit.'); const rn=ri+1; const cells:SourceCell[]=[]; const values:unknown[]=[];
    for(let ci=range.s.c;ci<=range.e.c;ci++){count++;if(count>(options.maxCellsPerSheet??Infinity)) throw new RangeError('XLSX sheet exceeds the configured cell limit.');const addr=columnLetter(ci+1)+rn;const c=ws[addr] as XLSX.CellObject|undefined;const raw=c?.v??null;if(ri===range.s.r&&typeof raw==='string')headers.set(ci+1,raw);values.push(raw);cells.push({ref:{sheetName:name,rowNumber:rn,columnIndex:ci+1,columnHeaderRaw:headers.get(ci+1),cellAddress:addr},rawValue:raw,displayedValue:c?.w,detectedType:c?.f?'FORMULA':c?.t==='e'?'ERROR':c?.t==='n'?'NUMBER':c?.t==='b'?'BOOLEAN':c?.t==='d'?'DATE':c?.t==='s'?'STRING':'BLANK',formula:c?.f,formulaResult:c?.f?c.v:undefined,numberFormat:c?.z===undefined?undefined:String(c.z)});}
    rows.push({sheetName:name,rowNumber:rn,kind:classifyRow(values,ri===range.s.r),cells});
   }
   return {name,ordinal:si+1,visibility:visibility.get(name)===2?'VERY_HIDDEN':visibility.get(name)===1?'HIDDEN':'VISIBLE',rows};
  });
  return {...metadata,sourceFormat:'XLSX',sheets};
 }
}
