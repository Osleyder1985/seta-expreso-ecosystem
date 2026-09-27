export type SheetVisibility = 'VISIBLE' | 'HIDDEN' | 'VERY_HIDDEN';

export type RowKind = 'HEADER' | 'DATA' | 'EMPTY' | 'TOTAL' | 'SUBTOTAL';

export type DetectedCellType =
  | 'STRING'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'FORMULA'
  | 'ERROR'
  | 'BLANK'
  | 'UNKNOWN';

export interface SourceCellRef {
  readonly sheetName: string;
  readonly rowNumber: number;
  readonly columnIndex: number;
  readonly columnHeaderRaw?: string;
  readonly cellAddress: string;
}

export interface SourceCell {
  readonly ref: SourceCellRef;
  readonly rawValue: unknown;
  readonly displayedValue?: string;
  readonly detectedType: DetectedCellType;
  readonly formula?: string;
  readonly formulaResult?: unknown;
  readonly numberFormat?: string;
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
  readonly visibility: SheetVisibility;
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
