import type { ImportSnapshot, SourceCell } from './workbook-reader.types';
import type { Finding, MappedRecord, ReconciliationResult } from './import-pipeline.types';

const totalRows = (snapshot: ImportSnapshot) => snapshot.sheets.flatMap(sheet => sheet.rows.filter(row => row.kind === 'TOTAL' || row.kind === 'SUBTOTAL'));
const number = (cell: SourceCell | undefined) => typeof cell?.rawValue === 'number' && Number.isFinite(cell.rawValue) ? cell.rawValue : undefined;

export const reconcileTotals = (snapshot: ImportSnapshot, records: readonly MappedRecord[], reconciliationId: string): ReconciliationResult => {
  const declaredTotals: Record<string,number> = {};
  const observedTotals: Record<string,number> = {};
  const discrepancies: Finding[] = [];

  for (const field of ['bultos','peso']) {
    const observed = records.reduce((sum, record) => {
      const value = record.fields.find(item => item.canonicalField === field)?.value;
      return sum + (typeof value === 'number' && Number.isFinite(value) ? value : 0);
    }, 0);
    observedTotals[field] = observed;
    const cells = totalRows(snapshot).flatMap(row => row.cells.filter(cell => String(cell.ref.columnHeaderRaw ?? '').trim().toLocaleLowerCase() === field));
    const declared = number(cells.at(-1));
    if (declared === undefined) continue;
    declaredTotals[field] = declared;
    if (Math.abs(declared - observed) > 1e-9) discrepancies.push({ id:'REC-TOTAL-'+field, ruleId:'R-RECONCILIATION-TOTAL', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', sourceRefs:cells, actualValue:declared, expectedValue:observed, message:'Declared ' + field + ' total differs from detail' });
  }

  return { reconciliationId, status: discrepancies.length ? 'REQUIRES_RECONCILIATION' : 'PASS', discrepancies, declaredTotals, observedTotals };
};

export const reconcileIdentity = (findings: readonly Finding[]): ReconciliationResult => {
  const discrepancies = findings.filter(f => f.ruleId === 'R-PER-002');
  return { reconciliationId:'identity-reconciliation', status:discrepancies.length ? 'REQUIRES_RECONCILIATION' : 'PASS', discrepancies, declaredTotals:{}, observedTotals:{} };
};
