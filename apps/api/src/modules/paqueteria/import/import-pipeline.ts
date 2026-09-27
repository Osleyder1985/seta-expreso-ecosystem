import type { ImportSnapshot, SourceCell } from './workbook-reader.types';
import { mapSnapshot } from './mapping-engine';
import { validateRecords } from './validation-engine';
import { reconcileIdentity, reconcileTotals } from './reconciliation-service';
import type { AcceptanceResult, AuditRecord, EvidencePersistence, MappingProfile, PipelineResult, SnapshotStore, ProvenanceRecord } from './import-pipeline.types';

export interface ImportPipelineOptions {
  readonly pipelineVersion?: string;
  readonly clock?: () => string;
  readonly persistence?: EvidencePersistence;
  readonly store?: SnapshotStore;
}

const provenance = (snapshot: ImportSnapshot, profile: MappingProfile, pipelineVersion: string): ProvenanceRecord[] =>
  snapshot.sheets.flatMap(sheet => sheet.rows.flatMap(row => row.cells.map((cell: SourceCell) => ({
    sourceDocumentId: snapshot.sourceDocumentId,
    contentHash: snapshot.contentHash,
    sourceFileName: snapshot.sourceFileName,
    sheetName: cell.ref.sheetName,
    rowNumber: cell.ref.rowNumber,
    columnIndex: cell.ref.columnIndex,
    columnHeaderRaw: cell.ref.columnHeaderRaw,
    cellAddress: cell.ref.cellAddress,
    rawValue: cell.rawValue,
    mappingProfileId: profile.profileId,
    mappingProfileVersion: profile.version,
    pipelineVersion,
  }))));

export const runImportPipeline = async (
  snapshot: ImportSnapshot,
  profile: MappingProfile,
  idempotencyKey?: string,
  options: ImportPipelineOptions = {},
): Promise<PipelineResult> => {
  const pipelineVersion = options.pipelineVersion ?? '1.0.0';
  const key = idempotencyKey ?? snapshot.contentHash + '|' + profile.profileId + '|' + profile.version;
  const existing = options.store?.get(key);
  if (existing) return { ...existing, reusedExistingResult: true };

  const now = options.clock ?? (() => new Date().toISOString());
  const mapping = mapSnapshot(snapshot, profile);
  const validation = validateRecords(mapping.records, snapshot.importSnapshotId + '-validation');
  const reconciliation = reconcileTotals(snapshot, mapping.records, snapshot.importSnapshotId + '-reconciliation');
  const identity = reconcileIdentity(validation.findings);

  const reconciliationFindings = [...reconciliation.discrepancies, ...identity.discrepancies];
  const requiresReconciliation = reconciliationFindings.length > 0;
  const mappingBlocked = mapping.findings.some(f => f.blocking);
  const validationBlocked = validation.blocked;

  let acceptance: AcceptanceResult;
  if (mappingBlocked && !requiresReconciliation) acceptance = { accepted:false, state:'BLOCKED', reason:'Blocking mapping finding' };
  else if (requiresReconciliation) acceptance = { accepted:false, state:'REQUIRES_RECONCILIATION', reason:'Business discrepancy or identity ambiguity requires reconciliation' };
  else if (validationBlocked) acceptance = { accepted:false, state:'BLOCKED', reason:'Blocking validation finding' };
  else acceptance = { accepted:true, state:'ACCEPTED', reason:'Mapping, validation and reconciliation completed without blocking findings' };

  const audit: AuditRecord[] = [
    { eventId:snapshot.importSnapshotId + '-received', eventType:'ManifestImportReceived', importSnapshotId:snapshot.importSnapshotId, occurredAt:now(), details:{ contentHash:snapshot.contentHash, profileId:profile.profileId, profileVersion:profile.version } },
    { eventId:snapshot.importSnapshotId + '-validated', eventType:'ManifestValidationCompleted', importSnapshotId:snapshot.importSnapshotId, occurredAt:now(), details:{ findingCount:validation.findings.length, blocked:validation.blocked } },
    { eventId:snapshot.importSnapshotId + '-reconciled', eventType:'ManifestReconciliationCompleted', importSnapshotId:snapshot.importSnapshotId, occurredAt:now(), details:{ status:reconciliation.status, discrepancyCount:reconciliationFindings.length } },
    { eventId:snapshot.importSnapshotId + '-accepted', eventType:'ManifestAccepted', importSnapshotId:snapshot.importSnapshotId, occurredAt:now(), details:{ accepted:acceptance.accepted, state:acceptance.state } },
  ];

  const result: PipelineResult = {
    importSnapshotId:snapshot.importSnapshotId,
    pipelineVersion,
    mapping,
    validation,
    reconciliation:{ ...reconciliation, discrepancies:reconciliationFindings, status:requiresReconciliation ? 'REQUIRES_RECONCILIATION' : reconciliation.status },
    acceptance,
    provenance:provenance(snapshot, profile, pipelineVersion),
    audit,
    idempotencyKey:key,
    reusedExistingResult:false,
  };

  if (options.persistence) {
    await options.persistence.persistProvenance(result.provenance);
    await options.persistence.appendAudit(result.audit);
  }
  options.store?.put(key, result);
  return result;
};
