# Proceso operativo de Paquetería — flujo de referencia v0.1.0

**Issue:** #38  
**PR relacionado:** #42  
**Estado:** modelo operativo de referencia; pendiente de validación con procedimiento real de SETA y evidencia operativa de AeroVaradero.

## 1. Propósito

Este documento transforma la evidencia normativa disponible en un flujo operativo de referencia para el Servicio de Paquetería de SETA EXPRESO SURL.

No sustituye los procedimientos oficiales ni crea obligaciones jurídicas. Su finalidad es definir qué información debe capturarse, qué eventos deben conservarse y qué fronteras debe respetar el software.

## 2. Principio de separación de responsabilidades

SETA no debe modelar todo el proceso como una única operación de "recibir y entregar".

El flujo debe separar, como mínimo:

1. documentación de transporte;
2. recepción física y conciliación;
3. custodia/almacenamiento;
4. control y resultados aduaneros externos;
5. preparación para distribución;
6. transporte y ruta;
7. intento de entrega;
8. entrega efectiva;
9. devolución/reingreso;
10. incidencias y cierre.

Las actuaciones cuya autoridad corresponde a Aduana deben registrarse como hechos, documentos, referencias o resultados externos; SETA no debe simular que ejecutó una decisión aduanera.

## 3. Actores

| Actor | Responsabilidad en el flujo | Naturaleza |
|---|---|---|
| Operador/transportista de origen | Genera o transmite información de transporte | Externo |
| Operador aeroportuario/carga | Recepción, manipulación y documentación operacional según corresponda | Externo |
| Aduana | Control, actuaciones y decisiones aduaneras | Autoridad externa |
| Operador de depósito temporal | Custodia y movimientos dentro del depósito autorizado | Externo |
| SETA EXPRESO | Recepción operativa posterior a la disponibilidad, clasificación, distribución y entrega según su servicio | Interno |
| Conductor/repartidor | Transporte, parada, intento y evidencia de entrega | Interno |
| Destinatario/receptor autorizado | Recepción de la mercancía y confirmación de entrega | Externo |
| Sistema de mapas/geocodificación | Proporciona geocodificación/rutas | Servicio externo |

## 4. Flujo de referencia

### P01 — Recepción de información documental

**Entrada:** manifiesto, documento de transporte y datos de carga disponibles.

**Actividad:**
- registrar el manifiesto;
- registrar cada documento de transporte;
- conservar identificadores originales;
- asociar los documentos según la estructura realmente recibida.

**Salida:** expediente documental inicial.

**Evidencia:** archivo/documento de origen, identificador, fecha/hora de recepción, actor y canal.

**Estado generado:** DOCUMENTED.

### P02 — Preparación para recepción física

**Entrada:** expediente documental.

**Actividad:**
- determinar qué carga/bultos se esperan;
- preparar conciliación de cantidades;
- identificar unidades/documentos que deben comprobarse.

**Salida:** expectativa de recepción.

**Evidencia:** relación esperada por documento de transporte.

**Estado generado:** RECEPTION_EXPECTED.

### P03 — Recepción y conciliación

**Entrada:** carga físicamente recibida + expectativa documental.

**Actividad:**
- registrar cantidades declaradas;
- registrar cantidades recibidas;
- comparar ambas;
- documentar diferencias.

**Decisiones mínimas:**
- recepción conforme;
- faltante total;
- faltante parcial;
- sobrante;
- carga no manifestada;
- otra irregularidad documentada.

**Salida:** acta/reporte de recepción o registro equivalente.

**Estado generado:** RECEIVED o RECEIVED_WITH_DISCREPANCY.

**Invariante:** nunca reducir la recepción a un booleano received.

### P04 — Custodia y almacenamiento

**Entrada:** mercancía recibida.

**Actividad:**
- registrar ubicación de custodia;
- registrar entrada al depósito/área;
- registrar movimientos internos;
- conservar fecha/hora, actor y documento de movimiento cuando exista.

**Salida:** trazabilidad de custodia.

**Estado generado:** IN_STORAGE.

**Invariante:** la ubicación de almacenamiento no es la dirección del destinatario.

### P05 — Control/resultado aduanero externo

**Entrada:** expediente y mercancía sometida a control.

**Actividad SETA:**
- registrar referencias de declaraciones, autorizaciones, resoluciones o resultados comunicados;
- conservar documentos/evidencias disponibles;
- registrar fechas y actores externos.

**Actividad de Aduana:** control, formalidades, desaduanamiento, régimen u otras actuaciones según corresponda.

**Salida:** resultado aduanero externo registrado.

**Estados posibles:** dimensión independiente CUSTOMS_*.

**Invariante:** SETA no genera por sí misma el hecho jurídico de liberación/desaduanamiento.

