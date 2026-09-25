# Máquina de estados de Paquetería — modelo conceptual v0.1.0

**Issue:** #38  
**PR relacionado:** #42  
**Estado:** modelo conceptual para diseño; estados jurídicos concretos pendientes de validación normativa completa.

## 1. Objetivo

Definir las máquinas de estado independientes necesarias para evitar un único campo status que mezcle documentación, recepción, custodia, aduana, distribución y entrega.

## 2. Principio fundamental

Una unidad operativa puede estar simultáneamente documentada, recibida, almacenada, bajo una determinada situación aduanera, lista para distribución, asignada a una ruta y pendiente de entrega.

Por tanto, el estado global no debe ser un enum único.

## 3. Dimensiones

Se establecen seis dimensiones conceptuales:

1. Documental
2. Recepción
3. Custodia
4. Aduanera
5. Distribución
6. Entrega

Las incidencias y el historial son aspectos transversales y no sustituyen estas dimensiones.

## 4. Máquina documental

### Estados

DRAFT → REGISTERED → AMENDED → CLOSED

### Eventos

- DOCUMENT_CREATED
- DOCUMENT_REGISTERED
- DOCUMENT_AMENDED
- DOCUMENT_CLOSED

### Reglas

- Un documento no puede pasar a CLOSED si existen errores documentales bloqueantes.
- Una modificación no destruye el valor anterior.
- Los datos rectificados deben conservar origen, actor, fecha/hora y referencia.

### Transiciones inválidas

- CLOSED → DRAFT
- CLOSED → REGISTERED

Cualquier reapertura, si fuese necesaria, deberá ser una operación explícita y autorizada, no una modificación silenciosa.

## 5. Máquina de recepción

### Estados

EXPECTED → RECEIVING → RECEIVED

Resultado alternativo:

RECEIVING → RECEIVED_WITH_DISCREPANCY

### Eventos

- RECEPTION_STARTED
- CARGO_RECEIVED
- RECEPTION_DISCREPANCY_DETECTED
- RECEPTION_CLOSED

### Datos obligatorios conceptuales

- documento de referencia;
- cantidad esperada;
- cantidad recibida;
- unidad de medida;
- fecha/hora;
- actor;
- tipo de discrepancia;
- evidencia cuando exista.

### Invariantes

- No puede existir RECEIVED sin una recepción registrada.
- RECEIVED_WITH_DISCREPANCY exige registrar la diferencia.
- Una discrepancia no debe eliminarse al corregirse; debe conservar su resolución.

## 6. Máquina de custodia

### Estados

NOT_IN_STORAGE → IN_STORAGE → MOVED → RELEASED_FROM_STORAGE

MOVED representa un evento de movimiento y puede conducir nuevamente a IN_STORAGE.

### Eventos

- STORAGE_ENTRY
- STORAGE_MOVEMENT
- STORAGE_RELEASE

### Datos obligatorios conceptuales

- ubicación origen;
- ubicación destino, cuando aplique;
- fecha/hora;
- actor;
- documento de movimiento, cuando exista;
- motivo;
- evidencia.

### Invariante

StorageLocation no es DeliveryAddress.

Una misma dirección física puede coincidir en determinados casos, pero los conceptos y responsabilidades son distintos.

## 7. Máquina aduanera

### Restricción

No se define todavía un catálogo definitivo de estados jurídicos.

La extracción normativa debe determinar los estados y transiciones exactos.

### Estados conceptuales mínimos

CUSTOMS_CONTROL

→ resultado externo registrado:

CUSTOMS_RESULT_RECORDED

El resultado puede contener información sobre régimen, formalidades, desaduanamiento, retención, abandono u otra actuación, pero estos conceptos no deben convertirse automáticamente en estados SETA hasta cerrar la evidencia normativa.

### Eventos externos

- CUSTOMS_DOCUMENT_RECEIVED
- CUSTOMS_ACTION_RECORDED
- CUSTOMS_RESULT_RECEIVED
- CUSTOMS_RECTIFICATION_RECEIVED
- CUSTOMS_ABANDONMENT_RECORDED

### Invariantes

- SETA registra actuaciones externas; no las genera como autoridad.
- Una entrega exitosa no implica por sí misma un resultado aduanero.
- Un intento fallido no produce abandono.
- Un abandono registrado debe conservar la referencia de la actuación aduanera correspondiente cuando esté disponible.

## 8. Máquina de distribución

### Estados

NOT_READY → READY_FOR_DISTRIBUTION → PLANNED → IN_DISTRIBUTION

Final operativo:

IN_DISTRIBUTION → DISTRIBUTION_COMPLETED

### Eventos

- RELEASED_FOR_DISTRIBUTION
- ROUTE_PLANNED
- ROUTE_STARTED
- ROUTE_COMPLETED

### Reglas

READY_FOR_DISTRIBUTION requiere que las condiciones de negocio necesarias para distribuir estén satisfechas.

Las condiciones exactas deben ser configurables según el servicio y no deben confundirse con la liberación aduanera.

## 9. Máquina de entrega

### Estados

PENDING → ATTEMPTED → DELIVERED

Resultado fallido:

ATTEMPTED → DELIVERY_FAILED

Reintento:

DELIVERY_FAILED → RETRY_SCHEDULED → ATTEMPTED

Devolución:

DELIVERY_FAILED → RETURN_PENDING → RETURNED

### Eventos

- DELIVERY_ATTEMPTED
- DELIVERY_SUCCEEDED
- DELIVERY_FAILED
- RETRY_SCHEDULED
- RETURN_REQUESTED
- RETURN_COMPLETED

### Invariantes

