import { assertF01F20Ledger, certifyF01F20 } from './f01-f20-certification';
import { source } from './experimental-read-excel-file-workbook-reader.spec';
import { ExperimentalReadExcelFileWorkbookReader } from './experimental-read-excel-file-workbook-reader';

const EXPECTED = ['PASS','NOT_EXECUTED','PASS','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','GAP','PARTIAL','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','PASS','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','GAP'];

describe('F01-F20 certification — read-excel-file', () => {
  it('executes all twenty certification records with explicit status', async () => {
    const snapshot = await new ExperimentalReadExcelFileWorkbookReader().read(source, { importSnapshotId:'IMP-FIXTURE-F01-F20-001', sourceDocumentId:'DOC-FIXTURE-F01-F20-001', contentHash:'fixture-f01-f20-sha256', sourceFileName:'manifest-f01-f20.xlsx', mappingProfileId:'manifest-default', mappingProfileVersion:'1.0.0' });
    const evidence = certifyF01F20(snapshot, 'read-excel-file');
    assertF01F20Ledger(evidence);
    expect(evidence.map(e => e.status)).toEqual(EXPECTED);
    console.log(JSON.stringify({ adapter: 'read-excel-file', evidence }, null, 2));
  });
});
