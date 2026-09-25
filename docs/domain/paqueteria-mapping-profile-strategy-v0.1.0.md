# Estrategia de perfiles y mapeo de manifiestos Excel de Paquetería v0.1.0

**Estado:** En validación

## Propósito
Define cómo transformar estructuras Excel hacia el contrato canónico sin asumir nombres reales de columnas. No declara ningún encabezado Excel como definitivo.

## Flujo
Excel real → Workbook Inspector → Perfil aplicable → Mapping → Transformaciones → Modelo intermedio → Validación → Modelo canónico.

El lector no conoce reglas de negocio; el perfil no oculta errores; la validación no inventa mapeos.

## MappingProfile
Debe identificar profileId, version, name, description, sourceFormat, workbookApplicability, worksheetSelection, headerDetection, mappings, transformations, effectiveFrom, effectiveTo, status, owner y tests.

Estados: PROPOSED, VALIDATED, ACTIVE, DEPRECATED, RETIRED.

## Campo de mapping
Debe expresar sourceReference, sourceHeaderPattern, sourcePosition opcional, canonicalField, cardinality, required, transformation, validationHints y confidencePolicy.

No se depende únicamente de posición física.

## Resolución
Considera formato, estructura, encabezados, worksheet, versión, vigencia y contexto. Si dos perfiles son igualmente aplicables, se produce ambigüedad y se solicita selección; no se escoge arbitrariamente.

## Inspección estructural
Registrar workbook, worksheets, dimensiones, encabezados candidatos, celdas combinadas, filas/columnas ocultas, tipos aparentes, fórmulas, vacíos, posibles títulos/totales y fingerprint estructural.

## Mapping determinista
Mismo input + mismo perfil + misma versión debe producir el mismo mapping. Transformaciones y valores no mapeados quedan trazables. Cambiar de perfil produce nueva ejecución/version; no muta silenciosamente la anterior.

## Transformaciones
Tipos iniciales: TRIM, NORMALIZE_WHITESPACE, NORMALIZE_CASE, PARSE_DECIMAL, PARSE_INTEGER, PARSE_DATE, NORMALIZE_PHONE, NORMALIZE_COUNTRY_CODE, NORMALIZE_CODE, SPLIT, JOIN, LOOKUP y CUSTOM_VERSIONED.

Toda transformación debe ser determinista y trazable. Transformación no sustituye validación.

## Campos críticos
Requieren mapping explícito, transformación identificable, validación, procedencia, política de ausencia y criterio de bloqueo. Ejemplos conceptuales: identificador de envío, peso, dirección, destinatario y referencia documental.

## Headers
Resolución mediante coincidencia exacta, alias autorizados, normalización segura y posición solo si el perfil lo declara. No fuzzy matching silencioso para campos críticos. Similitud sin certeza genera finding de ambigüedad.

## Valores
Distinguir rawValue, interpretedValue, normalizedValue, validatedValue y operationalValue. Nunca perder el valor fuente cuando una transformación sea relevante.

## Idempotencia y duplicados
El fingerprint de fuente participa en identificación de duplicados. Debe distinguirse mismo archivo/misma ejecución, mismo archivo/nueva ejecución, archivo diferente con contenido igual y archivo diferente con estructura igual. La política exacta queda pendiente.

## Cambios del proveedor
Cambios de columnas, worksheets o formatos provocan inspección y evaluación de aplicabilidad, con warning/bloqueo según impacto. Un perfil ACTIVE no se modifica retroactivamente.

## Matriz de compatibilidad

| Característica | Resultado |
|---|---|
| Formato | compatible/no compatible |
| Worksheet | compatible/no compatible |
| Header | exacto/alias/ambiguo |
| Campo crítico | mapeado/no mapeado |
| Transformación | disponible/no disponible |
| Regla | aplicable/no aplicable |

## Fixtures
Cada perfil ACTIVE debe tener casos mínimo válido, representativo, obligatorio ausente, header ambiguo, columna adicional/eliminada, formato inválido, transformación, duplicado y encoding. Fixtures productivas con datos personales requieren tratamiento/autorización.

## Evolución
Cambios compatibles generan nueva versión según política de versionado. Cambios que alteren significado, cardinalidad o interpretación requieren nueva versión mayor o nuevo profileId. Nunca se edita retroactivamente un perfil usado históricamente.

## Fallback
No existe fallback que invente columnas. Sin perfil aplicable: BLOCKED o REQUIRES_RECONCILIATION según causa. Un operador autorizado puede seleccionar un perfil alternativo y la decisión queda registrada.

## Criterios de aceptación
- AT-MAP-001: ningún encabezado real es definitivo sin evidencia.
- AT-MAP-002: perfiles son versionados.
- AT-MAP-003: ACTIVE no se modifica retroactivamente.
- AT-MAP-004: mappings críticos son explícitos.
- AT-MAP-005: transformaciones son trazables.
- AT-MAP-006: valores originales se conservan.
- AT-MAP-007: ambigüedad no se resuelve silenciosamente.
- AT-MAP-008: perfil no aplicable no se fuerza.
- AT-MAP-009: fixtures reproducen el mapping.
- AT-MAP-010: cambios estructurales son detectables.
- AT-MAP-011: mapping es determinista.
- AT-MAP-012: no hay fuzzy matching silencioso en campos críticos.

## Evidencia pendiente
Para cerrar el catálogo concreto se necesita al menos un Excel real de manifiesto, idealmente varias versiones históricas anonimizadas. Hasta entonces, los nombres concretos de columnas permanecen abiertos.
