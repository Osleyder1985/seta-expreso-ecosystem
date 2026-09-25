# Modelo de dominio de Paquetería — v0.2.0

**Estado:** propuesta consolidada para revisión técnica  
**Ámbito:** Bounded Context Paquetería  
**Base de evidencia:** modelo conceptual v0.1.0, extracción normativa v0.3.0 y análisis del manifiesto real 649-31382945.  
**Restricción:** este documento no autoriza todavía migraciones PostgreSQL definitivas.

## 1. Propósito

Definir un modelo de dominio suficientemente preciso para que la implementación de Paquetería no confunda conceptos documentales, físicos, logísticos, aduaneros y de entrega.

El modelo separa:

- documentación de transporte;
- expediciones House;
- unidades físicas;
- personas y roles;
- direcciones y geolocalización;
- puntos de entrega;
- rutas y paradas;
- entregas e intentos;
- evidencia de entrega;
- incidencias;
- estados e historial.

## 2. Evidencia que condiciona el modelo

El manifiesto 649-31382945 contiene un Master AWB y 127 House, además de remitente, destinatario, identificaciones, teléfonos, dirección, peso, cantidad de bultos y unidad de destino.

La evidencia demuestra que House es una unidad documental/operativa propia y que la columna de cantidad de bultos debe poder representar más de una unidad física. No se adopta House = PhysicalUnit como regla universal.

La evidencia también demuestra que varias expediciones pueden compartir destinatario o dirección, por lo que dirección y punto de entrega no deben quedar embebidos como simples campos irrepetibles de una entrega.

## 3. Bounded Context

### 3.1 Responsabilidad

Paquetería gestiona el ciclo operativo de las mercancías desde su incorporación documental al proceso de SETA hasta su distribución, intento de entrega, entrega, devolución o cierre operacional.

### 3.2 Fuera de alcance

No se convierte a SETA en autoridad aduanera. El sistema registra resultados, referencias y evidencias de actuaciones externas cuando sean necesarias para la operación.

Quedan fuera del agregado de Paquetería:

- contabilidad general;
- nómina;
- gestión integral de vehículos;
- identidad/autenticación transversal;
- catálogo corporativo de clientes;
- proveedores externos de mapas/geocodificación.

Estos contextos se integrarán mediante contratos y referencias.

## 4. Entidades y Value Objects

### 4.1 Manifest

Representa la instancia de importación/registro del manifiesto recibido por SETA.

Atributos candidatos:

- ManifestId;
- sourceFileName;
- sourceFileHash;
- sourceSheet;
- receivedAt;
- sourceAgent;
- originCountry;
- consignee;
- declaredHouseCount;
- declaredBagCount;
- declaredPersonCount;
- declaredWeight;
- status;
- sourceReference.

No debe confundirse automáticamente con Master AWB.

### 4.2 TransportDocument

Representa un documento de transporte identificado por un número documental.

Atributos candidatos:

- TransportDocumentId;
- documentType;
- documentNumber;
- normalizedDocumentNumber;
- parentDocumentId;
- sourceReference.

Para el manifiesto de referencia existe evidencia de Master AWB. La jerarquía documental completa sigue abierta.

### 4.3 House

Entidad central de la expedición.

Atributos candidatos:

- HouseId;
- houseNumber;
- normalizedHouseNumber;
- transportDocumentId;
- declaredContent;
- declaredWeight;
- declaredPackageCount;
- senderId;
- recipientId;
- destinationUnitCode;
- commercialCollectionStatus;
- lifecycleState.

House no equivale necesariamente a unidad física.

### 4.4 PhysicalUnit

Representa una unidad física manipulable.

Atributos candidatos:

- PhysicalUnitId;
- houseId;
- sequence;
- identifier;
- weight;
- physicalState;
- dimensions cuando estén disponibles.

Debe existir aunque el primer manifiesto observado tenga una unidad por House.

### 4.5 Person

Entidad independiente de Customer.

Atributos:

- PersonId;
- name;
- contact data;
- identification collection;
- provenance;
- matching status.

Los roles Sender y Recipient se modelan mediante asociaciones con House, no mediante duplicación de personas.

### 4.6 Identification

Value Object/entidad dependiente:

- type;
- originalValue;
- normalizedValue cuando proceda;
- issuingCountry cuando esté disponible;
- source.

No se transforma automáticamente en credencial interna de autenticación.

### 4.7 Address

Debe separar:

**OriginalAddress**
- rawText;
- source.

**ParsedAddress**
- street;
- number;
- betweenStreets;
- neighborhood/reparto;
- municipality;
- province;
- locality;
- references.

**NormalizedAddress**
- normalized fields;
- normalizationVersion;
- validationStatus.

