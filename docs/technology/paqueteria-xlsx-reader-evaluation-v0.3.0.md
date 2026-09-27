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
| ExcelJS 4.4.0 | 🔴 BLOQUEADO | Adapter aislado con estructura, fórmulas/cache, formatos, filas especiales, visibilidad, provenance de headers y límites | Conformance dedicado PASS; persisten gates de consumo de recursos, seguridad y supply chain |
| read-excel-file 9.3.10 | 🟡 CANDIDATO / GAP CONOCIDO | Adapter aislado con valores, filas, direcciones, provenance de headers y límites básicos; gate común invocado explícitamente | La API utilizada no preserva suficiente metadata para el contrato completo; conformance dedicado PASS con GAP explícito |
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

**Estado:** adapter experimental técnicamente instrumentado; **BLOCKED FOR PRODUCTION**. Evidencia CI dedicada reproducible: run `36331157010`, job `108653206761`, SHA `ce224581c85a4b475defb961b9ae00e2cfb2e4a6`; build y `test:xlsx-readers` PASS.

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

**Estado:** adapter experimental completo para evaluación comparativa; **CANDIDATO / GAP CONOCIDO / NO SELECCIONADO**. La ejecución dedicada `36330974147` sobre SHA `f6da8e72ea388dadc921618eaa66360116271c1f` terminó SUCCESS. La prueba del gate registra deliberadamente el GAP conocido; esto no equivale a PASS F01–F20.

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

**Importante:** la evidencia dedicada ya es observable para los tres candidatos. La certificación F01–F20 reader-level queda registrada en la sección 5.2; los estados GAP/PARTIAL/NOT_EXECUTED no se convierten en PASS por la mera ejecución del workflow.

Para SheetJS existe evidencia CI observable: run `36329351335`, con **4/4 tests PASS**. Esa evidencia sigue siendo estructural y experimental.


### 5.1 Evidencia posterior — 2026-09-27

En #234 se produjo una ejecución dedicada observable del workflow ExcelJS (run #5, ID `36330413051`) sobre `ebaacdc12f9f60ddd736e5c5ba62437fc5f8d930`. El build pasó y 5/6 pruebas pasaron; el gate común falló por una discrepancia de fixture: la celda de `Peso` no tenía el formato numérico esperado `0.00`. Se corrigió el fixture y posteriormente se corrigió el workflow para usar `apps/api/package-lock.json` como dependencia de caché.

La corrección quedó certificada posteriormente por run `36331157010` sobre `ce224581c85a4b475defb961b9ae00e2cfb2e4a6`: build PASS y conformance PASS.

Para #236, la evidencia dedicada posterior es run `36330974147` sobre `f6da8e72ea388dadc921618eaa66360116271c1f`: build PASS y suite PASS, incluyendo la prueba que documenta el GAP conocido del proveedor. No se interpreta como PASS F01–F20.



## 5.2 Certificación ejecutable F01–F20 — 2026-09-27

Se implementó un ledger provider-neutral de exactamente 20 requisitos en
`apps/api/src/modules/paqueteria/import/f01-f20-certification.ts`. El ledger
obliga a distinguir **PASS**, **PARTIAL**, **GAP** y **NOT_EXECUTED**; no convierte
la ausencia de evidencia en PASS.

Se ejecutaron suites dedicadas sobre los tres adapters:

| Adapter | SHA | Run | Job | Resultado CI |
|---|---|---:|---:|---|
| ExcelJS 4.4.0 | `ac8f8b03e256445481ee36fcb3bd56156739fc6b` | `36333990786` | `108661211656` | PASS |
| read-excel-file 9.3.10 | `8eb4088c916a671fe8a6b7e485068da239325ebe` | `36334029875` | `108661324840` | PASS |
| SheetJS CE 0.20.3 | `402eed62288d64e880017c517b9875da1162807d` | `36334377939` | `108662303147` | PASS |

