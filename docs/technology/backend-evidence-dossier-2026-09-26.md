# Dossier de evidencia — evaluación de backend

**Ecosistema:** SETA EXPRESO SURL  
**Fecha de corte:** 2026-09-26  
**Candidatos:** NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS / ASP.NET Core + .NET 10 LTS

## 1. Decisión metodológica de este corte

Este dossier consolida la evidencia ya obtenida. **No se repetirán benchmarks existentes y no se ejecutará el perfil DELETE.**

La ausencia de una nueva ejecución no invalida la evidencia histórica recuperada; sí obliga a conservar explícitamente sus límites y procedencia.

## 2. Evidencia experimental recuperada

### 2.1 Perfil LIST — Windows nativo — 2026-09-25

Configuración:
- 1000 requests
- concurrencia 20
- 20 warm-up requests
- 5 corridas
- candidatos ejecutados de forma aislada
- error_rate = 0 en las cinco corridas

Promedios de las cinco corridas:

| Métrica | NestJS | ASP.NET Core |
|---|---:|---:|
| Throughput | 3222.98 req/s | 917.92 req/s |
| p50 | 5.60 ms | 13.30 ms |
| p95 | 12.67 ms | 63.48 ms |
| Startup | 1701.58 ms | 682.06 ms |
| CPU | 0.456 s | 2.581 s |
| Working Set | 115.81 MB | 77.70 MB |
| Build | 3163.19 ms | 1583.57 ms |
| Error rate | 0% | 0% |

### 2.2 Valores por corrida

#### NestJS

| Corrida | req/s | p50 ms | p95 ms | startup ms | CPU s | WS MB | Private MB |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 3308.51 | 5.28 | 12.90 | 1683.73 | 0.4688 | 114.94 | 121.42 |
| 2 | 3215.88 | 5.43 | 12.87 | 1770.13 | 0.5156 | 115.63 | 124.43 |
| 3 | 2662.30 | 6.85 | 14.56 | 1693.52 | 0.4531 | 116.86 | 125.73 |
| 4 | 3511.41 | 5.31 | 11.20 | 1682.42 | 0.4062 | 116.24 | 125.48 |
| 5 | 3416.78 | 5.15 | 11.80 | 1677.10 | 0.4375 | 115.40 | 124.28 |

Build: 3163.19 ms en cada corrida.

#### ASP.NET Core

| Corrida | req/s | p50 ms | p95 ms | startup ms | CPU s | WS MB | Private MB |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 1022.13 | 11.89 | 49.88 | 695.50 | 2.7812 | 77.89 | 39.71 |
| 2 | 1017.98 | 12.28 | 51.28 | 674.95 | 3.0781 | 77.36 | 38.95 |
| 3 | 964.86 | 13.18 | 54.91 | 661.83 | 2.2188 | 77.42 | 38.68 |
| 4 | 993.84 | 13.35 | 51.16 | 678.03 | 2.2344 | 77.13 | 38.90 |
| 5 | 590.80 | 15.80 | 110.16 | 699.98 | 2.5938 | 78.71 | 39.07 |

Build: 1583.57 ms en cada corrida.

## 3. Validez y límites

El perfil LIST anterior se conserva como evidencia experimental válida del entorno nativo Windows de referencia. No se debe mezclar con el preanálisis anterior documentado en Issue #145 (~138 req/s NestJS frente a ~762 req/s ASP.NET Core), porque corresponde a un conjunto/configuración diferente.

Issue #145 queda como hallazgo de discrepancia histórica y no se utilizará para sustituir ni promediar el dataset de cinco corridas.

La métrica de CPU y memoria corresponde al perfil nativo Windows. No debe compararse directamente con snapshots obtenidos dentro de Docker.

## 4. Cobertura funcional del PoC

Los PoC de ambos candidatos fueron reconstruidos con equivalencia funcional y CI verificó:
- health check;
- CRUD mínimo;
- validación de entrada;
- PostgreSQL;
- transacción explícita en creación;
- manejo de errores;
- OpenAPI;
- pruebas de integración;
- build.

Evidencia adicional recuperada:
- CREATE: válido.
- LIST: válido y cuantificado con el dataset de cinco corridas.
- GET: válido.
- UPDATE: válido.
- DELETE: no forma parte de la evidencia final de este corte.

