# SETA EXPRESO API

Backend principal del Ecosistema SETA EXPRESO.

## Baseline
- Node.js 24.21.0 LTS
- NestJS 12.1.0
- TypeScript 6.0.3
- Modular Monolith
- Clean/Hexagonal architecture
- REST/JSON

## Estado
Esta aplicación constituye el **bootstrap ejecutable** del backend. Todavía no contiene la implementación productiva de Paquetería ni de los proveedores de infraestructura aprobados.

La regla de evolución es:
**Issue → diseño → implementación → pruebas → PR → CI/revisión → integración → documentación.**

## Desarrollo local
Desde `apps/api`:
`npm install`
`npm run start:dev`

Health check:
`GET http://localhost:3000/api/health`

Pruebas:
`npm test`
`npm run build`

## Límites arquitectónicos
- El dominio no debe depender de NestJS.
- Los adaptadores de infraestructura deben depender de puertos/contratos.
- Keycloak será el proveedor de identidad; autorización de negocio permanece en la aplicación.
- Prisma será infraestructura de persistencia; PostGIS se utilizará mediante SQL controlado/TypedSQL cuando corresponda.