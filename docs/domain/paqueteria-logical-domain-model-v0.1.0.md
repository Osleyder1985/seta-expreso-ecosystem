# Modelo lógico objetivo de Paquetería — v0.1.0

**Estado:** diseño lógico — no congela esquema físico  
**Issue:** #217  
**Fecha:** 2026-09-27

## 1. Propósito

Definir el modelo lógico objetivo que debe preceder a cualquier migración PostgreSQL/Prisma derivada de las decisiones B-01/D01, D09, B-04, B-05 y B-06.

Este documento define conceptos, relaciones, cardinalidades e invariantes. No define todavía nombres finales de tablas, enums PostgreSQL, índices ni migraciones.

## 2. Principio de separación conceptual

SETA debe distinguir:

**Documentos**
- Manifest
- TransportDocument
- MasterAirWaybill
- ChildAirWaybill
- House

**Unidades físicas**
- PhysicalUnit

**Destino**
- Address
- Geolocation
- DeliveryPoint
- DestinationUnit

**Distribución**
- Route
- RouteStop
- Delivery
- DeliveryAttempt

**Evidencia**
- ProofOfDelivery
- EvidenceObject / EvidenceReference

**Recepción SETA**
- ReceiptHandoff
- referencias al Manifest de Agencia y Manifest de AeroVaradero

**Gobernanza**
- lifecycle/archival facts
- AuditRecord
- autorización contextual / object ownership

## 3. Cadena documental

La cadena conceptual es:

Manifest
→ TransportDocument
→ MasterAirWaybill
→ ChildAirWaybill (cuando exista)
→ House
→ PhysicalUnit

### 3.1 MasterAirWaybill

Representa la guía master/documento aéreo principal.

Invariantes:
- pertenece a un TransportDocument;
- no es House;
- no es PhysicalUnit.

### 3.2 ChildAirWaybill

Representa una guía hija cuando el documento fuente la identifica.

Invariantes:
- es conceptualmente distinta de House;
- no se debe crear automáticamente solo porque exista un House;
- si una fuente establece relación ChildAWB ↔ House, dicha relación se registra como trazabilidad;
- no se impondrá a House formato, longitud o unicidad propios de ChildAWB.

### 3.3 House

Representa el House/número de paquete utilizado por el proceso de Paquetería.

Invariantes:
- pertenece al contexto documental correspondiente;
- puede estar relacionado con MasterAirWaybill;
- no es sinónimo de ChildAirWaybill;
- no es PhysicalUnit;
- puede agrupar varias PhysicalUnit;
- conserva su identidad aunque la dirección falle geocodificación.

### 3.4 PhysicalUnit

Representa una unidad física individual.

Invariantes:
- pertenece a un House;
- no sustituye House;
- puede tener secuencia/identificador físico propio;
- su trazabilidad física debe mantenerse durante recepción y custodia.

## 4. Destino

### 4.1 Address

Representa la dirección documental/normalizada.

Una Address puede reutilizarse por múltiples House.

### 4.2 DeliveryPoint

Representa el destino operacional de entrega.

Puede referenciar:
- Address;
- Geolocation;
- instrucciones;
- contactos;
- referencias de acceso.

Una DeliveryPoint puede agrupar House de diferentes operaciones cuando comparten el mismo destino operacional.

### 4.3 DestinationUnit

Representa la unidad operacional de destino utilizada para agrupación logística.

Regla cerrada:
- se identifica por código operacional de aeropuerto internacional, por ejemplo `CMW`;
- territorios sin aeropuerto internacional se representan mediante `OTRAS`;
- no equivale al nombre de la provincia;
- el catálogo debe conservar la relación entre código y referencia geográfica.

## 5. Delivery

### 5.1 Regla D09

Una Delivery representa una operación/visita de entrega.

Si varios House tienen la misma dirección/punto de entrega:

**varios House → una Delivery**

Cardinalidad:
**Delivery ↔ House = N:M**

Invariantes:
- una Delivery no representa simplemente el cambio de estado de un House;
- el agrupamiento por misma dirección/punto es la condición operacional;
- una parada puede ejecutar una Delivery que contiene varios House;
- los intentos pertenecen a Delivery, no se reescriben entre sí.

## 6. Route y RouteStop

Route contiene:
- fecha;
- origen;
- destino;
- vehículo;
- conductor;
- estado.

RouteStop contiene:
- secuencia;
- DeliveryPoint;
- tiempos planificados/reales;
- estado.

Relación conceptual:

Route
→ RouteStop
→ DeliveryPoint
→ Delivery
→ House

No debe duplicarse Address como sustituto de DeliveryPoint.

## 7. Proof of Delivery

Una entrega exitosa requiere:

1. resultado exitoso;
2. fotografía del documento de identidad del receptor asociada inequívocamente al paquete/operación;
3. actor y timestamp conservados como hechos de sistema/auditoría.

