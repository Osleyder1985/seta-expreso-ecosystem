# Evaluación objetiva del Backend: NestJS vs ASP.NET Core

**Versión:** 0.3.0  
**Estado:** En validación
**Issue:** #7  
**Actualización de versión:** #20  
**Fecha:** 2026-09-24

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
- .NET 10 — LTS.

Node.js 24.21.0 es además la versión disponible en el entorno Windows de referencia del proyecto. El PoC NestJS utiliza Vitest 5.0.1, alineado con el flujo ESM recomendado para NestJS 12.

## 3. Evidencia disponible

El repositorio contiene la arquitectura baseline, la matriz de evaluación, el protocolo de benchmark y los PoC reconstruidos.

No se inventan resultados:

- no se asignan puntuaciones experimentales sin medición;
- los criterios que dependan de benchmark permanecen pendientes;
- la decisión final queda abierta hasta completar la evidencia requerida.

## 4. Evaluación preliminar

| Criterio | Peso | NestJS | Evidencia | ASP.NET Core | Evidencia |
|---|---:|---|---|---|---|
| B01 Adecuación Modular/Clean/Hexagonal | 15% | Pendiente de evaluación estructural | E1/E2 | Pendiente de evaluación estructural | E1/E2 |
| B02 REST/OpenAPI | 10% | Evidencia favorable | E1/E2 | Evidencia favorable | E1/E2 |
| B03 Testabilidad | 10% | Evidencia favorable | E1/E2 | Evidencia favorable | E1/E2 |
| B04 Seguridad | 10% | Evidencia disponible | E1 | Evidencia disponible | E1 |
| B05 Rendimiento | 10% | Pendiente benchmark | E2 | Pendiente benchmark | E2 |
| B06 Mantenibilidad | 10% | Pendiente de PoC/estructura | E1/E2 | Pendiente de PoC/estructura | E1/E2 |
| B07 Ecosistema | 10% | Evidencia documental | E1/E4 | Evidencia documental | E1/E4 |
| B08 Documentación/madurez | 5% | Evidencia documental | E1 | Evidencia documental | E1 |
| B09 Productividad | 5% | Pendiente de PoC | E2 | Pendiente de PoC | E2 |
| B10 Operación/despliegue | 5% | Pendiente de experimento | E2 | Pendiente de experimento | E2 |
| B11 Costo/licencia | 5% | Analizar TCO | E1/E4 | Analizar TCO | E1/E4 |
| B12 Evolución futura | 5% | Pendiente de análisis contextual | E1/E2 | Pendiente de análisis contextual | E1/E2 |

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

La actualización de versiones no constituye una selección de backend.

La siguiente etapa es validar CI, ejecutar las pruebas locales disponibles y posteriormente ejecutar el benchmark común sobre el mismo entorno de referencia.

## 10. Referencias de evidencia

- E1 — documentación oficial de NestJS, Node.js y Microsoft consultada en septiembre de 2026.
- E2 — evidencia experimental del PoC/benchmark, pendiente de ejecución final.
- E4 — evidencia externa confiable cuando corresponda.

## 11. Trazabilidad

`#7 → #9 → #10/#12/#20 → PoC → benchmark → resultados → B01–B12 → ADR → Stack Baseline`

El PoC .NET 8 queda únicamente como referencia histórica. El experimento vigente utiliza .NET 10 LTS.

**Fin de la evaluación preliminar.**


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
