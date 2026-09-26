# Evaluación objetiva del Backend: NestJS vs ASP.NET Core

**Versión:** 0.3.2  
**Estado:** Evaluación cuantitativa parcial — decisión abierta
**Issue:** #7  
**Actualización de versión:** #20  
**Entorno de referencia:** `docs/technology/backend-benchmark-environment-2026-09-25.md`  
**Fecha:** 2026-09-25

## 1. Objetivo

Aplicar la matriz oficial de evaluación tecnológica al backend del Ecosistema SETA EXPRESO SURL.

Los candidatos del experimento vigente son:

- **NestJS 12.1.0 + TypeScript + Node.js 24.21.0 LTS**
- **ASP.NET Core + .NET 10 LTS**

La evaluación no selecciona un backend por anticipado. Se separa la evidencia documental de la evidencia experimental.

## 2. Baseline de versiones

Las versiones fueron verificadas contra fuentes actuales antes de actualizar el PoC:

- @nestjs/core 12.1.0 — etiqueta latest.
- @nestjs/common 12.1.0.
- @nestjs/platform-express 12.1.0.
- @nestjs/swagger 12.0.1.
- @nestjs/cli 12.0.5.
- Node.js 24.21.0 — LTS.
- Node.js 26.10.0 — Current; no se utiliza como baseline LTS del experimento.
- TypeScript 6.0.3 — fijado para el candidato NestJS por compatibilidad del tooling.
- .NET 10 — LTS.

Node.js 24.21.0 es además la versión disponible en el entorno Windows de referencia del proyecto. El PoC NestJS utiliza Vitest 5.0.1, alineado con el flujo ESM recomendado para NestJS 12.

## 3. Evidencia disponible

La evaluación incorpora ahora evidencia histórica real del benchmark nativo Windows del 2026-09-25, consolidada en el dossier:

`docs/technology/backend-evidence-dossier-2026-09-26.md`

No se repetirán benchmarks existentes ni se ejecutará DELETE en esta ronda.

Evidencia funcional recuperada:
- CREATE: válido.
- LIST: válido y cuantificado.
- GET: válido.
- UPDATE: válido.
- DELETE: excluido de la evidencia final de esta ronda; la corrección posterior del harness queda registrada como corrección histórica.
- CI/PoC: health check, validación, PostgreSQL, transacción explícita, manejo de errores, OpenAPI, pruebas de integración y build.

### 3.1 LIST nativo Windows — 2026-09-25

Configuración: 1000 requests, concurrencia 20, 20 warm-up, 5 corridas, candidatos aislados, error_rate 0%.

| Métrica | NestJS | ASP.NET Core |
|---|---:|---:|
| Throughput promedio | 3222.98 req/s | 917.92 req/s |
| p50 promedio | 5.60 ms | 13.30 ms |
| p95 promedio | 12.67 ms | 63.48 ms |
| Startup promedio | 1701.58 ms | 682.06 ms |
| CPU promedio | 0.456 s | 2.581 s |
| Working Set promedio | 115.81 MB | 77.70 MB |
| Build | 3163.19 ms | 1583.57 ms |
| Error rate | 0% | 0% |

Estas cifras son evidencia del PoC y perfil nativo concreto. No representan propiedades universales de los frameworks.

### 3.2 Limitaciones

Issue #145 conserva una discrepancia histórica de otro conjunto de medición (~138 req/s frente a ~762 req/s). Ese dataset no se mezcla ni se utiliza para sustituir el de cinco corridas. La causalidad de la discrepancia histórica permanece como incertidumbre documental, no como motivo para repetir pruebas.

La CPU y memoria nativas no deben compararse directamente con snapshots Docker.

## 4. Evaluación criterio por criterio

| Criterio | Peso | NestJS | ASP.NET Core |
|---|---:|---:|---:|
| B01 Arquitectura modular/Clean/Hexagonal | 15% | 3/5 | 3/5 |
| B02 REST/OpenAPI | 10% | 4/5 | 4/5 |
| B03 Testabilidad | 10% | 4/5 | 4/5 |
| B04 Seguridad | 10% | 2/5 | 2/5 |
| B05 Rendimiento | 10% | 4/5 | 3/5 |
| B06 Mantenibilidad | 10% | 3/5 | 3/5 |
| B07 Ecosistema | 10% | 4/5 | 4/5 |
| B08 Documentación/madurez | 5% | 4/5 | 4/5 |
| B09 Productividad | 5% | No evaluado | No evaluado |
| B10 Operación/despliegue | 5% | 3/5 | 3/5 |
| B11 Costo/licencia | 5% | 4/5 | 4/5 |
| B12 Evolución futura | 5% | 4/5 | 4/5 |

