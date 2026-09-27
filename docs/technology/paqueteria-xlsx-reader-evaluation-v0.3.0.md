# Evaluación comparativa de lectores XLSX de Paquetería

**Estado:** evaluación técnica; parser productivo NO seleccionado  
**Issue rector:** #228  
**Fecha:** 2026-09-27

## 1. Criterio

SETA no selecciona un parser por popularidad, antigüedad o actividad del paquete. El candidato debe producir el `ImportSnapshot` requerido por `WorkbookReaderPort`, preservar provenance suficiente para auditoría y satisfacer los fixtures F01–F20 bajo límites reproducibles.

**Regla de evidencia:** PASS significa que existe una prueba ejecutada y reproducible para ese requisito. GAP significa que el adapter no conserva el dato requerido. NOT EXECUTED significa que todavía no existe evidencia suficiente. No se convierten ausencias de evidencia en PASS.

## 2. Candidatos evaluados

| Candidato | Estado actual | Evidencia funcional | Brecha principal |
|---|---|---|---|
| ExcelJS 4.4.0 | 🔴 BLOQUEADO | PoC ejecuta con Node 24; estructura, fórmulas/cache, formatos, filas especiales y visibilidad | Riesgo de consumo de recursos en `Workbook.xlsx.load()`, deuda de dependencias y vulnerabilidades observadas en CI |
| read-excel-file 9.3.10 | 🟡 CANDIDATO | Adapter aislado ejecuta bajo `WorkbookReaderPort`; valores, filas, direcciones y límites básicos | No preserva de forma suficiente fórmula/cache, visibilidad, formatos, merged cells y errores para el contrato completo |
| SheetJS 0.20.3 | 🟡 CANDIDATO | Adapter aislado ejecuta bajo `WorkbookReaderPort`; fórmula/cache, formatos y visibilidad fueron ejercitados en fixture | Faltan F01–F20 completos, benchmark, real-source anonimizado y revisión final de supply chain |
| Forks | ⚪ CONDICIONADOS | No existe todavía una evaluación equivalente | Procedencia, mantenimiento, seguridad y reproducibilidad |

## 3. Matriz F01–F20

La matriz siguiente registra la evidencia disponible **a la fecha**, no una afirmación de conformidad productiva.

| Fixture | Requisito | ExcelJS | read-excel-file | SheetJS | Estado de decisión |
|---|---|---:|---:|---:|---|
| F01 | House textual / valores básicos | PASS | PASS | PASS | Evidencia experimental |
| F02 | Múltiples bultos | PASS | PASS | PASS | Evidencia experimental |
| F03 | Dirección compartida/repetida | PASS | PASS | PASS | Evidencia experimental |
| F04 | Múltiples teléfonos | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F05 | Coordenadas válidas | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F06 | Coordenadas no resueltas | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F07 | Aduana | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F08 | CONSOLIDADO | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F09 | Fórmula y resultado cacheado | PASS | GAP | PASS | Evidencia parcial |
| F10 | Discrepancia de totales | PASS | PASS | PASS | Clasificación estructural; regla de negocio pendiente |
| F11 | Alias de headers | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Mapping pendiente |
| F12 | Headers ambiguos | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Mapping pendiente |
| F13 | Campo crítico ausente | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Validación pendiente |
| F14 | Columnas adicionales | PASS | PASS | PASS | Preservación de columnas requiere validación de mapping |
| F15 | Filas TOTAL/SUBTOTAL | PASS | PASS | PASS | Evidencia experimental |
| F16 | Valores numéricos problemáticos | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F17 | Identidad ambigua | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Reconciliación pendiente |
| F18 | Reimportación idéntica/idempotencia | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pipeline pendiente |
| F19 | Mismo contenido + mapping versionado diferente | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pipeline/mapping pendiente |
| F20 | Provenance y trazabilidad completa | PARTIAL | GAP | PARTIAL | Requiere validación end-to-end |

