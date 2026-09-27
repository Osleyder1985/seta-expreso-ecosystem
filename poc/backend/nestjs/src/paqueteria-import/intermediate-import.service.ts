import { ImportFinding, ImportIntermediateResult, ImportSnapshot, MappedFieldValue, SourceCell, SourceRow } from './intermediate-import.model';

export interface MappingProfile {
  readonly id: string;
  readonly version: string;
  readonly aliases: Readonly<Record<string, readonly string[]>>;
  readonly criticalFields: readonly string[];
}

const normalizeHeader = (value: unknown): string =>
  String(value ?? '').trim().replace(/\s+/g, ' ').toUpperCase();

const resolveField = (
  row: SourceRow,
  canonicalField: string,
  profile: MappingProfile,
  snapshot: ImportSnapshot,
): { value?: MappedFieldValue; finding?: ImportFinding } => {
  const acceptedHeaders = [canonicalField, ...(profile.aliases[canonicalField] ?? [])].map(normalizeHeader);
  const matches = row.cells.filter((cell) => acceptedHeaders.includes(normalizeHeader(cell.columnHeaderRaw)));

  if (matches.length > 1 && profile.criticalFields.includes(canonicalField)) {
    return {
      finding: {
        findingId: 'F-' + row.rowNumber + '-' + canonicalField,
        ruleId: 'R-MAP-AMBIGUOUS-CRITICAL',
        severity: 'ERROR',
        blocking: true,
        code: 'AMBIGUOUS_CRITICAL_MAPPING',
        message: 'Multiple source columns match critical field ' + canonicalField + '.',
        sourceRefs: matches.map((cell) => cell.ref),
        field: canonicalField,
      },
    };
  }

  const cell = matches[0];
  if (!cell) {
    return {
      finding: {
        findingId: 'F-' + row.rowNumber + '-' + canonicalField,
        ruleId: 'R-MAP-CRITICAL-MISSING',
        severity: 'ERROR',
        blocking: profile.criticalFields.includes(canonicalField),
        code: 'MISSING_MAPPED_FIELD',
        message: 'No source column matched field ' + canonicalField + '.',
        sourceRefs: [],
        field: canonicalField,
      },
    };
  }

  const decision = normalizeHeader(cell.columnHeaderRaw) === normalizeHeader(canonicalField) ? 'EXACT' : 'ALIAS';
  return {
    value: {
      targetField: canonicalField,
      sourceCellRefs: [cell.ref],
      rawValue: cell.rawValue,
      interpretedValue: cell.rawValue,
      normalizedValue: typeof cell.rawValue === 'string' ? cell.rawValue.trim() : cell.rawValue,
      transformationRefs: [],
      mappingDecision: decision,
      provenance: [{
        sourceDocumentId: snapshot.sourceDocumentId,
        contentHash: snapshot.contentHash,
        sheetName: cell.ref.sheetName,
        rowNumber: cell.ref.rowNumber,
        columnIndex: cell.ref.columnIndex,
        columnHeaderRaw: cell.columnHeaderRaw,
        cellAddress: cell.ref.cellAddress,
        rawValue: cell.rawValue,
        formula: cell.formula,
        mappingProfileId: profile.id,
        mappingProfileVersion: profile.version,
      }],
    },
  };
};

export class PaqueteriaImportIntermediateService {
  inspect(snapshot: ImportSnapshot, profile: MappingProfile): ImportIntermediateResult {
    const findings: ImportFinding[] = [];
    const records: ImportIntermediateResult['extractedRecords'][number][] = [];

    for (const sheet of snapshot.sheets) {
      for (const row of sheet.rows.filter((candidate) => candidate.kind === 'DATA')) {
        const house = resolveField(row, 'HOUSE', profile, snapshot);
        const weight = resolveField(row, 'PESO (KG)', profile, snapshot);
        const address = resolveField(row, 'DIRECCION DEL DESTINATARIO', profile, snapshot);

        for (const result of [house, weight, address]) {
          if (result.finding) findings.push(result.finding);
        }

        if (!house.value) continue;

        records.push({
          extractedRecordId: snapshot.importSnapshotId + ':' + sheet.name + ':' + row.rowNumber,
          recordType: 'HOUSE',
          sourceRowRef: row.cells[0]?.ref ?? {
            sheetName: sheet.name, rowNumber: row.rowNumber, columnIndex: 0, cellAddress: '',
          },
          fields: [house.value, weight.value, address.value].filter(
            (field): field is MappedFieldValue => field !== undefined,
          ),
          relatedRecordRefs: [],
        });
      }
    }

    const extractedWeight = records.reduce((sum, record) => {
      const field = record.fields.find((candidate) => candidate.targetField === 'PESO (KG)');
      return sum + (typeof field?.normalizedValue === 'number' ? field.normalizedValue : 0);
    }, 0);

    const addresses = new Set(
      records
        .map((record) => record.fields.find((field) => field.targetField === 'DIRECCION DEL DESTINATARIO')?.normalizedValue)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    );

    return {
      snapshot,
      extractedRecords: records,
      findings,
      reconciliation: {
        extractedHouseCount: records.length,
        extractedPhysicalUnitQuantity: records.length,
        extractedWeight,
        distinctAddressCount: addresses.size,
        discrepancies: [],
      },
    };
  }
}
