# Evaluación comparativa de lectores XLSX de Paquetería

**Estado:** evaluación técnica; parser productivo NO seleccionado  
**Issue rector:** #228  
**Seguimiento:** #243  
**Fecha de actualización:** 2026-09-27

## 1. Criterio

SETA no selecciona un parser por popularidad, antigüedad o actividad del paquete. El candidato debe producir el `ImportSnapshot` requerido por `WorkbookReaderPort`, preservar provenance suficiente para auditoría y satisfacer los fixtures F01–F20 bajo límites reproducibles.

**Regla de evidencia:** PASS significa que existe una prueba ejecutada y reproducible para ese requisito. GAP significa que el adapter no conserva el dato requerido. NOT EXECUTED significa que todavía no existe evidencia suficiente. No se convierten ausencias de evidencia en PASS.

## 2. Candidatos evaluados

| Candidato | Estado actual | Evidencia funcional | Brecha principal |
|---|---|---|---|
| ExcelJS 4.4.0 | 🔴 BLOQUEADO | Adapter aislado con estructura, fórmulas/cache, formatos, filas especiales, visibilidad, provenance de headers y límites | No existe todavía ejecución CI observable del conformance dedicado; persisten gates de consumo de recursos, seguridad y supply chain |
| read-excel-file 9.3.10 | 🟡 CANDIDATO / GAP CONOCIDO | Adapter aislado con valores, filas, direcciones, provenance de headers y límites básicos; gate común invocado explícitamente | La API utilizada no preserva suficiente metadata para el contrato completo; no existe todavía ejecución CI observable del conformance dedicado |
| SheetJS CE 0.20.3 | 🟡 CANDIDATO | Adapter aislado con fórmula/cache, formatos, visibilidad, provenance de headers y límites; conformance dedicado observado PASS | F01–F20 completo, benchmark, real-source anonimizado y revisión final de supply chain siguen pendientes |
| Forks | ⚪ CONDICIONADOS | No existe todavía una evaluación equivalente | Procedencia, mantenimiento, seguridad y reproducibilidad |

## 3. Matriz F01–F20

La matriz registra la evidencia disponible **a la fecha** y no constituye una afirmación de conformidad productiva.

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
| F14 | Columnas adicionales | PASS | PASS | PASS | Preservación estructural; mapping pendiente |
| F15 | Filas TOTAL/SUBTOTAL | PASS | PASS | PASS | Evidencia experimental |
| F16 | Valores numéricos problemáticos | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pendiente |
| F17 | Identidad ambigua | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Reconciliación pendiente |
| F18 | Reimportación idéntica/idempotencia | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pipeline pendiente |
| F19 | Mismo contenido + mapping versionado diferente | NOT EXECUTED | NOT EXECUTED | NOT EXECUTED | Pipeline/mapping pendiente |
| F20 | Provenance y trazabilidad completa | PARTIAL | GAP | PARTIAL | Requiere validación end-to-end |

**Nota F10:** identificar filas TOTAL/SUBTOTAL o conservar valores numéricos no demuestra por sí mismo la regla de discrepancia de negocio. La reconciliación sigue siendo responsabilidad del pipeline.

**Nota F20:** los adapters generan referencias de celda y, donde aplica, propagan `columnHeaderRaw`, pero todavía no existe evidencia end-to-end de la provenance completa exigida por el baseline: `sourceDocumentId`, `contentHash`, sheet, fila, columna, header, dirección, valor original, mapping profile/version y transformación.

## 4. Estado de implementación de los tres adapters

### ExcelJS 4.4.0

El adapter experimental implementa:

- lectura desde `Buffer`;
- límites de bytes, hojas, filas y celdas;
- clasificación HEADER/DATA/EMPTY/TOTAL/SUBTOTAL;
- fórmula y resultado cacheado;
- formato numérico;
- hojas VISIBLE/HIDDEN/VERY_HIDDEN;
- referencias de celda;
- propagación de `columnHeaderRaw`;
- prueba explícita del gate provider-neutral F01–F20.

**Estado:** adapter experimental técnicamente instrumentado; **BLOCKED FOR PRODUCTION**. La ausencia de una ejecución CI observable en el branch no se interpreta como PASS.

### read-excel-file 9.3.10

El adapter experimental implementa:

- lectura mediante `WorkbookReaderPort`;
- valores/tipos básicos;
- clasificación de filas;
- referencias de celda;
- direcciones repetidas;
- propagación de `columnHeaderRaw`;
- límite de bytes;
- prueba explícita que ejecuta el gate común y registra deliberadamente el gap mediante una expectativa de fallo.

La implementación no falsea conformidad: la API utilizada no proporciona de forma suficiente fórmula/cache, hidden/veryHidden, number format y otras capacidades requeridas por el contrato.

