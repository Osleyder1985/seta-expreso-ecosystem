import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ImportSnapshot, SourceCell, SourceRow } from './workbook-reader.types';
import { JsonlEvidencePersistence } from './evidence-persistence';
import { runImportPipeline } from './import-pipeline';
import type { MappingProfile, SnapshotStore, PipelineResult } from './import-pipeline.types';

const cell = (sheet:string,row:number,column:number,header:string,value:unknown):SourceCell => ({
  ref:{sheetName:sheet,rowNumber:row,columnIndex:column,columnHeaderRaw:header,cellAddress:String.fromCharCode(64+column)+row},
  rawValue:value,
  displayedValue:value == null ? undefined : String(value),
  detectedType:value == null ? 'BLANK' : typeof value === 'number' ? 'NUMBER' : 'STRING',
});

const buildSnapshot = (headers:string[], data:unknown[][], totalBultos?:number):ImportSnapshot => {
  const sheet='Manifiesto';
  const rows:SourceRow[]=[
    {sheetName:sheet,rowNumber:1,kind:'HEADER',cells:headers.map((h,i)=>cell(sheet,1,i+1,h,h))},
    ...data.map((values,index)=>({sheetName:sheet,rowNumber:index+2,kind:'DATA' as const,cells:values.map((v,i)=>cell(sheet,index+2,i+1,headers[i],v))})),
  ];
  if (totalBultos !== undefined) rows.push({sheetName:sheet,rowNumber:data.length+2,kind:'TOTAL',cells:[cell(sheet,data.length+2,1,'House','TOTAL'),cell(sheet,data.length+2,2,'bultos',totalBultos)]});
  return {importSnapshotId:'IMP-CERT-001',sourceDocumentId:'DOC-CERT',contentHash:'sha-cert',sourceFileName:'cert.xlsx',sourceFormat:'XLSX',mappingProfileId:'manifest',mappingProfileVersion:'1.0.0',sheets:[{name:sheet,ordinal:1,visibility:'VISIBLE',rows}]};
};

const profile=(version='1.0.0'):MappingProfile=>({profileId:'manifest',version,fields:[
  {canonicalField:'house',headers:['House','No. House'],required:true},
  {canonicalField:'bultos',headers:['Bultos','Cantidad'],required:true},
  {canonicalField:'peso',headers:['Peso'],required:false},
  {canonicalField:'recipient',headers:['Destinatario'],required:false},
  {canonicalField:'address',headers:['Dirección','Direccion'],required:true},
]});