- Cada intento debe conservarse.
- Una entrega exitosa requiere evidencia suficiente para el procedimiento vigente.
- Un intento fallido no se sobrescribe con un intento posterior.
- La devolución debe conservar el vínculo con el intento que la originó.
- DELIVERY_FAILED → ABANDONED es inválido.

## 10. Matriz de transiciones

| Dimensión | Estado origen | Evento | Estado destino | Evidencia |
|---|---|---|---|---|
| Documental | DRAFT | DOCUMENT_REGISTERED | REGISTERED | Documento |
| Documental | REGISTERED | DOCUMENT_AMENDED | AMENDED | Rectificación/historial |
| Recepción | EXPECTED | RECEPTION_STARTED | RECEIVING | Registro |
| Recepción | RECEIVING | CARGO_RECEIVED | RECEIVED | Registro de recepción |
| Recepción | RECEIVING | RECEPTION_DISCREPANCY_DETECTED | RECEIVED_WITH_DISCREPANCY | Reporte |
| Custodia | NOT_IN_STORAGE | STORAGE_ENTRY | IN_STORAGE | Movimiento |
| Custodia | IN_STORAGE | STORAGE_MOVEMENT | MOVED | Movimiento |
| Custodia | MOVED | STORAGE_ENTRY | IN_STORAGE | Movimiento |
| Custodia | IN_STORAGE | STORAGE_RELEASE | RELEASED_FROM_STORAGE | Salida |
| Aduanera | CUSTOMS_CONTROL | CUSTOMS_RESULT_RECEIVED | CUSTOMS_RESULT_RECORDED | Documento/referencia |
| Distribución | NOT_READY | RELEASED_FOR_DISTRIBUTION | READY_FOR_DISTRIBUTION | Autorización/condición |
| Distribución | READY_FOR_DISTRIBUTION | ROUTE_PLANNED | PLANNED | Plan de ruta |
| Distribución | PLANNED | ROUTE_STARTED | IN_DISTRIBUTION | Evento de salida |
| Distribución | IN_DISTRIBUTION | ROUTE_COMPLETED | DISTRIBUTION_COMPLETED | Cierre |
| Entrega | PENDING | DELIVERY_ATTEMPTED | ATTEMPTED | Intento |
| Entrega | ATTEMPTED | DELIVERY_SUCCEEDED | DELIVERED | POD |
| Entrega | ATTEMPTED | DELIVERY_FAILED | DELIVERY_FAILED | Incidencia |
| Entrega | DELIVERY_FAILED | RETRY_SCHEDULED | RETRY_SCHEDULED | Nueva programación |
| Entrega | RETRY_SCHEDULED | DELIVERY_ATTEMPTED | ATTEMPTED | Intento |
| Entrega | DELIVERY_FAILED | RETURN_REQUESTED | RETURN_PENDING | Solicitud |
| Entrega | RETURN_PENDING | RETURN_COMPLETED | RETURNED | Evidencia de devolución |

## 11. Transiciones prohibidas críticas

| Transición | Motivo |
|---|---|
| RECEIVED → DELIVERED sin flujo de distribución/entrega | Rompe trazabilidad |
| DELIVERY_FAILED → ABANDONED | Confunde operación logística con abandono aduanero |
| IN_STORAGE → DELIVERED sin salida/movimiento justificable | Rompe cadena de custodia |
| DRAFT → DELIVERED | Falta ciclo documental |
| Cualquier estado → CLOSED con incidencias bloqueantes abiertas | Cierre inconsistente |
| Cambio de dato externo sin historial | Destruye trazabilidad |
| Cambio de estado aduanero generado solo por usuario operativo | SETA no sustituye autoridad aduanera |

## 12. Separación entre estado y evento

Un evento es algo que ocurrió.

Un estado es la condición resultante después del evento.

Ejemplo:

DELIVERY_ATTEMPTED → estado ATTEMPTED

Si falla:

DELIVERY_FAILED → estado DELIVERY_FAILED

El intento anterior permanece en el historial.

No debe almacenarse solamente el estado actual.

## 13. Historial de estados

Cada transición deberá producir conceptualmente un registro con:

- identificador;
- objeto;
- dimensión;
- estado anterior;
- estado nuevo;
- evento;
- fecha/hora;
- actor;
- origen;
- motivo;
- referencia documental;
- evidencia;
- metadatos.

Esto permite reconstruir la línea temporal de la operación.

## 14. Relación entre máquinas

Las máquinas no son completamente independientes.

Ejemplo conceptual de habilitación de entrega:

Reception = RECEIVED
+
Customs = resultado compatible con disponibilidad
+
Distribution = READY_FOR_DISTRIBUTION
+
Route = PLANNED/IN_DISTRIBUTION

→ permite crear/ejecutar DeliveryAttempt.

Esto es una regla de coordinación, no una fusión de estados.

## 15. DDD

La máquina de estados debe pertenecer al dominio correspondiente.

Recomendación conceptual:

- Document lifecycle → agregado documental;
- Reception → agregado/proceso de recepción;
- Custody → agregado de custodia/movimientos;
- Customs reference → contexto de integración/registro externo;
- Route → agregado de ruta;
- Delivery → agregado/proceso de entrega;
- Status history → mecanismo transversal de auditoría de dominio.

No se decide todavía el nombre definitivo de cada agregado.

## 16. Próximas validaciones

Antes de convertir estas máquinas en código:

1. verificar artículo por artículo la normativa pendiente;
2. validar flujo operativo de AeroVaradero;
3. confrontar con un manifiesto real anonimizado;
4. confirmar qué representa exactamente cada fila/unidad del Excel;
5. cerrar D02–D09 y D12;
6. revisar invariantes con casos reales;
7. recién después definir agregados y comandos;
8. después diseñar el modelo relacional y migraciones.

**Restricción:** esta máquina de estados no autoriza todavía la creación de tablas PostgreSQL definitivas.
