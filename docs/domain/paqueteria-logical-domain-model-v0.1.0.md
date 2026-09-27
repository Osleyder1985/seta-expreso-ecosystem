# Modelo lógico objetivo de Paquetería — v0.1.0

**Estado:** diseño lógico — no congela esquema físico  
**Issue:** #217  
**Fecha:** 2026-09-27

## 1. Propósito

Define el modelo lógico que precede a cualquier migración PostgreSQL/Prisma derivada de B-01/D01, D09, B-04, B-05 y B-06. No define tablas físicas, enums PostgreSQL, índices ni migraciones.

## 2. Conceptos

### Documentales
- Manifest
- TransportDocument
- MasterAirWaybill
- ChildAirWaybill
- House

### Físicos
- PhysicalUnit

### Destino
- Address
- Geolocation
- DeliveryPoint
- DestinationUnit

### Distribución
- Route
- RouteStop
- Delivery
- DeliveryAttempt

### Evidencia
- ProofOfDelivery
- EvidenceObject / EvidenceReference

### Recepción SETA
- ReceiptHandoff
- referencias al Manifest de Agencia y al Manifest de AeroVaradero

### Gobernanza
- lifecycle/archival facts
- AuditRecord
- autorización contextual y object ownership

### Ownership contextual — decisión para el primer recurso real
- El primer agregado expuesto por API será `Manifest`.
- `Manifest` tendrá ownership operacional explícito mediante `ownerSubject`, vinculado al `sub` del principal autenticado que lo crea.
- Un actor `operator` podrá operar únicamente sobre `Manifest` cuyo `ownerSubject` coincida con su `sub`.
- `admin` conserva el acceso transversal definido por la baseline de autorización.
- La autorización no confiará en identificadores enviados por el cliente para determinar ownership.
- El organizational scope queda como dimensión separada y extensible; no se inventa un claim de organización hasta que exista evidencia contractual de identidad que lo proporcione.
- Los recursos existentes sin ownership resoluble quedan inaccesibles para `operator` (fail-closed); no se realizará un backfill ficticio.
- Esta decisión habilita la primera migración física de ownership únicamente para `Manifest` y no congela todavía el ownership de `House`, `Delivery`, `Route`, POD ni Evidence.

## 3. Cadena documental

Manifest → TransportDocument → MasterAirWaybill → ChildAirWaybill (cuando exista) → House → PhysicalUnit

### MasterAirWaybill
- pertenece a TransportDocument;
- no es House;
- no es PhysicalUnit.

### ChildAirWaybill
- solo existe cuando una fuente documental lo identifica;
- es distinto de House;
- no se crea automáticamente por existir un House;
- cualquier vínculo ChildAWB ↔ House requiere evidencia documental;
- no impone a House formato, longitud o unicidad de ChildAWB.

### House
- representa House/número de paquete del proceso de Paquetería;
- puede relacionarse con MasterAirWaybill;
- no es ChildAirWaybill;
- no es PhysicalUnit;
- puede contener varias PhysicalUnit;
- conserva identidad aunque falle la geocodificación.

### PhysicalUnit
- pertenece a House;
- representa una unidad física individual;
- conserva secuencia/identificador físico y trazabilidad de custodia.

## 4. Destino

### Address
Dirección documental/normalizada reutilizable por múltiples House.

### DeliveryPoint
Destino operacional que puede referenciar Address, Geolocation, instrucciones, contactos y acceso.

### DestinationUnit
Unidad operacional utilizada para agrupación logística.

Reglas:
- se identifica mediante código operacional del aeropuerto internacional de referencia;
- ejemplo: Camagüey = `CMW`;
- territorios sin aeropuerto internacional = `OTRAS`;
- no equivale al nombre de la provincia;
- el catálogo debe conservar la relación código ↔ referencia geográfica.

## 5. Delivery

Una Delivery representa una operación/visita de entrega.

**D09:** si varios House tienen la misma dirección/punto de entrega, se registran en una única Delivery.

Cardinalidad: **Delivery ↔ House = N:M**.

Invariantes:
- Delivery no es simplemente un estado de House;
- una parada puede ejecutar una Delivery con múltiples House;
- cada DeliveryAttempt es independiente.

## 6. Route y RouteStop

Route contiene fecha, origen, destino, vehículo, conductor y estado.

RouteStop contiene secuencia, DeliveryPoint, tiempos planificados/reales y estado.

Relación:

Route → RouteStop → DeliveryPoint → Delivery → House

No debe sustituirse DeliveryPoint por Address.

## 7. Proof of Delivery

Entrega exitosa requiere:
1. resultado exitoso;
2. fotografía del documento de identidad del receptor asociada inequívocamente al paquete/operación;
3. actor y timestamp conservados como hechos de sistema/auditoría.

