# Technology Stack Baseline v0.4.0

**Ecosistema:** SETA EXPRESO SURL  
**Estado:** Vigente — decisiones tecnológicas transversales cerradas
**Versión:** 0.4.0  
**Issue:** #3  
**Arquitectura de referencia:** Architecture Baseline v0.1.0 / ADR-0001  
**Idioma del documento:** Español  
**Regla de nomenclatura:** directorios, archivos, código e identificadores en inglés; documentación oficial en español.

---

## 1. Propósito

Este documento establece el Technology Stack Baseline v0.1.0 del Ecosistema SETA EXPRESO SURL.

Su objetivo no es congelar la tecnología del producto de forma irreversible. Define:
- tecnologías adoptadas para el baseline;
- tecnologías candidatas que requieren validación antes de convertirse en decisiones definitivas;
- tecnologías explícitamente no adoptadas por ahora;
- criterios para incorporar, sustituir o retirar tecnologías;
- decisiones que deben validarse mediante PoC, benchmark, pruebas de integración o evidencia operativa.

El stack debe servir a la arquitectura baseline del Ecosistema y no convertirse en el fin del diseño.

## 2. Relación con la arquitectura

La arquitectura baseline establece como punto de partida:
- aplicación web;
- aplicaciones móviles Android e iOS;
- backend central;
- modular monolith;
- separación Clean/Hexagonal;
- API como frontera de integración;
- persistencia relacional;
- capacidad geoespacial;
- abstracción de proveedores externos;
- seguridad, auditoría y observabilidad;
- evolución progresiva sin introducir microservicios, serverless o Kubernetes sin justificación.

Por tanto, el stack tecnológico debe preservar esas propiedades.

## 3. Principios tecnológicos

### 3.1 Adecuación antes que moda
Una tecnología solo se adopta cuando existe una necesidad real y evidencia suficiente de que satisface los criterios del proyecto.

### 3.2 Costo total
“Gratuito” no significa automáticamente adecuado.
Se evaluarán licencia, costos de infraestructura, límites de uso, costos indirectos, dependencia del proveedor, esfuerzo de operación, esfuerzo de migración y disponibilidad de alternativas.

### 3.3 Sustituibilidad
Las integraciones externas deberán aislarse detrás de interfaces/adapters cuando exista riesgo razonable de cambio de proveedor.
Especialmente: geocodificación, mapas, correo, mensajería, notificaciones, almacenamiento externo e identidad externa.

### 3.4 Simplicidad operacional
El Ecosistema debe comenzar con la menor complejidad operacional compatible con sus requisitos.
No se adoptan inicialmente Kubernetes, arquitectura de microservicios, service mesh, múltiples motores de base de datos, multi-cloud, event streaming distribuido ni serverless como arquitectura general.

### 3.5 Seguridad desde el diseño
La seguridad será una propiedad transversal, no una funcionalidad añadida al final.

### 3.6 Calidad automatizada
El stack debe permitir automatizar linting, análisis estático, pruebas unitarias, pruebas de integración, pruebas de API, pruebas end-to-end, validaciones de contratos y construcción reproducible.

### 3.7 Observabilidad desde el inicio
Las decisiones de producción deberán permitir obtener logs estructurados, métricas, trazabilidad de operaciones relevantes, correlación de solicitudes y auditoría de acciones de negocio cuando corresponda.

## 4. Baseline tecnológico

