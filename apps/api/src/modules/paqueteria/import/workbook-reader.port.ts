import type {
  ImportSnapshot,
  RowKind,
  SourceCell,
} from './workbook-reader.types';

export interface WorkbookReaderMetadata {
  readonly importSnapshotId: string;
  readonly sourceDocumentId: string;
  readonly contentHash: string;
  readonly sourceFileName: string;
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
}

export interface WorkbookReaderOptions {
  /** Maximum source workbook size accepted before parsing. */
  readonly maxSourceBytes?: number;
  readonly maxRowsPerSheet?: number;
  readonly maxSheets?: number;
  readonly maxCellsPerSheet?: number;
}

export interface WorkbookReaderPort {
  read(
    source: Buffer,
    metadata: WorkbookReaderMetadata,
    options?: WorkbookReaderOptions,
  ): Promise<ImportSnapshot>;
}

export const classifyRow = (
  values: readonly unknown[],
  headerRow = false,
): RowKind => {
  if (headerRow) return 'HEADER';

  if (
    values.every(
      (value) =>
        value === null ||
        value === undefined ||
        String(value).trim() === '',
    )
  ) {
    return 'EMPTY';
  }

  const first = String(values[0] ?? '').trim().toUpperCase();
  if (first === 'TOTAL' || first.startsWith('TOTAL ')) return 'TOTAL';
  if (first === 'SUBTOTAL' || first.startsWith('SUBTOTAL ')) return 'SUBTOTAL';

  return 'DATA';
};

export const columnLetter = (index: number): string => {
  if (!Number.isInteger(index) || index < 1) {
    throw new RangeError('Column index must be a positive integer.');
  }

  let current = index;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
};

export const toSourceCell = (
  sheetName: string,
  rowNumber: number,
  columnIndex: number,
  value: unknown,
  columnHeaderRaw?: string,
): SourceCell => ({
  ref: {
    sheetName,
    rowNumber,
    columnIndex,
    columnHeaderRaw,
    cellAddress: `${columnLetter(columnIndex)}${rowNumber}`,
  },
  rawValue: value,
  displayedValue:
    value === null || value === undefined ? undefined : String(value),
  detectedType:
    value === null || value === undefined
      ? 'BLANK'
      : value instanceof Date
        ? 'DATE'
        : typeof value === 'number'
          ? 'NUMBER'
          : typeof value === 'boolean'
            ? 'BOOLEAN'
            : typeof value === 'string'
              ? 'STRING'
              : 'UNKNOWN',
});
