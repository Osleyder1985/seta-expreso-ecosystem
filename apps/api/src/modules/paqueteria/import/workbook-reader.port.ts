import type { ImportSnapshot } from './workbook-reader.types';

export interface WorkbookReaderMetadata {
  readonly importSnapshotId: string;
  readonly sourceDocumentId: string;
  readonly contentHash: string;
  readonly sourceFileName: string;
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
}

export interface WorkbookReaderOptions {
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
