import * as XLSX from 'xlsx';
import type { ImportSnapshot, RowKind, SheetVisibility, SourceCell, SourceRow, SourceSheet } from './workbook-reader.types';
import { columnLetter, classifyRow, type WorkbookReaderMetadata, type WorkbookReaderOptions, type WorkbookReaderPort } from './workbook-reader.port';

const DEFAULT_MAX_SOURCE_BYTES = 50 * 1024 * 1024;

const toDetectedType = (cell: XLSX.CellObject | undefined): SourceCell['detectedType'] => {
  if (!cell || cell.v === undefined || cell.v === null) return 'BLANK';
  if (cell.t === 'e') return 'ERROR';
  if (cell.f) return 'FORMULA';
  if (cell.t === 'n') return 'NUMBER';
  if (cell.t === 'b') return 'BOOLEAN';
  if (cell.t === 'd') return 'DATE';
  if (cell.t === 's') return 'STRING';
  return 'UNKNOWN';
};

const toVisibility = (hidden: number | undefined): SheetVisibility => {
  if (hidden === 2) return 'VERY_HIDDEN';
  if (hidden === 1) return 'HIDDEN';
  return 'VISIBLE';
};

export class ExperimentalSheetJsWorkbookReader implements WorkbookReaderPort {
  async read(source: Buffer, metadata: WorkbookReaderMetadata, options: WorkbookReaderOptions = {}): Promise<ImportSnapshot> {
    const maxSourceBytes = options.maxSourceBytes ?? DEFAULT_MAX_SOURCE_BYTES;
    if (source.byteLength > maxSourceBytes) throw new RangeError('XLSX source exceeds the configured byte limit.');
    const workbook = XLSX.read(source, { type: 'buffer', cellFormula: true, cellNF: true, cellDates: true, cellStyles: true, cellText: true });
    if (options.maxSheets !== undefined && workbook.SheetNames.length > options.maxSheets) throw new RangeError('XLSX workbook exceeds the configured sheet limit.');
    const visibility = new Map<string, number>();
    for (const sheet of workbook.Workbook?.Sheets ?? []) { if (sheet.name) visibility.set(sheet.name, sheet.Hidden ?? 0); }
    const sheets: SourceSheet[] = workbook.SheetNames.map((sheetName, sheetIndex) => {
      const worksheet = workbook.Sheets[sheetName];
      const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: -1, c: -1 } };
      const rows: SourceRow[] = [];
      const maxRows = options.maxRowsPerSheet ?? Number.POSITIVE_INFINITY;
      const maxCells = options.maxCellsPerSheet ?? Number.POSITIVE_INFINITY;
      let cellCount = 0;
      for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
        if (rows.length >= maxRows) throw new RangeError('XLSX sheet exceeds the configured row limit.');
        const rowNumber = rowIndex + 1;
        const cells: SourceCell[] = [];
        const values: unknown[] = [];
        for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
          cellCount += 1;
          if (cellCount > maxCells) throw new RangeError('XLSX sheet exceeds the configured cell limit.');
          const address = columnLetter(columnIndex + 1) + rowNumber;
          const cell = worksheet[address] as XLSX.CellObject | undefined;
          const rawValue = cell?.v ?? null;
          values.push(rawValue);
          cells.push({ ref: { sheetName, rowNumber, columnIndex: columnIndex + 1, columnHeaderRaw: rowIndex === range.s.r && typeof rawValue === 'string' ? rawValue : undefined, cellAddress: address }, rawValue, displayedValue: cell?.w, detectedType: toDetectedType(cell), formula: cell?.f, formulaResult: cell?.f ? cell.v : undefined, numberFormat: cell?.z === undefined ? undefined : String(cell.z) });
        }
        rows.push({ sheetName, rowNumber, kind: classifyRow(values, rowIndex === range.s.r), cells });
      }
      return { name: sheetName, ordinal: sheetIndex + 1, visibility: toVisibility(visibility.get(sheetName)), rows };
    });
    return { ...metadata, sourceFormat: 'XLSX', sheets };
  }
};