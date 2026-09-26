# Matriz de trazabilidad de Paquetería — v0.1.0

**Estado:** baseline de trazabilidad para validación de dominio y diseño de aplicación  
**Ámbito:** Servicio de Paquetería de SETA EXPRESO SURL  
**Rama:** docs/paqueteria-normative-extraction-v0.2.0  
**Fuentes base:** especificación funcional v0.1.0, casos de uso UC-01…UC-20, decisiones críticas D01…D12, máquina de estados, análisis del manifiesto 649-31382945 y evidencia normativa disponible.

## 1. Propósito

Establecer trazabilidad verificable entre:

**Requisito → Caso de Uso → Regla/Invariante → Evento → Prueba de Aceptación → Contrato de Aplicación candidato**

Esta matriz evita que un requisito llegue al código sin una representación funcional, una regla de dominio y una estrategia de verificación.

Los contratos de aplicación indicados aquí son **candidatos**. No constituyen todavía el diseño definitivo de REST/OpenAPI ni autorizan un esquema PostgreSQL físico.

## 2. Estados de cobertura

- **CUBIERTO:** existe correspondencia funcional, regla, evento y prueba suficiente para continuar.
- **PARCIAL:** existe trazabilidad, pero falta evidencia o una decisión de dominio.
- **BLOQUEADO:** no debe congelarse la implementación definitiva hasta resolver una decisión o evidencia pendiente.

## 3. Matriz principal

| Req. | Caso de uso | Regla / invariante | Evento candidato | Aceptación | API candidata | Estado |
|---|---|---|---|---|---|---|
| RF-PQ-001 | UC-01 | I01, I02; conservar archivo, hash, hoja, filas y valores originales | ManifestIngested | AT-01, AT-02 | POST /manifest-imports | CUBIERTO |
| RF-PQ-002 | UC-02 | I07; validación estructural y semántica por fila | ManifestValidated | AT-01, AT-05 | POST /manifest-imports/{id}/validate | CUBIERTO |
| RF-PQ-003 | UC-03 | M-04/M-05/M-06; discrepancia no destruye información válida | ManifestDiscrepancyDetected | AT-03, AT-04, AT-18, AT-19, AT-20, AT-21 | GET /manifest-imports/{id}/discrepancies | CUBIERTO |
| RF-PQ-004 | UC-04, UC-05, UC-06 | D01-D04; Master AWB, House y PhysicalUnit son conceptos separados | HouseRegistered, PhysicalUnitsRegistered | AT-06 | POST /houses; POST /houses/{id}/physical-units | PARCIAL |
| RF-PQ-005 | UC-07 | D05; Person independiente, Sender/Recipient como roles; no fusionar por nombre | PersonRoleResolved | AT-08 | POST /persons/resolve | CUBIERTO |
| RF-PQ-006 | UC-08 | I06, RT-02; conservar dirección original y resultados de normalización | AddressNormalized | AT-09 | POST /addresses/normalize | CUBIERTO |
| RF-PQ-007 | UC-09 | geocodificación versionada y desacoplada; fallo no elimina dirección | GeolocationResolved | AT-10, AT-25 | POST /geolocations/resolve | CUBIERTO |
| RF-PQ-008 | UC-11, UC-13 | custodia separada de entrega; StorageLocation ≠ DeliveryAddress | StorageMovementRecorded | AT-22 | POST /storage-movements | CUBIERTO |
| RF-PQ-009 | UC-11 | registrar actos/resultados aduaneros sin sustituir a la autoridad | CustomsActionRecorded | AT-23, AT-24 | POST /customs-actions | PARCIAL |
| RF-PQ-010 | UC-11 | elegibilidad depende de recepción, custodia, situación aduanera, destino e incidencias | DistributionEligibilityGranted | AT-15, AT-16, AT-25 | POST /distribution-eligibility/evaluate | PARCIAL |
| RF-PQ-011 | UC-12, UC-13 | Route contiene fecha, origen, destino, vehículo, conductor y Stop ordenados | RoutePlanned, RouteStarted, StopArrived | AT-15, AT-16 | POST /routes; POST /routes/{id}/start | CUBIERTO |
| RF-PQ-012 | UC-14, UC-16 | cada intento es independiente y conserva su resultado; retry crea nuevo intento | DeliveryAttemptRecorded, DeliveryFailed, RetryScheduled | AT-11, AT-12 | POST /deliveries/{id}/attempts | CUBIERTO |
| RF-PQ-013 | UC-15 | D12; entrega exitosa requiere fotografía del documento de identidad del receptor asociada al paquete/operación | DeliveryCompleted | AT-13 | POST /deliveries/{id}/complete | CUBIERTO |
| RF-PQ-014 | UC-17 | DeliveryFailed ≠ abandono; devolución es flujo operacional separado | ReturnInitiated, ReturnCompleted | AT-23 | POST /deliveries/{id}/return | CUBIERTO |
| RF-PQ-015 | UC-18 | incidencia conserva tipo, actor, fecha, evidencia y resolución | IncidentRegistered | AT-18, AT-20, AT-21 | POST /incidents | CUBIERTO |
| RF-PQ-016 | UC-19 | trazabilidad no depende solo del estado actual | AuditRecordCreated | AT-17 | GET /houses/{id}/traceability | CUBIERTO |
| RF-PQ-017 | UC-20 + autorización transversal | operación autorizada por rol, permiso, ámbito y estado | StatusTransitionRecorded, AuditRecordCreated | AT-15, AT-16 | POST /status-transitions | PARCIAL |
| RF-PQ-018 | UC-20 | no perder transiciones; estado multidimensional | StatusTransitionRecorded | AT-15, AT-16 | GET /{resource}/{id}/status-history | CUBIERTO |
| RF-PQ-019 | UC-19 + auditoría | operaciones críticas deben atribuirse a actor, tiempo, operación y motivo | AuditRecordCreated | AT-17 | GET /audit/records | CUBIERTO |
| RF-PQ-020 | UC-14, UC-15 | D09 abierto; soporte técnico provisional Delivery ↔ House N:M | DeliveryAttemptRecorded, DeliveryCompleted | AT-26 | POST /deliveries/{id}/houses | BLOQUEADO |

