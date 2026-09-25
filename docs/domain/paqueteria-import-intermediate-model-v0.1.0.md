# Modelo intermedio de importación de Paquetería — v0.1.0

**Estado:** En validación  
**Tipo:** Diseño lógico / contrato interno de pipeline  
**Base:** evidencia real documentada en PR #139 y PR #140

## 1. Propósito
Define una representación neutral entre el archivo fuente y el modelo canónico de Paquetería. Preserva evidencia, permite inspección y mapping determinista, ejecuta transformaciones controladas y soporta validación/reconciliación sin acoplar el importador a PostgreSQL, REST, un proveedor de geocodificación o una librería Excel concreta.

## 2. Flujo
```
Source file → ImportSnapshot → Workbook/Sheet/Row/Cell
→ MappedFieldValue → ExtractedRecord
→ Validation + Reconciliation → Canonical Candidate
→ Operational promotion
```

## 3. ImportSnapshot
Identidad: importSnapshotId, sourceDocumentId, contentHash, createdAt, createdBy, sourceFormat, sourceFileName, mappingProfileId/version.

Estado: preservationStatus, inspectionStatus, extractionStatus, validationStatus, reconciliationStatus.

Integridad: byteLength, detectedMimeType, encoding, workbookMetadata, sourceSystemReference.

El snapshot es inmutable; una nueva versión del archivo crea otro snapshot.

## 4. Workbook y Sheet
Workbook: workbookId, sourceDocumentId, sheetCount, workbookProperties, calculationMode, sheets[].

Sheet: sheetId, nameRaw, ordinal, visibility, usedRange, headerCandidates, mergedRanges, formulaCount, rowCountObserved, columnCountObserved, structuralFingerprint.

El mapping selecciona hojas mediante perfil y reglas de compatibilidad; no se confía solamente en posición.

## 5. Row
Campos: rowId, sheetId, rowNumber, rowKind, cells[], rowFingerprint.

Tipos: HEADER, DATA, TOTAL, SUBTOTAL, FOOTER, EMPTY, UNKNOWN.

## 6. Cell
Cada celda conserva: cellId, address, rowNumber, columnIndex, columnHeaderRaw, rawValue, displayedValue, dataTypeDetected, formula, formulaResult, numberFormat, isMerged, mergeRange, sourceHash.

Una normalización nunca destruye rawValue.

## 7. MappedFieldValue
Representa uno o varios valores fuente mapeados a un campo lógico.

Campos: mappedFieldValueId, targetField, sourceCellRefs[], rawValue, interpretedValue, normalizedValue, transformationRefs[], confidence, mappingDecision, mappingProfileRef.

Decisiones: EXACT, ALIAS, POSITIONAL_EXPLICIT, DERIVED, UNMAPPED, AMBIGUOUS, BLOCKED.

Para campos críticos, AMBIGUOUS/UNMAPPED no produce asignación silenciosa.

## 8. ExtractedRecord
Representa una unidad extraída antes de convertirla en entidad canónica.

Campos: extractedRecordId, recordType, sourceRowRef, sourceSheetRef, identityCandidates[], fields[], relatedRecordRefs[], findings[], provenanceRefs[].

Tipos iniciales: MANIFEST, HOUSE, PHYSICAL_UNIT, PERSON, ADDRESS, CONTACT_POINT, DOCUMENT_METADATA, DERIVED_RECORD.

## 9. ProvenanceReference
Cada valor relevante debe remontarse a: sourceDocumentId, contentHash, workbookId, sheetId, sheetName, rowNumber, columnIndex, columnHeaderRaw, cellAddress, rawValue, formula, mappingProfileId/version, transformationChain[], validationRunId.

Las decisiones humanas añaden actorId, occurredAt y decisionReference.

## 10. Transformation
Una transformación nunca modifica la evidencia original.

Campos: transformationId, type, version, inputRefs[], outputValue, parameters, deterministic, executedAt.