**Estado:** adapter experimental completo para evaluación comparativa; **CANDIDATO / GAP CONOCIDO / NO SELECCIONADO**. La ausencia de una ejecución CI observable no se interpreta como PASS.

### SheetJS CE 0.20.3

El adapter experimental implementa:

- lectura desde `Buffer`;
- límites de bytes, hojas, filas y celdas;
- clasificación HEADER/DATA/EMPTY/TOTAL/SUBTOTAL;
- fórmula y resultado;
- formato numérico;
- visibilidad VISIBLE/HIDDEN/VERY_HIDDEN;
- referencias de celda;
- `columnHeaderRaw`;
- direcciones repetidas;
- ejecución del gate común.

La ejecución dedicada de conformance observada en CI produjo **4/4 pruebas PASS**. Esta evidencia certifica solamente el conjunto estructural cubierto por ese job; no convierte F01–F20 completo en PASS.

**Estado:** adapter experimental instrumentado y con evidencia CI observable; **CANDIDATO / NO SELECCIONADO**.

## 5. CI y trazabilidad de la ejecución

Para eliminar la dependencia de workflows que existen únicamente dentro de branches experimentales, se incorporó en `main` el workflow:

`.github/workflows/xlsx-reader-adapters-conformance.yml`

Este workflow se ejecuta sobre Pull Requests que modifican el área XLSX y realiza:

1. checkout del código del PR;
2. Node.js 24.21.0;
3. `npm ci`;
4. `npm run build`;
5. `npm run test:xlsx-readers`.

Commit de incorporación en `main`: `ad0903f37c426119721acc1673374d9e439253ee`. Posteriormente se corrigió para limitarlo a Pull Requests, evitando ejecutar el job contra `main` cuando `main` todavía no contiene los adapters experimentales; commit de corrección: `eda244b6fb88a11223959113215f1ea79f3ac17b`.

**Importante:** al actualizar esta documentación no se inventa evidencia de ejecución para #234 o #236. Sus workflows dedicados existen en los branches, pero no se ha observado todavía una ejecución CI verificable asociada a sus últimos commits. El workflow central en `main` deja establecida la vía reproducible para que la evidencia se produzca desde los PR.

Para SheetJS existe evidencia CI observable previa: workflow de conformance con **4/4 tests PASS**. Esa evidencia sigue siendo estructural y experimental.


### 5.1 Evidencia posterior — 2026-09-27

En #234 se produjo una ejecución dedicada observable del workflow ExcelJS (run #5, ID `36330413051`) sobre `ebaacdc12f9f60ddd736e5c5ba62437fc5f8d930`. El build pasó y 5/6 pruebas pasaron; el gate común falló por una discrepancia de fixture: la celda de `Peso` no tenía el formato numérico esperado `0.00`. Se corrigió el fixture y posteriormente se corrigió el workflow para usar `apps/api/package-lock.json` como dependencia de caché.

El último commit del branch ExcelJS es `5ed2d169ae842731bd376761a6de14c6f63f5314`. GitHub no muestra todavía una ejecución dedicada asociada a ese SHA; por tanto, la corrección aún no se certifica por CI.

Para #236, el último commit evaluado es `43b5e76f548db5edcd35829c31aa9f408d5f3507`. La ejecución observable asociada hasta ahora corresponde únicamente a `security-assurance.yml` y terminó en failure; no se utiliza como evidencia de conformance del adapter. No existe todavía una ejecución dedicada observable para el adapter read-excel-file en ese SHA.

La ausencia de ejecución dedicada se registra como **NOT EXECUTED**, nunca como PASS.

## 6. Arquitectura vigente

El parser concreto permanece aislado:

`WorkbookReaderPort -> ImportSnapshot -> mapping -> validation -> reconciliation -> acceptance -> promotion`

Ningún adapter experimental escribe directamente Manifest, House u otras entidades operacionales.

## 7. Puertas de producción

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
12. Para SheetJS, cierre de #152 antes de convertir la evaluación en decisión de adopción.

## 8. Resultado y siguiente estado

**PARCIAL — los tres adapters experimentales están implementados detrás del contrato común y la instrumentación comparativa está documentada. La evidencia todavía no permite seleccionar un parser productivo.**

El trabajo pendiente ya no es “crear otro adapter”. Es producir y conservar evidencia reproducible:

- ejecutar el conformance central en #234 y #236;
- completar la matriz F01–F20 donde corresponda al adapter y al pipeline;
- cerrar resource limits/benchmark;
- cerrar provenance end-to-end;
- completar #152 para la evidencia real privacy-preserving de SheetJS;
- separar explícitamente #198 como limitación de Dependency Review;
- registrar la decisión final mediante ADR.

**No se selecciona ni promociona ningún parser a producción en esta actualización.**