La corrección posterior del harness DELETE (#126) queda registrada como corrección histórica del runner, no como una invitación a ejecutar una nueva medición.

## 5. Estado de B01–B12

| Criterio | Estado al corte | Base |
|---|---|---|
| B01 Arquitectura modular/Clean/Hexagonal | Evaluable documental/PoC | PoC + arquitectura |
| B02 REST/OpenAPI | Evidencia favorable | PoC + CI |
| B03 Testabilidad | Evidencia favorable | tests + CI |
| B04 Seguridad | Evidencia documental/PoC; sin puntuación final | documentación + PoC |
| B05 Rendimiento | Evidencia experimental parcial | LIST nativo |
| B06 Mantenibilidad | Evaluable estructuralmente; sin puntuación final | PoC |
| B07 Ecosistema | Evidencia documental | fuentes oficiales |
| B08 Documentación/madurez | Evidencia documental | fuentes oficiales |
| B09 Productividad | Sin medición comparativa suficiente | no inventar |
| B10 Operación/despliegue | Evidencia parcial | Docker/CI/PoC |
| B11 Costo/licencia | Evaluación documental | licencias/runtime |
| B12 Evolución futura | Evaluación contextual | arquitectura + requisitos |

**Regla:** no se asignan puntuaciones 0–5 donde la evidencia trazable no sea suficiente.

## 6. Lectura técnica del benchmark LIST

El dataset de cinco corridas permite afirmar descriptivamente que, en este PoC y bajo este perfil nativo concreto, las mediciones de throughput y latencia LIST fueron distintas entre candidatos. También muestra diferencias en startup, build y consumo de memoria.

Estas cifras describen el comportamiento de las implementaciones evaluadas; no deben interpretarse como una propiedad universal de todos los sistemas NestJS o ASP.NET Core.

El dataset tampoco permite por sí solo concluir B01–B12 completos ni reemplaza criterios arquitectónicos, de seguridad, mantenibilidad, operación, costo o evolución.

## 7. Estado de la decisión

**No cerrada todavía por este dossier.**

La evidencia experimental existente se conserva sin repetir pruebas. El siguiente paso de evaluación consiste en integrar esta evidencia con la evidencia documental y estructural ya disponible y determinar, criterio por criterio, cuáles pueden recibir puntuación trazable y cuáles deben permanecer como **No evaluado**.

No se ejecutará DELETE como condición artificial para continuar.

## 8. Trazabilidad

- Matriz: Issue #5 / PR #6.
- Evaluación backend: Issue #7 / documentación v0.3.1.
- PoC: PR #9.
- Actualización de versiones: PR #20 y PR #21.
- Benchmark nativo: PR #28.
- Corrección del harness DELETE: PR #126.
- Discrepancia histórica LIST: Issue #145.
- Cierre de ronda tecnológica por estado de evidencia: PR #154.
- Reproducibilidad PostgreSQL preparada en PR #155; no constituye nueva evidencia experimental.


## 9. Integración criterio por criterio — corte 2026-09-26

Esta sección aplica la escala 0–5 únicamente cuando existe evidencia trazable suficiente. No convierte automáticamente diferencias de benchmark en una decisión de arquitectura.

### 9.1 Matriz de puntuación trazable

| Criterio | Peso | NestJS | Evidencia / justificación | Confianza | ASP.NET Core | Evidencia / justificación | Confianza |
|---|---:|---:|---|---|---:|---|---|
| B01 Arquitectura modular/Clean/Hexagonal | 15% | 3/5 | E1/E2: soporte de módulos/DI y PoC funcional; el PoC no implementa todavía una separación Clean/Hexagonal completa | Media | 3/5 | E1/E2: DI y PoC funcional; el PoC tampoco implementa todavía una separación Clean/Hexagonal completa | Media |
| B02 REST/OpenAPI | 10% | 4/5 | E1/E2: REST funcional, Swagger/OpenAPI generado y validado en PoC | Alta | 4/5 | E1/E2: Minimal API REST, Swagger/OpenAPI y endpoints funcionales | Alta |
| B03 Testabilidad | 10% | 4/5 | E2: pruebas E2E/integración y CI; PoC diseñado para prueba | Alta | 4/5 | E2: proyecto de pruebas y CI; PoC diseñado para prueba | Alta |
| B04 Seguridad | 10% | 2/5 | E1/E2: validación global y manejo uniforme de errores; no existe todavía autenticación/autorización ni hardening completo en el PoC | Media | 2/5 | E1/E2: validación y manejo uniforme de errores; no existe todavía autenticación/autorización ni hardening completo en el PoC | Media |
| B05 Rendimiento | 10% | 4/5 | E2: LIST nativo, 5 corridas, 0% errores; 3222.98 req/s promedio, p50 5.60 ms, p95 12.67 ms | Alta | 3/5 | E2: LIST nativo, 5 corridas, 0% errores; 917.92 req/s promedio, p50 13.30 ms, p95 63.48 ms | Alta |
| B06 Mantenibilidad | 10% | 3/5 | E2: módulos, DTOs, servicio y controlador separados; todavía no existe arquitectura Clean/Hexagonal completa en el PoC | Media | 3/5 | E2: endpoint/service/store en PoC; todavía no existe arquitectura Clean/Hexagonal completa | Media |
| B07 Ecosistema | 10% | 4/5 | E1: ecosistema oficial amplio de módulos, testing, OpenAPI, seguridad, observabilidad y acceso a datos | Alta | 4/5 | E1: plataforma oficial amplia con DI, OpenAPI, testing, health checks y ecosistema .NET | Alta |
| B08 Documentación/madurez | 5% | 4/5 | E1: documentación oficial amplia y versión baseline fijada | Alta | 4/5 | E1: documentación oficial de .NET/ASP.NET Core y baseline .NET 10 LTS | Alta |
| B09 Productividad | 5% | No evaluado | No existe medición homogénea de tiempo/effort para implementar la vertical | — | No evaluado | No existe medición homogénea de tiempo/effort para implementar la vertical | — |
| B10 Operación/despliegue | 5% | 3/5 | E2: Dockerfile, compose, health check y configuración por entorno en PoC/CI | Media | 3/5 | E2: Dockerfile, compose, health check y configuración por entorno en PoC/CI | Media |
| B11 Costo/licencia | 5% | 4/5 | E1: framework/runtime y tooling base sin costo de licencia para el escenario; TCO operativo aún no medido | Media | 4/5 | E1: runtime/framework base sin costo de licencia para el escenario; TCO operativo aún no medido | Media |
| B12 Evolución futura | 5% | 4/5 | E1/E2: modularidad, TypeScript, OpenAPI y extensibilidad; riesgo aún depende de arquitectura definitiva | Media | 4/5 | E1/E2: DI, Minimal APIs/OpenAPI y ecosistema .NET; riesgo aún depende de arquitectura definitiva | Media |

### 9.2 Criterios que permanecen abiertos

**B09 Productividad** permanece explícitamente como **No evaluado**. No se utilizará una impresión subjetiva de velocidad de desarrollo como sustituto de una medición homogénea.

**B01, B04, B06, B10, B11 y B12** tienen puntuación provisional trazable, pero con confianza Media porque el PoC no representa todavía el sistema productivo completo.

**B05** tiene evidencia cuantitativa suficiente para una puntuación provisional del perfil LIST concreto. Esta puntuación no representa una propiedad universal del framework.

### 9.3 Resultado cuantitativo parcial

La matriz vigente exige que los pesos sumen 100%, pero B09 permanece sin evidencia cuantitativa homogénea. Por ello se publican dos valores distintos y explícitamente etiquetados:

1. **Puntaje ponderado observado sobre criterios evaluados (95% de cobertura):**
   - NestJS: **66.00 puntos ponderados sobre 100 de peso total disponible**.
   - ASP.NET Core: **64.00 puntos ponderados sobre 100 de peso total disponible**.

2. **Índice normalizado de cobertura evaluada (no es el resultado final de la matriz):**
   - NestJS: **69.47 / 100**.
   - ASP.NET Core: **67.37 / 100**.

La segunda cifra se obtiene dividiendo el puntaje ponderado observado entre el 95% de peso efectivamente evaluado. Su única finalidad es mostrar el estado de la evidencia disponible; **no constituye una puntuación final ni una recomendación de selección**.

No se imputan los 5 puntos porcentuales de B09 a ningún candidato. No se inventa una puntuación de productividad ni se redistribuye su peso.

**Consecuencia:** todavía no corresponde cerrar la decisión mediante la puntuación 0–100 oficial. La diferencia cuantitativa observada queda registrada como evidencia parcial, pero debe interpretarse junto con riesgos, criterios eliminatorios y evidencia cualitativa.

### 9.4 Resolución metodológica de B09

No se ejecutará un nuevo experimento para medir productividad.

A la fecha de corte no existe un registro homogéneo de horas/personas, tareas equivalentes, commits normalizados o tiempo de implementación comparable entre los dos PoC que permita asignar B09 con rigor.

Por tanto, B09 se declara **No evaluado en esta ronda** y queda como una **excepción explícita de evidencia**, no como un cero.

Esta decisión preserva la integridad de la matriz: ausencia de evidencia ≠ bajo desempeño.

Para futuras evaluaciones, B09 podrá medirse mediante un protocolo previamente definido, por ejemplo:
- mismas historias/tareas;
- mismo alcance funcional;
- criterios de aceptación idénticos;
- tiempo de implementación registrado;
- número y complejidad de cambios controlados;
- defectos introducidos y corregidos;
- revisión independiente de mantenibilidad.

No se utilizará retrospectivamente una estimación subjetiva para llenar la celda actual.

### 9.5 Lectura técnica del resultado parcial

Con los criterios actualmente puntuables, ambos candidatos muestran una base técnica suficiente para continuar la evaluación. Las puntuaciones son muy cercanas en los criterios documentales/estructurales; la principal diferencia cuantitativa procede de B05, cuyo experimento LIST favoreció a NestJS en throughput y latencia, mientras ASP.NET Core mostró ventajas en startup, build y memoria.

Este resultado **no debe transformarse por sí solo en una decisión de backend**. La decisión final requiere además consolidar los riesgos, bloqueadores, requisitos operativos y la arquitectura objetivo.

### 9.6 Criterios eliminatorios

No se ha identificado, con la evidencia disponible al corte, un incumplimiento eliminatorio de ninguno de los dos candidatos respecto a los requisitos backend establecidos.

Esto no equivale a una certificación de seguridad productiva: la autenticación, autorización, gestión de secretos, hardening, threat modeling y pruebas de seguridad todavía pertenecen a la fase de diseño/implementación productiva.

## 10. Evidencia documental externa incorporada

La documentación oficial vigente confirma que Nest organiza aplicaciones mediante módulos y ofrece validación, OpenAPI y capacidades de seguridad; además, Nest 12.1 incorpora API de security headers. Para ASP.NET Core, Microsoft documenta DI como capacidad integrada y .NET 10 incorpora soporte integrado para generación de OpenAPI 3.1. Estas fuentes respaldan B01/B02/B04/B07/B08, pero no sustituyen las pruebas del PoC.

Fuentes:
- NestJS Modules / Validation / OpenAPI / Security.
- Microsoft Learn — ASP.NET Core dependency injection / OpenAPI .NET 10.

## 11. Nuevo estado de evaluación

**Estado: EVALUACIÓN CUANTITATIVA PARCIAL, DECISIÓN ABIERTA.**

La evaluación ya no está en el estado anterior de «benchmark pendiente». Existe evidencia experimental histórica válida para LIST y una primera puntuación trazable para los criterios con evidencia suficiente.

No se repetirán benchmarks existentes ni se ejecutará DELETE para completar artificialmente la matriz.

**Siguiente condición de cierre:** resolver B09 mediante evidencia de productividad o declarar formalmente que B09 no es necesario para esta decisión y aprobar esa excepción mediante la gobernanza del proyecto. A continuación se podrá calcular el resultado ponderado sin ocultar criterios ausentes.

**Fin de la actualización del dossier v0.2.0.**


### 9.7 Análisis de riesgos y condiciones de cierre

La matriz de riesgos se interpreta contra los requisitos reales del Ecosistema y contra la evidencia disponible al 2026-09-26. Un riesgo no se convierte en bloqueador por su sola existencia; el criterio eliminatorio exige incompatibilidad crítica sin mitigación razonable.

| Riesgo | NestJS | ASP.NET Core | Evidencia / tratamiento |
|---|---|---|---|
| Seguridad incompleta del PoC | Medio | Medio | E2: ambos validan entrada y manejan errores, pero aún no implementan autenticación/autorización, gestión de secretos, hardening y threat modeling productivos. Debe resolverse en diseño de seguridad. |
| Disciplina Clean/Hexagonal | Medio | Medio | E1/E2: ambos soportan la separación requerida, pero el PoC no la materializa completamente. La mitigación es imponer la arquitectura en el código productivo y sus reglas de dependencia. |
| Incertidumbre causal del rendimiento | Medio | Medio | E2: existe un LIST de cinco corridas válido; Issue #145 conserva una discrepancia histórica de otro conjunto. No se mezclan datasets y no se repite el benchmark. B05 se limita al perfil medido. |
| Rendimiento bajo cargas no ensayadas | Medio | Medio | E2: el benchmark cubre LIST, no la totalidad de manifiestos, importación XLSX, geocodificación, rutas ni concurrencia productiva. Se mitiga con pruebas específicas cuando cada funcionalidad crítica llegue a integración. |
| Complejidad operacional | Bajo/Medio | Bajo/Medio | E2: ambos PoC tienen Docker, health check y configuración por entorno. No existe evidencia de una complejidad operativa crítica. |
| Lock-in tecnológico | Bajo | Bajo | E1/E2: REST/OpenAPI, PostgreSQL y SQL permiten mantener límites relativamente independientes del framework. La arquitectura por puertos/adaptadores reduce acoplamiento. |
| Obsolescencia de runtime/framework | Bajo | Bajo | E1: baseline en Node 24 LTS/Nest 12.1 y .NET 10 LTS. Debe mantenerse política de versiones estables compatibles. |
| Dependencia del ecosistema de paquetes | Medio | Bajo/Medio | E1/E2: ambos dependen de ecosistemas externos; la mitigación es fijar versiones, auditar dependencias, CI y actualización controlada. No se ha identificado una dependencia externa crítica específica que bloquee. |
| Costo/licencia | Bajo | Bajo | E1: no se identifica licencia de framework/runtime que constituya un bloqueador; TCO operativo completo aún no medido. |
| Migración posterior | Bajo/Medio | Bajo/Medio | E5: inferencia técnica condicionada a mantener contratos REST/OpenAPI y límites de dominio. No hay una migración prevista ahora. |

### 9.8 Verificación de criterios eliminatorios

Con la evidencia disponible al corte, **ninguno de los dos candidatos activa un criterio eliminatorio**.

Verificación:

- **Entorno:** ambos PoC funcionan en el entorno Windows de referencia; no existe incompatibilidad conocida.
- **PostgreSQL/PostGIS:** ambos utilizan PostgreSQL en el PoC y el acceso SQL permite integrar PostGIS. No se ha identificado una imposibilidad técnica.
- **API para Web/Mobile:** ambos exponen REST/OpenAPI y, por tanto, satisfacen el mecanismo de integración requerido.
- **Licencia:** no se ha identificado incompatibilidad de licencia para el escenario.
- **Funciones críticas:** ninguno presenta una imposibilidad demostrada para manifiestos, paquetes, direcciones, geocodificación, rutas o integración con clientes externos. Estas capacidades todavía deben implementarse en el backend productivo, pero su ausencia en el PoC no constituye incapacidad del framework.
- **Seguridad:** existe una brecha de implementación productiva, pero no un riesgo crítico demostrado sin mitigación razonable. Autenticación, autorización, secretos, hardening y pruebas de seguridad siguen siendo requisitos de diseño.
- **Servicios externos:** los candidatos no dependen intrínsecamente de un proveedor externo específico para funcionar.

**Conclusión de eliminatorios:** ambos permanecen técnicamente viables para continuar la evaluación.

### 9.9 Interpretación de la evidencia para la decisión

El conjunto de evidencia permite reducir la incertidumbre principal de la evaluación:

1. **No existe un bloqueador técnico demostrado para ninguno de los dos candidatos.**
2. **B05 ya no está vacío:** existe evidencia LIST nativa de cinco corridas y 0% de errores.
3. **La evidencia B05 es específica del PoC y perfil medido**, por lo que no se extrapola automáticamente a importación XLSX, geocodificación, routing ni cargas productivas.
4. **B09 permanece No evaluado** y no se rellenará mediante estimación retrospectiva.
5. La diferencia observada de rendimiento no compensa ni invalida por sí sola los demás criterios.
6. La decisión debe considerar especialmente la arquitectura objetivo, seguridad productiva, operación y capacidad de evolución del Ecosistema.

Por tanto, el estado correcto al corte es:

> **EVALUACIÓN PARCIAL CON AMBAS ALTERNATIVAS VIABLES; DECISIÓN DE BACKEND ABIERTA.**

La siguiente acción de gobernanza no es repetir el benchmark ni ejecutar DELETE. Es determinar si la evidencia existente es suficiente para una decisión contextual o si se requiere únicamente completar una justificación/ADR que acepte explícitamente B09 como no evaluado.

### 9.10 Regla de no repetición

Queda establecida para esta ronda:

- no repetir el benchmark LIST;
- no ejecutar el benchmark DELETE;
- no sustituir el dataset recuperado por resultados posteriores de una ejecución fallida;
- no mezclar el dataset de cinco corridas con el dataset histórico descrito en Issue #145;
- no presentar los índices parciales 69.47/100 y 67.37/100 como puntuaciones finales;
- no declarar un ganador por diferencia numérica aislada.


## 12. Comparación de adecuación al Ecosistema SETA EXPRESO

Esta sección cambia el foco desde la capacidad genérica del framework hacia la adecuación concreta al backend definido para SETA EXPRESO.

### 12.1 Requisitos arquitectónicos de referencia

El backend debe soportar, como mínimo:

- Modular Monolith como estrategia inicial.
- separación Domain / Application / Infrastructure.
- puertos y adaptadores para persistencia y proveedores externos.
- API REST/OpenAPI como frontera para Web, Android e iOS.
- PostgreSQL/PostGIS.
- importación y procesamiento de manifiestos XLSX.
- gestión de manifiestos y paquetes.
- normalización y geocodificación de direcciones.
- rutas y entregas.
- operación con conectividad limitada en los clientes.
- autenticación/autorización.
- auditoría.
- observabilidad.
- evolución progresiva sin introducir microservicios prematuramente.

### 12.2 Comparación arquitectónica

| Dimensión | NestJS | ASP.NET Core | Lectura para SETA |
|---|---|---|---|
| Modular Monolith | Compatible | Compatible | Empate técnico |
| Domain/Application/Infrastructure | Compatible | Compatible | Depende de disciplina arquitectónica, no del framework |
| Puertos/adaptadores | Compatible mediante interfaces/providers | Compatible mediante interfaces/DI | Empate técnico |
| REST/OpenAPI | Evidencia PoC favorable | Evidencia PoC favorable | Empate técnico |
| PostgreSQL | Evidencia PoC | Evidencia PoC | Empate técnico |
| PostGIS | Acceso SQL disponible; ORM no debe ocultar capacidades espaciales | Acceso SQL disponible; ORM no debe ocultar capacidades espaciales | Empate técnico |
| XLSX/importación | No existe bloqueo técnico demostrado | No existe bloqueo técnico demostrado | Debe desacoplarse como caso de uso + adaptador |
| Geocoding/routing | Integrable mediante puertos/adaptadores | Integrable mediante puertos/adaptadores | Empate técnico |
| Web + Android + iOS | REST/OpenAPI | REST/OpenAPI | Empate técnico |
| Auditoría/observabilidad | Integrable | Integrable | Empate técnico |
| Evolución a servicios independientes | Posible si aparece necesidad | Posible si aparece necesidad | No requiere microservicios hoy |
| Rendimiento LIST medido | 3222.98 req/s; p50 5.60 ms; p95 12.67 ms | 917.92 req/s; p50 13.30 ms; p95 63.48 ms | Evidencia favorable a NestJS en este perfil |
| Startup | 1701.58 ms | 682.06 ms | Evidencia favorable a ASP.NET Core |
| Build | 3163.19 ms | 1583.57 ms | Evidencia favorable a ASP.NET Core |
| Working Set | 115.81 MB | 77.70 MB | Evidencia favorable a ASP.NET Core |
| Integración con stack Web TypeScript | Directa | Requiere frontera HTTP y separación de lenguajes | NestJS reduce heterogeneidad del stack |
| Coherencia con TypeScript end-to-end | Alta | Menor; backend .NET + frontend TypeScript | Ventaja contextual de NestJS, sin convertirla en puntuación automática |
| Complejidad inicial | Adecuada | Adecuada | Ninguno exige arquitectura distribuida |

### 12.3 Interpretación

La comparación revela que **la diferencia decisiva no está en la capacidad arquitectónica fundamental**: ambos candidatos pueden implementar el baseline arquitectónico.

La diferencia contextual aparece en la combinación de:

1. **stack homogéneo con TypeScript** para Web y backend;
2. **PoC ya construido y validado** sobre la vertical mínima;
3. **evidencia LIST favorable a NestJS** en throughput y latencia;
4. ausencia de un requisito del Ecosistema que obligue específicamente a .NET;
5. ausencia de un criterio eliminatorio para NestJS;
6. menor heterogeneidad tecnológica si el backend permanece en TypeScript.

Las ventajas medidas de ASP.NET Core —startup, build y working set— son reales y deben conservarse como parte de la evidencia. Sin embargo, ninguna de ellas aparece, con los requisitos actuales, como una restricción que el Ecosistema necesite optimizar por encima del comportamiento de las APIs de negocio.

### 12.4 Requisitos que todavía pueden cambiar la decisión

La decisión debe permanecer reversible hasta que se validen estos puntos del backend productivo:

- seguridad e identidad;
- arquitectura Clean/Hexagonal real, no solo el PoC;
- importación XLSX integrada con el modelo de dominio;
- geocodificación real sobre direcciones cubanas;
- routing;
- PostGIS;
- auditoría;
- observabilidad;
- operación con los recursos reales disponibles.

Si alguno de estos experimentos revela una incompatibilidad crítica o una diferencia operacional material, deberá abrirse un ADR de revisión.

## 13. Determinación técnica de esta ronda

Con la evidencia disponible y sin repetir experimentos:

**La alternativa que presenta mejor adecuación contextual al baseline actual es NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS.**

La determinación se fundamenta en la combinación de evidencia, no en un único benchmark:

- no existe criterio eliminatorio;
- B01/B02/B03/B06/B07/B08/B10/B11/B12 son equivalentes o prácticamente equivalentes en la evidencia disponible;
- B05 aporta evidencia experimental favorable a NestJS en el perfil LIST;
- el stack del ecosistema ya utiliza TypeScript en Web y Flutter/Dart en Mobile, por lo que el backend TypeScript reduce la heterogeneidad del lado Web/backend;
- el baseline arquitectónico es compatible con NestJS sin introducir microservicios, serverless ni infraestructura distribuida;
- ASP.NET Core conserva ventajas objetivas en startup, build y memoria, pero no se ha demostrado que sean requisitos críticos del Ecosistema.

**Importante:** esta determinación es una decisión técnica contextual de esta ronda, no una afirmación universal de que NestJS sea superior a ASP.NET Core.

### 13.1 B09 y gobernanza

B09 Productividad permanece **No evaluado**.

No se utilizará como cero ni se inventará una estimación. Para cerrar la decisión, se propone registrar explícitamente una excepción de gobernanza:

> B09 no es necesario para discriminar la decisión actual porque la determinación se sostiene con los demás criterios evaluados y evidencia E1/E2, incluyendo un benchmark real y la adecuación arquitectónica al Ecosistema. La ausencia de B09 debe quedar visible en el ADR.

Esta excepción no debe reutilizarse automáticamente para futuras comparaciones tecnológicas.

### 13.2 Condición de reversibilidad

La adopción de NestJS no elimina ASP.NET Core como alternativa tecnológica válida. Queda registrado como alternativa descartada para el backend inicial por adecuación contextual, no por incompatibilidad.

La decisión podrá revisarse si aparece evidencia que cambie alguno de estos supuestos:

- requisito funcional no cubierto;
- incompatibilidad PostgreSQL/PostGIS;
- problema crítico de seguridad;
- limitación operacional material;
- necesidad de despliegue o escalabilidad que no pueda resolverse razonablemente con el Modular Monolith;
- evidencia integrada de rendimiento significativamente diferente en cargas críticas reales;
- cambio sustancial del stack o de las restricciones operativas.

## 14. Estado de cierre propuesto

**Backend inicial propuesto: NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS.**

Estado de la evaluación:

**DECISIÓN TÉCNICA PROPUESTA — PENDIENTE DE ADR Y APROBACIÓN/INTEGRACIÓN EN STACK BASELINE.**

No se requiere repetir LIST ni ejecutar DELETE para producir esta determinación.
