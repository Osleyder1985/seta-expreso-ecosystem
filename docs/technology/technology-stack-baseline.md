# Technology Stack Baseline v0.1.0

**Ecosistema:** SETA EXPRESO SURL  
**Estado:** En validación
**Versión:** 0.1.0  
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
| Backend | NestJS + TypeScript | Adoptado provisionalmente |
| Runtime | Node.js LTS | Adoptado |
| API | REST + OpenAPI | Adoptado |
| Web | React + TypeScript + Vite | Adoptado provisionalmente |
| Mobile | Flutter + Dart | Adoptado provisionalmente |
| DB | PostgreSQL | Adoptado |
| Geodatos | PostGIS | Adoptado |
| Acceso a datos | Prisma, sujeto a validación | Candidato |
| Backend tests | Jest + Supertest | Adoptado provisionalmente |
| Web tests | Vitest + Testing Library + Playwright | Adoptado provisionalmente |
| Mobile tests | Flutter Test + integration_test | Adoptado provisionalmente |
| CI | GitHub Actions | Adoptado |
| Contenedores | Docker | Adoptado |
| API docs | OpenAPI/Swagger | Adoptado |
| Maps | OpenStreetMap como fuente/cartografía base, sujeto a implementación concreta | Adoptado como dirección |
| Geocoding | Provider abstraction + proveedor por evaluar | Candidato |
| Observabilidad | OpenTelemetry + backend compatible | Dirección adoptada |
| Version control | Git + GitHub | Adoptado |
| Auth | OAuth/OIDC compatible, sujeto a diseño de identidad | Candidato |
| Reverse proxy | Caddy/Nginx si el despliegue lo requiere | Candidato |
| AI/ML | No obligatorio en baseline | No adoptado como requisito tecnológico |

Nota: “Adoptado provisionalmente” significa que la tecnología puede utilizarse como baseline de implementación, pero permanece sujeta a validación técnica mediante evidencia.

## 5. Backend

### 5.1 NestJS + TypeScript
**Baseline provisional: NestJS + TypeScript.**

Razones: estructura modular, inyección de dependencias, soporte para separación por módulos, buen encaje con Clean/Hexagonal, tipado estático de TypeScript, ecosistema adecuado para APIs, buena capacidad de pruebas y posibilidad de evolucionar un modular monolith sin exigir microservicios.

La decisión debe considerarse conjuntamente con la evidencia de los PoC de backend existentes en el repositorio, incluyendo el PoC de ASP.NET Core. La existencia de un PoC alternativo no se descarta: forma parte de la evidencia utilizada para la decisión final.

### 5.2 Node.js LTS
**Adoptado.**
El runtime debe utilizar una versión LTS soportada y fijada explícitamente mediante los mecanismos de versionado del proyecto. No se permitirá depender de una versión latest no controlada.

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
**Baseline provisional.**
Se selecciona como punto de partida por ecosistema amplio, TypeScript, modularidad, facilidad para componentes reutilizables, integración con pruebas y compatibilidad con API REST.
Vite se utilizará como herramienta de desarrollo/build salvo que requisitos futuros justifiquen otra alternativa.

## 8. Aplicaciones móviles

### 8.1 Flutter + Dart
**Baseline provisional para Android e iOS.**
La decisión busca mantener una base de código compartida cuando la funcionalidad y el comportamiento de las plataformas lo permitan.
Esto no implica que el 100 % de las capacidades serán idénticas entre plataformas. Cuando una capacidad requiera APIs nativas, se aislará, se documentará y se utilizará integración nativa solo donde sea necesario.

Alternativa: desarrollo nativo independiente con Kotlin/Android y Swift/iOS. No se adopta inicialmente porque duplicaría gran parte del desarrollo, pero podrá reevaluarse si aparecen requisitos específicos de plataforma que hagan insuficiente Flutter.

## 9. Persistencia

### 9.1 PostgreSQL
**Adoptado.**
Se utilizará como sistema principal de persistencia relacional por su adecuación a procesos empresariales, integridad transaccional, consultas complejas, ecosistema maduro, extensibilidad y disponibilidad de capacidades geoespaciales mediante PostGIS.

### 9.2 PostGIS
**Adoptado.**
Se utilizará para representar y consultar información espacial: coordenadas de direcciones, puntos de entrega, localizaciones, consultas geográficas y preparación para cálculo/optimización de rutas.
La utilización concreta de algoritmos de routing será una decisión posterior.

### 9.3 Acceso a datos
**Candidato: Prisma.**
Prisma se establece como candidato inicial por integración con TypeScript, tipado, productividad y migraciones.
Antes de congelar la decisión se evaluará frente a TypeORM, acceso SQL controlado y otras alternativas justificadas.
La existencia de consultas espaciales/PostGIS deberá formar parte explícita de la evaluación.
Criterio crítico: la herramienta de acceso a datos no debe impedir aprovechar capacidades SQL/PostGIS necesarias para el dominio.

## 10. Geocodificación y mapas

### 10.1 Separación de responsabilidades
Se separarán Map rendering, Geocoding, Routing y Spatial persistence.
No se permitirá que una única librería o proveedor quede acoplado a todo el subsistema geoespacial sin necesidad.

### 10.2 OpenStreetMap
**Dirección tecnológica adoptada para cartografía abierta.**
La utilización concreta de servicios derivados de OpenStreetMap debe respetar sus políticas, atribución, capacidad y límites.
OpenStreetMap no implica que cualquier servicio público asociado sea ilimitado o apropiado para producción.

