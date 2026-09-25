# Contratos transversales de sincronización, GPS y evidencias

**Versión:** 0.1.0  
**Estado:** Propuesto como regla transversal de arquitectura  
**Fecha:** 2026-09-25  
**Trazabilidad:** Issues #87, #88; PRs #53, #55, #57, #59, #60, #61, #63

## 1. Propósito

Este documento establece la separación entre invariantes transversales de operación/sincronización y reglas específicas de cada dominio. Su objetivo es evitar que GPS, entregas y evidencias implementen contratos incompatibles o duplicados.

No selecciona tecnología de almacenamiento móvil, streaming, broker, proveedor de mapas ni política definitiva de retención.

## 2. Cadena de autoridad

La evolución de diseño sigue:

**capacidades/requisitos → arquitectura offline-first → protocolo → PoC → evidencia → ADR/contrato final → implementación**

El PoC produce evidencia; no convierte por sí solo una hipótesis en decisión productiva.

## 3. Invariantes transversales

| Invariante | Aplicación |
|---|---|
| operationId | Identifica una operación capturada por el cliente |
| idempotencyKey | Permite reintentos sin duplicar efectos |
| causalidad/baseVersion | Permite detectar concurrencia y dependencias |
| estado de sincronización | Pendiente → enviada → confirmada/reintentable/conflictiva/permanente |
| reintento controlado | Errores transitorios no deben perder operaciones |
| recuperación | Reinicio/offline/intermitencia no elimina operaciones durables |
| autorización | El backend decide qué objeto/operación puede afectar el actor |
| auditoría | Operaciones relevantes deben dejar trazabilidad |
| observabilidad | Errores, latencia, volumen y recuperación deben poder medirse |

Estos invariantes son contractuales/transversales; no son estados de negocio.

## 4. Separación por dominio

### GPSObservation
Hecho append-only de posición/observación. Incluye como mínimo latitud, longitud, timestamp, accuracy y contexto disponible. Su sincronización reutiliza los invariantes transversales.

### Delivery / DeliveryAttempt
Representan ejecución logística y sus intentos. Una operación offline puede crear/modificar un intento, pero los estados logísticos no deben confundirse con estados de sincronización.

### Evidence
Representa evidencia asociada a una operación/entidad de negocio. Su almacenamiento, autorización, ciclo de vida y retención siguen la gobernanza de evidencias. La retención legal permanece abierta hasta evidencia oficial suficiente.

### FieldObservation
Representa observaciones/correcciones capturadas en campo. Una corrección geoespacial pendiente de validación no se convierte automáticamente en dato maestro confirmado.

## 5. Matriz de reutilización

| Capacidad | Transversal | GPS | Delivery/POD | FieldObservation |
|---|---:|---:|---:|---:|
| operationId | ✓ | usa | usa | usa |
| idempotencyKey | ✓ | usa | usa | usa |
| causalidad/baseVersion | ✓ | usa cuando aplique | ✓ | ✓ |
| outbox/durabilidad local | ✓ | ✓ | ✓ | ✓ |
| reintentos | ✓ | ✓ | ✓ | ✓ |
| recuperación | ✓ | ✓ | ✓ | ✓ |
| autorización | ✓ | acceso a posición | acceso a operación/evidencia | acceso a corrección |
| auditoría | ✓ | ✓ | ✓ | ✓ |
| estados de sincronización | ✓ | ✓ | ✓ | ✓ |
| estados de dominio | **no** | propios | propios | propios |
| retención legal POD | **no** | **no** | evidencia/POD | **no** |
| reconstrucción de trayectoria | **no** | ✓ | **no** | **no** |
| resultado de entrega | **no** | **no** | ✓ | **no** |
| validación de corrección | **no** | **no** | **no** | ✓ |

## 6. Reglas de no duplicación

1. No crear un segundo modelo de outbox para GPS si puede utilizarse el contrato transversal.
2. No reutilizar estados de Delivery/POD como estados de sincronización.
3. No reutilizar estados de GPS como estados de entrega.
4. No convertir Evidence en agregado universal.
5. No introducir un broker o streaming solo para satisfacer esta matriz; cualquier decisión de infraestructura distribuida requiere evidencia y ADR.
6. La autorización se ejecuta en el backend; el cliente no es autoridad final.
7. Los contratos API concretos se derivarán posteriormente de esta separación.

## 7. Decisiones que permanecen abiertas

- tecnología de persistencia local;
- frecuencia definitiva de captura GPS;
- frecuencia/política definitiva de transmisión;
- streaming vs sincronización HTTP;
- resolución automática de conflictos críticos;
- proveedor de mapas/geocoder/routing;
- política definitiva de retención de evidencias;
- infraestructura distribuida.

## 8. Criterio de cierre de H-17/H-18

H-17 queda trazado mediante la cadena de autoridad y la relación explícita entre capacidades, arquitectura, protocolo y PoC.

H-18 queda trazado mediante la matriz de reutilización y la separación explícita de GPSObservation, Delivery/DeliveryAttempt, Evidence y FieldObservation.

El cierre de estos hallazgos no implica que las decisiones abiertas anteriores estén resueltas.