## 4. Trazabilidad D01–D12

| Decisión | Requisitos afectados | UC | Pruebas | Estado |
|---|---|---|---|---|
| D01 — jerarquía Master AWB/Guide/House | RF-PQ-001, RF-PQ-004, RF-PQ-016 | UC-01, UC-04, UC-05, UC-19 | AT-17 | PARCIAL |
| D02 — House vs PhysicalUnit | RF-PQ-004 | UC-05, UC-06 | AT-06 | PARCIAL |
| D03 — jerarquía documental y cardinalidad | RF-PQ-004 | UC-01, UC-04, UC-05 | AT-17 | PARCIAL |
| D04 — House → PhysicalUnit | RF-PQ-004 | UC-06 | AT-06 | CUBIERTO ESTRUCTURALMENTE |
| D05 — Person y roles | RF-PQ-005 | UC-07 | AT-08 | CUBIERTO |
| D06 — Customer | RF-PQ-005 | UC-07 | futuras pruebas comerciales | BLOQUEADO PARA MODELO COMERCIAL |
| D07 — reutilización de Address | RF-PQ-006, RF-PQ-010 | UC-08, UC-10 | AT-09, AT-10 | PARCIAL |
| D08 — DeliveryPoint/Stop | RF-PQ-010, RF-PQ-011 | UC-10, UC-12, UC-13 | AT-07 | CUBIERTO |
| D09 — múltiples House en Delivery | RF-PQ-020, RF-PQ-013 | UC-14, UC-15 | AT-26 | BLOQUEADO |
| D10 — fallos, retry y retorno | RF-PQ-012, RF-PQ-014 | UC-16, UC-17 | AT-11, AT-12, AT-23 | CUBIERTO CONCEPTUALMENTE |
| D11 — máquina de estados | RF-PQ-010…RF-PQ-018 | UC-11, UC-13, UC-14, UC-20 | AT-15, AT-16 | PARCIAL |
| D12 — mínimo POD | RF-PQ-013 | UC-15 | AT-13 | CERRADO |

## 5. Reglas transversales

| Regla | Aplicación | Requisitos |
|---|---|---|
| RT-01 Auditabilidad | modificaciones y operaciones críticas | RF-PQ-003, 005, 008, 013, 015, 017, 019 |
| RT-02 Preservación de fuente | nunca sobrescribir valores originales | RF-PQ-001, 002, 003, 006 |
| RT-03 Idempotencia | importación y comandos reintentables | RF-PQ-001, 002 |
| RT-04 Errores parciales | fila inválida no destruye filas válidas | RF-PQ-002, 003 |
| RT-05 Separación de responsabilidades | SETA registra actuaciones externas | RF-PQ-009, 014 |
| RT-06 Estado multidimensional | seis dimensiones independientes | RF-PQ-009, 010, 011, 012, 014, 018 |
| RT-07 Historial | hechos no se sobrescriben | RF-PQ-012, 015, 016, 018, 019 |
| RT-08 Geocodificación desacoplada | documentación válida no depende del proveedor | RF-PQ-006, 007, 010 |

## 6. Trazabilidad de aceptación AT-01…AT-26