La certificación ejecutada en esta fase es **reader-level**, no una certificación
productiva completa del pipeline. F04, F11–F14 y F16–F19 permanecen
NOT_EXECUTED porque requieren mapping/validation/reconciliation/pipeline.
F10 queda PARTIAL porque la suite demuestra clasificación/preservación de
TOTAL/SUBTOTAL pero todavía no ejecuta la regla de discrepancia de negocio.
F20 queda PARTIAL para ExcelJS/SheetJS y GAP para read-excel-file porque aún no
existe provenance end-to-end hasta mapping, persistencia y auditoría.

### Matriz de estado producida por el ledger

| Fixture | ExcelJS | read-excel-file | SheetJS |
|---|---|---|---|
| F01 | PASS | PASS | PASS |
| F02 | PASS | NOT_EXECUTED | PASS |
| F03 | PASS | PASS | PASS |
| F04 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F05 | PASS | NOT_EXECUTED | PASS |
| F06 | PASS | PASS | PASS |
| F07 | PASS | NOT_EXECUTED | PASS |
| F08 | PASS | NOT_EXECUTED | PASS |
| F09 | PASS | GAP | PASS |
| F10 | PARTIAL | PARTIAL | PARTIAL |
| F11 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F12 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F13 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F14 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F15 | PASS | PASS | PASS |
| F16 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F17 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F18 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F19 | NOT_EXECUTED | NOT_EXECUTED | NOT_EXECUTED |
| F20 | PARTIAL | GAP | PARTIAL |

Esta matriz reemplaza la interpretación anterior de PASS estructural cuando la
evidencia no cubría realmente el requisito completo. En particular, **F14 ya no
se considera PASS** en esta certificación porque el fixture ejecutado no incluye
una columna adicional específica.

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


### 5.2 Certificación F01-F20 — 2026-09-27

Se incorporó un ledger ejecutable de 20 registros (`f01-f20-certification.ts`) que distingue PASS, PARTIAL, GAP y NOT_EXECUTED y evita promover evidencia de reader a capacidades de mapping, validation, reconciliation o pipeline.

Evidencia reproducible dedicada observada:
- ExcelJS: run `36333990786`, SHA `ac8f8b03e256445481ee36fcb3bd56156739fc6b6`, build y suite `test:xlsx-readers` PASS.
- read-excel-file: run `36334654986`, SHA `8f4938992ee42c8c5ab4beab35a95a182164c8ed`, build y suite PASS; F09 y F20 permanecen GAP por limitaciones del proveedor.
- SheetJS: run `36334579842`, SHA `38c7c706e19cc6b5845b56920b2359f34a235f72`, suite PASS.

Esta certificación es evidencia estructural ejecutada, no certificación final F01-F20 de producción: F04, F10-F14, F16-F19 y la parte end-to-end de F20 requieren capas superiores. ExcelJS/read-excel-file continúan usando `npm install` en sus ramas experimentales por ausencia de lockfile; por tanto, la reproducibilidad de producción sigue bloqueada hasta incorporar lockfile y los demás gates.

No se selecciona parser con esta ejecución. ADR-XLSX-001 permanece pendiente de los gates restantes, incluido #152 y el análisis de supply chain #198.

### 5.2 Certificación ejecutable F01-F20 — evidencia reproducible

Se incorporó un ledger ejecutable de exactamente 20 controles F01–F20 y un workflow dedicado para ejecutarlo sin convertir un resultado parcial en PASS de producción.

