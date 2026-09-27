import ExcelJS from 'exceljs';
import { ExperimentalExcelJsWorkbookReader } from './experimental-exceljs-workbook-reader';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';
import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';
import { runImportPipeline } from './import-pipeline';
import type { MappingProfile } from './import-pipeline.types';
import type { ImportSnapshot, SourceCell, SourceRow } from './workbook-reader.types';

const profile:MappingProfile={profileId:'manifest-default',version:'1.0.0',fields:[
 {canonicalField:'house',headers:['House','No. House'],required:true},
 {canonicalField:'bultos',headers:['Bultos','Cantidad'],required:true},
 {canonicalField:'peso',headers:['Peso']},
 {canonicalField:'recipient',headers:['Destinatario']},
 {canonicalField:'address',headers:['Dirección','Direccion'],required:true},
]};

async function sourceBuffer():Promise<Buffer>{
 const wb=new ExcelJS.Workbook();const ws=wb.addWorksheet('Manifiesto');
 ws.addRow(['House','Bultos','Dirección','Destinatario','Peso','Extra']);
 ws.addRow(['CACC-00000001',3,'DIRECCION_TEST_001','JUAN',12.5,'KEEP']);
 ws.addRow(['CACC-00000002',1,'DIRECCION_TEST_001','ANA',7.5,'KEEP']);
 ws.addRow(['CACC-00000003',2,'DIRECCION_TEST_002','LUIS',3.25,'KEEP']);
 ws.addRow(['TOTAL',null,null,null,23.25,'KEEP']);
 const hidden=wb.addWorksheet('Oculta');hidden.state='hidden';const very=wb.addWorksheet('MuyOculta');very.state='veryHidden';
 return Buffer.from(await wb.xlsx.writeBuffer());
}

const metadata=(id:string)=>({importSnapshotId:'IMP-'+id,sourceDocumentId:'DOC-CERT',contentHash:'reader-to-pipeline-fixture-sha',sourceFileName:'reader-to-pipeline.xlsx',mappingProfileId:profile.profileId,mappingProfileVersion:profile.version});

const readers=[
 ['exceljs',new ExperimentalExcelJsWorkbookReader()],
 ['sheetjs',new ExperimentalSheetJsWorkbookReader()],
 ['read-excel-file',new ExperimentalReadExcelFileWorkbookReader()],
] as const;

const cloneSnapshot=(snapshot:ImportSnapshot,mutate:(rows:SourceRow[])=>void):ImportSnapshot=>{
 const sheets=snapshot.sheets.map(sheet=>({...sheet,rows:sheet.rows.map(row=>({...row,cells:row.cells.map(cell=>({...cell,ref:{...cell.ref}}))}))}));
 mutate(sheets[0].rows as SourceRow[]);
 return {...snapshot,sheets};
};

const header=(row:SourceRow,index:number)=>row.cells[index];

describe.each(readers)('%s → real snapshot → F10-F20 pipeline',(adapter,reader)=>{
 let snapshot:ImportSnapshot;
 beforeAll(async()=>{snapshot=await reader.read(await sourceBuffer(),metadata(adapter));});
 test('baseline snapshot enters the real pipeline and preserves additional source data',async()=>{
   const result=await runImportPipeline(snapshot,profile);
   expect(result.mapping.records).toHaveLength(3);
   expect(result.mapping.records[0].additionalColumns.some(c=>c.rawValue==='KEEP')).toBe(true);
   expect(result.acceptance.state).toBe('ACCEPTED');
 });
 test('F10 uses the reader-produced TOTAL row for real reconciliation',async()=>{
   const bad=cloneSnapshot(snapshot,rows=>{const total=rows.find(r=>r.kind==='TOTAL')!;total.cells[4].rawValue=99;});
   const result=await runImportPipeline(bad,profile);
   expect(result.reconciliation.discrepancies.some(f=>f.ruleId==='R-RECONCILIATION-TOTAL')).toBe(true);
   expect(result.acceptance.state).toBe('REQUIRES_RECONCILIATION');
 });
 test('F11-F13 execute mapping against the reader-produced source observations',async()=>{
   const alias=cloneSnapshot(snapshot,rows=>{const h=rows[0];h.cells[0].rawValue='No. House';h.cells[0].ref.columnHeaderRaw='No. House';h.cells[1].rawValue='Cantidad';h.cells[1].ref.columnHeaderRaw='Cantidad';for(const row of rows) { row.cells[0].ref.columnHeaderRaw='No. House'; row.cells[1].ref.columnHeaderRaw='Cantidad'; }});
   const aliasResult=await runImportPipeline(alias,profile);
   expect(aliasResult.mapping.records[0].fields.find(f=>f.canonicalField==='house')?.decision).toBe('ALIAS');
   const ambiguous=cloneSnapshot(snapshot,rows=>{rows[0].cells[0].ref.columnIndex=1;rows[0].cells[0].ref.cellAddress='A1';rows[0].cells[0].rawValue='House';rows[0].cells[1].ref.columnIndex=2;rows[0].cells[1].ref.cellAddress='B1';rows[0].cells[1].rawValue='House';});
   const ambiguousResult=await runImportPipeline(ambiguous,profile);
   expect(ambiguousResult.mapping.findings.some(f=>f.ruleId==='R-MAP-AMBIGUOUS-HEADER')).toBe(true);
   const missing=cloneSnapshot(snapshot,rows=>{rows[0].cells[2].rawValue='Otra';rows[0].cells[2].ref.columnHeaderRaw='Otra';});
   const missingResult=await runImportPipeline(missing,profile);
   expect(missingResult.mapping.findings.some(f=>f.ruleId==='R-MAP-CRITICAL-FIELD-MISSING')).toBe(true);
 });
 test('F16-F19 execute validation/reconciliation/idempotency on the reader output',async()=>{
   const anomalous=cloneSnapshot(snapshot,rows=>{rows[1].cells[1].rawValue=-1;});
   const anomalyResult=await runImportPipeline(anomalous,profile);
   expect(anomalyResult.validation.findings.some(f=>f.ruleId==='R-FLD-004')).toBe(true);
   const identity=cloneSnapshot(snapshot,rows=>{rows[2].cells[3].rawValue='JUAN';rows[3].cells[3].rawValue='JUAN';});
   const identityResult=await runImportPipeline(identity,profile);
   expect(identityResult.reconciliation.discrepancies.some(f=>f.ruleId==='R-PER-002')).toBe(true);
   const store=new Map<string,Awaited<ReturnType<typeof runImportPipeline>>>();
   const first=await runImportPipeline(snapshot,profile,'IDEMP-'+adapter,{store:{get:k=>store.get(k),put:(k,v)=>{store.set(k,v);}}});
   const second=await runImportPipeline(snapshot,profile,'IDEMP-'+adapter,{store:{get:k=>store.get(k),put:(k,v)=>{store.set(k,v);}}});
   expect(first.reusedExistingResult).toBe(false);expect(second.reusedExistingResult).toBe(true);
   const v2=await runImportPipeline(snapshot,{...profile,version:'2.0.0'},undefined,{store:{get:k=>store.get(k),put:(k,v)=>{store.set(k,v);}}});
   expect(v2.idempotencyKey).not.toBe(first.idempotencyKey);
 });
});
