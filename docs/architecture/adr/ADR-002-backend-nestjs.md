# ADR-002 — Backend inicial con NestJS

**Estado:** Propuesto  
**Fecha:** 2026-09-26  
**Decisión:** NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS  
**Alternativa evaluada:** ASP.NET Core + .NET 10 LTS  
**Ecosistema:** SETA EXPRESO SURL

## 1. Contexto

SETA EXPRESO requiere un backend central para Web, Android e iOS, inicialmente organizado como Modular Monolith y con separación Domain / Application / Infrastructure, puertos/adaptadores, REST/OpenAPI, PostgreSQL/PostGIS, integraciones externas desacopladas, seguridad, auditoría y observabilidad.

Se evaluaron NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS y ASP.NET Core + .NET 10 LTS.

La evaluación utiliza evidencia documental y PoC, incluyendo el benchmark LIST nativo Windows del 2026-09-25. Por decisión metodológica del proyecto, no se repite el benchmark y no se ejecuta DELETE.

## 2. Evidencia relevante

Benchmark LIST, 5 corridas, 1000 requests, concurrencia 20, 20 warm-up, error rate 0%:

| Métrica | NestJS | ASP.NET Core |
|---|---:|---:|
| Throughput promedio | 3222.98 req/s | 917.92 req/s |
| p50 | 5.60 ms | 13.30 ms |
| p95 | 12.67 ms | 63.48 ms |
| Startup | 1701.58 ms | 682.06 ms |
| Build | 3163.19 ms | 1583.57 ms |
| Working Set | 115.81 MB | 77.70 MB |

El resultado es específico del PoC y del perfil medido.

Los dos candidatos demostraron capacidad para REST/OpenAPI, validación, PostgreSQL, transacciones, manejo de errores, health check, pruebas de integración y build.

No se identificó ningún criterio eliminatorio.

## 3. Decisión

Se propone utilizar **NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS** como backend inicial del Ecosistema.

La decisión se basa en la combinación de:

1. adecuación al Modular Monolith y a la separación Clean/Hexagonal prevista;
2. evidencia funcional del PoC;
3. evidencia de rendimiento favorable en el perfil LIST medido;
4. integración natural con TypeScript en la capa Web;
5. menor heterogeneidad tecnológica entre Web y backend;
6. compatibilidad con PostgreSQL/PostGIS mediante acceso SQL controlado;
7. ausencia de un requisito del Ecosistema que obligue específicamente a ASP.NET Core;
8. ausencia de criterios eliminatorios.

ASP.NET Core conserva ventajas objetivas en startup, build y working set, pero no se ha demostrado que esas ventajas sean restricciones críticas para las cargas actuales del Ecosistema.

## 4. B09 — Productividad

B09 permanece **No evaluado**.

No se asigna cero ni se estima retrospectivamente. Se propone una excepción explícita: B09 no es necesario para discriminar esta decisión porque existe evidencia suficiente en los demás criterios evaluados y una evidencia experimental real de rendimiento.

Esta excepción es específica de esta decisión y no establece una regla para futuras evaluaciones.

## 5. Consecuencias

### Positivas

- Unifica lenguaje entre Web y backend.
- Mantiene el backend dentro del Modular Monolith previsto.
- Evita introducir infraestructura distribuida innecesaria.
- Permite evolucionar hacia Clean/Hexagonal.
- Mantiene PostgreSQL/PostGIS y proveedores externos detrás de contratos.
- Conserva una ruta clara para observabilidad, auditoría y seguridad.

### Costes / riesgos

- Mayor consumo de memoria que el PoC ASP.NET Core.
- Startup y build superiores en el benchmark realizado.
- Seguridad productiva todavía debe diseñarse e implementarse.
- El benchmark solo cubre LIST; no representa geocodificación, routing, XLSX ni cargas productivas completas.
- La productividad no fue medida de forma homogénea.

## 6. Condiciones de revisión

La decisión deberá revisarse si aparece:

- incompatibilidad funcional o técnica crítica;
- incompatibilidad con PostgreSQL/PostGIS;
- problema crítico de seguridad sin mitigación razonable;
- limitación operacional material;
- necesidad demostrada de una arquitectura distribuida que cambie los requisitos;
- evidencia integrada de rendimiento que contradiga de forma material los supuestos actuales;
- cambio sustancial de los requisitos o restricciones operativas.

## 7. Alternativa no seleccionada

**ASP.NET Core + .NET 10 LTS** permanece como alternativa técnicamente viable y queda registrada como no seleccionada para el backend inicial por adecuación contextual, no por incompatibilidad.

## 8. Trazabilidad

- Issue #5 — Matriz tecnológica.
- Issue #7 — Evaluación backend.
- PR #9 — PoC backend.
- PR #20/#21 — actualización de versiones.
- PR #28 — benchmark nativo Windows.
- PR #126 — corrección histórica del harness DELETE.
- Issue #145 — discrepancia histórica LIST.
- PR #154 — cierre de ronda tecnológica por estado de evidencia.
- PR #155 — reproducibilidad PostgreSQL; sin nueva evidencia de rendimiento.
- PR #156 — consolidación de evidencia y análisis contextual.
- Dossier: `docs/technology/backend-evidence-dossier-2026-09-26.md`.

## 9. Estado de integración

Este ADR queda **Propuesto**. El Stack Baseline no se modifica hasta que la decisión sea aprobada mediante el flujo de gobernanza del proyecto.

**Fin del ADR.**
