# ASP.NET Core Backend PoC

PoC mínimo para comparación experimental del backend del Ecosistema.

## Baseline técnico

- ASP.NET Core / .NET 10 LTS.
- Npgsql 10.0.3.
- Swashbuckle.AspNetCore 10.2.3.
- PostgreSQL como persistencia común.
- OpenAPI.
- Health check.
- CRUD y validación.
- Pruebas de integración mediante ASP.NET Core testing infrastructure.

Las versiones se actualizan siguiendo el criterio del Ecosistema de utilizar versiones estables y soportadas actuales. Este PoC no constituye todavía la selección definitiva del backend.

## Objetivo experimental

Implementar el mismo vertical funcional definido para la comparación NestJS vs ASP.NET Core, manteniendo equivalencia de contrato, persistencia, pruebas, contenedorización y condiciones de benchmark.

La decisión del backend definitivo permanece pendiente de la evidencia experimental y documental.