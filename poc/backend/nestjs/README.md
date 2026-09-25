# NestJS Backend PoC

PoC mínimo para comparación objetiva con ASP.NET Core.

## Baseline vigente

- NestJS 12.1.0
- Node.js 24.21.0 LTS
- TypeScript 5.9.3
- PostgreSQL 16
- OpenAPI mediante @nestjs/swagger 12.0.1
- Vitest 5.0.1 para pruebas

NestJS 12 utiliza paquetes core ESM. El PoC utiliza Vitest para evitar una configuración de compatibilidad innecesaria entre Jest y los paquetes ESM de Nest 12.

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
