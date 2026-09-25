# Alcance y fronteras del dominio de Paquetería — v0.1.0

**Estado:** Propuesto para validación de dominio  
**Issue:** #35  
**Fecha:** 2026-09-25  
**Ámbito:** Bounded Context Paquetería

## 1. Propósito

Establecer el alcance funcional y las fronteras del dominio de Paquetería antes de convertir el modelo conceptual en persistencia, APIs o implementación física.

Este documento consolida evidencia ya disponible; no resuelve por inferencia las decisiones que permanecen abiertas.

## 2. Responsabilidad del dominio

Paquetería gestiona el ciclo operativo de las expediciones que SETA recibe para procesar y distribuir, desde su incorporación documental hasta recepción física, custodia, preparación para distribución, planificación, ejecución de entregas, intentos, evidencias, incidencias, devoluciones y cierre operacional.

## 3. Dentro del alcance

### 3.1 Ingreso documental
- recepción/importación del manifiesto;
- conservación del archivo y metadatos de origen;
- validación y conciliación;
- discrepancias;
- trazabilidad del origen.

### 3.2 Expedición y unidades físicas
- Manifest;
- TransportDocument y referencias documentales;
- House;
- PhysicalUnit;
- relaciones documentales y físicas;
- recepción y conciliación física.

**Regla:** House no se considera sinónimo universal de PhysicalUnit.

### 3.3 Personas, direcciones y destinos
- remitente;
- destinatario;
- receptor de entrega;
- Address;
- interpretación/normalización/validación;
- Geolocation;
- DeliveryPoint.

La geocodificación es una capacidad de soporte y no equivale a validación de dirección.

### 3.4 Custodia y distribución
- recepción;
- ubicación/custodia;
- movimientos;
- elegibilidad para distribución;
- planificación de rutas;
- Route;
- Stop;
- ejecución de ruta.

### 3.5 Entrega
- Delivery;
- DeliveryAttempt;
- resultado de entrega;
- no-entrega;
- reintentos;
- devolución;
- ProofOfDelivery;
- incidencias;
- trazabilidad y auditoría operacional.

### 3.6 Estados y trazabilidad
El dominio mantiene dimensiones de estado independientes cuando corresponda, en lugar de reducir todo el ciclo a un único estado.

## 4. Fuera del alcance del Bounded Context

| Área | Tratamiento |
|---|---|
| Identidad/autenticación transversal | Contexto transversal |
| Contabilidad general | Economía |
| Facturación/cobros corporativos | Economía/Administración según diseño futuro |
| Nómina | RR. HH. |
| Gestión integral de vehículos | Flota/Logística |
| Mantenimiento de vehículos | Flota/Mantenimiento |
| Proveedores de mapas/geocodificación/routing | Sistemas externos |
| Autoridad aduanera | Sistema/actor externo |
| Agencia transitara | Actor externo |
| AeroVaradero | Actor/sistema externo |
| Catálogo corporativo de clientes | Contexto corporativo pendiente |
| Almacenamiento físico como infraestructura | Infraestructura; las operaciones de custodia sí pertenecen al flujo de Paquetería |

## 5. Fronteras funcionales

### Paquetería → Economía
Paquetería produce información operacional necesaria para facturación, costos, cobros y liquidaciones. No ejecuta contabilidad general.

### Paquetería → Flota/Logística
Paquetería necesita asignación y ejecución de transporte, pero la gestión integral del vehículo y su mantenimiento no son responsabilidad del contexto.

### Paquetería → Identidad
Paquetería utiliza identidad, roles y autorización; no administra el ciclo de identidad corporativa.

### Paquetería → Aduana/AeroVaradero
Paquetería registra resultados, referencias y evidencias necesarios para su operación. No sustituye la autoridad ni inventa estados jurídicos.

### Paquetería → Mapas/Geocodificación/Routing
El dominio define la necesidad y conserva resultados contractuales; el proveedor externo no debe penetrar en las reglas de dominio.

## 6. Actores principales

**Internos**
- operador de Paquetería;
- personal de almacén;
- planificador;
- conductor/miembro de tripulación;
- personal autorizado para incidencias y cierre;
- administración/economía según operación.

**Externos**
- agencia transitara;
- AeroVaradero;
- autoridades aduaneras;
- destinatario/receptor;
- proveedores tecnológicos externos.

## 7. Conceptos centrales

Manifest → TransportDocument → House → PhysicalUnit

Person → Address → Geolocation → DeliveryPoint

Route → Stop → Delivery → DeliveryAttempt → ProofOfDelivery

Incident y StatusHistory proporcionan trazabilidad transversal.

## 8. Decisiones que NO quedan cerradas

Permanecen abiertas:

- equivalencia definitiva de House, Package y Bulto;
- cardinalidad final Delivery ↔ House;
- requisitos mínimos obligatorios de POD;
- catálogo jurídico definitivo de estados aduaneros;
- fuente de verdad contractual/fiscal para facturación;
- proveedor de mapas/geocodificación/routing;
- diseño físico definitivo de PostgreSQL/PostGIS;
- endpoints concretos;
- algoritmo de optimización de rutas;
- política definitiva de modificación/cancelación según estado.

## 9. Criterio de frontera

Una capacidad pertenece a Paquetería cuando su responsabilidad principal consiste en controlar el ciclo operacional de una expedición, unidad física, destino, ruta, entrega o evidencia dentro del servicio.

Una capacidad permanece fuera cuando su responsabilidad principal corresponde a otro proceso corporativo o a un sistema/actor externo.

## 10. Trazabilidad

AS-IS → alcance y fronteras → requisitos → casos de uso → modelo de dominio → diseño → implementación → pruebas

Fuentes principales:
- docs/domain/paqueteria-as-is-process-v0.1.0.md
- docs/domain/paqueteria-domain-model-v0.2.0.md
- docs/domain/paqueteria-functional-specification-v0.1.0.md
- docs/domain/paqueteria-critical-decisions-v0.2.0.md
- docs/domain/paqueteria-operational-closure-matrix-v0.1.0.md

## 11. Criterio de aceptación de #35

La Issue se considera resuelta cuando existe un artefacto versionado que define inclusión y exclusión, actores, fronteras, conceptos centrales, decisiones abiertas y trazabilidad hacia AS-IS, requisitos y modelo de dominio.

**Este documento no autoriza todavía una implementación física irreversible.**
