# Protocolo de benchmark del backend v0.2.0

**Issue:** #9  
**Actualización de versiones:** #20  
**Relacionado:** #7  
**Estado:** Propuesto

## Objetivo

Comparar dos implementaciones funcionalmente equivalentes:

- NestJS 12.1.0 + TypeScript + Node.js 24.21.0 LTS
- ASP.NET Core + .NET 10 LTS

La comparación debe medir propiedades técnicas relevantes para el Ecosistema sin convertir una métrica aislada en una decisión.

## Vertical experimental

Se utilizará una entidad mínima representativa de paquetería, sin pretender modelar todavía el dominio definitivo.

Operaciones:

- crear;
- consultar por identificador;
- listar;
- actualizar;
- eliminar.

Capacidades transversales:

- validación;
- errores HTTP consistentes;
- PostgreSQL;
- transacción;
- OpenAPI;
- health check;
- tests;
- Docker.

## Condiciones

Las dos implementaciones deben utilizar:

- la misma especificación HTTP;
- el mismo esquema de datos;
- la misma base PostgreSQL;
- los mismos casos de prueba;
- equivalente configuración de contenedor;
- equivalentes condiciones de carga.

No se aplicarán optimizaciones específicas de una plataforma salvo que se documenten y se reproduzcan conceptualmente en la otra.

## Métricas

### Build

- duración;
- resultado;
- tamaño del artefacto cuando sea comparable.

### Runtime

- tiempo hasta readiness;
- memoria en reposo;
- CPU en reposo.

### API

- throughput;
- p50;
- p95;
- tasa de errores.

### Calidad de desarrollo

- duración de tests;
- cantidad de tests;
- cobertura cuando el método sea comparable;
- complejidad necesaria para implementar la vertical.

## Repeticiones

Cada medición de rendimiento deberá ejecutarse varias veces.

El informe deberá conservar:

- datos brutos;
- promedio;
- dispersión cuando corresponda;
- versión del software;
- hardware;
- sistema operativo;
- configuración;
- comando exacto.

## Reglas de versión

El experimento vigente utilizará versiones estables y soportadas, priorizando LTS cuando corresponda.

A fecha de septiembre de 2026:

- Node.js 24.21.0 está en LTS;
- Node.js 26.10.0 está en Current y no se utilizará como baseline LTS del experimento;
- NestJS 12.1.0 es la versión latest de @nestjs/core;
- @nestjs/swagger 12.0.1 es la versión latest del paquete;
- .NET 10 es la línea LTS del candidato ASP.NET Core.

Las versiones exactas deberán conservarse en los artefactos de reproducibilidad.

## Regla de interpretación

Una diferencia de rendimiento no determina por sí sola la decisión del backend.

Los resultados se integrarán con B01–B12 de la matriz oficial y con los requisitos reales del Ecosistema.

## Resultado esperado

El experimento debe permitir:

1. reproducir ambas implementaciones;
2. comparar sus resultados;
3. identificar ventajas y limitaciones;
4. registrar incertidumbres;
5. proporcionar evidencia para el ADR del backend.

**Importante:** este protocolo no contiene resultados inventados. Los resultados se incorporarán después de ejecutar el experimento.


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
