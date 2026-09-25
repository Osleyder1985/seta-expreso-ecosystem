# Contrato de resultados, hallazgos y conciliación de importación de Paquetería v0.1.0

**Estado:** En validación

## 1. Propósito

Define el modelo lógico que comunica el resultado de una ejecución de importación sin congelar tablas, ORM, DTO HTTP ni proveedor de persistencia.

El contrato separa:

- resultado técnico de la ejecución;
- evaluaciones de reglas;
- hallazgos;
- discrepancias conciliables;
- decisiones de conciliación;
- procedencia/evidencia;
- resultado de promoción operacional.

## 2. ImportResult

Una ejecución produce conceptualmente:

```text
ImportResult
 ├─ execution
 ├─ source
 ├─ mapping
 ├─ validation
 ├─ findings
 ├─ reconciliation
 ├─ provenance
 └─ promotion
```

### Execution

- executionId
- importId
- attemptNumber
- status
- startedAt
- completedAt
- operationId
- correlationId
- causationId
- previousExecutionId cuando sea reintento

### Source

- sourceId
- contentHash
- originalFileName
- mediaType
- size
- receivedAt

### Mapping

- profileId
- profileVersion
- mappingStatus

### Validation

- validationRunId
- ruleSetId
- ruleSetVersion
- evaluatedCount
- passedCount
- failedCount
- blockedCount
- errorCount

### Promotion

- eligible
- blockingFindingCount
- unresolvedReconciliationCount
- requiredEvidenceComplete
- decision
- decidedBy
- decidedAt

## 3. Finding

Un Finding representa el resultado de una regla sobre un objetivo concreto.

Campos conceptuales:

- findingId
- findingVersion
- executionId
- validationRunId
- ruleId
- ruleVersion
- type
- severity
- blocking
- status
- targetType
- targetReference
- fieldReference
- declaredValue
- observedValue
- correctedValue
- messageCode
- message
- evidenceReferences
- externalDependency
- detectedAt
- resolvedAt
- resolvedBy

### Tipos

- STRUCTURAL
- REQUIRED
- TYPE
- DOMAIN
- CONSISTENCY
- BUSINESS
- EXTERNAL
- RECONCILIATION

Estos tipos deben permanecer alineados con el modelo de reglas de Paquetería.

## 4. Estado del Finding

Estados iniciales:

- OPEN
- UNDER_RECONCILIATION
- RESOLVED
- ACCEPTED_EXCEPTION
- SUPERSEDED
- INVALIDATED

Reglas:

- OPEN puede pasar a UNDER_RECONCILIATION.
- UNDER_RECONCILIATION requiere una decisión.
- RESOLVED implica una corrección/resultado verificable.
- ACCEPTED_EXCEPTION requiere autorización explícita.
- SUPERSEDED conserva referencia al finding sustituido.
- INVALIDATED no significa que el dato original se haya borrado; significa que el finding dejó de representar el resultado vigente.

## 5. Severity y Blocking

Severity:

- ERROR
- WARNING
- INFO

Blocking es una propiedad independiente.

Ejemplos:

- ERROR + blocking=true → impide promoción.
- ERROR + blocking=false → requiere tratamiento, pero no necesariamente bloquea.
- WARNING + blocking=true → puede bloquear si la regla así lo establece.
- INFO + blocking=false → informativo.

Nunca debe inferirse blocking exclusivamente desde severity.

## 6. Discrepancy

Una discrepancia es una especialización operacional de un finding que requiere comparar estados de información.

Modelo:

```text
Discrepancy
 ├─ declared
 ├─ observed
 ├─ difference
 ├─ classification
 ├─ evidence
 └─ reconciliation
```

Debe conservar:

- declaredValue;
- observedValue;
- difference;
- differenceType;
- sourceReference;
- observationReference;
- detectedAt.

El valor declarado nunca se sustituye destructivamente.

## 7. ReconciliationCase

Cuando un finding requiere intervención:

- caseId
- findingId
- executionId
- status
- openedAt
- openedBy
- assignedTo
- priority
- decision
- decisionReason
- evidenceReferences
- closedAt
- closedBy

Estados:

- OPEN
- ASSIGNED
- IN_REVIEW
- DECIDED
- CLOSED
- CANCELLED

## 8. ReconciliationDecision

Una decisión debe ser explícita:

- decisionId
- caseId
- actor
- authorityContext
- decisionType
- previousValue
- selectedValue
- reason
- evidenceReferences
- decidedAt
- resultingDataReference

Tipos conceptuales:

- ACCEPT_DECLARED
- ACCEPT_OBSERVED
- APPLY_CORRECTION
- REQUEST_EXTERNAL_CONFIRMATION
- REJECT_RECORD
- ACCEPT_EXCEPTION