Otros elementos no son obligatorios por D12:
- firma;
- foto del bulto;
- OTP;
- geolocalización.

La evidencia debe ser un concepto trazable, no únicamente una cadena `evidenceRef`.

La política de retención, legal hold y eliminación queda separada del modelo funcional.

## 8. ReceiptHandoff — recepción SETA

Después de la liberación aduanera externa:

1. AeroVaradero entrega físicamente la carga.
2. Personal autorizado de SETA recibe/extracta.
3. Se conservan como referencias:
   - Manifest recibido de la Agencia;
   - Manifest generado por AeroVaradero.
4. La recepción SETA habilita la continuación hacia distribución, sujeto a los restantes bloqueos.

Invariantes:
- la liberación aduanera es un hecho externo;
- SETA no debe modelarse como autoridad que ejecuta la liberación;
- AeroVaradero y el actor receptor SETA son actores distintos;
- el handoff debe ser auditable.

## 9. Archival lifecycle

Regla B-06:

**Pre-archival**
- modificación permitida;
- cancelación permitida;
- toda modificación conserva auditoría/historial.

**Archived**
- modificación operacional directa prohibida;
- cancelación directa prohibida;
- corrección excepcional, si fuese autorizada, debe generar una nueva operación histórica sin sobrescribir el estado archivado.

El archivado es una dimensión de lifecycle y no debe mezclarse con el estado operativo de entrega.

## 10. Authorization / ownership

El modelo lógico debe soportar una evaluación:

**actor + permission + organizational scope + object + object owner/context + object state + action**

El esquema de datos no debe considerarse suficiente para cerrar autorización BOLA/IDOR.

Cada operación sensible debe producir un resultado de autorización auditable.

## 11. Relaciones objetivo

| Relación | Cardinalidad | Regla |
|---|---:|---|
| Manifest → TransportDocument | 1:N | documento pertenece al manifiesto |
| TransportDocument → MasterAWB | 1:0..1 | según tipo documental |
| MasterAWB → ChildAWB | 1:N | solo cuando existe ChildAWB |
| MasterAWB → House | 1:N | relación documental disponible |
| ChildAWB ↔ House | 0:N / 0:N | solo por evidencia; nunca identidad |
| House → PhysicalUnit | 1:N | unidad física separada |
| House → Address | N:1 | dirección reutilizable |
| Address → DeliveryPoint | 1:N | un address puede tener destinos operacionales |
| DeliveryPoint → Delivery | 1:N | visitas/operaciones |
| Delivery ↔ House | N:M | D09 |
| Route → RouteStop | 1:N | orden de paradas |
| RouteStop → DeliveryPoint | N:1 | destino operacional |
| Delivery → DeliveryAttempt | 1:N | intentos independientes |
| Delivery → POD | 1:N | evidencias; una mínima obligatoria para éxito |
| Handoff → Manifest references | N:M | referencias documentales conservadas |

## 12. Invariantes críticas

1. House ≠ ChildAirWaybill.
2. House ≠ PhysicalUnit.
3. Address ≠ DeliveryPoint.
4. StorageLocation ≠ DeliveryAddress.
5. DeliveryFailed ≠ Abandoned.
6. Customs release ≠ SETA action.
7. Same delivery address → one Delivery containing multiple House.
8. Successful Delivery requires mandatory recipient-ID photograph.
9. Archived object cannot be directly modified.
10. Original source data is never silently overwritten.
11. Geocoding failure does not invalidate source address.
12. Authorization cannot depend solely on client state.
13. Every sensitive operation is attributable.
14. Historical facts are append-only from the application perspective.
15. ChildAWB/House relationship is evidence-driven, not inferred.

## 13. Gaps that must be designed before physical migration

- ChildAirWaybill and evidence-driven ChildAWB ↔ House relationship.
- DestinationUnit catalog and geographic mapping.
- archival lifecycle and transition history.
- ProofOfDelivery/evidence storage and retention boundary.
- ReceiptHandoff and manifest-reference model.
- DeliveryPoint/RouteStop/Delivery linkage.
- contextual authorization and object ownership.
- executable AT-13, AT-26, AT-27, AT-28 and AT-29.

## 14. Deliberate non-decisions

This model does not yet decide:
- exact PostgreSQL table names;
- enum implementation;
- object-storage provider;
- geocoder provider;
- routing engine;
- retention duration;
- legal deletion policy;
- final REST/OpenAPI resource paths.

## 15. Gate for physical schema

No migration derived from this document is approved until:

1. each gap has a logical design;
2. every concept has requirement traceability;
3. invariants have acceptance tests;
4. security ownership rules are executable;
5. evidence storage boundary is defined;
6. end-to-end Paquetería tests are executable.

**Conclusion:** the current PostgreSQL foundation is retained. This document establishes the target logical model without prematurely freezing its physical implementation.
