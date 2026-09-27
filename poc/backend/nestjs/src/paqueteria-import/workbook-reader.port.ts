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
  readonly headerScanRows?: number;
  readonly requiredHeaderTokens?: readonly string[];
}

export interface HeaderCandidate {
  readonly rowNumber: number;
  readonly score: number;
  readonly matchedRequiredTokens: number;
  readonly nonEmptyCells: number;
}

export const detectHeaderRow = (
  rows: readonly unknown[][],
  options: Pick<WorkbookReaderOptions, 'headerScanRows' | 'requiredHeaderTokens'> = {},
): number => {
  const scanRows = Math.min(options.headerScanRows ?? 20, rows.length);
  const required = (options.requiredHeaderTokens ?? []).map(normalizeHeaderToken).filter(Boolean);
  let best: HeaderCandidate | undefined;

  for (let index = 0; index < scanRows; index += 1) {
    const values = rows[index] ?? [];
    const normalized = values.map(value => normalizeHeaderToken(value)).filter(Boolean);
    if (normalized.length < 2) continue;
    const unique = new Set(normalized);
    const matched = required.length === 0 ? 0 : required.filter(token => normalized.some(value => value.includes(token) || token.includes(value))).length;
    const duplicatePenalty = normalized.length - unique.size;
    const score = (required.length ? matched * 100 : 0) + normalized.length * 5 + unique.size - duplicatePenalty * 3;
    const candidate = { rowNumber: index + 1, score, matchedRequiredTokens: matched, nonEmptyCells: normalized.length };
    if (!best || candidate.score > best.score) best = candidate;
  }

  return best?.rowNumber ?? 1;
};

const normalizeHeaderToken = (value: unknown): string => String(value ?? '')
  .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
  .trim().toUpperCase().replace(/\\s+/g, ' ');

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