Tipos iniciales: TRIM, WHITESPACE_NORMALIZATION, PHONE_SPLIT, TEXT_CANONICALIZATION, NUMERIC_PARSE, DATE_PARSE, CODE_NORMALIZATION, ADDRESS_COMPONENT_EXTRACTION, FORMULA_DERIVATION, EXPLICIT_MAPPING.

No se permite fuzzy matching no declarado para campos críticos.

## 11. IdentityCandidate
Permite sugerir identidad sin fusionar automáticamente.

Campos: candidateType, sourceValue, normalizedValue, matchingKeys[], candidateRefs[], decision, decisionReason.

Decisiones: NEW, LINK_EXISTING, AMBIGUOUS, REJECTED, REQUIRES_RECONCILIATION.

Especialmente aplicable a personas y direcciones.

## 12. Findings y reconciliación
Los findings referencian ruleId/version, severity, blocking, field, sourceRefs, actualValue, expectedValue, message y state.

El resumen de reconciliación debe incluir:
- declaredHouseCount / extractedHouseCount;
- declaredSackCount / extractedPhysicalUnitQuantity;
- declaredPersonCount / extractedPersonCount;
- declaredWeight / extractedWeight;
- distinctAddressCount;
- discrepancies[].

Cada discrepancia conserva diferencia y evidencia.

## 13. Canonical Candidate
Solo después de mapping, transformación, validación y reconciliación se construye el candidato canónico:

```
CanonicalHouseCandidate
 ├─ externalReference
 ├─ physicalUnits[]
 ├─ senderRef
 ├─ recipientRef
 ├─ addressRef
 ├─ destinationCode
 ├─ collectionStatus
 ├─ provenance[]
 └─ findings[]
```

Esto todavía no implica aceptación operacional.

## 14. Promotion boundary
La transición **Canonical Candidate → Operational Entity** requiere decisión explícita y respeta los guards de la máquina de estados. No se insertan entidades operacionales parcialmente solo porque terminó la extracción técnica.

## 15. Idempotencia
La misma fuente, perfil y operación se detectan mediante contentHash + mappingProfileId/version + import command/idempotency key. Reprocesar una importación no debe duplicar Houses, personas o unidades físicas.

## 16. Seguridad
El modelo puede contener nombres, documentos, teléfonos y direcciones. Debe aplicar acceso por rol, logs minimizados, hashes de integridad, retención definida y fixtures sin PII real.

## 17. Invariantes
1. Ningún campo derivado elimina su fuente.
2. Ninguna transformación modifica rawValue.
3. Ningún mapping ambiguo de campo crítico se acepta silenciosamente.
4. Ningún finding crítico desaparece al revalidar.
5. Toda corrección humana queda auditada.
6. House y PhysicalUnit permanecen diferenciados.
7. Una dirección puede relacionarse con múltiples Houses.
8. Múltiples teléfonos son válidos.
9. Geocoding failure no elimina Address.
10. Fórmula y valor calculado se distinguen.
11. Reprocesamiento es idempotente.
12. La promoción operacional es explícita.

## 18. Pruebas obligatorias
Fixtures para House numérico y CACC-*, múltiples bultos, teléfonos múltiples, dirección compartida, coordenadas válidas/ausentes/#N/A, Aduana, CONSOLIDADO, fórmulas, totales discrepantes, columnas renombradas/adicionales/ausentes, duplicados, reimportación e incremento de versión del mapping profile.

## 19. Arquitectura
El modelo pertenece al boundary Application/Domain del pipeline y utiliza puertos como SourceStoragePort, WorkbookReaderPort, MappingProfilePort, RuleSetPort, FindingsRepositoryPort y GeocodingPort. No requiere microservicios.

## 20. Próximo vertical
Preservar archivo → inspeccionar workbook → producir ImportSnapshot → detectar hojas/cabeceras → ejecutar mapping profile → producir ExtractedRecord → emitir findings → reconciliar totales → generar Canonical Candidate → probar idempotencia y trazabilidad.

La persistencia definitiva se diseñará después de verificar este flujo con fixtures sintéticos.
