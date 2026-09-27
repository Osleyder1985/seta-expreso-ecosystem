import readExcelFile from 'read-excel-file/node';
import type { WorkbookReaderMetadata, WorkbookReaderOptions, WorkbookReaderPort } from './workbook-reader.port';
import type { ImportSnapshot, SourceCell, SourceRow, RowKind, SheetVisibility } from './workbook-reader.types';

export class ExperimentalReadExcelFileWorkbookReader implements WorkbookReaderPort {
  async read(source: Buffer, metadata: WorkbookReaderMetadata, options: WorkbookReaderOptions = {}): Promise<ImportSnapshot> {
    const maxSourceBytes = options.maxSourceBytes ?? 50 * 1024 * 1024;
    if (source.byteLength > maxSourceBytes) throw new Error('XLSX source exceeds configured byte limit');

    const sheets = await readExcelFile(source);
    const maxSheets = options.maxSheets ?? 32;
    if (sheets.length > maxSheets) throw new Error('XLSX workbook exceeds configured sheet limit');

    const normalized = sheets.map((sheet, sheetIndex) => {
      const rows = sheet.data.map((values, rowIndex) => {
        const cells = values.map((value, columnIndex) => this.cell(sheet.sheet, rowIndex + 1, columnIndex + 1, value));
        return {
          sheetName: sheet.sheet,
          rowNumber: rowIndex + 1,
          kind: this.classify(cells, rowIndex === 0),
          cells,
        } satisfies SourceRow;
      });
      return {
        name: sheet.sheet,
        ordinal: sheetIndex + 1,
        visibility: 'VISIBLE' as SheetVisibility,
        rows,
      };
    });

    return { ...metadata, sourceFormat: 'XLSX', sheets: normalized };
  }

  private cell(sheetName: string, rowNumber: number, columnIndex: number, value: unknown): SourceCell {
    const detectedType = value === null || value === undefined ? 'BLANK'
      : value instanceof Date ? 'DATE'
      : typeof value === 'number' ? 'NUMBER'
      : typeof value === 'boolean' ? 'BOOLEAN'
      : typeof value === 'string' ? 'STRING'
      : 'UNKNOWN';
    return {
      ref: { sheetName, rowNumber, columnIndex, cellAddress: this.address(columnIndex, rowNumber) },
      rawValue: value,
      displayedValue: value == null ? undefined : String(value),
      detectedType,
    };
  }

  private classify(cells: readonly SourceCell[], firstRow: boolean): RowKind {
    const values = cells.map(c => c.rawValue).filter(v => v !== null && v !== undefined && v !== '');
    if (!values.length) return 'EMPTY';
    const firstText = values.find(v => typeof v === 'string');
    const text = typeof firstText === 'string' ? firstText.trim().toUpperCase() : '';
    if (text === 'TOTAL' || text.startsWith('TOTAL ')) return 'TOTAL';
    if (text === 'SUBTOTAL' || text.startsWith('SUBTOTAL ')) return 'SUBTOTAL';
    if (firstRow && values.every(v => typeof v === 'string')) return 'HEADER';
    return 'DATA';
  }

  private address(column: number, row: number): string {
    let n = column;
    let result = '';
    while (n > 0) {
      const remainder = (n - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      n = Math.floor((n - 1) / 26);
    }
    return result + row;
  }
}
