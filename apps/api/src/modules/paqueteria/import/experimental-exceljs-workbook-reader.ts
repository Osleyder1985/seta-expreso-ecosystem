import ExcelJS from 'exceljs';
import type {
  DetectedCellType,
  ImportSnapshot,
  RowKind,
  SheetVisibility,
  SourceCell,
  SourceRow,
} from './workbook-reader.types';
import type {
  WorkbookReaderMetadata,
  WorkbookReaderOptions,
  WorkbookReaderPort,
} from './workbook-reader.port';

const DEFAULT_MAX_SOURCE_BYTES = 50 * 1024 * 1024;
const DEFAULT_MAX_ROWS_PER_SHEET = 100_000;
const DEFAULT_MAX_SHEETS = 32;
const DEFAULT_MAX_CELLS_PER_SHEET = 1_000_000;

export class ExperimentalExcelJsWorkbookReader implements WorkbookReaderPort {
  async read(
    source: Buffer,
    metadata: WorkbookReaderMetadata,
    options: WorkbookReaderOptions = {},
  ): Promise<ImportSnapshot> {
    const limits = {
      maxSourceBytes: options.maxSourceBytes ?? DEFAULT_MAX_SOURCE_BYTES,
      maxRowsPerSheet: options.maxRowsPerSheet ?? DEFAULT_MAX_ROWS_PER_SHEET,
      maxSheets: options.maxSheets ?? DEFAULT_MAX_SHEETS,
      maxCellsPerSheet:
        options.maxCellsPerSheet ?? DEFAULT_MAX_CELLS_PER_SHEET,
    };

    if (source.byteLength > limits.maxSourceBytes) {
      throw new Error('XLSX source exceeds configured byte limit');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(source);

    if (workbook.worksheets.length > limits.maxSheets) {
      throw new Error('XLSX workbook exceeds configured sheet limit');
    }

    const sheets = workbook.worksheets.map((worksheet, index) =>
      this.readSheet(worksheet, index + 1, limits),
    );

    return {
      ...metadata,
      sourceFormat: 'XLSX',
      sheets,
    };
  }

  private readSheet(
    worksheet: ExcelJS.Worksheet,
    ordinal: number,
    limits: Required<{
      maxSourceBytes: number;
      maxRowsPerSheet: number;
      maxSheets: number;
      maxCellsPerSheet: number;
    }>,
  ) {
    if (worksheet.rowCount > limits.maxRowsPerSheet) {
      throw new Error(
        `XLSX sheet "${worksheet.name}" exceeds configured row limit`,
      );
    }

    const rows: SourceRow[] = [];
    let cellCount = 0;
    let headerDetected = false;

    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const cells: SourceCell[] = [];
      row.eachCell({ includeEmpty: true }, (cell, columnIndex) => {
        cellCount += 1;
        if (cellCount > limits.maxCellsPerSheet) {
          throw new Error(
            `XLSX sheet "${worksheet.name}" exceeds configured cell limit`,
          );
        }

        cells.push(this.toSourceCell(worksheet.name, row.number, columnIndex, cell));
      });

      const kind = this.classifyRow(cells, headerDetected);
      if (kind === 'HEADER') headerDetected = true;
      rows.push({
        sheetName: worksheet.name,
        rowNumber: row.number,
        kind,
        cells,
      });
    });

    return {
      name: worksheet.name,
      ordinal,
      visibility: this.visibility(worksheet.state),
      rows,
    };
  }

  private classifyRow(cells: readonly SourceCell[], headerDetected: boolean): RowKind {
    const values = cells.map((cell) => cell.rawValue);
    const nonBlank = values.filter((value) => value !== null && value !== undefined && value !== '');
    if (nonBlank.length === 0) return 'EMPTY';

    const firstText = nonBlank.find((value) => typeof value === 'string');
    const normalized = typeof firstText === 'string' ? firstText.trim().toUpperCase() : '';

    if (normalized === 'TOTAL' || normalized.startsWith('TOTAL ')) return 'TOTAL';
    if (normalized === 'SUBTOTAL' || normalized.startsWith('SUBTOTAL ')) return 'SUBTOTAL';

    if (!headerDetected && nonBlank.every((value) => typeof value === 'string')) {
      return 'HEADER';
    }

    return 'DATA';
  }

  private toSourceCell(
    sheetName: string,
    rowNumber: number,
    columnIndex: number,
    cell: ExcelJS.Cell,
  ): SourceCell {
    const value = cell.value;
    const formulaValue =
      value && typeof value === 'object' && 'formula' in value
        ? value as { formula: string; result?: unknown }
        : undefined;

    const rawValue = formulaValue ? formulaValue.result : value;
    const detectedType: DetectedCellType = formulaValue
      ? 'FORMULA'
      : cell.type === ExcelJS.ValueType.Error
        ? 'ERROR'
        : cell.type === ExcelJS.ValueType.Date
          ? 'DATE'
          : cell.type === ExcelJS.ValueType.Number
            ? 'NUMBER'
            : cell.type === ExcelJS.ValueType.Boolean
              ? 'BOOLEAN'
              : cell.type === ExcelJS.ValueType.String
                ? 'STRING'
                : cell.type === ExcelJS.ValueType.Null
                  ? 'BLANK'
                  : 'UNKNOWN';

    return {
      ref: {
        sheetName,
        rowNumber,
        columnIndex,
        columnHeaderRaw: undefined,
        cellAddress: cell.address,
      },
      rawValue,
      displayedValue: cell.text || undefined,
      detectedType,
      formula: formulaValue?.formula,
      formulaResult: formulaValue?.result,
      numberFormat: cell.numFmt,
    };
  }

  private visibility(state: ExcelJS.Worksheet['state']): SheetVisibility {
    if (state === 'veryHidden') return 'VERY_HIDDEN';
    if (state === 'hidden') return 'HIDDEN';
    return 'VISIBLE';
  }
}