| Capa | Baseline v0.1.0 | Estado |
|---|---|---|
| Backend | NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS | **Adoptado** |
| Runtime | Node.js 24.21.0 LTS | Adoptado |
| API | REST + OpenAPI | Adoptado |
| Web | React 19.3 + TypeScript 6.0.3 + Vite 8.3.x | **Adoptado** |
| Mobile | Flutter 3.47.5 + Dart 3.13.4 | **Adoptado** |
| DB | PostgreSQL 18.6 | Adoptado |
| Geodatos | PostGIS 3.6.0 | Adoptado |
| Acceso a datos | Prisma ORM 7.10.0 + SQL/TypedSQL controlado para PostGIS | **Adoptado** |
| Backend tests | Jest 30.x + Supertest 7.2.2 | **Adoptado** |
| Web tests | Vitest 5.x + Testing Library + Playwright 1.63.0 | **Adoptado** |
| Mobile tests | Flutter Test + integration_test | **Adoptado** |
| CI | GitHub Actions | Adoptado |
| Contenedores | Docker Engine 29.8.1 | Adoptado |
| API docs | OpenAPI/Swagger | Adoptado |
| Maps | MapLibre GL JS/Native + OpenFreeMap; OSM como fuente de datos | **Adoptado** |
| Geocoding | Geoapify como proveedor externo primario + `GeocodingProvider`; Nominatim autogestionado como fallback | **Adoptado** |
| Observabilidad | OpenTelemetry + Collector + Prometheus + Grafana + Loki | **Adoptado** |
| Version control | Git + GitHub | Adoptado |
| Auth | Keycloak 26.7.x + OAuth 2.0/OIDC | **Adoptado** |
| Reverse proxy | Caddy | **Adoptado** |
| AI/ML | No obligatorio en baseline | No adoptado como requisito tecnológico |

Nota: las decisiones adoptadas permanecen gobernadas por la regla Latest Stable Compatible; una sustitución futura requiere evidencia y ADR cuando corresponda.

## 5. Backend

### 5.1 NestJS + TypeScript
**Baseline adoptado: NestJS 12.1.0 + TypeScript 6.0.3 + Node.js 24.21.0 LTS.**

Razones: estructura modular, inyección de dependencias, soporte para separación por módulos, buen encaje con Clean/Hexagonal, tipado estático de TypeScript, ecosistema adecuado para APIs, buena capacidad de pruebas y posibilidad de evolucionar un modular monolith sin exigir microservicios.

La decisión queda respaldada por el ADR-002 y por la evidencia consolidada de los PoC de backend, incluido el benchmark LIST nativo de Windows del 2026-09-25. ASP.NET Core + .NET 10 LTS permanece como alternativa técnicamente viable y no seleccionada para el backend inicial.

### 5.2 Node.js LTS
**Adoptado.**
El runtime fijado es **Node.js 24.21.0 LTS**. Node.js 26.10.0 es Current y no se adopta como baseline LTS.

## 6. API

### 6.1 REST
**Adoptado como estilo inicial de API.**
Motivos: interoperabilidad con Web, Android e iOS; simplicidad operacional; facilidad de pruebas; herramientas maduras; integración sencilla con terceros.
GraphQL no se adopta inicialmente. Su incorporación requeriría una necesidad demostrable que REST no resuelva adecuadamente.

### 6.2 OpenAPI
**Adoptado.**
La API deberá mantener un contrato documentado para documentación, generación/validación de clientes cuando resulte útil, pruebas contractuales y comunicación entre equipos.

## 7. Web

### 7.1 React + TypeScript + Vite
**Adoptado: React 19.3 + TypeScript 6.0.3 + Vite 8.3.x.** React 19.3 es la versión actual documentada y Vite 8.3 es la rama estable soportada. TypeScript se mantiene en 6.0.3 por compatibilidad con NestJS 12 tooling.
Vite se utilizará como herramienta de desarrollo/build salvo que requisitos futuros justifiquen otra alternativa.

## 8. Aplicaciones móviles

### 8.1 Flutter + Dart
**Adoptado para Android e iOS: Flutter 3.47.5 + Dart 3.13.4.**
La decisión busca mantener una base de código compartida cuando la funcionalidad y el comportamiento de las plataformas lo permitan.
Esto no implica que el 100 % de las capacidades serán idénticas entre plataformas. Cuando una capacidad requiera APIs nativas, se aislará, se documentará y se utilizará integración nativa solo donde sea necesario.

Alternativa: desarrollo nativo independiente con Kotlin/Android y Swift/iOS. No se adopta inicialmente porque duplicaría gran parte del desarrollo, pero podrá reevaluarse si aparecen requisitos específicos de plataforma que hagan insuficiente Flutter.

## 9. Persistencia

### 9.1 PostgreSQL
**Adoptado: PostgreSQL 18.6.**
Se utilizará como sistema principal de persistencia relacional por su adecuación a procesos empresariales, integridad transaccional, consultas complejas, ecosistema maduro, extensibilidad y disponibilidad de capacidades geoespaciales mediante PostGIS.

