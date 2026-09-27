import type { ImportSnapshot, SourceCell, SourceRow } from './workbook-reader.types';

export type MappingDecision = 'EXACT' | 'ALIAS' | 'UNMAPPED' | 'AMBIGUOUS' | 'BLOCKED';
export interface MappingFieldSpec { readonly canonicalField: string; readonly headers: readonly string[]; readonly required?: boolean; }
export interface MappingProfile { readonly profileId: string; readonly version: string; readonly fields: readonly MappingFieldSpec[]; }
export interface MappedField { readonly canonicalField: string; readonly value: unknown; readonly decision: MappingDecision; readonly sourceCells: readonly SourceCell[]; }
export interface MappedRecord { readonly row: SourceRow; readonly fields: readonly MappedField[]; readonly additionalColumns: readonly SourceCell[]; }
export interface Finding { readonly id: string; readonly ruleId: string; readonly ruleVersion: string; readonly severity: 'INFO'|'WARNING'|'ERROR'; readonly blocking: boolean; readonly status: 'OPEN'|'RECONCILED'|'RESOLVED'; readonly rowNumber?: number; readonly field?: string; readonly sourceRefs: readonly SourceCell[]; readonly actualValue?: unknown; readonly expectedValue?: unknown; readonly message: string; }
export interface MappingResult { readonly profileId: string; readonly profileVersion: string; readonly records: readonly MappedRecord[]; readonly findings: readonly Finding[]; }
export interface ValidationSummary { readonly validationRunId: string; readonly findings: readonly Finding[]; readonly passed: boolean; readonly blocked: boolean; }
export interface ReconciliationResult { readonly reconciliationId: string; readonly status: 'PASS'|'REQUIRES_RECONCILIATION'|'BLOCKED'; readonly discrepancies: readonly Finding[]; readonly declaredTotals: Readonly<Record<string,number>>; readonly observedTotals: Readonly<Record<string,number>>; }
export interface AcceptanceResult { readonly accepted: boolean; readonly state: 'ACCEPTED'|'REQUIRES_RECONCILIATION'|'BLOCKED'; readonly reason: string; }
export interface ProvenanceRecord { readonly sourceDocumentId: string; readonly contentHash: string; readonly sourceFileName: string; readonly sheetName: string; readonly rowNumber: number; readonly columnIndex: number; readonly columnHeaderRaw?: string; readonly cellAddress: string; readonly rawValue: unknown; readonly mappingProfileId: string; readonly mappingProfileVersion: string; readonly pipelineVersion: string; }
export interface AuditRecord { readonly eventId: string; readonly eventType: string; readonly importSnapshotId: string; readonly occurredAt: string; readonly details: Readonly<Record<string,unknown>>; }
export interface PipelineResult { readonly importSnapshotId: string; readonly pipelineVersion: string; readonly mapping: MappingResult; readonly validation: ValidationSummary; readonly reconciliation: ReconciliationResult; readonly acceptance: AcceptanceResult; readonly provenance: readonly ProvenanceRecord[]; readonly audit: readonly AuditRecord[]; readonly idempotencyKey: string; readonly reusedExistingResult: boolean; }
export type EvidencePersistence = { persistProvenance(records: readonly ProvenanceRecord[]): Promise<void>; appendAudit(records: readonly AuditRecord[]): Promise<void>; };
export type SnapshotStore = { get(key: string): PipelineResult|undefined; put(key: string, result: PipelineResult): void; };
