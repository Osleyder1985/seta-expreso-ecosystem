import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';

const source = Buffer.from('UEsDBBQAAAAIAG17O129XP2Q8gAAABwCAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbK2RvU7DMBDHX8XyWsVOOyCEknQodASG8gCHc0ms+Es+t4S3x0kLAyqwMJ3s/8fvZFfbyRp2wkjau5qvRckZOuVb7fqavxz2xS3fNtXhPSCxbHVU8yGlcCclqQEtkPABXVY6Hy2kfIy9DKBG6FFuyvJGKu8SulSkuYM31T12cDSJPUz5+oyNaIiz3dk4s2oOIRitIGVdnlz7jVJcCCInFw8NOtAqG7i8SpiVnwGX3FN+h6hbZM8Q0yPY7JKTkW8+jq/ej+L3kitb+q7TCluvjjZHBIWI0NKAmKwRyxQWtFv9zV/MJJex/udFvvo/95DLdzcfUEsDBBQAAAAIAG17O10cSfe+pAAAABYBAAALAAAAX3JlbHMvLnJlbHONz8EOwiAMBuBXIb07pgdjzNguxmRXMx8AWcfIBiWAOt9ejs548Nj0/7+mVbPYmT0wRENOwLYogaFT1BunBVy78+YATV1dcJYpJ+JofGS54qKAMSV/5DyqEa2MBXl0eTNQsDLlMWjupZqkRr4ryz0PnwasTdb2AkLbb4F1L4//2DQMRuGJ1N2iSz9OfCWyLIPGJGCZ+ZPCdCOaiowCryu+erB+A1BLAwQUAAAACABteztdNpavC7IAAAAOAQAADwAAAHhsL3dvcmtib29rLnhtbI2Puw7CMAxFfyXyTlMYEKr6WBBSBzb4gNC6NGpjV3Z4fD4Rj53J9rV97Fs2zzCbO4p6pgrWWQ4GqePe07WC8+mw2kFTlw+W6cI8mTRNWsEY41JYq92IwWnGC1LqDCzBxVTK1eoi6HodEWOY7SbPtzY4T/AhFPIPg4fBd7jn7haQ4gciOLuYftXRLwp1+b6g32jIBazg6MgPHjUymLfe9skaGCl8SqTt12Dr0v5W7c9d/QJQSwMEFAAAAAgAbXs7XfCmYoGmAAAAFwEAABoAAAB4bC9fcmVscy93b3JrYm9vay54bWwucmVsc43PSwrCMBAA0KuE2dtpXYhI025E6FbqAUI6TUqbD0n83d7gQiy4cDXM7w1Ttw+zsBuFODnLoSpKYGSlGyarOFz602YPbVOfaREpT0Q9+cjyio0cdEr+gBilJiNi4TzZ3BldMCLlNCj0Qs5CEW7Lcofh24C1ybqBQ+iGClj/9PSP7cZxknR08mrIph8n8O7CHDVRyqgIihKHTyniO1RFVgGbGlcfNi9QSwMEFAAAAAgAbXs7XWCxmHw1AQAATAMAABgAAAB4bC93b3Jrc2hlZXRzL3NoZWV0MS54bWyVk99OwyAUh1+l4X6jf2w1hrJ07cyWGGdcd71ghyuxhQVw8718BF9MVg1ZXUmUK/hxzne+C0CT97bxDlQqJngKgrEPPMorsWV8l4J1eTe6AROMjkK+qppS7ZlyrlJQa72/hVBVNW2JGos95ebmRciWaHOUO6j2kpJt19Q2MPT9BLaEcYBRlxVEE4ykOHrSjDVpddpkAfB0ChhvGKcrLU3OFEYaz8WboghqjOApgNVPw9TV8EiVGKjPXfUFk7Sq2OcH73dBo2g9Q+sZOjB5lucj/3sFQ74nxAEH4ThG8HAu5iIWi6dZni+WD5tytio3F9ieYGQFoz8IhkOCUSd4feHnAv7L7wr8CmIrHDv4q/W0XJbZvTcnz4STIeW4Uw59a9wbkdgRiWNExx8CJ8NgePaCof0a+AtQSwECFAMUAAAACABteztdvVz9kPIAAAAcAgAAEwAAAAAAAAAAAAAAgAEAAAAAW0NvbnRlbnRfVHlwZXNdLnhtbFBLAQIUAxQAAAAIAG17O10cSfe+pAAAABYBAAALAAAAAAAAAAAAAACAASMBAABfcmVscy8ucmVsc1BLAQIUAxQAAAAIAG17O102lq8LsgAAAA4BAAAPAAAAAAAAAAAAAACAAfABAAB4bC93b3JrYm9vay54bWxQSwECFAMUAAAACABteztd8KZigaYAAAAXAQAAGgAAAAAAAAAAAAAAgAHPAgAAeGwvX3JlbHMvd29ya2Jvb2sueG1sLnJlbHNQSwECFAMUAAAACABteztdYLGYfDUBAABMAwAAGAAAAAAAAAAAAAAAgAGtAwAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1sUEsFBgAAAAAFAAUARQEAABgFAAAAAA==', 'base64');
const metadata = {
  importSnapshotId: 'IMP-READ-EXCEL-FILE-001',
  sourceDocumentId: 'DOC-READ-EXCEL-FILE-001',
  contentHash: 'fixture',
  sourceFileName: 'fixture.xlsx',
  mappingProfileId: 'manifest-default',
  mappingProfileVersion: '1.0.0',
};

describe('ExperimentalReadExcelFileWorkbookReader', () => {
  it('maps basic workbook rows through the common structural contract', async () => {
    const snapshot = await new ExperimentalReadExcelFileWorkbookReader().read(source, metadata);
    expect(snapshot.sheets).toHaveLength(1);
    expect(snapshot.sheets[0].rows.map(row => row.kind)).toEqual(['HEADER', 'DATA', 'DATA']);
    expect(snapshot.sheets[0].rows[1].cells[1].rawValue).toBe(12.5);
    expect(snapshot.sheets[0].rows[2].cells[2].rawValue).toBe('DIRECCION_TEST_001');
    expect(snapshot.sheets[0].rows[1].cells[0].ref.columnHeaderRaw).toBe('House');
    expect(snapshot.sheets[0].rows[1].cells[2].ref.columnHeaderRaw).toBe('Dirección');
  });

  it('enforces the source byte limit before parsing', async () => {
    await expect(new ExperimentalReadExcelFileWorkbookReader().read(Buffer.alloc(11), metadata, { maxSourceBytes: 10 })).rejects.toThrow('XLSX source exceeds configured byte limit');
  });

  it('executes the common conformance gate and records the known adapter gap', async () => {
    const { assertCommonEvidenceSnapshot } = await import('./workbook-reader-conformance');
    const snapshot = await new ExperimentalReadExcelFileWorkbookReader().read(source, {
      ...metadata,
      importSnapshotId: 'IMP-FIXTURE-F01-F20-001',
      sourceDocumentId: 'DOC-FIXTURE-F01-F20-001',
      contentHash: 'fixture-f01-f20-sha256',
      sourceFileName: 'manifest-f01-f20.xlsx',
    });
    expect(() => assertCommonEvidenceSnapshot(snapshot)).toThrow();
  });
});