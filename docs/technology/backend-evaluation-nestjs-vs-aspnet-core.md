# Evaluación objetiva del Backend: NestJS vs ASP.NET Core

**Versión:** 0.2.0  
**Estado:** Evaluación en curso  
**Issue:** #7  
**Fecha:** 2026-09-25

## 1. Objetivo

Aplicar la matriz oficial de evaluación tecnológica al backend del Ecosistema SETA EXPRESO SURL.

Los candidatos evaluados son:

- NestJS + TypeScript + Node.js LTS
- ASP.NET Core + .NET 10 LTS

La evaluación no debe convertir una preferencia tecnológica en una conclusión. Se separa la evidencia documental de la evidencia experimental.

## 2. Evidencia disponible

El repositorio oficial contiene actualmente la arquitectura baseline y la matriz de evaluación, pero no contiene los PoC de backend mencionados en trabajos anteriores.

Por tanto:

- no se inventan resultados de benchmark;
- no se asignan puntuaciones experimentales que no hayan sido reproducidas;
- los criterios que dependan de medición quedan pendientes;
- la decisión final queda abierta hasta completar la evidencia requerida.

## 3. Evidencia documental inicial

### 3.1 NestJS

La documentación oficial describe módulos como mecanismo para organizar capacidades relacionadas y encapsular providers; también documenta inyección de dependencias, testing, validación, seguridad, OpenAPI, health checks, eventos y observabilidad. [E1]

La documentación oficial de testing indica soporte para pruebas unitarias, integración y e2e, integración con herramientas como Vitest y Supertest y utilización del sistema de DI para pruebas. [E1]

Nest dispone de integración dedicada para generar especificaciones OpenAPI desde el código mediante `@nestjs/swagger`. [E1]

### 3.2 ASP.NET Core

Para el experimento actualizado se utilizará .NET 10 LTS. La política oficial de Microsoft, actualizada el 8 de septiembre de 2026, identifica .NET 10.0.12 como el parche vigente, con soporte LTS activo hasta el 14 de noviembre de 2028. .NET 8 se mantiene en fase de mantenimiento y finaliza soporte el 10 de noviembre de 2026. [E1]


La documentación oficial de ASP.NET Core documenta Dependency Injection y Minimal APIs, además de capacidades de infraestructura HTTP y binding de servicios. [E1]

Microsoft documenta `WebApplicationFactory<TEntryPoint>` y `TestServer` para pruebas de integración, incluyendo configuración del host, sustitución de servicios y escenarios de autenticación. [E1]

La documentación oficial también mantiene una sección específica de rendimiento y carga para ASP.NET Core. [E1]

## 4. Evaluación preliminar

Esta tabla **no constituye todavía la puntuación final**. Se utiliza para identificar qué criterios pueden resolverse documentalmente y cuáles requieren PoC/benchmark.

| Criterio | Peso | NestJS | Evidencia | ASP.NET Core | Evidencia |
|---|---:|---|---|---|---|
| B01 Adecuación Modular/Clean/Hexagonal | 15% | Pendiente de evaluación estructural | E1 | Pendiente de evaluación estructural | E1 |
| B02 REST/OpenAPI | 10% | Evidencia favorable | E1 | Evidencia favorable | E1 |
| B03 Testabilidad | 10% | Evidencia favorable | E1 | Evidencia favorable | E1 |
| B04 Seguridad | 10% | Evidencia disponible | E1 | Evidencia disponible | E1 |
| B05 Rendimiento | 10% | **Pendiente benchmark** | E2 | **Pendiente benchmark** | E2 |
| B06 Mantenibilidad | 10% | Pendiente de PoC/estructura | E1/E2 | Pendiente de PoC/estructura | E1/E2 |
| B07 Ecosistema | 10% | Evidencia documental | E1/E4 | Evidencia documental | E1/E4 |
| B08 Documentación/madurez | 5% | Evidencia documental | E1 | Evidencia documental | E1 |
| B09 Productividad | 5% | Pendiente de PoC | E2 | Pendiente de PoC | E2 |
| B10 Operación/despliegue | 5% | Pendiente de experimento | E2 | Pendiente de experimento | E2 |
| B11 Costo/licencia | 5% | Analizar TCO | E1/E4 | Analizar TCO | E1/E4 |
| B12 Evolución futura | 5% | Pendiente de análisis contextual | E1/E2 | Pendiente de análisis contextual | E1/E2 |