### P06 — Disponibilidad para distribución

**Entrada:** mercancía disponible conforme a las condiciones operativas y documentales aplicables.

**Actividad:**
- clasificar por destino;
- validar información del destinatario;
- conservar dirección original;
- normalizar dirección;
- geocodificar cuando corresponda;
- registrar incidencias de dirección.

**Salida:** unidades listas para planificación.

**Estado generado:** READY_FOR_DISTRIBUTION.

**Invariante:** geocodificación no sustituye ni sobrescribe silenciosamente la dirección original.

### P07 — Planificación de distribución

**Entrada:** unidades listas + puntos de entrega + restricciones operativas.

**Actividad:**
- agrupar por zona;
- crear ruta;
- asignar vehículo y conductor;
- ordenar paradas;
- calcular tiempos estimados;
- registrar fecha/hora prevista.

**Salida:** ruta planificada.

**Estado generado:** PLANNED.

### P08 — Ejecución del transporte

**Entrada:** ruta planificada.

**Actividad:**
- iniciar ruta;
- registrar salida;
- registrar llegada a cada parada;
- conservar incidencias de transporte;
- registrar cambios relevantes de ruta.

**Salida:** paradas ejecutadas o pendientes.

**Estado generado:** IN_DISTRIBUTION.

### P09 — Intento de entrega

**Entrada:** parada + mercancía destinada a esa parada.

**Actividad:**
- registrar llegada;
- identificar al receptor;
- intentar entrega;
- registrar resultado;
- capturar evidencia.

**Resultados mínimos:**
- entrega exitosa;
- entrega fallida;
- entrega parcial, si el procedimiento real lo permite;
- imposibilidad/incidencia operacional.

**Salida:** DeliveryAttempt.

**Invariante:** cada intento queda conservado, incluso cuando falla.

### P10 — Entrega efectiva

**Entrada:** intento exitoso.

**Actividad:**
- confirmar receptor;
- registrar fecha/hora;
- registrar ubicación efectiva cuando corresponda;
- registrar evidencia/POD;
- cerrar la operación.

**Salida:** evidencia de entrega.

**Estado generado:** DELIVERED.

**Regla:** los datos mínimos de cierre definitivo quedan pendientes de validar con el procedimiento real de SETA.

### P11 — Fallo, reintento y devolución

**Entrada:** intento fallido.

**Actividad:**
- registrar causa;
- decidir reintento, permanencia temporal, devolución/reingreso u otra disposición operacional autorizada;
- conservar cada transición.

**Estados candidatos:**
- DELIVERY_FAILED;
- RETRY_SCHEDULED;
- RETURN_PENDING;
- RETURNED.

**Invariante:** un fallo de entrega no implica abandono aduanero.

### P12 — Incidencias

Una incidencia puede afectar:
- documento;
- recepción;
- bulto/unidad de carga;
- almacenamiento;
- aduana;
- dirección;
- ruta;
- vehículo;
- parada;
- intento;
- entrega.

Debe conservar:
- tipo;
- fecha/hora;
- actor;
- objeto afectado;
- descripción;
- evidencia;
- resolución;
- fecha/hora de cierre.

### P13 — Cierre operacional

**Entrada:** todas las unidades del alcance operativo tienen disposición conocida.

**Actividad:**
- comprobar entregas;
- comprobar devoluciones/reingresos;
- comprobar incidencias abiertas;
- comprobar evidencias;
- cerrar ruta y operación.

**Salida:** expediente operacional cerrado.

**Invariante:** no cerrar silenciosamente operaciones con unidades o incidencias sin disposición conocida.

## 5. Máquina de estados conceptual

El sistema no debe utilizar un único estado universal.

### 5.1 Dimensión documental

DRAFT → REGISTERED → CORRECTED/AMENDED → CLOSED

Las correcciones externas deben conservar trazabilidad y no destruir el valor original.

### 5.2 Dimensión de recepción

EXPECTED → RECEIVING → RECEIVED

Con resultado alternativo:

RECEIVING → RECEIVED_WITH_DISCREPANCY

### 5.3 Dimensión de custodia

NOT_IN_STORAGE → IN_STORAGE → MOVED → RELEASED_FROM_STORAGE

### 5.4 Dimensión aduanera

El conjunto exacto de estados queda pendiente de extracción completa y validación jurídica.

Como mínimo conceptual:

UNDER_CUSTOMS_CONTROL → CUSTOMS_RESULT_RECORDED

Los estados concretos de régimen, formalización, desaduanamiento, retención, abandono u otros deben derivarse de la norma y no de una taxonomía inventada por SETA.

### 5.5 Dimensión de distribución

NOT_READY → READY_FOR_DISTRIBUTION → PLANNED → IN_DISTRIBUTION

