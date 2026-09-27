import { comprehensiveEvidenceFixture } from './common-evidence-fixture';
import { assertCommonEvidenceSnapshot } from './workbook-reader-conformance';

describe('WorkbookReader common conformance evidence', () => {
  it('accepts the provider-neutral evidence fixture', () => {
    assertCommonEvidenceSnapshot(comprehensiveEvidenceFixture());
  });
});
