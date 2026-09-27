import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { AuditRecord, ProvenanceRecord } from './import-pipeline.types';

export interface EvidencePersistencePort { persistProvenance(records: readonly ProvenanceRecord[]): Promise<void>; appendAudit(records: readonly AuditRecord[]): Promise<void>; }

export class JsonlEvidencePersistence implements EvidencePersistencePort {
  public constructor(private readonly provenancePath:string, private readonly auditPath:string) {}
  public async persistProvenance(records:readonly ProvenanceRecord[]):Promise<void>{ await mkdir(dirname(this.provenancePath),{recursive:true}); if(records.length) await appendFile(this.provenancePath,records.map(record=>JSON.stringify(record)).join('\n')+'\n','utf8'); }
  public async appendAudit(records:readonly AuditRecord[]):Promise<void>{ await mkdir(dirname(this.auditPath),{recursive:true}); if(records.length) await appendFile(this.auditPath,records.map(record=>JSON.stringify(record)).join('\n')+'\n','utf8'); }
}