### 5.6 Dimensión de entrega

PENDING → ATTEMPTED → DELIVERED

Rama de fallo:

ATTEMPTED → DELIVERY_FAILED → RETRY_SCHEDULED

Rama de devolución:

ATTEMPTED → DELIVERY_FAILED → RETURN_PENDING → RETURNED

**Restricción crítica:**

DELIVERY_FAILED —X→ ABANDONED

El abandono requiere el hecho/acto aduanero correspondiente.

## 6. Datos mínimos transversales de trazabilidad

Cada evento operacional relevante debe poder identificar:

- eventId;
- tipo de evento;
- fecha/hora;
- actor;
- objeto afectado;
- estado anterior, si aplica;
- estado nuevo, si aplica;
- motivo;
- referencia documental;
- evidencia;
- origen del dato;
- observaciones.

Cuando el dato procede de un actor externo, debe conservarse su origen.

## 7. Reglas de diseño derivadas

### R01 — Documento ≠ carga física

Manifest, TransportDocument y CargoUnit/Bulto son conceptos distintos.

### R02 — Recepción ≠ entrega

Que una carga haya sido recibida no significa que haya sido entregada al destinatario.

### R03 — Custodia ≠ dirección

La ubicación de almacenamiento y la dirección del destinatario son contextos distintos.

### R04 — Aduana ≠ distribución

El estado aduanero debe evolucionar independientemente del estado logístico de SETA.

### R05 — Fallo ≠ abandono

Un intento fallido, una devolución y un abandono aduanero son disposiciones distintas.

### R06 — Historial no destructivo

Los cambios relevantes deben conservar historial suficiente para reconstruir qué ocurrió, cuándo, quién actuó y por qué.

### R07 — Evidencia primero

Una transición que produzca un hecho operacional relevante debe tener los datos/evidencias mínimos definidos por el procedimiento correspondiente.

## 8. Matriz compacta de trazabilidad

| Paso | Actor principal | Entrada | Actividad | Salida | Evidencia |
|---|---|---|---|---|---|
| P01 | SETA | Documentos | Registrar | Expediente | Documento original |
| P02 | SETA | Expediente | Preparar expectativa | Recepción esperada | Relación esperada |
| P03 | Operador/SETA | Carga + documentos | Conciliar | Recepción | Reporte/registro |
| P04 | Custodio/SETA | Carga | Almacenar/mover | Custodia | Movimiento |
| P05 | Aduana + SETA | Expediente | Control/registrar resultado | Resultado externo | Documento/referencia |
| P06 | SETA | Carga disponible | Clasificar/geocodificar | Lista distribuible | Dirección + geodatos |
| P07 | SETA | Lista + restricciones | Planificar | Ruta | Plan |
| P08 | Conductor | Ruta | Transportar | Paradas | Eventos |
| P09 | Conductor | Parada + carga | Intentar | Resultado | Attempt/evidencia |
| P10 | Receptor/SETA | Intento | Confirmar | Entrega | POD |
| P11 | SETA | Fallo | Reintentar/devolver | Nueva disposición | Incidencia |
| P12 | Responsables | Incidencia | Resolver | Incidencia cerrada | Evidencia |
| P13 | Responsable | Operación | Verificar/cerrar | Expediente cerrado | Cierre |

## 9. Decisiones que aún no deben cerrarse

Este flujo permite avanzar en arquitectura sin inventar datos de negocio. Continúan abiertas:

- D02: equivalencia House/Bulto/Package;
- D03: cardinalidad TransportDocument → CargoUnit;
- D04: unidad física interna;
- D05: roles exactos de personas;
- D06: concepto Cliente;
- D07: reutilización de Address;
- D08: múltiples entregas por parada;
- D09: múltiples unidades en una entrega;
- D12: datos mínimos de cierre exitoso.

## 10. Próximo artefacto

El siguiente artefacto de dominio debe ser:

**paqueteria-state-machine-v0.1.0.md**

Debe definir, para cada dimensión:
- estados;
- eventos;
- precondiciones;
- transición;
- actor autorizado;
- evidencia requerida;
- transición inválida;
- efectos;
- relación con otras dimensiones.

Después se debe confrontar el modelo con un manifiesto real anonimizado antes de crear el modelo lógico PostgreSQL.

## 11. Fuentes de referencia

- Gaceta Oficial de la República de Cuba.
- Aduana General de la República.
- AeroVaradero.
- Evidencia normativa consolidada en paqueteria-normative-extraction-v0.3.0.md.

**Nota:** este documento es una especificación de dominio de software. Las reglas jurídicas ejecutables deben permanecer vinculadas a la fuente normativa vigente y a su evidencia verificable.