La representación exacta se cerrará después de probar datos reales y fuentes oficiales/catálogos.

### 4.8 Geolocation

Value Object/registro histórico:

- latitude;
- longitude;
- provider;
- providerReference;
- confidence;
- obtainedAt;
- algorithm/version;
- status.

Una nueva geocodificación no debe destruir silenciosamente la anterior.

### 4.9 DeliveryPoint

Entidad operacional que representa el destino utilizable para distribución.

Relaciona:

- dirección;
- geolocalización válida;
- instrucciones/referencias;
- estado operacional.

Puede ser compartido por múltiples House.

### 4.10 Route

Entidad operacional:

- RouteId;
- routeDate;
- origin;
- destination;
- vehicle reference;
- driver reference;
- status;
- ordered stops.

La optimización de ruta será un servicio posterior; no forma parte de la identidad de Route.

### 4.11 Stop

Parada ordenada de una Route.

Atributos:

- StopId;
- routeId;
- sequence;
- deliveryPointId;
- plannedArrival;
- plannedServiceDuration;
- actualArrival;
- actualDeparture;
- status.

### 4.12 Delivery

Representa una operación de entrega.

Debe poder asociar uno o varios House si el procedimiento operativo lo confirma.

Atributos:

- DeliveryId;
- stopId;
- status;
- receiver;
- outcome;
- completedAt;
- effectiveLocation;
- observations.

La cardinalidad definitiva Delivery↔House queda condicionada por D09.

### 4.13 DeliveryAttempt

Registra cada intento.

Atributos:

- AttemptId;
- deliveryId;
- attemptNumber;
- startedAt;
- completedAt;
- outcome;
- failureReason;
- actor;
- location.

Un intento fallido nunca debe sobrescribirse con el siguiente.

### 4.14 ProofOfDelivery

Evidencia de una entrega.

Candidatos:

- receiverName;
- receiverIdentification;
- signatureReference;
- photoReference;
- timestamp;
- location;
- observations.

Los requisitos mínimos de cierre siguen abiertos hasta confirmar el procedimiento real.

### 4.15 Incident

Incidencia transversal vinculable a un objeto operativo.

Debe conservar:

- type;
- severity;
- detectedAt;
- actor;
- description;
- status;
- resolution;
- evidence;
- references.

### 4.16 StatusHistory

Registro inmutable de transición:

- objectType;
- objectId;
- dimension;
- previousState;
- newState;
- event;
- occurredAt;
- actor;
- source;
- reason;
- referenceDocument;
- evidence.

## 5. Relaciones y cardinalidades candidatas

- Manifest 1 → N TransportDocument references.
- TransportDocument 1 → N House.
- House 1 → N PhysicalUnit.
- House N → 1 Sender Person.
- House N → 1 Recipient Person.
- Recipient Person 1 → N Address.
- Address 1 → N Geolocation records.
- Address 1 → N DeliveryPoint.
- Route 1 → N Stop.
- Stop N → 1 DeliveryPoint.
- Stop 1 → N Delivery.
- Delivery N ↔ M House — pendiente D09.
- Delivery 1 → N DeliveryAttempt.
- DeliveryAttempt 1 → N ProofOfDelivery, sujeto al procedimiento.
- Cualquier objeto operacional relevante 1 → N Incident.
- Cada objeto con ciclo de vida relevante 1 → N StatusHistory.

## 6. Agregados candidatos

Los agregados son una hipótesis de diseño DDD, no una decisión de persistencia.

### Aggregate A — Manifest

Raíz: Manifest.

Responsabilidad:

- integridad de la importación;
- conciliación de totales;
- trazabilidad del archivo;
- relación con registros importados.

No debe contener físicamente todas las operaciones de entrega.

### Aggregate B — HouseShipment

Raíz: House.

Responsabilidad:

- identidad de House;
- contenido declarado;
- peso;
- cantidad declarada;
- remitente/destinatario;
- unidades físicas;
- reglas documentales propias.

### Aggregate C — DeliveryPoint

Raíz: DeliveryPoint.

Responsabilidad:

- destino operacional;
- dirección;
- geolocalización utilizable;
- instrucciones de entrega.

### Aggregate D — Route

Raíz: Route.

Responsabilidad:

- orden de paradas;
- programación;
- asignación operacional;
- estado de ejecución.

### Aggregate E — Delivery

Raíz: Delivery.

Responsabilidad:

- ejecución de entrega;
- intentos;
- resultado;
- POD;
- cierre.

La composición exacta se validará mediante casos de uso y concurrencia antes de implementar.

## 7. Invariantes de dominio

### Identidad

1. HouseNumber debe ser único dentro del ámbito documental definido.
2. Master AWB/document number debe conservarse exactamente y normalizarse separadamente.
3. No se fusionan personas únicamente por nombre.

