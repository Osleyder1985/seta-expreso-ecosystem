import type { SourceCell } from './workbook-reader.types';
import type { Finding, MappedRecord, ValidationSummary } from './import-pipeline.types';

const field = (record: MappedRecord, name: string) => record.fields.find(item => item.canonicalField === name);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const validateRecords = (records: readonly MappedRecord[], validationRunId: string): ValidationSummary => {
  const findings: Finding[] = [];

  for (const record of records) {
    const house = field(record, 'house');
    const bultos = field(record, 'bultos');
    const peso = field(record, 'peso');
    const recipient = field(record, 'recipient');
    const address = field(record, 'address');

    if (house?.value == null || String(house.value).trim() === '') findings.push({ id:'VAL-'+record.row.rowNumber+'-HOUSE', ruleId:'R-FLD-001', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', rowNumber:record.row.rowNumber, field:'house', sourceRefs:house?.sourceCells ?? [], message:'House is required' });
    if (bultos && (!finite(bultos.value) || !Number.isInteger(bultos.value) || bultos.value < 0)) findings.push({ id:'VAL-'+record.row.rowNumber+'-BULTOS', ruleId:'R-FLD-004', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', rowNumber:record.row.rowNumber, field:'bultos', sourceRefs:bultos.sourceCells, actualValue:bultos.value, expectedValue:'integer >= 0', message:'Bultos has a numeric anomaly' });
    if (peso && (!finite(peso.value) || peso.value < 0)) findings.push({ id:'VAL-'+record.row.rowNumber+'-PESO', ruleId:'R-FLD-004', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', rowNumber:record.row.rowNumber, field:'peso', sourceRefs:peso.sourceCells, actualValue:peso.value, expectedValue:'finite number >= 0', message:'Peso has a numeric anomaly' });
    if (address?.value == null || String(address.value).trim() === '') findings.push({ id:'VAL-'+record.row.rowNumber+'-ADDRESS', ruleId:'R-ADDR-001', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', rowNumber:record.row.rowNumber, field:'address', sourceRefs:address?.sourceCells ?? [], message:'Address is required' });

    if (recipient?.value != null && address?.value != null) {
      const sameRecipient = records.filter(other => String(field(other,'recipient')?.value ?? '').trim().toLocaleLowerCase() === String(recipient.value).trim().toLocaleLowerCase());
      const addresses = new Set(sameRecipient.map(other => String(field(other,'address')?.value ?? '').trim().toLocaleLowerCase()).filter(Boolean));
      if (addresses.size > 1) findings.push({ id:'VAL-'+record.row.rowNumber+'-IDENTITY', ruleId:'R-PER-002', ruleVersion:'1.0.0', severity:'ERROR', blocking:true, status:'OPEN', rowNumber:record.row.rowNumber, field:'recipient', sourceRefs:[...(recipient.sourceCells as SourceCell[]), ...(address.sourceCells as SourceCell[])], actualValue:recipient.value, expectedValue:'unambiguous identity', message:'Recipient identity is ambiguous across addresses' });
    }
  }

  return { validationRunId, findings, passed: !findings.some(f => f.severity === 'ERROR'), blocked: findings.some(f => f.blocking) };
};
