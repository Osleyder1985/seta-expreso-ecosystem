export type CertificationStatus = 'PASS' | 'PARTIAL' | 'GAP' | 'NOT_EXECUTED';

export interface F01F20Requirement {
  readonly id: string;
  readonly requirement: string;
  readonly evidenceLayer: 'READER' | 'MAPPING' | 'VALIDATION' | 'RECONCILIATION' | 'PIPELINE' | 'PROVENANCE';
}

export const F01_F20_REQUIREMENTS: readonly F01F20Requirement[] = [
  { id: 'F01', requirement: 'House textual / valores básicos', evidenceLayer: 'READER' },
  { id: 'F02', requirement: 'Múltiples bultos', evidenceLayer: 'READER' },
  { id: 'F03', requirement: 'Dirección compartida/repetida', evidenceLayer: 'READER' },
  { id: 'F04', requirement: 'Múltiples teléfonos', evidenceLayer: 'MAPPING' },
  { id: 'F05', requirement: 'Coordenadas válidas', evidenceLayer: 'MAPPING' },
  { id: 'F06', requirement: 'Coordenadas no resueltas', evidenceLayer: 'MAPPING' },
  { id: 'F07', requirement: 'Aduana', evidenceLayer: 'MAPPING' },
  { id: 'F08', requirement: 'CONSOLIDADO', evidenceLayer: 'MAPPING' },
  { id: 'F09', requirement: 'Fórmula y resultado cacheado', evidenceLayer: 'READER' },
  { id: 'F10', requirement: 'Discrepancia de totales', evidenceLayer: 'RECONCILIATION' },
  { id: 'F11', requirement: 'Alias de headers', evidenceLayer: 'MAPPING' },
  { id: 'F12', requirement: 'Headers ambiguos', evidenceLayer: 'MAPPING' },
  { id: 'F13', requirement: 'Campo crítico ausente', evidenceLayer: 'VALIDATION' },
  { id: 'F14', requirement: 'Columnas adicionales', evidenceLayer: 'READER' },
  { id: 'F15', requirement: 'Filas TOTAL/SUBTOTAL', evidenceLayer: 'READER' },
  { id: 'F16', requirement: 'Valores numéricos problemáticos', evidenceLayer: 'VALIDATION' },
  { id: 'F17', requirement: 'Identidad ambigua', evidenceLayer: 'RECONCILIATION' },
  { id: 'F18', requirement: 'Reimportación idéntica/idempotencia', evidenceLayer: 'PIPELINE' },
  { id: 'F19', requirement: 'Mismo contenido + mapping versionado diferente', evidenceLayer: 'PIPELINE' },
  { id: 'F20', requirement: 'Provenance y trazabilidad completa', evidenceLayer: 'PROVENANCE' },
];

export const F01_F20_IDS = F01_F20_REQUIREMENTS.map(({ id }) => id);