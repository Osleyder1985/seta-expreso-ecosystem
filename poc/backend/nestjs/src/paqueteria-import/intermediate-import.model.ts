export type RowKind = 'HEADER' | 'DATA' | 'TOTAL' | 'SUBTOTAL' | 'FOOTER' | 'EMPTY' | 'UNKNOWN';

export type MappingDecision = 'EXACT' | 'ALIAS' | 'POSITIONAL_EXPLICIT' | 'DERIVED' | 'UNMAPPED' | 'AMBIGUOUS' | 'BLOCKED';

export interface SourceCellRef {
  readonly sheetName: string;
  readonly rowNumber: number;
  readonly columnIndex: number;
  readonly cellAddress: string;
}

export interface SourceCell {
  readonly ref: SourceCellRef;
  readonly columnHeaderRaw?: string;
  readonly rawValue: unknown;
  readonly displayedValue?: string;
  readonly detectedType?: string;
  readonly formula?: string;
  readonly formulaResult?: unknown;
  readonly numberFormat?: string;
  readonly isMerged?: boolean;
  readonly mergeRange?: string;
}

export interface SourceRow {
  readonly sheetName: string;
  readonly rowNumber: number;
  readonly kind: RowKind;
  readonly cells: readonly SourceCell[];
}

export interface SourceSheet {
  readonly name: string;
  readonly ordinal: number;
  readonly visibility?: 'VISIBLE' | 'HIDDEN' | 'VERY_HIDDEN';
  readonly rows: readonly SourceRow[];
}

export interface ImportSnapshot {
  readonly importSnapshotId: string;
  readonly sourceDocumentId: string;
  readonly contentHash: string;
  readonly sourceFileName: string;
  readonly sourceFormat: 'XLSX';
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
  readonly sheets: readonly SourceSheet[];
}

export interface ProvenanceReference {
  readonly sourceDocumentId: string;
  readonly contentHash: string;
  readonly sheetName: string;
  readonly rowNumber: number;
  readonly columnIndex: number;
  readonly columnHeaderRaw?: string;
  readonly cellAddress: string;
  readonly rawValue: unknown;
  readonly formula?: string;
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
}

export interface MappedFieldValue {
  readonly targetField: string;
  readonly sourceCellRefs: readonly SourceCellRef[];
  readonly rawValue: unknown;
  readonly interpretedValue?: unknown;
  readonly normalizedValue?: unknown;
  readonly transformationRefs: readonly string[];
  readonly mappingDecision: MappingDecision;
  readonly provenance: readonly ProvenanceReference[];
}

export interface ExtractedRecord {
  readonly extractedRecordId: string;
  readonly recordType: 'MANIFEST' | 'HOUSE' | 'PHYSICAL_UNIT' | 'PERSON' | 'ADDRESS' | 'CONTACT_POINT' | 'DERIVED_RECORD';
  readonly sourceRowRef: SourceCellRef;
  readonly fields: readonly MappedFieldValue[];
  readonly relatedRecordRefs: readonly string[];
}

export interface ImportFinding {
  readonly findingId: string;
  readonly ruleId: string;
  readonly severity: 'ERROR' | 'WARNING' | 'INFO';
  readonly blocking: boolean;
  readonly code: string;
  readonly message: string;
  readonly sourceRefs: readonly SourceCellRef[];
  readonly field?: string;
}

export interface ReconciliationSummary {
  readonly extractedHouseCount: number;
  readonly extractedPhysicalUnitQuantity: number;
  readonly extractedWeight: number;
  readonly distinctAddressCount: number;
  readonly discrepancies: readonly string[];
}

export interface ImportIntermediateResult {
  readonly snapshot: ImportSnapshot;
  readonly extractedRecords: readonly ExtractedRecord[];
  readonly findings: readonly ImportFinding[];
  readonly reconciliation: ReconciliationSummary;
}
