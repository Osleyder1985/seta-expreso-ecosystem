import ExcelJS from 'exceljs';
import { createHash } from 'node:crypto';
import { ImportSnapshot, SourceRow, SourceSheet } from './intermediate-import.model';
import { WorkbookReaderOptions, WorkbookReaderPort, classifyRow, detectHeaderRow, toCell } from './workbook-reader.port';

export class ExcelJsWorkbookReader implements WorkbookReaderPort {
  constructor(private readonly options: WorkbookReaderOptions = {}) {}

  async read(
    buffer: Buffer,
    metadata: {
      importSnapshotId: string;
      sourceDocumentId: string;
      contentHash: string;
      sourceFileName: string;
      mappingProfileId: string;
      mappingProfileVersion: string;
    },
  ): Promise<ImportSnapshot> {
    if (!buffer.length) throw new Error('XLSX source buffer is empty.');

    const contentHash = metadata.contentHash || createHash('sha256').update(buffer).digest('hex');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheets: SourceSheet[] = [];
    workbook.worksheets.forEach((worksheet, ordinal) => {
      const maxRows = this.options.maxRowsPerSheet ?? worksheet.rowCount;
      const rawRows = Array.from({ length: Math.min(worksheet.rowCount, maxRows) }, (_, index) => (worksheet.getRow(index + 1).values as unknown[]).slice(1));
      const headerRowNumber = detectHeaderRow(rawRows, this.options);
      const headerValues = rawRows[headerRowNumber - 1] ?? [];
      const headers = headerValues.map((value) => value === null || value === undefined ? undefined : String(value));

      const rows: SourceRow[] = [];
      for (let rowNumber = 1; rowNumber <= Math.min(worksheet.rowCount, maxRows); rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const values = row.values as unknown[];
        const cells = values.slice(1).map((value, index) => {
          const cell = row.getCell(index + 1);
          const formula = typeof cell.value === 'object' && cell.value !== null && 'formula' in cell.value
            ? String((cell.value as { formula: unknown }).formula)
            : undefined;
          const formulaResult = typeof cell.value === 'object' && cell.value !== null && 'result' in cell.value
            ? (cell.value as { result: unknown }).result
            : undefined;
          return {
            ...toCell(worksheet.name, rowNumber, index + 1, cell.value, headers[index]),
            formula,
            formulaResult,
            numberFormat: cell.numFmt,
          };
        });
        rows.push({
          sheetName: worksheet.name,
          rowNumber,
          kind: classifyRow(values.slice(1), rowNumber === headerRowNumber),
          cells,
        });
      }

      sheets.push({
        name: worksheet.name,
        ordinal,
        visibility: worksheet.state === 'veryHidden' ? 'VERY_HIDDEN' : worksheet.state === 'hidden' ? 'HIDDEN' : 'VISIBLE',
        rows,
      });
    });

    return {
      ...metadata,
      contentHash,
      sourceFormat: 'XLSX',
      sheets,
    };
  }
}