Evidencia observable de CI:
- ExcelJS — run 36333990786, job 108661211656: build y suite dedicados completados con éxito. Ledger: F01/F02/F03/F05/F06/F07/F08/F09/F15 PASS; F10/F20 PARTIAL; F04/F11/F12/F13/F14/F16/F17/F18/F19 NOT_EXECUTED.
- SheetJS CE 0.20.3 — run 36335433551, job 108665260317: build y suite completados con éxito. Ledger: F01/F02/F03/F05/F06/F07/F08/F09/F15 PASS; F10/F20 PARTIAL; F04/F11/F12/F13/F14/F16/F17/F18/F19 NOT_EXECUTED.
- read-excel-file 9.3.10 — run 36334029875, job 108661324840: build y suite completados con éxito. Ledger: F01/F03/F06/F15 PASS; F09/F20 GAP; F10 PARTIAL; F02/F04/F05/F07/F08/F11/F12/F13/F14/F16/F17/F18/F19 NOT_EXECUTED.

La certificación actual es una certificación de ejecución del ledger, no una certificación de cumplimiento F01–F20 completa. F10 sólo demuestra evidencia estructural de TOTAL/SUBTOTAL; F11–F19 requieren capas de mapping/validation/reconciliation/pipeline; F20 exige provenance de extremo a extremo hasta persistencia. Por ello no se selecciona parser ni se habilita producción con esta ejecución.

Limitación de reproducibilidad: los branches experimentales ExcelJS/read-excel-file no disponen actualmente de lockfile y sus workflows dedicados usan npm install; esto queda fuera del gate de adopción productiva, que exige lockfile/dependency tree, límites de recursos, benchmark, security/maintenance review, evidencia real anonimizada y ADR.

### 5.2 Certificación ejecutable F01–F20 — 2026-09-27

Se incorporó un ledger ejecutable de los 20 casos F01–F20 y se ejecutó dentro de las suites CI dedicadas de los tres adaptadores.

| Adaptador | Commit certificado | Workflow | Resultado CI |
|---|---|---|---|
| ExcelJS | `470561f50dee36b490ffe4f6073cdbecedc27131` | run `36348234806` | PASS |
| SheetJS CE | `97e624afe4ad25d2c4b8a1dea3f5db57ee6b6bba` | run `36348236784` | PASS |
| read-excel-file | `a20daa357685dd46e415ea1730e96f5420c3bf0b` | run `36348240441` | PASS |

**Importante:** PASS de CI significa que el ledger F01–F20 fue ejecutado y que sus estados explícitos coincidieron con los estados esperados. No significa que F01–F20 estén todos en PASS.

La evidencia actual demuestra, entre otros puntos, que ExcelJS y SheetJS preservan en esta fixture House, Bultos, dirección repetida, coordenadas resueltas/no resueltas, Aduana, Consolidado, fórmula/cache y TOTAL/SUBTOTAL. F10 permanece PARTIAL porque la fixture demuestra estructura de totales, pero todavía no ejecuta la reconciliación empresarial de discrepancias. F11–F13 y F16–F19 permanecen NOT_EXECUTED porque requieren capas de mapping/validation/reconciliation/pipeline aún no ejecutadas en esta certificación. F20 permanece PARTIAL para ExcelJS/SheetJS porque la provenance del reader existe, pero todavía falta demostrar mapping transformation y persistencia end-to-end.

read-excel-file conserva evidencia básica y F06/F15 en esta ejecución, pero mantiene GAP explícito en F09 y F20 por las limitaciones del proveedor ya documentadas.

Por tanto, **no se selecciona parser y no se declara el gate F01–F20 cerrado**. La siguiente fase es ejecutar F10–F19 sobre fixtures y pipeline reales de importación/reconciliación, completar F20 end-to-end y cruzar la evidencia con #152 y los gates de supply-chain.


### 5.3 Estado de transición hacia F10-F19 — 2026-09-27

La certificación reader-level ya produce evidencia CI reproducible para los tres adapters. La siguiente frontera de ingeniería es **#247**, que eleva F10-F19 a las capas reales de mapping, validation, reconciliation y pipeline.