### 10.3 Geocoding
**No se congela todavía un proveedor específico.**
Se requiere evaluar cobertura geográfica, calidad de resultados en Cuba, normalización de direcciones, límites de solicitudes, política de uso, disponibilidad, latencia, capacidad de batch, precisión, costo, términos de uso y posibilidad de sustitución.
La aplicación deberá utilizar una abstracción equivalente a GeocodingProvider. El dominio no deberá conocer la implementación concreta del proveedor.

## 11. Testing

### 11.1 Backend
Baseline provisional: Jest y Supertest.
Cobertura esperada: unit tests, integration tests, API tests y contract-related tests cuando sean útiles.

### 11.2 Web
Baseline provisional: Vitest, Testing Library y Playwright.
Capas: unit, component, integration y end-to-end.

### 11.3 Mobile
Baseline provisional: Flutter Test e integration_test.
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
**Candidato**, no decisión irreversible.
Se utilizará un proveedor/servidor compatible con estándares cuando los requisitos lo justifiquen.
Antes de seleccionar una solución concreta se evaluará costo, posibilidad de operación propia, compatibilidad Web/Mobile, refresh tokens, revocación, MFA, gestión de roles, integración con clientes y dependencia del proveedor.

## 17. Reverse proxy
**Candidato: Caddy o Nginx.**
No se congela uno de los dos en v0.1.0. La selección dependerá de arquitectura de despliegue, TLS, routing, facilidad operacional, recursos disponibles, necesidades de caching o headers y simplicidad.

## 18. Dependencias externas
Toda dependencia externa crítica deberá evaluarse según licencia, actividad/mantenimiento, seguridad, compatibilidad, costo, límites, lock-in, facilidad de sustitución y disponibilidad.
Para proveedores externos se deberá identificar proveedor, servicio, API, límite, SLA/expectativa de disponibilidad cuando exista, fallback y estrategia de sustitución.

## 19. Tecnologías no adoptadas inicialmente
No forman parte del baseline inicial: microservicios, Kubernetes, service mesh, serverless como arquitectura general, Kafka u otro event streaming distribuido, múltiples bases de datos sin necesidad, blockchain, GraphQL, AI/ML como dependencia obligatoria del núcleo, multi-cloud e infraestructura excesivamente distribuida.
Esto no significa que estén prohibidas. Significa que requieren una decisión específica basada en requisitos y evidencia.

## 20. Criterios para cambiar una tecnología
Una tecnología podrá sustituirse cuando no satisfaga requisitos, introduzca riesgo desproporcionado, tenga problemas de seguridad, quede sin mantenimiento, limite el crecimiento necesario, incremente excesivamente la complejidad, presente costos incompatibles, tenga problemas de disponibilidad, produzca lock-in inaceptable o una alternativa ofrezca ventajas demostrables.
Toda sustitución relevante deberá quedar documentada.

## 21. PoC y decisiones pendientes
### P0 — Alta prioridad
1. NestJS vs ASP.NET Core.
2. Flutter vs desarrollo nativo.
3. Prisma vs alternativa de acceso a PostgreSQL/PostGIS.
4. Geocoder compatible con los requisitos reales de Cuba.
5. Estrategia de autenticación/identidad.

### P1 — Prioridad media
6. Solución concreta de mapas.
7. Routing engine.
8. almacenamiento de documentos.
9. plataforma de notificaciones.
10. observabilidad concreta.
11. reverse proxy.

### P2 — Evolutivas
12. capacidades de IA;
13. optimización de rutas;
14. event-driven architecture avanzada;
15. extracción de módulos a servicios independientes.

## 22. Criterios de aceptación del Stack Baseline
El baseline se considera técnicamente válido cuando todas las tecnologías adoptadas tienen una justificación; las tecnologías críticas pendientes están identificadas; existe una ruta de validación; no existen dependencias externas no documentadas; el stack es compatible con la arquitectura baseline; puede ejecutarse en el entorno de desarrollo objetivo; permite pruebas automatizadas; permite CI; permite evolución; y no introduce complejidad operacional injustificada.

## 23. Estrategia de evolución
La versión 0.1.0 representa un baseline, no el stack final del Ecosistema.

Necesidad → Requisito → Criterios técnicos → Candidatos → PoC / Benchmark → Evaluación → Decisión → ADR → Actualización del Stack Baseline → Implementación

Las decisiones de alto impacto deberán quedar registradas mediante ADR.

## 24. Próximos pasos
1. evaluar objetivamente NestJS vs ASP.NET Core utilizando los PoC existentes;
2. validar Flutter;
3. validar Prisma/PostGIS;
4. investigar y probar geocodificación;
5. definir identidad/autorización;
6. preparar la estructura inicial de proyectos;
7. establecer quality gates;
8. definir CI;
9. actualizar el baseline según evidencia;
10. comenzar la implementación de la primera capacidad de negocio mediante Issue → diseño → implementación → pruebas → PR.

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
| NestJS | Provisional |
| React/Vite | Provisional |
| Flutter | Provisional |
| Jest/Supertest | Provisional |
| Vitest/Testing Library/Playwright | Provisional |
| Flutter Test/integration_test | Provisional |
| Prisma | Candidato |
| Geocoder | Pendiente |
| Routing engine | Pendiente |
| Identity provider | Pendiente |
| Observability backend | Pendiente |
| Reverse proxy | Pendiente |
| AI/ML | No requerido por baseline |

## 26. Regla de gobierno
**Ninguna tecnología crítica se considerará definitiva únicamente porque haya sido propuesta.**
Debe existir evidencia suficiente y una decisión documentada.
Cuando la decisión tenga impacto arquitectónico significativo, se deberá crear un ADR.

**Fin del Technology Stack Baseline v0.1.0.**

**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