### 9.2 PostGIS
**Adoptado: PostGIS 3.6.0.**
Se utilizará para representar y consultar información espacial: coordenadas de direcciones, puntos de entrega, localizaciones, consultas geográficas y preparación para cálculo/optimización de rutas.
La utilización concreta de algoritmos de routing será una decisión posterior.

### 9.3 Acceso a datos
**Adoptado: Prisma ORM 7.10.0.**
Prisma ORM 8 permanece fuera del baseline porque continúa en Release Candidate. Prisma 7 se utilizará con SQL/TypedSQL controlado cuando PostGIS u otras capacidades no estén expresadas por el cliente ORM. El dominio permanece independiente de Prisma.

## 10. Geocodificación y mapas

### 10.1 Separación de responsabilidades
Se separarán Map rendering, Geocoding, Routing y Spatial persistence.
No se permitirá que una única librería o proveedor quede acoplado a todo el subsistema geoespacial sin necesidad.

### 10.2 OpenStreetMap
**Dirección tecnológica adoptada para cartografía abierta.**
La utilización concreta de servicios derivados de OpenStreetMap debe respetar sus políticas, atribución, capacidad y límites.
OpenStreetMap no implica que cualquier servicio público asociado sea ilimitado o apropiado para producción.

### 10.3 Geocoding
**Proveedor primario inicial adoptado: Geoapify.**
La integración deberá permanecer detrás de `GeocodingProvider`. Geoapify se adopta como proveedor externo primario por su soporte forward/reverse, entrada libre y estructurada, filtros territoriales y exposición de confidence/quality para permitir quality gates propios.

**Fallback técnico: Nominatim autogestionado sobre OSM de Cuba.** No se utilizará Nominatim público como dependencia operativa de producción.

La decisión está documentada en ADR-003. La evidencia disponible no demuestra superioridad empírica de Geoapify sobre Cuba; por ello el sistema debe validar cada resultado contra el catálogo territorial, conservar caché/auditoría y permitir sustitución del proveedor.

Se requiere cumplir cuota, atribución y condiciones vigentes del proveedor antes de producción.

## 11. Testing

### 11.1 Backend
Adoptado: Jest y Supertest.
Cobertura esperada: unit tests, integration tests, API tests y contract-related tests cuando sean útiles.

### 11.2 Web
Adoptado: Vitest, Testing Library y Playwright.
Capas: unit, component, integration y end-to-end.

### 11.3 Mobile
Adoptado: Flutter Test e integration_test.
Se deberá probar lógica, widgets, integración con API, flujos críticos y comportamiento relevante por plataforma.

## 12. Calidad estática
El stack deberá incorporar herramientas automatizadas para lint, formato, type checking, análisis estático, detección de dependencias vulnerables cuando sea viable y validación de builds.
Las herramientas concretas se fijarán en la configuración de cada aplicación.

## 13. CI/CD
### 13.1 GitHub Actions
**Adoptado.**
GitHub Actions será la plataforma inicial de automatización.

Pipeline conceptual:
Commit → Lint → Type Check → Unit Tests → Integration Tests → Build → E2E / Contract Tests → Quality Gate → Artifact

Los pasos concretos dependerán del componente.

## 14. Docker
**Adoptado.**
Docker se utilizará para reproducibilidad, entornos de desarrollo, pruebas, empaquetado de componentes cuando resulte útil y ejecución consistente de PostgreSQL/PostGIS y servicios auxiliares.
Docker no implica que Kubernetes sea necesario.

## 15. Observabilidad
### 15.1 OpenTelemetry
**Dirección tecnológica adoptada.**
Se evaluará su integración progresiva para traces, métricas y contexto de correlación.
Los logs deberán mantener formato estructurado cuando sea técnicamente apropiado.
La plataforma concreta de observabilidad se decidirá según costo, capacidad, infraestructura disponible, facilidad de operación, retención y privacidad.

## 16. Seguridad e identidad
### 16.1 Principio
La autenticación y autorización deberán ser componentes explícitos de la arquitectura.
Se deberán separar identidad, autenticación, autorización, roles, permisos, sesiones/tokens y auditoría.

### 16.2 OAuth/OIDC
**Adoptado: Keycloak 26.7.x autogestionado.**
Keycloak será el Identity Provider OIDC. NestJS será Resource Server y conservará la autorización de negocio. Para clientes públicos se utilizará Authorization Code + PKCE.