Las puntuaciones son provisionales y trazables; B09 permanece explícitamente sin evaluar. El detalle de evidencia, confianza, riesgos y límites está en el dossier de evidencia.

### 4.1 Resultado cuantitativo parcial

Cobertura evaluada: 95% del peso.

- Puntaje ponderado observado: NestJS **66.00**, ASP.NET Core **64.00**.
- Índice normalizado de cobertura: NestJS **69.47/100**, ASP.NET Core **67.37/100**.

Estos índices **no son puntuaciones finales** de la matriz y no constituyen un ranking automático. No se redistribuye el 5% de B09.

### 4.2 Criterios eliminatorios

Con la evidencia disponible no se ha identificado un incumplimiento eliminatorio para ninguno de los candidatos respecto de entorno Windows, PostgreSQL/PostGIS, integración REST con Web/Mobile, licencia o capacidad funcional crítica.

La ausencia actual de autenticación/autorización y hardening productivo en ambos PoC es una brecha de implementación, no un bloqueador demostrado del framework.

### 4.3 Riesgos principales

- Seguridad productiva: **Medio** para ambos.
- Disciplina Clean/Hexagonal: **Medio** para ambos.
- Incertidumbre causal del benchmark histórico: **Medio** para ambos; no afecta la validez del dataset de cinco corridas.
- Rendimiento fuera de LIST: **Medio** para ambos por cobertura experimental limitada.
- Complejidad operacional: **Bajo/Medio** para ambos.
- Lock-in: **Bajo** para ambos bajo REST/OpenAPI + PostgreSQL + puertos/adaptadores.
- Obsolescencia: **Bajo** para ambos con el baseline actual.
- Costo/licencia: **Bajo** como riesgo de licencia; TCO completo aún no medido.

## 5. Hipótesis

### H01 — Adecuación arquitectónica

Ambas alternativas deben poder implementar:

- Modular Monolith;
- separación Domain / Application / Infrastructure;
- puertos y adaptadores;
- API-first;
- PostgreSQL/PostGIS;
- integración con proveedores externos sin acoplamiento del dominio.

### H02 — Productividad

Debe medirse el tiempo necesario para implementar la misma vertical funcional en ambos candidatos, manteniendo criterios equivalentes.

### H03 — Rendimiento

Debe medirse el comportamiento bajo carga controlada y reproducible.

### H04 — Operación

Ambos candidatos deben producir una imagen Docker reproducible y ejecutar:

- health check;
- configuración por variables de entorno;
- conexión PostgreSQL;
- transacciones;
- pruebas;
- documentación OpenAPI.

## 6. Benchmark

El benchmark utiliza la misma especificación funcional y el mismo esquema PostgreSQL.

Debe registrar como mínimo:

- build;
- startup/readiness;
- memoria;
- CPU;
- throughput;
- p50;
- p95;
- error rate;
- duración de tests;
- versiones;
- configuración;
- commit evaluado.

## 7. Entorno de referencia

Windows 11 Pro:

- Intel Core i7-13700H;
- 16 GB RAM;
- NVIDIA GeForce RTX 4080 Laptop GPU.

La GPU no se considera relevante para el benchmark inicial.

El entorno debe registrar además:

- Node.js;
- NestJS;
- .NET SDK/runtime;
- ASP.NET Core;
- PostgreSQL;
- Docker;
- configuración de CPU/memoria;
- comandos ejecutados.

## 8. Criterios de validez

Un resultado experimental será válido solamente si:

1. el experimento es reproducible;
2. las implementaciones son funcionalmente equivalentes;
3. las versiones están registradas;
4. el entorno está registrado;
5. los comandos están registrados;
6. las mediciones están disponibles;
7. las limitaciones están documentadas.

## 9. Estado de decisión

**PENDIENTE.**

La actualización de versiones no constituye una selección de backend. El candidato NestJS queda fijado para el experimento como NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS. La alternativa ASP.NET Core permanece en .NET 10 LTS.

La siguiente etapa es validar CI, ejecutar las pruebas locales disponibles y posteriormente ejecutar el benchmark común sobre el mismo entorno de referencia.

## 10. Referencias de evidencia

- E1 — documentación oficial de NestJS, Node.js y Microsoft consultada en septiembre de 2026.
- E2 — evidencia experimental del PoC/benchmark, pendiente de ejecución final.
- E4 — evidencia externa confiable cuando corresponda.

## 11. Trazabilidad

`#7 → #9 → #10/#12/#20 → PoC → benchmark → resultados → B01–B12 → ADR → Stack Baseline`

El PoC .NET 8 queda únicamente como referencia histórica. El experimento vigente utiliza .NET 10 LTS.

**Fin de la evaluación preliminar v0.3.1.**


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