Los estados NOT_EXECUTED de F11-F13 y F16-F19 no se convertirán en PASS mediante fixtures o mocks aislados: cada control debe ejecutar la capa real que gobierna la regla y producir evidencia determinista. F10 requiere reconciliación real de totales; F14 debe demostrar preservación de columnas adicionales dentro del flujo de importación; F18/F19 requieren ejecución del pipeline y control explícito de identidad/versionado.

Hasta cerrar #247 y F20 end-to-end, el ledger F01-F20 se considera **ejecutado pero incompleto**, y no constituye una autorización de selección/promoción de parser.


## 5.4 Evidencia pipeline-level F10–F19 + provenance — 2026-09-27

Issue rector de ejecución: **#247**. PR de implementación: **#248**.

Se incorporó una capa neutral sobre `ImportSnapshot` que ejecuta:

`ImportSnapshot → mapping → validation → reconciliation → acceptance`

y, en paralelo:

`ImportSnapshot → provenance → persistencia/auditoría`.

La implementación se mantiene independiente del parser XLSX concreto y utiliza contratos explícitos para mapping profile/version, findings, reconciliation, acceptance, provenance y audit.

### Evidencia CI

- Workflow: `xlsx-f10-f19-pipeline-certification`
- Run: `36349196549`
- Job: `108704402043`
- Build: **PASS**
- Suite: **PASS**
- Tests: **10/10 PASS**

| Control | Evidencia ejecutada | Resultado observable |
|---|---|---|
| F10 | Reconciliación TOTAL vs detalle | discrepancia real → REQUIRES_RECONCILIATION |
| F11 | Mapping por aliases autorizados | ALIAS |
| F12 | Dos headers candidatos para campo crítico | AMBIGUOUS + fail-closed |
| F13 | Campo crítico ausente | BLOCKED |
| F14 | Columna fuera del perfil | preservada en additionalColumns |
| F16 | Valor numérico anómalo | finding bloqueante |
| F17 | Misma identidad con direcciones distintas | REQUIRES_RECONCILIATION |
| F18 | Segunda ejecución con misma identidad de idempotencia | reutilización sin duplicación |
| F19 | Mismo contenido con versión de mapping distinta | claves de ejecución distintas |
| F20 | Provenance + audit | persistencia JSONL verificable |

### Alcance de la evidencia

Esta ejecución demuestra las reglas en las capas donde realmente viven y no utiliza mocks para sustituir mapping, validation, reconciliation o pipeline.

**F20 aún no se cierra como gate productivo de persistencia operacional.** La evidencia actual demuestra persistencia de provenance/auditoría mediante un adapter append-only JSONL. Falta conectar esta evidencia con el almacenamiento operacional definitivo y demostrar la trazabilidad completa dentro de la transacción/flujo de producción.

La ejecución tampoco selecciona ExcelJS, SheetJS ni read-excel-file. Los adapters continúan aislados detrás de `WorkbookReaderPort`.

### Corrección metodológica durante la ejecución

El primer run `36349113154` falló porque el `jest.config.mjs` existente está configurado para descubrimiento E2E y no encontraba la suite específica. Se corrigió mediante una configuración Jest dedicada `jest.xlsx-pipeline.config.mjs`. No se utilizó `--passWithNoTests`.



## 5.5 Evidencia reader → pipeline — 2026-09-27

Run de certificación: `36350174196`  
Job: `108707211156`

Resultado:
- Build: **PASS**
- Certificación F10–F19: **PASS**
- Ejecución F10–F20 después de cada reader real: **PASS**
- Suite reader-to-pipeline: **22 tests PASS**

Se utilizó el mismo fixture XLSX binario para los tres adapters:

1. ExcelJS
2. SheetJS
3. read-excel-file

Flujo:

`XLSX bytes → reader real → ImportSnapshot → mapping → validation → reconciliation → acceptance`

La evidencia demuestra que los tres readers pueden alimentar el mismo contrato `ImportSnapshot` y atravesar las reglas de mapping, validation, reconciliation e idempotencia/versionado sin seleccionar todavía un candidato.

