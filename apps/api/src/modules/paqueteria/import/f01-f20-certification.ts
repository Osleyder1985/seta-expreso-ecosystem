import type { ImportSnapshot } from './workbook-reader.types';

export type F01F20Status = 'PASS' | 'PARTIAL' | 'GAP' | 'NOT_EXECUTED';
export interface F01F20Evidence { readonly id: string; readonly status: F01F20Status; readonly note: string; }

export const certifyF01F20 = (snapshot: ImportSnapshot, adapter: 'exceljs' | 'read-excel-file' | 'sheetjs'): readonly F01F20Evidence[] => {
  const sheet = snapshot.sheets.find(({ name }) => name === 'Manifiesto') ?? snapshot.sheets[0];
  const rows = sheet?.rows ?? [];
  const data = rows.filter(({ kind }) => kind === 'DATA');
  const cell = (row: typeof data[number] | undefined, header: string) => row?.cells.find(({ ref }) => ref.columnHeaderRaw === header);
  const addresses = data.map(row => cell(row, 'Dirección')?.rawValue).filter(v => typeof v === 'string');
  const formula = data.map(row => row.cells.find(c => c.formula)).find(Boolean);
  const hasCoords = data.some(row => { const lat = cell(row, 'Latitud')?.rawValue; const lon = cell(row, 'Longitud')?.rawValue; return typeof lat === 'number' && typeof lon === 'number' && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180; });
  const hasUnresolvedCoords = data.some(row => cell(row, 'Latitud')?.rawValue == null && cell(row, 'Longitud')?.rawValue == null);
  const hasHeader = (h: string) => rows.some(row => row.cells.some(c => c.ref.columnHeaderRaw === h));
  const f20Base = Boolean(snapshot.sourceDocumentId && snapshot.contentHash && snapshot.mappingProfileId && snapshot.mappingProfileVersion && data.every(row => row.cells.every(c => c.ref.sheetName && c.ref.rowNumber > 0 && c.ref.columnIndex > 0 && c.ref.cellAddress)));
  return [
    { id: 'F01', status: typeof cell(data[0], 'House')?.rawValue === 'string' ? 'PASS' : 'NOT_EXECUTED', note: 'House textual observable' },
    { id: 'F02', status: typeof cell(data[0], 'Bultos')?.rawValue === 'number' ? 'PASS' : 'NOT_EXECUTED', note: 'Bultos numeric observable' },
    { id: 'F03', status: new Set(addresses).size < addresses.length ? 'PASS' : 'NOT_EXECUTED', note: 'Repeated address observable' },
    { id: 'F04', status: 'NOT_EXECUTED', note: 'Multiple-phone mapping rule not implemented in reader certification' },
    { id: 'F05', status: hasCoords ? 'PASS' : 'NOT_EXECUTED', note: 'Valid coordinate pair preserved' },
    { id: 'F06', status: hasUnresolvedCoords ? 'PASS' : 'NOT_EXECUTED', note: 'Unresolved coordinate pair preserved' },
    { id: 'F07', status: hasHeader('Aduana') ? 'PASS' : 'NOT_EXECUTED', note: 'Aduana field preserved' },
    { id: 'F08', status: hasHeader('Consolidado') ? 'PASS' : 'NOT_EXECUTED', note: 'Consolidado field preserved' },
    { id: 'F09', status: adapter === 'read-excel-file' ? 'GAP' : formula?.formula && formula.formulaResult !== undefined ? 'PASS' : 'NOT_EXECUTED', note: adapter === 'read-excel-file' ? 'Provider API does not preserve required formula/cache evidence' : 'Formula and cached result observable' },
    { id: 'F10', status: rows.some(r => r.kind === 'TOTAL' || r.kind === 'SUBTOTAL') ? 'PARTIAL' : 'NOT_EXECUTED', note: 'Structural total/subtotal evidence only; business discrepancy reconciliation not executed' },
    { id: 'F11', status: 'NOT_EXECUTED', note: 'Header alias mapping belongs to mapping layer' },
    { id: 'F12', status: 'NOT_EXECUTED', note: 'Ambiguous-header mapping belongs to mapping layer' },
    { id: 'F13', status: 'NOT_EXECUTED', note: 'Critical-field validation belongs to validation layer' },
    { id: 'F14', status: 'NOT_EXECUTED', note: 'Additional-column preservation fixture not executed in this run' },
    { id: 'F15', status: rows.some(r => r.kind === 'TOTAL') && rows.some(r => r.kind === 'SUBTOTAL') ? 'PASS' : 'NOT_EXECUTED', note: 'TOTAL/SUBTOTAL row classification observable' },
    { id: 'F16', status: 'NOT_EXECUTED', note: 'Numeric anomaly validation belongs to validation layer' },
    { id: 'F17', status: 'NOT_EXECUTED', note: 'Identity ambiguity belongs to reconciliation layer' },
    { id: 'F18', status: 'NOT_EXECUTED', note: 'Idempotent reimport requires pipeline execution' },
    { id: 'F19', status: 'NOT_EXECUTED', note: 'Mapping-version reimport requires pipeline execution' },
    { id: 'F20', status: adapter === 'read-excel-file' ? 'GAP' : f20Base ? 'PARTIAL' : 'NOT_EXECUTED', note: adapter === 'read-excel-file' ? 'Required provenance metadata cannot be preserved end-to-end by provider' : 'Reader provenance is partial; mapping transformation and end-to-end persistence remain unexecuted' },
  ];
};

export const assertF01F20Ledger = (evidence: readonly F01F20Evidence[]): void => {
  if (evidence.length !== 20) throw new Error(`F01-F20 certification must contain exactly 20 records; got ${evidence.length}`);
  const ids = evidence.map(e => e.id);
  for (let i = 1; i <= 20; i += 1) if (!ids.includes(`F${String(i).padStart(2, '0')}`)) throw new Error(`Missing F${String(i).padStart(2, '0')}`);
};

// F01-F20 ledger remains provider-neutral; status is evidence, not selection.

// trigger central certification workflow
