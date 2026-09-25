# Máquina de estados del ciclo de importación de Paquetería v0.1.0

**Estado documental:** En validación  
**Bounded Context:** Paquetería  
**Base de trabajo:** 42a8759a7c3061078bd9e3dade4d9a13db650db0

## 1. Propósito

Define la máquina de estados lógica del procesamiento de un manifiesto importado y separa explícitamente el estado técnico de una ejecución de importación del estado operativo del manifiesto.

Este documento no congela tablas PostgreSQL, DTO REST, broker, motor BPM/BRMS ni una implementación distribuida.

## 2. Principio fundamental

Existen dos ciclos relacionados pero independientes:

1. **ImportExecution:** describe qué ocurre con una ejecución técnica de importación.
2. **Manifest:** describe la situación operativa del manifiesto una vez que sus datos son aceptados.

Una falla técnica de una importación no debe convertir por sí sola un manifiesto operativo en un estado inválido ni borrar información previamente aceptada.

## 3. Estados de ImportExecution

| Estado | Clase | Significado |
|---|---|---|
| RECEIVED | No terminal | Solicitud recibida y registrada |
| PRESERVED | No terminal | Fuente original preservada |
| INSPECTING | No terminal | Se inspecciona estructura y metadatos |
| EXTRACTING | No terminal | Se extraen datos a representación intermedia |
| MAPPED | No terminal | Se aplicó un perfil de mapeo versionado |
| VALIDATING | No terminal | Se ejecutan reglas |
| REQUIRES_RECONCILIATION | No terminal | Existen discrepancias que requieren intervención |
| REVALIDATING | No terminal | Se vuelven a evaluar datos tras conciliación |
| READY_FOR_ACCEPTANCE | No terminal | Cumple condiciones para promoción |
| ACCEPTED | Terminal | La ejecución fue aceptada |
| REJECTED | Terminal | La ejecución fue rechazada por razones operativas/de negocio |
| BLOCKED | No terminal | No puede avanzar hasta resolver una dependencia o decisión |
| FAILED | Terminal de la ejecución | Fallo técnico no resuelto; puede originar una nueva ejecución/reintento |
| CANCELLED | Terminal | Ejecución cancelada explícitamente |

## 4. Transiciones autorizadas

- RECEIVED → PRESERVED
- RECEIVED → FAILED
- PRESERVED → INSPECTING
- PRESERVED → FAILED
- INSPECTING → EXTRACTING
- INSPECTING → BLOCKED
- INSPECTING → FAILED
- EXTRACTING → MAPPED
- EXTRACTING → BLOCKED
- EXTRACTING → FAILED
- MAPPED → VALIDATING
- MAPPED → BLOCKED
- MAPPED → FAILED
- VALIDATING → REQUIRES_RECONCILIATION
- VALIDATING → READY_FOR_ACCEPTANCE
- VALIDATING → BLOCKED
- VALIDATING → FAILED
- REQUIRES_RECONCILIATION → REVALIDATING
- REQUIRES_RECONCILIATION → BLOCKED
- REQUIRES_RECONCILIATION → CANCELLED
- REVALIDATING → REQUIRES_RECONCILIATION
- REVALIDATING → READY_FOR_ACCEPTANCE
- REVALIDATING → BLOCKED
- REVALIDATING → FAILED
- READY_FOR_ACCEPTANCE → ACCEPTED
- READY_FOR_ACCEPTANCE → REJECTED
- READY_FOR_ACCEPTANCE → BLOCKED
- BLOCKED → estado operativo anterior/continuable, según checkpoint y causa
- FAILED → RECEIVED mediante nueva ejecución, nunca mediante mutación silenciosa del historial
- cualquier estado no terminal → CANCELLED cuando la política de autorización permita cancelación

La transición BLOCKED → estado previo debe materializarse mediante un checkpoint explícito; no se permite una transición genérica que oculte dónde quedó detenido el procesamiento.

## 5. Guardas de transición

Cada transición debe verificar:

- estado actual compatible;
- versión/baseVersion esperada;
- autorización del actor;
- idempotencyKey de la operación;
- existencia de checkpoint cuando corresponda;
- evidencia requerida;
- perfil de mapeo y versión disponibles;
- conjunto de reglas versionado disponible;
- ausencia de hallazgos bloqueantes para promoción;
- conciliaciones obligatorias cerradas;
- procedencia mínima completa;
- dependencias externas disponibles cuando sean obligatorias.

## 6. Comandos

- ReceiveImport
- PreserveSource
- InspectImport
- ExtractImport
- MapImport
- ValidateImport
- ReconcileDiscrepancy
- RevalidateImport
- RequestAcceptance
- AcceptImport
- RejectImport
- RetryImport
- CancelImport
- UnblockImport

Los comandos expresan intención. No deben permitir que una capa de infraestructura cambie directamente el estado operacional.

## 7. Eventos de dominio/proceso candidatos

- ManifestImportReceived
- SourcePreserved
- ImportInspectionCompleted
- ImportExtractionCompleted
- ImportMappingCompleted
- ImportValidationCompleted
- DiscrepancyDetected
- ReconciliationCompleted
- ImportRevalidationCompleted
- ImportReadyForAcceptance
- ManifestImportAccepted
- ManifestImportRejected
- ImportBlocked
- ImportFailed
- ImportRetried
- ImportCancelled

Los eventos son candidatos contractuales; su mecanismo de transporte queda abierto. No implican Kafka, RabbitMQ ni otro broker.

## 8. Idempotencia

Toda operación que pueda producir efectos debe aceptar una clave de idempotencia.