## 5. Hipótesis que deben comprobarse

### H01 — Adecuación arquitectónica

Ambas alternativas deben poder implementar:

- Modular Monolith;
- separación Domain / Application / Infrastructure;
- puertos y adaptadores;
- API-first;
- PostgreSQL/PostGIS;
- integración con proveedores externos sin acoplamiento del dominio.

La prueba debe realizarse con una vertical pequeña del dominio de paquetería.

### H02 — Productividad

Debe medirse el tiempo necesario para implementar la misma vertical funcional en ambos candidatos, manteniendo criterios equivalentes.

### H03 — Rendimiento

Debe medirse el comportamiento bajo una carga controlada y reproducible.

No se aceptará comparar resultados obtenidos con configuraciones diferentes o sin registrar versiones y entorno.

### H04 — Operación

Ambos candidatos deben producir una imagen Docker reproducible y ejecutar:

- health check;
- configuración por variables de entorno;
- conexión PostgreSQL;
- migraciones;
- logging;
- pruebas;
- documentación OpenAPI.

## 6. Benchmark mínimo

El benchmark deberá utilizar la misma especificación funcional.

### Endpoint mínimo

Implementar una operación CRUD sencilla representativa, evitando introducir reglas de negocio que favorezcan artificialmente una tecnología.

### Persistencia

PostgreSQL será la base común.

### Pruebas

Cada implementación deberá incluir:

- unit tests;
- integration tests;
- API tests;
- validación de entrada;
- manejo de errores;
- health check.

### Contrato

La API deberá exponer OpenAPI equivalente.

### Contenedores

Cada implementación deberá ejecutarse mediante Docker con configuración equivalente.

## 7. Métricas

Registrar como mínimo:

- tiempo de compilación/build;
- tiempo de arranque;
- consumo de memoria en reposo;
- latencia p50;
- latencia p95;
- throughput;
- duración de la suite de pruebas;
- tiempo de implementación de la vertical;
- tamaño de artefactos/imágenes cuando sea relevante.

Las métricas de rendimiento se repetirán varias veces y se documentará el método de medición.

## 8. Entorno de referencia

El entorno de desarrollo del proyecto es Windows 11 Pro con:

- Intel Core i7-13700H;
- 16 GB RAM;
- NVIDIA GeForce RTX 4080 Laptop GPU.

La GPU no se considera relevante para este benchmark inicial de backend, salvo que una prueba posterior demuestre lo contrario.

El benchmark debe registrar además:

- versión exacta de Node.js/.NET;
- versión exacta de NestJS/ASP.NET Core;
- versión de PostgreSQL;
- versión de Docker;
- configuración de CPU/memoria;
- configuración de PostgreSQL;
- comandos ejecutados.

## 9. Criterios de validez

Un resultado experimental será válido solamente si:

1. el experimento es reproducible;
2. las implementaciones son funcionalmente equivalentes;
3. las versiones están registradas;
4. el entorno está registrado;
5. los comandos están registrados;
6. las mediciones están disponibles;
7. las limitaciones están documentadas.

## 10. Decisión

**Estado actual: PENDIENTE.**

La evidencia documental demuestra que ambas alternativas disponen de capacidades relevantes para los requisitos arquitectónicos, API, testing y operación del Ecosistema.

No existe todavía en el repositorio oficial evidencia experimental suficiente para emitir una decisión final sobre NestJS frente a ASP.NET Core.

La siguiente acción técnica es completar la reconstrucción del PoC ASP.NET Core sobre .NET 10 LTS, validar sus dependencias y ejecutar el benchmark común frente a la versión de NestJS seleccionada para el mismo experimento.

## 11. Referencias de evidencia

- E1 — Documentación oficial de NestJS, Microsoft Learn y política oficial de soporte de .NET consultada en septiembre de 2026.
- E2 — Evidencia experimental: pendiente de reproducir.

## 12. Trazabilidad

`#7 → PoC/Benchmark → resultados → evaluación B01–B12 → ADR → Stack Baseline → PR`

**Nota de actualización:** el PoC .NET 8 queda como referencia histórica del experimento anterior. El experimento vigente deberá ejecutarse sobre .NET 10 LTS.

**Fin de la evaluación preliminar.**
