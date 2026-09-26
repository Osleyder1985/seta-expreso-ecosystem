# Requirements Baseline v0.1.0 — SETA EXPRESO SURL

**Estado:** Inicial — trazabilidad en construcción  
**Fecha:** 2026-09-26  
**Referencia:** Auditoría estricta 2026-09-26 / Issue #177

## 1. Propósito
Establecer una estructura formal para requisitos del Ecosistema y evitar que una funcionalidad se considere completa sin criterios verificables.

## 2. Taxonomía
- BR — Business Requirement
- SR — System Requirement
- FR — Functional Requirement
- NFR — Non-Functional Requirement
- SEC — Security Requirement
- DR — Data Requirement
- IR — Interface Requirement
- OR — Operational Requirement
- CON — Constraint

## 3. Reglas
Cada requisito debe tener identificador estable, enunciado verificable, fuente/origen, prioridad, dependencias, criterios de aceptación, estado, trazabilidad a Issue/ADR cuando aplique y prueba o evidencia de verificación cuando se implemente.

Los requisitos no deben describir una tecnología salvo que sea una restricción explícita.

## 4. Estados
Propuesto → Aprobado → Implementado → Verificado → Retirado/Superseded.

Implementado no equivale a Verificado.

## 5. Primer baseline funcional
### BR-PKG-001 — Gestión de paquetería
El sistema debe soportar el proceso empresarial de paquetería de SETA EXPRESO.

### FR-PKG-MAN-001 — Importar manifiesto
El sistema debe permitir importar un manifiesto desde XLSX, validar estructura y datos y producir un resultado auditable.

### FR-PKG-MAN-002 — CRUD de manifiestos
El sistema debe permitir crear, consultar, actualizar, listar y eliminar según las reglas de negocio y auditoría aplicables.

### FR-PKG-001 — CRUD de paquetes
El sistema debe permitir crear, consultar, actualizar y eliminar paquetes asociados a un manifiesto.

### FR-ADDR-001 — Normalización de direcciones
El sistema debe conservar la dirección original y generar una representación normalizada sin destruir información local.

### FR-ADDR-002 — Validación territorial
El sistema debe validar provincia, municipio y localidad/asentamiento mediante el catálogo territorial versionado.

### FR-GEO-001 — Geocodificación
El sistema debe convertir direcciones aceptables en coordenadas geográficas mediante GeocodingProvider.

### FR-GEO-002 — Quality Gate
Los resultados de geocodificación deben clasificarse como ACCEPTED, REVIEW o REJECTED según reglas verificables de consistencia, precisión y confianza.

### FR-MAP-001 — Visualización
El sistema debe mostrar localizaciones de paquetes en cartografía compatible con el contrato MapTileProvider.

### FR-ROUTE-001 — Rutas
El sistema debe permitir construir una ruta a partir de localizaciones seleccionadas y obtener distancia/tiempo mediante RoutingProvider.

### FR-ROUTE-002 — Tiempo de servicio
El cálculo operacional debe considerar tiempos de servicio configurables por entrega y paquetes agrupados en una misma dirección.

## 6. Requisitos no funcionales iniciales
### NFR-PERF-001
Los objetivos de rendimiento deben definirse por endpoint y workload; los resultados del benchmark backend existente no se extrapolan a cargas no probadas.

### NFR-REL-001
Los procesos asíncronos y sincronización móvil deben ser idempotentes y tolerantes a reintentos.

### NFR-SEC-001
La API debe aplicar controles verificables basados en OWASP ASVS 5.0.

### NFR-MOB-001
Las capacidades offline móviles deben mantener autoridad canónica del servidor y sincronización auditable.

### NFR-DATA-001
Los datos espaciales deben persistirse con una política explícita de SRID, precisión e índices espaciales.

### NFR-OBS-001
Las operaciones relevantes deben poder correlacionarse mediante contexto de observabilidad sin exponer información sensible innecesaria.

## 7. Matriz de trazabilidad inicial
| Requisito | Arquitectura/decisión | Implementación | Verificación |
|---|---|---|---|
| FR-PKG-MAN-001 | XLSX import architecture | Pendiente | Pendiente |
| FR-ADDR-002 | ONEI territorial model | Pendiente | Pendiente |
| FR-GEO-001 | ADR-003 / GeocodingProvider | Pendiente | Pendiente |
| FR-MAP-001 | ADR-004 / MapLibre | Pendiente | Pendiente |
| FR-ROUTE-001 | ADR-004 / Valhalla | Pendiente | Pendiente |
| NFR-SEC-001 | ADR-004 / ASVS | Pendiente | Pendiente |
| NFR-MOB-001 | ADR-004 / Offline | Pendiente | Pendiente |

## 8. Regla de evolución
La baseline crecerá por verticales funcionales. No se exige especificar todo el sistema antes de comenzar el desarrollo, pero ninguna capacidad implementada podrá declararse completa sin requisitos y criterios de aceptación suficientes para esa capacidad.

## 9. Criterio de auditoría
Un requisito es verificable cuando un tercero puede determinar, usando evidencia definida, si se satisface o no sin depender de una interpretación subjetiva.
