import { comprehensiveEvidenceFixture } from './common-evidence-fixture';
import { assertF01F20Ledger, certifyF01F20 } from './f01-f20-certification';

describe('F01-F20 certification ledger', () => {
  it('contains exactly twenty explicit evidence records for the common fixture', () => {
    const evidence = certifyF01F20(comprehensiveEvidenceFixture(), 'sheetjs');
    assertF01F20Ledger(evidence);
    expect(evidence).toHaveLength(20);
    expect(evidence.map(e => e.id)).toEqual(Array.from({ length: 20 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`));
  });

  it('does not promote reconciliation, mapping or pipeline cases to PASS from reader-only evidence', () => {
    const evidence = certifyF01F20(comprehensiveEvidenceFixture(), 'sheetjs');
    for (const id of ['F04','F10','F11','F12','F13','F14','F16','F17','F18','F19','F20']) {
      expect(evidence.find(e => e.id === id)?.status).not.toBe('PASS');
    }
  });
});