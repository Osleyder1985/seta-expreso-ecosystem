export const DEFAULT_WORKBOOK_READER_LIMITS = Object.freeze({
  maxSourceBytes: 50 * 1024 * 1024,
  maxRowsPerSheet: 100_000,
  maxSheets: 32,
  maxCellsPerSheet: 1_000_000,
} as const);

export type WorkbookReaderLimits = typeof DEFAULT_WORKBOOK_READER_LIMITS;