### Integridad documental

4. El manifiesto conserva el archivo y metadatos de origen.
5. Las discrepancias de totales no eliminan filas válidas.
6. El valor original de dirección permanece disponible después de normalización.

### Integridad física

7. declaredPackageCount no implica que exista exactamente una PhysicalUnit.
8. La cantidad física no puede reducirse silenciosamente por una transformación de importación.

### Geolocalización

9. Una geolocalización nueva no elimina el historial.
10. Una dirección no se considera operacionalmente geocodificada sólo porque exista texto de dirección.

### Entrega

11. Un intento fallido permanece registrado.
12. Un nuevo intento no modifica el resultado histórico del intento anterior.
13. Delivery no puede marcarse como exitosa sin satisfacer el mínimo de cierre definido por el procedimiento.
14. Fallo de entrega no equivale a abandono aduanero.

### Estados

15. Cada transición relevante genera StatusHistory.
16. No existe un único status global que sustituya las dimensiones documental, recepción, custodia, aduanera, distribución y entrega.
17. Transiciones incompatibles deben rechazarse explícitamente.

## 8. Commands candidatos

### Ingesta

- RegisterManifest
- ValidateManifest
- ReconcileManifest
- AcceptManifestImport
- RejectManifestImport

### House

- RegisterHouse
- AmendHouse
- RegisterPhysicalUnits
- AssociateSender
- AssociateRecipient
- UpdateDestinationUnit

### Address

- ParseAddress
- NormalizeAddress
- ValidateAddress
- RequestGeocoding
- AcceptGeocodingResult
- RejectGeocodingResult

### Distribution

- CreateDeliveryPoint
- CreateRoute
- AddStop
- ReorderStops
- StartRoute
- CompleteRoute

### Delivery

- CreateDelivery
- RegisterDeliveryAttempt
- RecordDeliveryFailure
- ScheduleRetry
- RegisterReturn
- CompleteDelivery
- RegisterProofOfDelivery

### Incidents

- RegisterIncident
- InvestigateIncident
- ResolveIncident

Los nombres son comandos de dominio candidatos; no implican todavía endpoints HTTP.

## 9. Domain events candidatos

- ManifestRegistered
- ManifestValidated
- ManifestImportAccepted
- ManifestImportRejected
- ManifestDiscrepancyDetected
- HouseRegistered
- HouseAmended
- PhysicalUnitRegistered
- AddressNormalized
- AddressValidationCompleted
- GeolocationObtained
- GeolocationRejected
- DeliveryPointCreated
- RoutePlanned
- RouteStarted
- DeliveryAttempted
- DeliveryFailed
- DeliveryRetryScheduled
- DeliveryCompleted
- ProofOfDeliveryRecorded
- ReturnInitiated
- ReturnCompleted
- IncidentRegistered
- IncidentResolved
- StatusTransitionRecorded

Los eventos deben expresar hechos ocurridos, no órdenes.

## 10. Separación de dimensiones de estado

No utilizar un enum global PackageStatus.

Se mantienen como mínimo:

### Documental
DRAFT → REGISTERED → AMENDED → CLOSED

### Recepción
EXPECTED → RECEIVING → RECEIVED  
o  
RECEIVING → RECEIVED_WITH_DISCREPANCY

### Custodia
NOT_IN_STORAGE → IN_STORAGE → MOVED → RELEASED_FROM_STORAGE

### Distribución
NOT_READY → READY_FOR_DISTRIBUTION → PLANNED → IN_DISTRIBUTION → DISTRIBUTION_COMPLETED

### Entrega
PENDING → ATTEMPTED → DELIVERED  
o  
ATTEMPTED → DELIVERY_FAILED → RETRY_SCHEDULED → ATTEMPTED  
o  
DELIVERY_FAILED → RETURN_PENDING → RETURNED

### Aduanera

Se mantiene separada de la entrega y no se cristaliza todavía en una lista definitiva de estados legales. El sistema debe registrar resultados/actos aduaneros conforme a la evidencia normativa y operacional disponible.

## 11. D01–D12

| Decisión | Estado | Tratamiento |
|---|---|---|
| D01 jerarquía Master AWB/Guide/House | Parcialmente resuelta | Master AWB → múltiples House queda respaldado por el manifiesto; jerarquía completa pendiente |
| D02 House/Bulto/Package | Parcialmente resuelta | House ≠ necesariamente PhysicalUnit |
| D03 Guide → House | Provisional | 1 → N |
| D04 House → unidades físicas | Estructuralmente definida | 1 → N |
| D05 Person/roles | Resuelta para diseño conceptual | Person + Sender/Recipient |
| D06 Customer | Abierta | no inferir Customer desde manifest |
| D07 reutilización Address | Abierta | preservar snapshot + posible canonicalización |
| D08 múltiples entregas por parada | Respaldada | Stop → DeliveryPoint y múltiples House por destino |
| D09 múltiples House por Delivery | Abierta | requiere procedimiento real |
| D10 intentos/reintentos | Conceptualmente resuelta | fallo ≠ abandono; reintento separado |
| D11 estados | Arquitectura resuelta | dimensiones independientes; detalle pendiente |
| D12 cierre/POD | Abierta | requiere procedimiento real |