## 17. Reverse proxy
**Adoptado: Caddy.**
Se utilizará como reverse proxy/TLS inicial. Nginx permanece como alternativa si aparecen requisitos específicos de infraestructura.

## 18. Dependencias externas
Toda dependencia externa crítica deberá evaluarse según licencia, actividad/mantenimiento, seguridad, compatibilidad, costo, límites, lock-in, facilidad de sustitución y disponibilidad.
Para proveedores externos se deberá identificar proveedor, servicio, API, límite, SLA/expectativa de disponibilidad cuando exista, fallback y estrategia de sustitución.

## 18.3 Routing
**Adoptado: Valhalla autogestionado sobre OSM de Cuba**, detrás de un puerto `RoutingProvider`. Se utilizará para rutas, matrices tiempo/distancia y optimización básica de paradas. La optimización empresarial completa (VRP, capacidad, ventanas, prioridades y tiempos de servicio) pertenece al dominio.

## 18.4 Trabajos asíncronos
**Adoptado: pg-boss sobre PostgreSQL.** Se utilizará solo para trabajos que realmente requieran procesamiento asíncrono, reintentos, programación o backpressure. Redis, RabbitMQ y Kafka no forman parte del baseline.

## 18.5 Almacenamiento de archivos
**Adoptado: `ObjectStorage` port con filesystem persistente como implementación inicial.** PostgreSQL conserva metadatos e integridad. El port queda preparado para S3-compatible si la evolución lo requiere. MinIO no forma parte del baseline inicial.

## 18.6 Notificaciones
**Adoptado: Firebase Cloud Messaging** como canal push inicial para Android/iOS/Web. Email, SMS y WhatsApp quedan fuera hasta que exista requisito.

## 18.7 Mobile state/offline
**Adoptado: Riverpod + Drift/SQLite + flutter_secure_storage.** Offline es selectivo: la operación móvil crítica puede trabajar con datos sincronizados y cola local; la web administrativa permanece online-first.

## 19. Tecnologías no adoptadas inicialmente
No forman parte del baseline inicial: microservicios, Kubernetes, service mesh, serverless como arquitectura general, Kafka u otro event streaming distribuido, múltiples bases de datos sin necesidad, blockchain, GraphQL, AI/ML como dependencia obligatoria del núcleo, multi-cloud e infraestructura excesivamente distribuida.
Esto no significa que estén prohibidas. Significa que requieren una decisión específica basada en requisitos y evidencia.

## 20. Criterios para cambiar una tecnología
Una tecnología podrá sustituirse cuando no satisfaga requisitos, introduzca riesgo desproporcionado, tenga problemas de seguridad, quede sin mantenimiento, limite el crecimiento necesario, incremente excesivamente la complejidad, presente costos incompatibles, tenga problemas de disponibilidad, produzca lock-in inaceptable o una alternativa ofrezca ventajas demostrables.
Toda sustitución relevante deberá quedar documentada.

## 21. PoC y decisiones pendientes
### P0 — Cerrado por ADR-004
Las decisiones tecnológicas transversales pendientes de v0.3.0 quedaron cerradas por ADR-004: Prisma, identidad, Web, Mobile, mapas, routing, almacenamiento, asincronía, notificaciones, observabilidad y reverse proxy.

### P1 — Detalle de implementación
1. Modelo de roles/permisos.
2. Contrato de sincronización offline.
3. Contrato RoutingProvider.
4. Contrato ObjectStorage.
5. Parámetros y dataset de Valhalla para Cuba.
6. Dashboards, retención y alertas.
7. políticas concretas de deployment y backup.

### P2 — Evolutivas
1. capacidades de IA;
2. optimización de rutas;
3. event-driven architecture avanzada;
4. extracción de módulos a servicios independientes.

## 22. Criterios de aceptación del Stack Baseline
El baseline se considera técnicamente válido cuando todas las tecnologías adoptadas tienen una justificación; las tecnologías críticas pendientes están identificadas; existe una ruta de validación; no existen dependencias externas no documentadas; el stack es compatible con la arquitectura baseline; puede ejecutarse en el entorno de desarrollo objetivo; permite pruebas automatizadas; permite CI; permite evolución; y no introduce complejidad operacional injustificada.


