# Preanálisis tecnológico backend — NestJS vs ASP.NET Core

**Fecha:** 2026-09-25  
**Estado:** En validación  
**Naturaleza:** Preanálisis no definitivo  
**DELETE:** Excluido temporalmente por defecto corregido en PR #126 pendiente de rerun válido.

## 1. Evidencia válida disponible

| Perfil | NestJS | ASP.NET Core | Estado |
|---|---:|---:|---|
| P1 LIST throughput | ~138 req/s | ~762 req/s | Válida |
| P2 CREATE throughput | ~1,602 req/s | ~927 req/s | Válida |
| P3 GET throughput | ~2,971 req/s | ~1,111 req/s | Válida |
| P4 UPDATE throughput | ~2,146 req/s | ~893 req/s | Válida |
| P5 DELETE | — | — | Pendiente |

Todas las ejecuciones P1–P4 vigentes registraron error_rate 0.

## 2. Lectura de latencia

- P2 CREATE: p50 medio ~11.62 ms NestJS / ~14.35 ms ASP.NET Core.
- P3 GET: ~6.06 ms / ~11.79 ms.
- P4 UPDATE: ~8.47 ms / ~14.48 ms.
- P1 LIST: ~135.48 ms / ~24.42 ms.

La ventaja de ASP.NET Core en LIST es marcada y debe investigarse causalmente; no se debe convertir directamente en una conclusión sobre el runtime.

## 3. Recursos

La evidencia disponible muestra:
- NestJS: menor CPU durante los perfiles medidos.
- ASP.NET Core: menor working set y menor memoria privada.
- ASP.NET Core: startup y build generalmente menores en las mediciones actuales.

Esto configura un intercambio técnico y no un ganador universal.

## 4. Preselección

Con la evidencia disponible y sin DELETE, **NestJS queda provisionalmente como candidato principal para continuar la evaluación del Stack Baseline**, principalmente por el comportamiento observado en CREATE, GET y UPDATE, menor CPU y adecuación al ecosistema TypeScript.

ASP.NET Core permanece como alternativa técnicamente viable y conserva ventajas medibles en LIST, memoria, startup y build.

Esta frase NO constituye una adopción definitiva ni una clasificación global.

## 5. Por qué no se cierra la decisión

Todavía faltan:
- DELETE válido;
- perfiles de validación y errores;
- comprobaciones OpenAPI/health/tests/transacciones;
- reproducibilidad completa;
- lockfile y árbol de dependencias;
- imagen/digest reproducible;
- dimensiones de mantenibilidad, seguridad y tooling;
- evaluación B01–B12;
- relación con requisitos reales del ecosistema.

## 6. Investigación P1 LIST

Se crea el Issue #145 para explicar la diferencia.

Debe compararse:
- SQL y plan;
- número/tamaño de registros;
- pool;
- driver pg/Npgsql;
- serialización;
- tamaño de respuesta;
- configuración;
- overhead del framework;
- medición del harness.

La investigación debe distinguir una característica accidental del PoC de un comportamiento reproducible del stack.

## 7. Regla de gobernanza

No actualizar el Stack Baseline ni emitir ADR definitivo a partir de este documento.

El resultado es únicamente una hipótesis de trabajo para orientar las siguientes pruebas y reducir incertidumbre.

## 8. Próximos gates

1. Completar P5 DELETE después de PR #126.
2. Investigar P1 LIST.
3. Completar perfiles funcionales restantes.
4. Resolver reproducibilidad (#106).
5. Integrar evidencia en B01–B12.
6. Emitir ADR únicamente cuando el conjunto de evidencia permita una decisión defendible.