## 12. Reglas derivadas del manifiesto 649-31382945

**M-01.** La importación debe conservar ManifestHeader y ManifestRows.

**M-02.** El archivo, hash, hoja, fila, columna y valor original deben formar parte de la trazabilidad de importación.

**M-03.** Master AWB y House conservan su representación original.

**M-04.** El importador debe conciliar House declarado contra House importados cuando sea posible.

**M-05.** Debe conciliar peso declarado contra suma de pesos cuando ambos datos existan.

**M-06.** Las discrepancias generan resultados explícitos, no pérdida silenciosa.

**M-07.** Los teléfonos múltiples deben poder normalizarse como colección.

**M-08.** La dirección atraviesa Parse → Normalize → Validate → Geocode.

**M-09.** Unidad de destino se conserva como código externo hasta disponer de catálogo validado.

**M-10.** La persistencia documental no debe depender de que la geocodificación sea exitosa.

## 13. Reglas derivadas de la evidencia normativa

El modelo debe mantener separadas las funciones de SETA de las funciones de la autoridad aduanera.

La custodia/almacenamiento temporal, control aduanero, desaduanamiento y abandono son dimensiones distintas y no deben representarse como simples estados de Delivery.

El sistema debe poder conservar referencias documentales, resultados y evidencias de controles externos sin atribuir a SETA facultades que corresponden a la autoridad competente.

Estas reglas deberán trazarse a artículos/documentos normativos concretos antes de convertirlas en restricciones legales codificadas.

## 14. Casos de uso que deben validar el modelo

1. Importar un manifiesto válido.
2. Importar manifiesto con discrepancia de House.
3. Importar manifiesto con discrepancia de peso.
4. Registrar un House con varios bultos físicos.
5. Normalizar una dirección compartida por varios House.
6. Geocodificar una dirección y conservar versiones anteriores.
7. Crear un punto de entrega para varios House.
8. Crear una ruta con varias paradas.
9. Ejecutar una entrega.
10. Registrar entrega fallida.
11. Programar reintento.
12. Registrar devolución.
13. Registrar incidencia.
14. Registrar evidencia de entrega.
15. Impedir una transición de estado incompatible.
16. Consultar trazabilidad completa de una House desde el archivo original hasta la entrega.

## 15. Implicaciones para PostgreSQL/PostGIS

Todavía no se deben crear migraciones definitivas.

Cuando se cierre el dominio, la persistencia deberá contemplar al menos:

- identificadores UUID o estrategia equivalente definida corporativamente;
- claves naturales/documentales para Master AWB y House;
- relaciones Manifest/TransportDocument/House/PhysicalUnit;
- personas e identificaciones;
- direcciones originales y normalizadas;
- histórico de geocodificación;
- DeliveryPoint con geometría PostGIS;
- Route/Stop;
- Delivery/Attempt/POD;
- Incident;
- StatusHistory;
- trazabilidad de importación.

Las decisiones de índices, constraints, particionamiento, tipos PostGIS, auditoría y estrategia de borrado se tomarán después del cierre de invariantes y casos de uso.

## 16. Trazabilidad

- Modelo conceptual → entidades y relaciones.
- Normativa → separación de dimensiones aduaneras/custodia/abandono.
- Manifiesto 649-31382945 → Master AWB, House, bultos, personas, identificaciones, teléfonos, direcciones, unidad de destino y reglas de importación.
- D01–D12 → sección 11.
- State machine v0.1.0 → sección 10.
- Importación determinista → sección 12.

## 17. Criterio de salida de esta versión

v0.2.0 puede pasar a diseño lógico cuando:

1. D01–D12 tengan estado explícito.
2. Los casos de uso críticos hayan sido validados.
3. Las reglas legales que deban convertirse en restricciones tengan evidencia oficial verificable.
4. Delivery↔House y POD estén resueltos.
5. La jerarquía documental Master AWB/Guide/House esté cerrada.
6. El catálogo de UnitDestination tenga fuente y semántica confirmadas.
7. Los agregados no presenten conflictos evidentes de consistencia o concurrencia.

**Decisión de esta versión:** continuar con el modelo de dominio y casos de uso; no generar todavía el esquema PostgreSQL definitivo.
