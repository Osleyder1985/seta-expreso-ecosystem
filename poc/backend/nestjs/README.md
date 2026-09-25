# NestJS Backend PoC

PoC mínimo para comparación objetiva con ASP.NET Core.

## Baseline vigente

- NestJS 12.1.0
- Node.js 24.21.0 LTS
- TypeScript 5.9.2
- PostgreSQL 16
- OpenAPI mediante @nestjs/swagger 12.0.1

La vertical CRUD es deliberadamente pequeña. Debe mantener equivalencia funcional con el PoC ASP.NET Core y no representa todavía el dominio definitivo de paquetería.

## Validación

La implementación debe cubrir:

- CRUD;
- validación;
- errores HTTP consistentes;
- PostgreSQL;
- transacción en la operación de creación;
- health check;
- OpenAPI;
- tests;
- Docker.

Los resultados de rendimiento no se consideran válidos hasta ejecutar el benchmark común con las versiones actuales registradas.
