# Protocolo de benchmark del backend v0.1.0

**Issue:** #9  
**Relacionado:** #7  
**Estado:** Preparación del experimento

## Objetivo

Comparar dos implementaciones funcionalmente equivalentes:

- NestJS + TypeScript
- ASP.NET Core + .NET

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