describe('F10-F19 real mapping/validation/reconciliation/pipeline certification',()=>{
  it('F10 reconciles declared TOTAL against detail and fails closed',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','Bultos','Dirección'],[['H1',2,'A'],['H2',3,'B']],4),profile());
    expect(result.reconciliation.status).toBe('REQUIRES_RECONCILIATION');
    expect(result.reconciliation.discrepancies.some(f=>f.ruleId==='R-RECONCILIATION-TOTAL')).toBe(true);
    expect(result.acceptance.state).toBe('REQUIRES_RECONCILIATION');
  });

  it('F11 resolves an authorized header alias through the real mapping engine',async()=>{
    const result=await runImportPipeline(buildSnapshot(['No. House','Cantidad','Dirección'],[['H1',2,'A']]),profile());
    expect(result.mapping.records[0].fields.find(f=>f.canonicalField==='house')?.decision).toBe('ALIAS');
    expect(result.mapping.records[0].fields.find(f=>f.canonicalField==='bultos')?.decision).toBe('ALIAS');
  });

  it('F12 rejects an ambiguous critical header mapping',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','No. House','Bultos','Dirección'],[['H1','H1B',2,'A']]),profile());
    expect(result.mapping.findings.some(f=>f.ruleId==='R-MAP-AMBIGUOUS-HEADER')).toBe(true);
    expect(result.acceptance.state).toBe('BLOCKED');
  });

  it('F13 blocks a missing critical field',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','Bultos'],[['H1',2]]),profile());
    expect(result.mapping.findings.some(f=>f.ruleId==='R-MAP-CRITICAL-FIELD-MISSING' && f.field==='address')).toBe(true);
    expect(result.acceptance.state).toBe('BLOCKED');
  });

  it('F14 preserves an additional source column instead of silently dropping it',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','Bultos','Dirección','ColumnaNueva'],[['H1',2,'A','KEEP-ME']]),profile());
    expect(result.mapping.records[0].additionalColumns.map(c=>c.rawValue)).toEqual(['KEEP-ME']);
  });

  it('F16 detects a numeric anomaly in the validation layer',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','Bultos','Dirección'],[['H1',-1,'A']]),profile());
    expect(result.validation.findings.some(f=>f.ruleId==='R-FLD-004' && f.field==='bultos')).toBe(true);
    expect(result.acceptance.state).toBe('BLOCKED');
  });

  it('F17 routes ambiguous identity to reconciliation instead of auto-merging',async()=>{
    const result=await runImportPipeline(buildSnapshot(['House','Bultos','Destinatario','Dirección'],[['H1',1,'JUAN','A'],['H2',1,'JUAN','B']]),profile());
    expect(result.reconciliation.discrepancies.some(f=>f.ruleId==='R-PER-002')).toBe(true);
    expect(result.acceptance.state).toBe('REQUIRES_RECONCILIATION');
  });

  it('F18 is idempotent for the same content/profile/version and key',async()=>{
    const snapshot=buildSnapshot(['House','Bultos','Dirección'],[['H1',1,'A']]);
    const store:SnapshotStore={get:()=>undefined,put:()=>undefined};
    let saved:PipelineResult|undefined;
    store.get=(key)=>saved;
    store.put=(_key,result)=>{saved=result;};
    const first=await runImportPipeline(snapshot,profile(),'IDEMP-001',{store});
    const second=await runImportPipeline(snapshot,profile(),'IDEMP-001',{store});
    expect(first.reusedExistingResult).toBe(false);
    expect(second.reusedExistingResult).toBe(true);
    expect(second.idempotencyKey).toBe(first.idempotencyKey);
  });

  it('F19 treats the same content with a different mapping version as a new interpretation',async()=>{
    const snapshot=buildSnapshot(['House','Bultos','Dirección'],[['H1',1,'A']]);
    const keys:string[]=[];
    const store:SnapshotStore={get:()=>undefined,put:(key)=>{keys.push(key);}};
    await runImportPipeline(snapshot,profile('1.0.0'),undefined,{store});
    await runImportPipeline(snapshot,profile('2.0.0'),undefined,{store});
    expect(keys).toHaveLength(2);
    expect(keys[0]).not.toBe(keys[1]);
  });

  it('F20 persists end-to-end provenance and audit evidence',async()=>{
    const dir=await mkdtemp(join(tmpdir(),'seta-f20-'));
    const persistence=new JsonlEvidencePersistence(join(dir,'provenance.jsonl'),join(dir,'audit.jsonl'));
    const result=await runImportPipeline(buildSnapshot(['House','Bultos','Dirección'],[['H1',1,'A']]),profile(),undefined,{persistence,clock:()=> '2026-09-27T20:00:00.000Z'});
    const provenance=await readFile(join(dir,'provenance.jsonl'),'utf8');
    const audit=await readFile(join(dir,'audit.jsonl'),'utf8');
    expect(provenance).toContain('"sourceDocumentId":"DOC-CERT"');
    expect(provenance).toContain('"cellAddress":"A2"');
    expect(provenance).toContain('"mappingProfileVersion":"1.0.0"');
    expect(audit).toContain('"eventType":"ManifestValidationCompleted"');
    expect(result.provenance.length).toBeGreaterThan(0);
  });
});
