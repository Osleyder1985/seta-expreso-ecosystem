# Contratos internos y puertos del pipeline de importación de Paquetería v0.1.0

**Estado:** En validación

## 1. Objetivo

Define contratos lógicos internos para desacoplar el pipeline de importación de Excel de almacenamiento, lector de hojas de cálculo, reglas, geocodificación, auditoría y publicación de eventos.

Son puertos de aplicación/dominio; no son todavía interfaces de un lenguaje concreto, endpoints HTTP ni tablas.

## 2. Principios

- El dominio no conoce proveedores concretos.
- La infraestructura implementa puertos.
- Los contratos reciben identificadores y modelos neutrales, no objetos de una librería Excel.
- Operaciones relevantes transportan `operationId`, `correlationId` e `idempotencyKey` cuando corresponda.
- Los resultados deben ser deterministas respecto a entrada, perfil y versión de reglas.
- Los errores técnicos y hallazgos de negocio permanecen separados.
- Ningún adapter puede promover directamente un manifiesto a estado operativo aceptado.

## 3. SourceStoragePort

Responsabilidad: preservar y recuperar la fuente original.

Operaciones: `preserve(source)`, `get(sourceId)`, `exists(sourceId)`, `fingerprint(sourceId)`.

`PreservedSource` conserva: sourceId, originalFileName, mediaType, byteLength, contentHash, receivedAt, storageReference y provenance.

**Invariante:** el contenido original es inmutable.

## 4. WorkbookReaderPort

Responsabilidad: inspeccionar y extraer contenido tabular sin introducir conceptos de negocio.

Operaciones: `inspect(source)`, `readSheet(source, sheetRef)`, `readRange(source, range)`.

La representación neutral debe poder expresar workbook, worksheet, fila/columna, índice, valor crudo, tipo aparente, fórmula, vacío y error de lectura.

No decide si un valor es dirección, peso o persona válida.

## 5. MappingProfilePort

Obtiene el perfil de mapeo versionado.

Operaciones: `resolve(context)`, `get(profileId, version)`, `listApplicable(context)`.

El perfil identifica profileId, version, applicability, source column/header, canonical field, transformation, requiredness, effective period y status.

No se infiere silenciosamente una columna desconocida como campo crítico.

## 6. RuleSetPort

Resuelve el conjunto versionado de reglas aplicable.

Operaciones: `resolve(context)`, `get(ruleSetId, version)`.

Identifica ruleSetId, version, rules, applicability, effective period y status. Toda validación conserva la versión exacta utilizada.

## 7. ValidationRunnerPort

Ejecuta reglas sobre representación canónica/intermedia.

Entrada: validationRunId, input reference, ruleSet, context y operation metadata.

Salida: validationRunId, ruleSetVersion, evaluations[], findings[], summary y completedAt.

Cada evaluación distingue PASS, FAIL, NOT_APPLICABLE, BLOCKED y ERROR. **FAIL no equivale a ERROR.**

## 8. FindingsRepositoryPort

Persiste y consulta hallazgos.

Operaciones: crear/buscar, obtener, listar por ejecución, cerrar, supersede y vincular evidencia.

Un finding conserva como mínimo findingId, ruleId/version, severity, blocking, target reference, declared/observed/corrected values, reason, evidence references, status, actor y timestamps.

## 9. ReconciliationPort

Aplica una decisión autorizada sobre un hallazgo y produce una representación susceptible de revalidación.

Operaciones: `open(case)`, `recordDecision(decision)`, `close(case)`, `get(caseId)`.

La decisión conserva actor, authority/context, correction, reason, evidence, timestamp, previous value y resulting value.

La conciliación nunca elimina el valor declarado original.

## 10. GeocodingPort

Resuelve coordenadas y metadatos de geocodificación.

Entrada: address reference, operational address candidate, country/region context y provider policy.

Salida: providerId, providerVersion cuando exista, request/reference, latitude, longitude, precision/quality, normalized representation, provider response metadata y timestamp.

Un fallo de geocodificación no destruye ni invalida por sí mismo la dirección declarada. El proveedor es sustituible.

## 11. AuditPort

Registra hechos auditables mediante `record(auditEntry)`.

La entrada conserva actor/process, operationId, correlationId, command, aggregate/reference, previous/new state, reason, timestamp y evidence references.

Debe ser append-oriented; no se modifica retrospectivamente un hecho para ocultar una acción.

## 12. EventPublisherPort

Publica eventos cuando corresponda.

Contrato: eventId, eventType, eventVersion, occurredAt, aggregateId, correlationId, causationId, payload y schemaVersion.

No presupone Kafka, RabbitMQ ni otro broker. Una primera implementación puede ser in-process.

## 13. ClockPort e IdGeneratorPort

`ClockPort.now()` desacopla el tiempo del sistema para pruebas deterministas.

`IdGeneratorPort.newId()` desacopla la generación de IDs de una librería concreta.

## 14. Contexto transversal

Todo comando del pipeline debe poder transportar conceptualmente:

```text
CommandContext
 ├─ operationId
 ├─ correlationId
 ├─ causationId
 ├─ idempotencyKey
 ├─ actor
 ├─ authorizationContext
 ├─ expectedVersion
 └─ occurredAt
```

La forma definitiva queda para la implementación.

## 15. Política de errores

**Finding de negocio:** dato faltante, dato inválido, inconsistencia, discrepancia o regla externa no satisfecha.

**Technical failure:** archivo ilegible, timeout, almacenamiento no disponible, dependencia caída o error inesperado.

**Blocked:** dependencia o decisión requerida para continuar.

No se convierte un error técnico en finding para ocultar una falla de infraestructura.

## 16. Composición conceptual

```text
Import Command
      ↓
SourceStoragePort
      ↓
WorkbookReaderPort
      ↓
MappingProfilePort
      ↓
Canonical Intermediate Model
      ↓
RuleSetPort
      ↓
ValidationRunnerPort
      ↓
FindingsRepositoryPort
      ↓
ReconciliationPort ──→ revalidation
      ↓
GeocodingPort
      ↓
Acceptance
      ↓
AuditPort + EventPublisherPort
```

La posición de geocodificación puede cambiar según reglas de aceptación y volumen; la dependencia permanece detrás del puerto.

## 17. Pruebas

Cada puerto debe admitir pruebas de contrato, determinismo, errores, timeout/retry cuando aplique, idempotencia, entradas vacías, límites, incompatibilidad de versiones, observabilidad y seguridad.

Los adapters reales deben poder probarse sin proveedores externos mediante dobles de prueba.

## 18. Criterios de aceptación

- AT-PC-001: ningún contrato expone una librería Excel concreta.
- AT-PC-002: ningún contrato expone tablas PostgreSQL.
- AT-PC-003: geocodificación es sustituible.
- AT-PC-004: reglas y perfiles son versionados.
- AT-PC-005: findings y technical failures son distinguibles.
- AT-PC-006: la fuente original es inmutable.
- AT-PC-007: comandos llevan contexto de trazabilidad.
- AT-PC-008: auditoría es append-oriented.
- AT-PC-009: eventos no obligan a adoptar un broker.
- AT-PC-010: adapters pueden probarse sin servicios externos.
- AT-PC-011: revalidación conserva referencia al run anterior.
- AT-PC-012: contratos no congelan DTO REST ni esquema físico.

## 19. Pendientes

Quedan abiertos nombres definitivos de tipos, serialización, versionado de contratos, transacciones, persistencia, proveedor geocodificador, sincronización móvil y requisitos definitivos de observabilidad/retención.