### Corrección metodológica F11

Durante la primera ejecución, el fixture declaraba `No. House` y `Cantidad` como headers válidos del campo, por lo que el mapping correctamente devolvía `EXACT`. Para certificar realmente F11, el contrato de mapping fue refinado para distinguir:

- `headers`: nombres canónicos;
- `aliases`: nombres alternativos autorizados.

La suite posterior valida `ALIAS` sobre esa distinción y quedó verde.

### Estado de F20

La ejecución reader-to-pipeline demuestra que la provenance se genera a partir del snapshot producido por cada reader. La persistencia/auditoría JSONL continúa demostrada por la suite F10–F19/F20 base.

Esto todavía **no cierra F20 como persistencia operacional productiva**. Falta la integración con el almacenamiento operacional definitivo y su comportamiento transaccional/auditable.

### Estado de selección

**No se selecciona reader.** ExcelJS, SheetJS y read-excel-file permanecen como candidatos técnicamente conformes en este tramo.



## 5.5 Reader → pipeline certification — 2026-09-27

PR **#248** extends the provider-neutral pipeline evidence to the three experimental readers without selecting one for production.

The same generated XLSX byte stream is parsed independently by:

- ExcelJS
- SheetJS CE
- read-excel-file

Each resulting `ImportSnapshot` is then passed through the same pipeline:

`reader → ImportSnapshot → mapping → validation → reconciliation → acceptance`

and F20 is exercised as:

`reader → ImportSnapshot → provenance → persisted audit evidence`.

### CI evidence

- Run: `36350210816`
- Job: `108707316027`
- Build: **PASS**
- Generic pipeline suites: **22/22 PASS**
- Reader-to-pipeline suite: **12/12 PASS**
- Three readers × four grouped executable scenarios = **12 reader-level pipeline scenarios**

The reader-level scenarios cover F10, F11, F12, F13, F14, F16, F17, F18, F19 and F20. F15 remains structurally covered by the existing reader conformance/fixture evidence.

### Defect discovered by the executable gate

The reader-to-pipeline comparison exposed a real mapping defect: the mapping layer classified every authorized header as `EXACT`. This incorrectly collapsed canonical-header and alias semantics.

The mapping engine was corrected so that:

- `spec.headers[0]` is the canonical header → `EXACT`;
- other authorized headers → `ALIAS`.

The defect was therefore detected by the executable pipeline gate and corrected rather than being masked by fixture-level assumptions.

### Security/supply-chain observation

The certification CI installation currently reports **11 dependency vulnerabilities (7 moderate, 4 high)**. This is recorded as a separate security/supply-chain gate and does not constitute a reader selection decision. No parser is promoted on the basis of this run.

### Current interpretation

This is now **reader-to-pipeline evidence**, materially stronger than reader-only evidence:

- reader fidelity is exercised before the business pipeline;
- mapping/validation/reconciliation execute against reader-produced observations;
- idempotency and mapping-version behavior execute against those snapshots;
- provenance/audit persistence executes against those snapshots.

F20 is still not closed as the final production persistence gate until the operational persistence transaction/storage integration is demonstrated.


### 5.5.1 Comparación de equivalencia semántica de snapshots — 2026-09-27

Se ejecutó el mismo binario XLSX contra los tres adapters y se compararon los `ImportSnapshot` producidos mediante el protocolo `xlsx-reader-snapshot-equivalence-v1.0.0`.

**Evidencia CI:**
- Workflow: `xlsx-f10-f19-pipeline-certification #25`
- Run: `36350685619`
- Job: `108708649846`
- Artifact: `xlsx-reader-snapshot-equivalence`
- Commit: `87aa23ab5accb55f0aac523edaa5e1e09b90fc0a`
- Build: PASS
- F10–F19 pipeline: PASS
- Reader → pipeline: PASS
- Comparación de snapshots: PASS
- Artifact de evidencia: generado correctamente

