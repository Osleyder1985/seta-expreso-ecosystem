import readExcelFile from 'read-excel-file/node';
import type { WorkbookReaderMetadata, WorkbookReaderOptions, WorkbookReaderPort } from './workbook-reader.port';
import type { ImportSnapshot, SourceCell, SourceRow, RowKind } from './workbook-reader.types';
import { DEFAULT_WORKBOOK_READER_LIMITS } from './workbook-reader.limits';

export class ExperimentalReadExcelFileWorkbookReader implements WorkbookReaderPort {
 async read(source:Buffer,metadata:WorkbookReaderMetadata,options:WorkbookReaderOptions={}):Promise<ImportSnapshot>{
  if(source.byteLength>(options.maxSourceBytes ?? DEFAULT_WORKBOOK_READER_LIMITS.maxSourceBytes)) throw new Error('XLSX source exceeds configured byte limit');
  const sheets=await readExcelFile(source); if(sheets.length>(options.maxSheets ?? DEFAULT_WORKBOOK_READER_LIMITS.maxSheets)) throw new Error('XLSX workbook exceeds configured sheet limit');
  const normalized=sheets.map((sheet,si)=>{if(sheet.data.length>(options.maxRowsPerSheet ?? DEFAULT_WORKBOOK_READER_LIMITS.maxRowsPerSheet))throw new Error(`XLSX sheet "${sheet.sheet}" exceeds configured row limit`);let count=0;const headers=new Map<number,string>();
   const rows=sheet.data.map((values,ri)=>{const cells=values.map((value,ci)=>{count++;if(count>(options.maxCellsPerSheet ?? DEFAULT_WORKBOOK_READER_LIMITS.maxCellsPerSheet))throw new Error(`XLSX sheet "${sheet.sheet}" exceeds configured cell limit`);return this.cell(sheet.sheet,ri+1,ci+1,value)});if(ri===0)cells.forEach(c=>{if(typeof c.rawValue==='string')headers.set(c.ref.columnIndex,c.rawValue)});const normalized=cells.map(c=>({...c,ref:{...c.ref,columnHeaderRaw:headers.get(c.ref.columnIndex)}}));return {sheetName:sheet.sheet,rowNumber:ri+1,kind:this.classify(normalized,ri===0),cells:normalized} satisfies SourceRow});return{name:sheet.sheet,ordinal:si+1,visibility:'VISIBLE' as const,rows};});
  return {...metadata,sourceFormat:'XLSX',sheets:normalized};
 }
 private cell(sheetName:string,row:number,column:number,value:unknown):SourceCell{const detectedType=value==null?'BLANK':value instanceof Date?'DATE':typeof value==='number'?'NUMBER':typeof value==='boolean'?'BOOLEAN':typeof value==='string'?'STRING':'UNKNOWN';return{ref:{sheetName,rowNumber:row,columnIndex:column,cellAddress:this.address(column,row)},rawValue:value,displayedValue:value==null?undefined:String(value),detectedType};}
 private classify(cells:readonly SourceCell[],first:boolean):RowKind{const values=cells.map(c=>c.rawValue).filter(v=>v!=null&&v!=='');if(!values.length)return'EMPTY';const firstText=values.find(v=>typeof v==='string');const text=typeof firstText==='string'?firstText.trim().toUpperCase():'';if(text==='TOTAL'||text.startsWith('TOTAL '))return'TOTAL';if(text==='SUBTOTAL'||text.startsWith('SUBTOTAL '))return'SUBTOTAL';if(first&&values.every(v=>typeof v==='string'))return'HEADER';return'DATA';}
 private address(column:number,row:number){let n=column,result='';while(n>0){const rem=(n-1)%26;result=String.fromCharCode(65+rem)+result;n=Math.floor((n-1)/26)}return result+row;}
}
