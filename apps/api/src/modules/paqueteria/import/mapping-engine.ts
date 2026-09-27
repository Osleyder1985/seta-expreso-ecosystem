import type { ImportSnapshot, SourceCell, SourceRow } from './workbook-reader.types';
import type { Finding, MappedField, MappedRecord, MappingProfile, MappingResult } from './import-pipeline.types';

const normalize = (value: unknown) => String(value ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
const rows = (snapshot: ImportSnapshot): readonly SourceRow[] => snapshot.sheets.flatMap(sheet => sheet.rows.filter(row => row.kind === 'DATA'));

export const mapSnapshot = (snapshot: ImportSnapshot, profile: MappingProfile): MappingResult => {
  const headers = snapshot.sheets.flatMap(sheet => sheet.rows.filter(row => row.kind === 'HEADER').flatMap(row => row.cells));
  const findings: Finding[] = [];
  const records: MappedRecord[] = [];

  for (const row of rows(snapshot)) {
    const fields: MappedField[] = [];
    const mappedAddresses = new Set<string>();

    for (const spec of profile.fields) {
      const candidates = headers.filter(header => spec.headers.some(alias => normalize(alias) === normalize(header.rawValue)));
      const matching = [...new Map(candidates.filter(header => row.cells.some(cell => cell.ref.columnIndex === header.ref.columnIndex)).map(cell => [cell.ref.cellAddress, cell])).values()];

      if (matching.length > 1) {
        findings.push({ id: 'MAP-' + row.rowNumber + '-' + spec.canonicalField + '-AMBIGUOUS', ruleId: 'R-MAP-AMBIGUOUS-HEADER', ruleVersion: '1.0.0', severity: 'ERROR', blocking: Boolean(spec.required), status: 'OPEN', rowNumber: row.rowNumber, field: spec.canonicalField, sourceRefs: matching, message: 'Ambiguous header mapping for ' + spec.canonicalField });
        fields.push({ canonicalField: spec.canonicalField, value: undefined, decision: 'AMBIGUOUS', sourceCells: matching });
        continue;
      }

      const header = matching[0];
      const sourceCell = header ? row.cells.find(cell => cell.ref.columnIndex === header.ref.columnIndex) : undefined;
      if (!sourceCell) {
        findings.push({ id: 'MAP-' + row.rowNumber + '-' + spec.canonicalField + '-MISSING', ruleId: 'R-MAP-CRITICAL-FIELD-MISSING', ruleVersion: '1.0.0', severity: 'ERROR', blocking: Boolean(spec.required), status: 'OPEN', rowNumber: row.rowNumber, field: spec.canonicalField, sourceRefs: [], message: 'Required mapping field missing: ' + spec.canonicalField });
        fields.push({ canonicalField: spec.canonicalField, value: undefined, decision: 'BLOCKED', sourceCells: [] });
        continue;
      }

      mappedAddresses.add(sourceCell.ref.cellAddress);
      const exact = normalize(sourceCell.ref.columnHeaderRaw) === normalize(spec.headers[0]);
      fields.push({ canonicalField: spec.canonicalField, value: sourceCell.rawValue, decision: exact ? 'EXACT' : 'ALIAS', sourceCells: [sourceCell] });
    }

    const additionalColumns = row.cells.filter(cell => !mappedAddresses.has(cell.ref.cellAddress));
    records.push({ row, fields, additionalColumns });
  }

  return { profileId: profile.profileId, profileVersion: profile.version, records, findings };
};
