import ExcelJS from 'exceljs';
import type { DetectedCellType, ImportSnapshot, RowKind, SheetVisibility, SourceCell, SourceRow } from './workbook-reader.types';
import type { WorkbookReaderMetadata, WorkbookReaderOptions, WorkbookReaderPort } from './workbook-reader.port';

export class ExperimentalExcelJsWorkbookReader implements WorkbookReaderPort {
  async read(source: Buffer, metadata: WorkbookReaderMetadata, options: WorkbookReaderOptions = {}): Promise<ImportSnapshot> {
    const limits = { maxSourceBytes: options.maxSourceBytes ?? 50*1024*1024, maxRowsPerSheet: options.maxRowsPerSheet ?? 100000, maxSheets: options.maxSheets ?? 32, maxCellsPerSheet: options.maxCellsPerSheet ?? 1000000 };
    if (source.byteLength > limits.maxSourceBytes) throw new Error('XLSX source exceeds configured byte limit');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(source as Parameters<typeof workbook.xlsx.load>[0]);
    if (workbook.worksheets.length > limits.maxSheets) throw new Error('XLSX workbook exceeds configured sheet limit');
    return { ...metadata, sourceFormat:'XLSX', sheets: workbook.worksheets.map((sheet,i)=>this.readSheet(sheet,i+1,limits)) };
  }
  private readSheet(sheet:ExcelJS.Worksheet, ordinal:number, limits:{maxRowsPerSheet:number;maxCellsPerSheet:number}){
    if(sheet.rowCount>limits.maxRowsPerSheet) throw new Error(`XLSX sheet "${sheet.name}" exceeds configured row limit`);
    const rows:SourceRow[]=[]; const headers=new Map<number,string>(); let cells=0; let header=false;
    sheet.eachRow({includeEmpty:true},row=>{
      const sourceCells:SourceCell[]=[];
      row.eachCell({includeEmpty:true},(c,col)=>{
        cells++; if(cells>limits.maxCellsPerSheet) throw new Error(`XLSX sheet "${sheet.name}" exceeds configured cell limit`);
        sourceCells.push(this.cell(sheet.name,row.number,col,c));
      });
      if(!header && sourceCells.every(c=>typeof c.rawValue==='string')) sourceCells.forEach(c=>headers.set(c.ref.columnIndex,String(c.rawValue)));
      const normalized=sourceCells.map(c=>({...c,ref:{...c.ref,columnHeaderRaw:headers.get(c.ref.columnIndex)}}));
      const kind=this.classify(normalized,header); if(kind==='HEADER') header=true;
      rows.push({sheetName:sheet.name,rowNumber:row.number,kind,cells:normalized});
    });
    return {name:sheet.name,ordinal,visibility:this.visibility(sheet.state),rows};
  }
  private classify(cells:readonly SourceCell[],header:boolean):RowKind{
    const values=cells.map(c=>c.rawValue); if(values.every(v=>v==null||String(v).trim()==='')) return 'EMPTY';
    const first=String(values[0]??'').trim().toUpperCase();
    if(first==='TOTAL'||first.startsWith('TOTAL ')) return 'TOTAL';
    if(first==='SUBTOTAL'||first.startsWith('SUBTOTAL ')) return 'SUBTOTAL';
    if(!header&&values.filter(v=>v!=null&&String(v).trim()!=='').every(v=>typeof v==='string')) return 'HEADER';
    return 'DATA';
  }
  private cell(sheetName:string,row:number,column:number,c:ExcelJS.Cell):SourceCell{
    const value=c.value; const formula=value&&typeof value==='object'&&'formula' in value ? value as {formula:string;result?:unknown}:undefined;
    const raw=formula?formula.result:value;
    const detectedType:DetectedCellType=formula?'FORMULA':c.type===ExcelJS.ValueType.Error?'ERROR':c.type===ExcelJS.ValueType.Date?'DATE':c.type===ExcelJS.ValueType.Number?'NUMBER':c.type===ExcelJS.ValueType.Boolean?'BOOLEAN':c.type===ExcelJS.ValueType.String?'STRING':c.type===ExcelJS.ValueType.Null?'BLANK':'UNKNOWN';
    return {ref:{sheetName,rowNumber:row,columnIndex:column,cellAddress:c.address},rawValue:raw,displayedValue:c.text||undefined,detectedType,formula:formula?.formula,formulaResult:formula?.result,numberFormat:c.numFmt};
  }
  private visibility(state:ExcelJS.Worksheet['state']):SheetVisibility{return state==='veryHidden'?'VERY_HIDDEN':state==='hidden'?'HIDDEN':'VISIBLE';}
}
