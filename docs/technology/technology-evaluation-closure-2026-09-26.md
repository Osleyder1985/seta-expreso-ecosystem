# Technology Evaluation Closure v0.1.0

**Ecosistema:** SETA EXPRESO SURL  
**Fecha:** 2026-09-26  
**Baseline relacionado:** Technology Stack Baseline v0.2.0  
**Estado:** Vigente

## 1. Objetivo

Cerrar las evaluaciones tecnológicas que ya disponen de evidencia suficiente y separar explícitamente las decisiones que todavía requieren PoC o benchmark.

No se asignan puntuaciones inventadas. Cuando falta evidencia experimental, el estado es **Bloqueada por evidencia**.

## 2. Resultado ejecutivo

| Área | Estado | Decisión |
|---|---|---|
| Backend | 🔴 Bloqueada | NestJS 12.1.0 + Node 24.21.0 LTS queda como candidato baseline; ASP.NET Core 10 permanece alternativa hasta benchmark reproducible |
| Web | 🟢 Cerrada | React 19.3 + TypeScript 6.0.3 + Vite 8.3.x |
| Mobile | 🟢 Cerrada | Flutter 3.47.5 + Dart 3.13.4 |
| DB | 🟢 Cerrada | PostgreSQL 18.6 + PostGIS 3.6.0 |
| ORM | 🟢 Cerrada con restricción | Prisma ORM 7.10.0 + SQL controlado/PostGIS cuando sea necesario |
| Testing | 🟢 Cerrada | Jest/Supertest; Vitest/Testing Library/Playwright; Flutter Test/integration_test |
| Maps | 🟡 Parcial | MapLibre/OSM como dirección; proveedor de tiles pendiente |
| Geocoding | 🔴 Bloqueada | Requiere PoC específico con direcciones cubanas |
| Routing | 🔴 Bloqueada | Requiere PoC con rutas cubanas y restricciones reales |
| Identity | 🟡 Parcial | OAuth 2.0/OIDC adoptado; proveedor concreto requiere PoC |
| Observability | 🟢 Arquitectura cerrada | OpenTelemetry adoptado; backend concreto pendiente |
| Infraestructura | 🟡 Abierta | Requiere PoC de despliegue, backup, recuperación y TCO |
| Reverse proxy | 🟡 No bloqueante | Caddy/Nginx se decidirá con la topología de despliegue |

## 3. Evidencia de versiones

### Runtime y backend

Node.js 24.21.0 es LTS; Node.js 26.10.0 es Current. Para producción se mantiene Node 24 LTS. [Evidencia oficial: Node.js Releases]

NestJS 12.1.0 + TypeScript 6.0.3 + Node 24.21.0 permanece como combinación experimental de referencia. La decisión entre NestJS y ASP.NET Core no puede cerrarse sin el benchmark.

ASP.NET Core 10 tiene soporte integrado para generar OpenAPI 3.1, por lo que sigue siendo una alternativa técnicamente válida.

### Web

React 19.3 es estable y fue publicado oficialmente el 9 de septiembre de 2026.

### Mobile

Flutter 3.47 fue publicado el 12 de agosto de 2026. Se mantiene Flutter como estrategia multiplataforma para Android/iOS; las capacidades específicas de plataforma se resolverán mediante integración nativa cuando sea necesario.

### Base de datos

PostgreSQL 18.6 fue publicado el 13 de agosto de 2026. PostgreSQL 19 todavía estaba en Beta 4 el 24 de septiembre de 2026, por lo que no entra al baseline productivo.

PostGIS 3.6.0 se mantiene con PostgreSQL 18 como línea estable de referencia.

### ORM

Prisma ORM 7 soporta PostgreSQL 18 y dispone de una extensión para PostGIS.

**Decisión:** Prisma 7.10.0 se adopta para acceso tipado habitual. Las operaciones geoespaciales o SQL avanzado no quedan obligadas al ORM; se permite SQL controlado mediante un adapter/repository aislado.

## 4. Backend: bloqueo real

El benchmark nativo intentado el 2026-09-25 no llegó a producir resultados porque PostgreSQL no estaba escuchando en localhost:5433.

Por tanto:

- no existe throughput válido;
- no existe p50/p95 válido;
- no existe comparación de CPU/memoria válida;
- no se declara ganador;
- no se inventan puntuaciones.

El benchmark debe ejecutarse con el mismo dataset, PostgreSQL/PostGIS, número de requests, concurrencia, warmup, número de runs y condiciones de build para ambos candidatos.

## 5. Geocoding: bloqueo por dominio

La selección no se hará por reputación general del proveedor.

El PoC debe utilizar un conjunto anonimizado o representativo de direcciones cubanas y medir:

- exactitud;
- cobertura;
- normalización;
- tasa de resultados útiles;
- ambigüedad;
- latencia;
- batch;
- límites;
- política de uso;
- costo;
- reproducibilidad;
- sustitución.

El proveedor quedará detrás de GeocodingProvider.

## 6. Routing: bloqueo por PoC

El motor deberá evaluarse con:

- rutas dentro de Cuba;
- origen/destino;
- múltiples paradas;
- distancia;
- duración;
- geometría de ruta;
- restricciones;
- posibilidad de optimización posterior;
- ejecución local;
- costo;
- datos OSM;
- sustituibilidad.

La arquitectura separará RoutingProvider, RoutingService y dominio de planificación.

## 7. Maps

La arquitectura geoespacial queda definitivamente separada en:

1. rendering;
2. tiles/map source;
3. geocoding;
4. reverse geocoding;
5. routing;
6. persistencia espacial.

MapLibre es compatible con el enfoque de mapas vectoriales y dispone de implementaciones para Web y plataformas nativas.

No se fija todavía un proveedor de tiles.

## 8. Identity

Se adopta OAuth 2.0 + OpenID Connect como protocolo.

Keycloak permanece como candidato principal para un despliegue autogestionado, pero debe validarse con un PoC que cubra Web, Android, iOS, API, refresh tokens, logout/revocación, roles, permisos, MFA y auditoría.

## 9. Observabilidad

OpenTelemetry queda adoptado como capa de instrumentación.

La decisión pendiente es únicamente el backend de almacenamiento/visualización de logs, métricas, traces y alertas.

## 10. Evaluaciones cerradas

Quedan cerradas documentalmente:

- React + TypeScript + Vite;
- Flutter + Dart;
- PostgreSQL + PostGIS;
- Prisma 7 como acceso tipado;
- SQL controlado como escape hatch geoespacial;
- Jest + Supertest;
- Vitest + Testing Library + Playwright;
- Flutter Test + integration_test;
- REST + OpenAPI 3.1;
- Node.js 24 LTS;
- Docker;
- GitHub Actions;
- OpenTelemetry;
- modular monolith + Clean/Hexagonal.

## 11. Evaluaciones que no deben seguir consumiendo tiempo sin nueva evidencia

No se requiere otra ronda conceptual para las decisiones cerradas.

El trabajo debe concentrarse ahora exclusivamente en:

1. benchmark backend;
2. PoC geocoding Cuba;
3. PoC routing Cuba;
4. PoC identidad;
5. PoC infraestructura/despliegue.

## 12. Regla de gobierno

Una decisión bloqueada por falta de evidencia no debe convertirse en una decisión definitiva mediante opinión.

La secuencia obligatoria continúa siendo:

**Requisito → candidatos → PoC/benchmark → evidencia → evaluación → decisión → ADR → Stack Baseline → implementación.**

**Fin de Technology Evaluation Closure v0.1.0.**
