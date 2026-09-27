import ExcelJS from 'exceljs';
import { ExperimentalExcelJsWorkbookReader } from './experimental-exceljs-workbook-reader';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';
import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';
import type { WorkbookReaderPort } from './workbook-reader.port';
import { DEFAULT_WORKBOOK_READER_LIMITS } from './workbook-reader.limits';

const metadata = {
  importSnapshotId: 'limits-test',
  sourceDocumentId: 'limits-document',
  contentHash: 'limits-hash',
  sourceFileName: 'limits.xlsx',
  mappingProfileId: 'limits',
  mappingProfileVersion: '1.0.0',
};

describe('XLSX reader resource-limit contract', () => {
  test('uses one shared default limit contract', () => {
    expect(DEFAULT_WORKBOOK_READER_LIMITS).toEqual({
      maxSourceBytes: 50 * 1024 * 1024,
      maxRowsPerSheet: 100_000,
      maxSheets: 32,
      maxCellsPerSheet: 1_000_000,
    });
  });
  const readers: Array<[string, WorkbookReaderPort]> = [
    ['ExcelJS', new ExperimentalExcelJsWorkbookReader()],
    ['SheetJS', new ExperimentalSheetJsWorkbookReader()],
    ['read-excel-file', new ExperimentalReadExcelFileWorkbookReader()],
  ];

  test.each(readers)('%s rejects source larger than maxSourceBytes before parsing', async (_name, reader) => {
    const source = Buffer.alloc(1024, 0x58);
    await expect(reader.read(source, metadata, { maxSourceBytes: 1023 })).rejects.toThrow(/source exceeds/i);
  });

  test.each(readers)('%s rejects more than maxSheets', async (_name, reader) => {
    const source = await makeWorkbook(3, 1, 1);
    await expect(reader.read(source, metadata, { maxSheets: 2 })).rejects.toThrow(/sheet limit/i);
  });

  test.each(readers)('%s rejects more than maxRowsPerSheet', async (_name, reader) => {
    const source = await makeWorkbook(1, 4, 1);
    await expect(reader.read(source, metadata, { maxRowsPerSheet: 3 })).rejects.toThrow(/row limit/i);
  });

  test.each(readers)('%s rejects more than maxCellsPerSheet', async (_name, reader) => {
    const source = await makeWorkbook(1, 3, 3);
    await expect(reader.read(source, metadata, { maxCellsPerSheet: 8 })).rejects.toThrow(/cell limit/i);
  });

  test.each(readers)('%s accepts exactly the configured limits', async (_name, reader) => {
    const source = await makeWorkbook(2, 3, 3);
    await expect(reader.read(source, metadata, {
      maxSheets: 2,
      maxRowsPerSheet: 3,
      maxCellsPerSheet: 9,
    })).resolves.toBeDefined();
  });
});

async function makeWorkbook(sheets: number, rows: number, columns: number): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  for (let s = 1; s <= sheets; s += 1) {
    const sheet = workbook.addWorksheet('S' + s);
    for (let r = 1; r <= rows; r += 1) {
      sheet.addRow(Array.from({ length: columns }, (_, c) => r * 100 + c));
    }
  }
  return Buffer.from(await workbook.xlsx.writeBuffer());
}
