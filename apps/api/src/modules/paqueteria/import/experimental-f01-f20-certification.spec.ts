import { assertF01F20Ledger, certifyF01F20 } from './f01-f20-certification';
import { createFixture } from './experimental-sheetjs-workbook-reader.spec';
import { ExperimentalSheetJsWorkbookReader } from './experimental-sheetjs-workbook-reader';

const EXPECTED = ['PASS','PASS','PASS','NOT_EXECUTED','PASS','PASS','PASS','PASS','PASS','PARTIAL','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','PASS','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','NOT_EXECUTED','PARTIAL'];

describe('F01-F20 certification — sheetjs', () => {
  it('executes all twenty certification records with explicit status', async () => {
    const source = await createFixture();
    const snapshot = await new ExperimentalSheetJsWorkbookReader().read(source, { importSnapshotId:'IMP-FIXTURE-F01-F20-001', sourceDocumentId:'DOC-FIXTURE-F01-F20-001', contentHash:'fixture-f01-f20-sha256', sourceFileName:'manifest-f01-f20.xlsx', mappingProfileId:'manifest-default', mappingProfileVersion:'1.0.0' });
    const evidence = certifyF01F20(snapshot, 'sheetjs');
    assertF01F20Ledger(evidence);
    expect(evidence.map(e => e.status)).toEqual(EXPECTED);
    console.log(JSON.stringify({ adapter: 'sheetjs', evidence }, null, 2));
  });
});
