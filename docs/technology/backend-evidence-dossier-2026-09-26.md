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

No se publica un total 0–100 todavía.

La razón es metodológica: B09 carece de puntuación y la matriz vigente no define una regla de renormalización de pesos para criterios No evaluado. Renormalizar ahora cambiaría el significado del 100% y podría aparentar una completitud que todavía no existe.

Por tanto, el estado correcto es:

- **Puntuaciones trazables:** B01–B08 y B10–B12.
- **No evaluado:** B09.
- **Benchmark experimental disponible:** B05, únicamente perfil LIST nativo.
- **Decisión final:** abierta.

### 9.4 Observación importante sobre B05

La diferencia observada en LIST es material dentro de este experimento: NestJS registró mayor throughput y menores p50/p95, mientras ASP.NET Core registró menor startup, menor build y menor working set.

Esto debe interpretarse como evidencia del PoC y de este entorno/configuración. No se transforma en una afirmación general sobre NestJS frente a ASP.NET Core.

### 9.5 Criterios eliminatorios

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