El catálogo definitivo queda sujeto a casos reales.

## 9. Regla de no pérdida

Para todo dato sometido a conciliación:

```text
Declared
   ↓
Observed
   ↓
Corrected / Selected
   ↓
Operational
```

Los estados anteriores deben permanecer trazables.

No se permite:

```text
Declared → overwrite → Operational
```

sin conservar el historial.

## 10. ProvenanceReference

Todo finding crítico debe poder apuntar a su procedencia:

- sourceId
- workbook
- worksheet
- row
- column
- cell
- rawValue
- transformation
- mappingProfileVersion
- capturedAt

La procedencia puede referenciar también evidencia externa cuando la regla lo exija.

## 11. EvidenceReference

Una referencia de evidencia contiene conceptualmente:

- evidenceId
- evidenceType
- contentReference
- contentHash cuando corresponda
- capturedAt
- capturedBy
- metadata

El contrato no obliga todavía a una política concreta de almacenamiento.

## 12. RevalidationResult

Después de una conciliación se ejecuta una nueva validación.

Debe conservar:

- previousValidationRunId
- validationRunId
- ruleSetVersion
- changedTargets
- evaluations
- findingsCreated
- findingsResolved
- findingsSuperseded
- completedAt

La revalidación es una nueva ejecución, no una edición silenciosa del resultado anterior.

## 13. PromotionDecision

La promoción operacional se representa separadamente:

- promotionId
- executionId
- eligibility
- blockingFindingCount
- unresolvedCaseCount
- evidenceComplete
- authorizationValid
- decision
- actor
- decidedAt
- reason

Decisiones:

- ACCEPT
- REJECT
- BLOCK

Una ejecución técnicamente completa no implica automáticamente ACCEPT.

## 14. ImportResultSummary

Resumen calculable:

- totalRows
- acceptedRows
- rejectedRows
- warningRows
- blockingFindings
- openReconciliationCases
- resolvedFindings
- technicalErrors
- geocodingPending
- geocodingFailed
- promotionEligibility

Los contadores deben derivarse de registros trazables y no almacenarse como fuente única de verdad.

## 15. Consistencia

El resultado debe cumplir:

1. Todo finding referencia una regla existente/versionada.
2. Todo finding pertenece a una ejecución.
3. Toda conciliación referencia un finding.
4. Toda decisión de conciliación identifica actor y razón.
5. Todo finding crítico debe poder llegar a su evidencia/procedencia.
6. Una revalidación conserva referencia a la ejecución anterior.
7. Los resúmenes son reproducibles.
8. Los valores declarados no desaparecen.
9. Una promoción no puede ignorar findings bloqueantes.
10. Una excepción aceptada queda explícitamente identificada.

## 16. Idempotencia

La misma decisión no puede crear dos efectos operacionales.

La clave de idempotencia debe estar asociada a la operación, no al contenido del finding.

Una repetición con la misma intención devuelve el resultado previamente registrado.

## 17. Concurrencia

Toda modificación de Finding/ReconciliationCase debe comprobar version/baseVersion.

Un conflicto produce:

- rechazo de la escritura;
- registro del conflicto;
- lectura del estado actual;
- nueva decisión explícita.

No se hace last-write-wins silencioso sobre decisiones humanas.

## 18. Seguridad

El contrato no debe exponer innecesariamente:

- datos personales completos;
- documentos sensibles;
- secretos;
- credenciales;
- evidencia privada.

Los identificadores de referencia pueden utilizarse en vistas y APIs donde el contexto de autorización no permita revelar el valor completo.

## 19. Criterios de aceptación

- AT-IRC-001: ImportResult distingue ejecución, validación y promoción.
- AT-IRC-002: Finding siempre referencia regla/version.
- AT-IRC-003: severity y blocking son independientes.
- AT-IRC-004: discrepancia conserva declarado y observado.
- AT-IRC-005: conciliación conserva historial.
- AT-IRC-006: decisión humana identifica actor, razón y evidencia.
- AT-IRC-007: revalidación genera un nuevo validationRunId.
- AT-IRC-008: promoción no se deduce solo del fin técnico.
- AT-IRC-009: resúmenes son reproducibles.
- AT-IRC-010: conflictos de concurrencia no sobrescriben decisiones.
- AT-IRC-011: repetición idempotente no duplica efectos.
- AT-IRC-012: información sensible queda sujeta a autorización.

## 20. Pendientes

- catálogo definitivo de tipos de discrepancia;
- taxonomía final de evidencia;
- roles que pueden aceptar excepciones;
- política de expiración de findings;
- reglas de retención;
- estructura final de vistas/API;
- campos personales que podrán mostrarse en cada rol.