Reglas mínimas:

- misma clave + misma intención + mismo contexto → mismo resultado lógico;
- repetir un comando ya aplicado no crea una segunda promoción;
- una conciliación no puede aplicarse dos veces al mismo hallazgo por la misma operación;
- una aceptación aceptada no puede volver a generar una nueva aceptación;
- las reejecuciones técnicas crean una nueva ejecución identificable, conservando la anterior.

## 9. Concurrencia

Se adopta control optimista mediante:

- executionId;
- version;
- baseVersion;
- actor;
- timestamp;
- operationId.

Si baseVersion no coincide con la versión vigente, la operación se rechaza como conflicto y no se sobrescribe silenciosamente el estado de otro actor.

## 10. Recuperación y reintentos

Se distinguen:

### Error técnico transitorio
Ejemplos: timeout, dependencia temporalmente indisponible, conexión interrumpida.

Acción:
- reintento limitado;
- backoff;
- checkpoint;
- contador de intentos;
- observabilidad.

### Error técnico definitivo
Ejemplos: archivo ilegible de forma irrecuperable o corrupción que impide continuar.

Acción:
- FAILED;
- conservar evidencia;
- registrar causa;
- permitir una nueva ejecución sin destruir la anterior.

### Bloqueo operativo
Ejemplos: decisión humana pendiente o dependencia externa requerida.

Acción:
- BLOCKED;
- registrar causa y responsable;
- no consumir reintentos técnicos indefinidamente.

### Hallazgo de negocio
Acción:
- REQUIRES_RECONCILIATION;
- no tratarlo como excepción técnica.

## 11. Regla de promoción a ACCEPTED

Una ejecución solamente puede alcanzar ACCEPTED si:

1. la fuente fue preservada;
2. la extracción terminó correctamente;
3. el mapeo usado está identificado y versionado;
4. las reglas ejecutadas están identificadas y versionadas;
5. los hallazgos bloqueantes están ausentes o resueltos mediante una excepción formal autorizada;
6. las conciliaciones obligatorias están cerradas;
7. la procedencia de los datos críticos está completa;
8. las validaciones obligatorias pasaron;
9. no existe bloqueo externo obligatorio;
10. el actor posee autorización para aceptar.

La aceptación debe generar un evento y una entrada de auditoría.

## 12. Manifest state ≠ ImportExecution state

El manifiesto tendrá su propio ciclo operativo. Como mínimo debe poder distinguirse conceptualmente entre:

- recibido;
- en conciliación;
- aceptado operacionalmente;
- disponible para operaciones posteriores;
- cerrado/archivado.

Los estados exactos del manifiesto permanecen sujetos al modelo operacional completo y no deben derivarse automáticamente de cada estado técnico de ImportExecution.

## 13. Checkpoints

Cada etapa importante debe poder registrar un checkpoint lógico con:

- executionId;
- stage;
- versión;
- timestamp;
- actor/proceso;
- input fingerprint;
- output fingerprint;
- ruleSetVersion cuando aplique;
- mappingProfileVersion cuando aplique;
- resultado;
- error/finding references;
- correlationId/operationId.

Los checkpoints permiten reanudar sin repetir innecesariamente etapas ya completadas.

## 14. Auditoría

Toda transición debe ser trazable mediante:

- quién o qué proceso la ejecutó;
- cuándo;
- estado anterior;
- estado posterior;
- comando;
- operationId;
- correlationId;
- idempotencyKey;
- razón;
- evidencia asociada;
- versión de reglas/mapeo cuando corresponda.

## 15. Invariantes

1. Nunca se pierde la fuente original por una transformación posterior.
2. Nunca se confunde un hallazgo de negocio con un fallo técnico.
3. Nunca se salta silenciosamente una etapa obligatoria.
4. Nunca se sobrescribe una ejecución histórica para simular una reejecución.
5. Nunca se promociona a ACCEPTED con hallazgos bloqueantes abiertos.
6. Una nueva ejecución conserva referencia a la ejecución anterior cuando deriva de un retry.
7. La aceptación operacional es explícita y auditable.
8. Un estado técnico no sustituye el historial de eventos.
9. La idempotencia debe ser observable.
10. Las transiciones inválidas son rechazadas.

## 16. Criterios de aceptación

- AT-ISM-001: cada estado tiene semántica única.
- AT-ISM-002: no existen transiciones implícitamente permitidas.
- AT-ISM-003: FAILED no se reutiliza para representar discrepancias de negocio.
- AT-ISM-004: BLOCKED identifica causa y checkpoint.
- AT-ISM-005: una reejecución conserva la ejecución anterior.
- AT-ISM-006: ACCEPTED exige las guardas de promoción.
- AT-ISM-007: comandos repetidos con la misma idempotencyKey no duplican efectos.
- AT-ISM-008: conflicto de version/baseVersion no sobrescribe cambios.
- AT-ISM-009: cada transición genera trazabilidad.
- AT-ISM-010: ImportExecution y Manifest mantienen estados conceptualmente separados.

## 17. Decisiones pendientes

Quedan abiertas únicamente decisiones que requieren evidencia o definición operacional:

- catálogo definitivo de estados del manifiesto;
- política exacta de excepciones autorizadas;
- límites de reintento/backoff;
- actores/roles concretos para cada comando;
- SLA de resolución de BLOCKED;
- retención de checkpoints;
- eventos que serán externos a este bounded context;
- sincronización offline para operaciones móviles;
- requisitos exactos de auditoría y retención documental según normativa aplicable.

Estas decisiones no deben resolverse por conveniencia de implementación ni por la elección de un framework.