## Política de versiones y compatibilidad

La regla oficial del Ecosistema es **Latest Stable Compatible**: seleccionar la versión estable más reciente que sea compatible con el conjunto completo, no simplemente la versión con el número mayor.

No se incorporan automáticamente versiones alpha, beta, RC, nightly, canary, next o dev. Una prerelease requiere ADR específico.

### Matriz vigente — 2026-09-25

| Componente | Última considerada | Versión fijada | Motivo |
|---|---|---|---|
| Node.js | 26.10.0 Current | **24.21.0 LTS** | LTS y compatibilidad operacional |
| NestJS | 12.1.0 | **12.1.0** | Compatible con Node 24 |
| TypeScript | 7.x | **6.0.3** | Compatibilidad con tooling NestJS 12 |
| React | 19.3 | **19.3** | Última versión estable documentada |
| Vite | 8.3.x | **8.3.x** | Rama estable soportada |
| Flutter | 3.47.5 | **3.47.5** | Stable para Android/iOS |
| Dart | 3.13.4 | **3.13.4** | Incluido con Flutter 3.47.5 |
| PostgreSQL | 19 Beta 4 | **18.6** | 19 continúa en beta |
| PostGIS | 3.7 prerelease | **3.6.0** | Línea estable compatible con PostgreSQL 18 |
| Prisma ORM | 8.0.0-rc.x | **7.10.0** | Prisma 8 continúa en RC |
| Docker Engine | 29.8.1 | **29.8.1** | Stable |
| Playwright | 1.63.0 | **1.63.0** | Stable |
| Supertest | 7.2.2 | **7.2.2** | Stable |
| ESLint | 10.11.0 | **10.11.0** | Stable |
| Prettier | 3.9.0 | **3.9.0** | Stable |

Las versiones críticas deberán quedar fijadas en manifests/lockfiles y reproducirse en CI/CD.

## 23. Estrategia de evolución
La versión 0.1.0 representa un baseline, no el stack final del Ecosistema.

Necesidad → Requisito → Criterios técnicos → Candidatos → PoC / Benchmark → Evaluación → Decisión → ADR → Actualización del Stack Baseline → Implementación

Las decisiones de alto impacto deberán quedar registradas mediante ADR.

## 24. Próximos pasos
1. implementar Prisma/PostGIS según ADR-004;
2. integrar Geoapify mediante `GeocodingProvider`;
3. implementar Keycloak/OIDC y RBAC;
4. implementar MapLibre/OpenFreeMap y `RoutingProvider`;
5. establecer offline móvil con Riverpod + Drift;
6. implementar quality gates y CI/CD;
7. comenzar la primera capacidad de negocio mediante Issue → diseño → implementación → pruebas → PR.

## 25. Estado de decisiones
| Decisión | Estado |
|---|---|
| Arquitectura modular monolith | Adoptada |
| Clean/Hexagonal | Adoptada |
| PostgreSQL | Adoptada |
| PostGIS | Adoptada |
| REST/OpenAPI | Adoptada |
| GitHub Actions | Adoptada |
| Docker | Adoptado |
| Git/GitHub | Adoptado |
| Node.js LTS | Adoptado |
| NestJS | Adoptado |
| React/Vite | Provisional |
| Flutter | Provisional |
| Jest/Supertest | Provisional |
| Vitest/Testing Library/Playwright | Provisional |
| Flutter Test/integration_test | Provisional |
| Prisma | Adoptado: 7.10.0 |
| Geocoder | Adoptado: Geoapify + fallback Nominatim autogestionado |
| Routing engine | Adoptado: Valhalla autogestionado |
| Identity provider | Adoptado: Keycloak 26.7.x |
| Observability backend | Adoptado: OTel + Collector + Prometheus + Grafana + Loki |
| Reverse proxy | Adoptado: Caddy |
| AI/ML | No requerido por baseline |

## 26. Regla de gobierno
**Ninguna tecnología crítica se considerará definitiva únicamente porque haya sido propuesta.**
Debe existir evidencia suficiente y una decisión documentada.
Cuando la decisión tenga impacto arquitectónico significativo, se deberá crear un ADR.

**Fin del Technology Stack Baseline v0.4.0.**

**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