No son obligatorios por D12:
- firma;
- fotografía del bulto;
- OTP;
- geolocalización.

La evidencia debe ser un concepto trazable y no únicamente una cadena libre. Retención, legal hold y eliminación se gobiernan por política separada.

## 8. ReceiptHandoff

Después de la liberación aduanera externa:
1. AeroVaradero entrega físicamente;
2. personal autorizado de SETA recibe/extracta;
3. se conservan como referencias el Manifest de Agencia y el Manifest de AeroVaradero;
4. la recepción SETA habilita continuar hacia distribución, sujeto a bloqueos restantes.

Invariantes:
- la liberación aduanera es un hecho externo;
- SETA no ejecuta la liberación aduanera;
- AeroVaradero y el receptor SETA son actores distintos;
- el handoff es auditable.

## 9. Archival lifecycle

**Pre-archival**
- modificación permitida;
- cancelación permitida;
- toda modificación conserva auditoría/historial.

**Archived**
- modificación operacional directa prohibida;
- cancelación directa prohibida;
- una corrección excepcional autorizada debe generar historia nueva sin sobrescribir el estado archivado.

Archivado es una dimensión independiente del estado operativo de entrega.

## 10. Authorization / ownership

La autorización contextual debe evaluar como mínimo:

**actor + permission + organizational scope + object + ownership/context + object state + action**

El modelo de datos por sí solo no cierra BOLA/IDOR. Las operaciones sensibles deben producir un resultado de autorización auditable.

## 11. Relaciones objetivo

| Relación | Cardinalidad | Regla |
|---|---:|---|
| Manifest → TransportDocument | 1:N | documento pertenece al manifiesto |
| TransportDocument → MasterAWB | 1:0..1 | según documento |
| MasterAWB → ChildAWB | 1:N | cuando exista |
| MasterAWB → House | 1:N | relación documental |
| ChildAWB ↔ House | 0:N / 0:N | solo con evidencia |
| House → PhysicalUnit | 1:N | unidad física separada |
| House → Address | N:1 | dirección reutilizable |
| Address → DeliveryPoint | 1:N | destino operacional |
| DeliveryPoint → Delivery | 1:N | operaciones de entrega |
| Delivery ↔ House | N:M | D09 |
| Route → RouteStop | 1:N | paradas ordenadas |
| RouteStop → DeliveryPoint | N:1 | destino operacional |
| Delivery → DeliveryAttempt | 1:N | intentos independientes |
| Delivery → POD | 1:N | evidencia; mínima obligatoria para éxito |
| ReceiptHandoff ↔ Manifest references | N:M | referencias documentales |

## 12. Invariantes críticas

1. House ≠ ChildAirWaybill.
2. House ≠ PhysicalUnit.
3. Address ≠ DeliveryPoint.
4. StorageLocation ≠ DeliveryAddress.
5. DeliveryFailed ≠ Abandoned.
6. Customs release ≠ SETA action.
7. Same delivery address → one Delivery containing multiple House.
8. Successful Delivery requires recipient-ID photograph.
9. Archived object cannot be directly modified.
10. Source data is never silently overwritten.
11. Geocoding failure does not invalidate source address.
12. Authorization cannot depend solely on client state.
13. Sensitive operations are attributable.
14. Historical facts are append-only from the application perspective.
15. ChildAWB↔House is evidence-driven, never inferred.

## 13. Gaps before physical migration

- ChildAirWaybill y vínculo ChildAWB ↔ House;
- catálogo DestinationUnit y referencia geográfica;
- archival lifecycle y corrección histórica;
- POD/evidence storage y límite de retención;
- ReceiptHandoff y referencias de ambos manifiestos;
- DeliveryPoint/RouteStop/Delivery linkage;
- autorización contextual y object ownership;
- evidencia ejecutable de AT-13, AT-26, AT-27, AT-28 y AT-29/AT-30.

## 14. No decisiones todavía

No se fijan:
- nombres finales de tablas;
- enums físicos;
- proveedor de object storage;
- geocoder;
- motor de routing;
- duración de retención;
- política legal de eliminación;
- paths REST/OpenAPI definitivos.

## 15. Gate de esquema físico

No se aprueba una migración derivada de este modelo hasta que:
1. cada gap tenga diseño lógico;
2. cada concepto tenga trazabilidad a requisito;
3. invariantes tengan pruebas;
4. autorización contextual sea ejecutable;
5. límite de almacenamiento de evidencia esté definido;
6. pruebas end-to-end de Paquetería sean ejecutables.

**Conclusión:** se conserva la fundación PostgreSQL/PostGIS actual. Este modelo fija la dirección lógica sin congelar prematuramente la implementación física.