La comparación es estricta para metadata común, estructura de workbook, hojas, filas, celdas, coordenadas, headers, valores, tipos, fórmulas, resultados de fórmula y formatos. No se normalizan silenciosamente diferencias del proveedor; solamente se normalizan representaciones de `Date` y `-0` para serialización.

| Comparación | Diferencias críticas | Diferencias significativas |
|---|---:|---:|
| ExcelJS ↔ SheetJS | 0 | 35 |
| ExcelJS ↔ read-excel-file | 0 | 2 |
| SheetJS ↔ read-excel-file | 0 | 37 |

**Hallazgos:**

1. **No hubo diferencias CRÍTICAS.** Los tres lectores conservaron la misma estructura, filas, celdas, valores y tipos observados por el protocolo sobre esta fixture.
2. **SheetJS vs ExcelJS:** SheetJS expone `numberFormat = "General"` en celdas donde ExcelJS deja el campo ausente. La diferencia no alteró el pipeline de esta fixture, pero sí constituye una diferencia de fidelidad del snapshot.
3. **read-excel-file vs ExcelJS/SheetJS:** las hojas `Oculta` y `MuyOculta` fueron reportadas como `VISIBLE` por el adapter de read-excel-file. Esto confirma una pérdida de metadata de visibilidad ya anticipada por la evaluación aislada.
4. Estas diferencias **no se interpretan como selección de lector**. Se registraron en #249 para definir primero el contrato definitivo de fidelidad del `ImportSnapshot` y repetir la comparación.

**Issue de seguimiento:** #249 — resolver diferencias de fidelidad entre snapshots XLSX.


### 5.5.2 Caracterización ampliada de fidelidad — 2026-09-27

Se amplió la fixture de equivalencia para cubrir fórmula/cache, fechas, formatos numéricos, celdas vacías, errores XLSX y hojas `HIDDEN`/`VERY_HIDDEN`.

**Evidencia CI final:**
- Run: `36351926595`
- Job: `108712139941`
- Commit: `f28cd42c93974b923d1ddcbab2247498788f3c24`
- Build: PASS
- F10–F19: PASS
- Reader → pipeline: PASS
- Snapshot equivalence: PASS
- Tests totales del workflow: 30/30 PASS en las tres suites

La comparación mantiene un principio fail-closed: los gaps conocidos se registran explícitamente y la prueba falla si aparece una diferencia crítica/significativa que no esté clasificada en el baseline.

Hallazgos nuevos:

1. **ExcelJS ↔ SheetJS:** no se observaron gaps críticos salvo la representación de la celda de error de la fixture; ambos conservan fórmula, fecha y estructura. SheetJS usa `General` como formato por defecto y sus `displayedValue` reflejan el formato aplicado (`10.00`, `27/09/2026`).
2. **read-excel-file:** no conserva la fórmula como fórmula ni su `formulaResult` en el snapshot común; la celda de fórmula queda como `NUMBER`. Tampoco conserva el formato numérico de la fórmula/fecha en el contrato actual.
3. **read-excel-file:** la celda XLSX con error no se conserva como `ERROR`; en esta fixture se observa pérdida de contenido/celdas respecto de ExcelJS/SheetJS.
4. **read-excel-file:** continúa perdiendo `HIDDEN` y `VERY_HIDDEN`, reportándolas como `VISIBLE`.
5. Las diferencias `General` de SheetJS y las diferencias de representación de `displayedValue` se clasifican como diferencias significativas de representación, no como pérdida de estructura. Las pérdidas anteriores de fórmula/error/visibilidad permanecen como gaps funcionales explícitos.

El baseline de gaps conocidos quedó codificado en `reader-snapshot-equivalence.spec.ts`. Esto no convierte los gaps en PASS: solamente evita que CI confunda una limitación ya documentada con una regresión desconocida.

**Issue de seguimiento:** #249.