| Prueba | Requisito | UC | Resultado verificable |
|---|---|---|---|
| AT-01 | RF-PQ-001, 002 | UC-01, UC-02 | manifiesto válido ingestado y validado |
| AT-02 | RF-PQ-001 | UC-01 | duplicado detectado según política de idempotencia |
| AT-03 | RF-PQ-003 | UC-03 | House declarado ≠ filas → discrepancia |
| AT-04 | RF-PQ-003 | UC-03 | peso declarado ≠ suma → discrepancia |
| AT-05 | RF-PQ-002, 003 | UC-02, UC-03 | filas válidas preservadas frente a errores parciales |
| AT-06 | RF-PQ-004 | UC-06 | House con 3 PhysicalUnit válido |
| AT-07 | RF-PQ-010, 011 | UC-10, UC-12 | dos House con misma dirección pueden compartir DeliveryPoint |
| AT-08 | RF-PQ-005 | UC-07 | personas con mismo nombre e identificaciones distintas no se fusionan automáticamente |
| AT-09 | RF-PQ-006 | UC-08 | dirección normalizada conserva original |
| AT-10 | RF-PQ-007 | UC-09 | fallo de geocodificación no elimina dirección |
| AT-11 | RF-PQ-012 | UC-16 | intento fallido permanece después de programar reintento |
| AT-12 | RF-PQ-012 | UC-16 | segundo intento crea nuevo registro |
| AT-13 | RF-PQ-013 | UC-15 | entrega exitosa exige fotografía del documento de identidad del receptor asociada al paquete/operación |
| AT-14 | RF-PQ-014 | UC-16, UC-17 | fallo de entrega no genera abandono |
| AT-15 | RF-PQ-010, 011, 017, 018 | UC-20 | transición válida aceptada y auditada |
| AT-16 | RF-PQ-017, 018 | UC-20 | transición prohibida rechazada sin mutar estado previo |
| AT-17 | RF-PQ-016, 019 | UC-19 | trazabilidad completa desde fuente hasta operación final |
| AT-18 | RF-PQ-003, 015 | UC-03, UC-18 | faltante parcial registrado sin borrar House |
| AT-19 | RF-PQ-003 | UC-03 | sobrante registrado con diferencia |
| AT-20 | RF-PQ-003, 015 | UC-03, UC-18 | carga no manifestada registrada como discrepancia/incidencia |
| AT-21 | RF-PQ-003, 015 | UC-03, UC-18 | avería registrada con evidencia |
| AT-22 | RF-PQ-008 | operación de custodia | movimiento entre ubicaciones crea StorageMovement |
| AT-23 | RF-PQ-014 | UC-16, UC-17 | DeliveryFailed no crea AbandonmentRecord |
| AT-24 | RF-PQ-009 | operación aduanera | abandono solo con referencia/acto correspondiente |
| AT-25 | RF-PQ-007, 010 | UC-09, UC-11 | House se conserva aunque no exista geolocalización |
| AT-26 | RF-PQ-020 | UC-14, UC-15 | varios House pueden asociarse técnicamente a una Delivery; ejecución final condicionada por D09 |

## 7. Contratos de aplicación candidatos

Estos nombres expresan intención de negocio; no son todavía endpoints definitivos:

**Ingesta**
- ImportManifest
- ValidateManifest
- ReconcileManifest
- AcceptManifestImport

**Expedición**
- RegisterHouse
- RegisterPhysicalUnits
- ResolvePersonRole

**Dirección**
- NormalizeAddress
- GeocodeAddress
- CreateDeliveryPoint

**Operación**
- EvaluateDistributionEligibility
- PlanRoute
- StartRoute
- ArriveAtStop
- RecordDeliveryAttempt
- CompleteDelivery
- FailDelivery
- ScheduleRetry
- InitiateReturn
- CompleteReturn

**Aduana/custodia**
- RecordCustomsAction
- RecordAbandonment
- RecordStorageMovement

**Incidencias/auditoría**
- RegisterIncident
- GetTraceability
- GetStatusHistory
- GetAuditRecords

RecordAbandonment no debe ser una simple transición de entrega; requiere contexto y referencia documental del acto aduanero correspondiente.

## 8. Gaps y bloqueadores

### Bloqueadores de dominio

1. D09: agrupación operacional de múltiples House en una Delivery.
2. D12: mínimo operativo de POD.
3. Confirmación operacional de House = guía hija.
4. Catálogo oficial/operacional de Unidad de destino.
5. Reglas exactas de modificación/cancelación por etapa.
6. Catálogo operativo de estados/actos aduaneros que SETA debe registrar.
7. Procedimiento de liberación desde custodia/aduana hacia distribución.

### No bloquean el diseño lógico conceptual

- proveedor concreto de geocodificación;
- algoritmo de optimización de rutas;
- UI definitiva;
- detalles finales de REST/OpenAPI.

## 9. Criterio de salida

La matriz es válida como baseline cuando:

- RF-PQ-001…020 tienen trazabilidad;
- UC-01…20 están asociados;
- AT-01…26 están vinculados;
- cada requisito tiene al menos una prueba;
- los bloqueadores están identificados explícitamente;
- ningún bloqueador se oculta mediante una decisión técnica.

**Conclusión:** la trazabilidad funcional está establecida. El siguiente paso debe ser cerrar la semántica operacional pendiente y, después, elaborar el modelo lógico PostgreSQL/PostGIS v0.1.0 acompañado de ADRs para las decisiones que afecten persistencia.