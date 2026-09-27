import { ImportSnapshot, SourceCell, SourceRow, SourceSheet, RowKind } from './intermediate-import.model';

export interface WorkbookReaderPort {
  read(buffer: Buffer, metadata: {
    importSnapshotId: string;
    sourceDocumentId: string;
    contentHash: string;
    sourceFileName: string;
    mappingProfileId: string;
    mappingProfileVersion: string;
  }): Promise<ImportSnapshot>;
}

export interface WorkbookReaderOptions {
  readonly maxRowsPerSheet?: number;
}

export const classifyRow = (values: readonly unknown[], headerRow = false): RowKind => {
  if (headerRow) return 'HEADER';
  if (values.every((value) => value === null || value === undefined || String(value).trim() === '')) return 'EMPTY';
  const first = String(values[0] ?? '').trim().toUpperCase();
  if (first === 'TOTAL' || first.startsWith('TOTAL ')) return 'TOTAL';
  if (first === 'SUBTOTAL' || first.startsWith('SUBTOTAL ')) return 'SUBTOTAL';
  return 'DATA';
};

export const toCell = (
  sheetName: string,
  rowNumber: number,
  columnIndex: number,
  value: unknown,
  header?: string,
): SourceCell => ({
  ref: {
    sheetName,
    rowNumber,
    columnIndex,
    cellAddress: columnLetter(columnIndex) + rowNumber,
  },
  columnHeaderRaw: header,
  rawValue: value,
  displayedValue: value === null || value === undefined ? undefined : String(value),
  detectedType: value instanceof Date ? 'DATE' : typeof value,
});

const columnLetter = (index: number): string => {
  let n = index;
  let result = '';
  while (n > 0) {
    const remainder = (n - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
};