**Nota sobre F10:** que un lector identifique filas TOTAL/SUBTOTAL o conserve valores numéricos no demuestra por sí mismo la regla de discrepancia de negocio. La reconciliación sigue siendo responsabilidad del pipeline.

**Nota sobre F20:** los tres adapters generan referencias de celda dentro de su alcance experimental, pero todavía no existe evidencia end-to-end que demuestre la provenance completa exigida por el baseline: `sourceDocumentId`, `contentHash`, sheet, fila, columna, header, dirección, valor original, mapping profile/version y transformación.

## 4. Evidencia de adapters

### ExcelJS

El adapter experimental demostró:

- lectura desde `Buffer`;
- límite de bytes;
- límite de hojas;
- límites de filas/celdas;
- clasificación HEADER/DATA/EMPTY/TOTAL/SUBTOTAL;
- fórmula y resultado cacheado;
- formato numérico;
- hojas VISIBLE/HIDDEN/VERY_HIDDEN;
- referencias de celda.

Su estado permanece **BLOCKED FOR PRODUCTION**. La prueba funcional no elimina los hallazgos de seguridad/supply chain.

### read-excel-file

El adapter experimental demostró:

- lectura de múltiples hojas;
- valores y tipos básicos;
- clasificación de filas;
- referencias de celda;
- dirección compartida;
- límite de bytes.

El contrato completo requiere información que este adapter no obtiene de forma suficiente de la API usada: fórmula/cache, estado hidden/veryHidden, number format, merged-cell metadata y errores de celda. Por ello queda como **CANDIDATO / NO SELECCIONADO**.

### SheetJS

El adapter experimental demostró:

- lectura desde `Buffer`;
- límite de bytes;
- límites de hojas/filas/celdas;
- clasificación HEADER/DATA/EMPTY/TOTAL/SUBTOTAL;
- fórmula y resultado;
- formato numérico;
- visibilidad VISIBLE/HIDDEN/VERY_HIDDEN;
- referencias de celda;
- preservación de raw/displayed values dentro del alcance del adapter.

La ejecución funcional de CI del commit `4241dd528b901b6f85061cde9b48d1301301b750` fue PASS en API Foundation, OpenAPI Contract, PostgreSQL/PostGIS, Keycloak OIDC y Observability. Dependency Review continúa afectado por la limitación conocida #198.

Esto **no constituye selección productiva**: F01–F20 completos, benchmark, evidencia real anonimizada, provenance end-to-end y revisión final de supply chain siguen pendientes.

## 5. Arquitectura vigente

El parser concreto permanece aislado:

`WorkbookReaderPort -> ImportSnapshot -> mapping -> validation -> reconciliation -> acceptance -> promotion`

Ningún adapter experimental escribe directamente Manifest, House u otras entidades operacionales.

## 6. Puertas de producción

Antes de seleccionar un parser deben cerrarse todas estas puertas:

1. F01–F20 reproducibles para el candidato seleccionado.
2. Provenance completa y verificable end-to-end.
3. Límites de bytes/hojas/filas/celdas y prueba de consumo de recursos.
4. Benchmark reproducible con archivos representativos.
5. Árbol de dependencias y lockfile reproducible.
6. Revisión de vulnerabilidades, mantenimiento y procedencia.
7. Prueba con evidencia real **anonimizada**.
8. Adapter aislado detrás de `WorkbookReaderPort`.
9. CI verde en controles funcionales aplicables.
10. ADR de selección y justificación de mitigaciones.
11. Integración posterior con mapping/validation/promotion; ningún parser se promociona directamente a Manifest/House.

## 7. Resultado

**PARCIAL — la comparación ya tiene evidencia experimental de tres familias de lectores, pero todavía NO existe base suficiente para seleccionar un parser productivo.**

El próximo incremento debe completar la suite F01–F20 en una ejecución común, no crear adapters aislados indefinidamente. La prioridad pasa ahora de “probar otra librería” a **cerrar evidencia comparativa reproducible y los gates de seguridad/supply chain**.
