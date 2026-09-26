# ADR-004 — Cierre del stack tecnológico transversal

- **Estado:** Aprobado
- **Fecha:** 2026-09-26
- **Alcance:** decisiones tecnológicas pendientes del baseline v0.3.0
- **Regla:** Latest Stable Compatible

## Contexto
El baseline ya había cerrado arquitectura, backend, PostgreSQL/PostGIS, REST/OpenAPI, Docker, GitHub Actions y geocodificación. Permanecían abiertas decisiones sobre acceso a datos, identidad, mapas, routing, móvil, almacenamiento, trabajos asíncronos, notificaciones, observabilidad, reverse proxy y quality gates.

Las decisiones se aprobaron aplicando requisitos del Ecosistema, costo cero/minimización de costo, simplicidad operacional, sustituibilidad, seguridad, compatibilidad Web/Android/iOS y evidencia técnica actual.

## Decisiones

### 1. Acceso a datos — Prisma 7.10.0: ADOPTADO
Se adopta Prisma 7.10.0 sobre PostgreSQL 18.6. Prisma soporta PostgreSQL 18 y permite SQL/TypedSQL para capacidades que el cliente ORM no expresa directamente. PostGIS queda como extensión del motor y las operaciones espaciales se encapsularán en repositorios/servicios SQL controlados.

**Motivo:** mantiene tipado y productividad en TypeScript sin sacrificar PostGIS. No se justifica sustituir Prisma por TypeORM ni por SQL puro.

**Regla:** el dominio no dependerá de Prisma; Prisma pertenece a infraestructura.

### 2. Identidad — Keycloak 26.7.x: ADOPTADO
Se adopta Keycloak autogestionado como Identity Provider compatible con OAuth 2.0/OpenID Connect. La aplicación será un Resource Server; autorización de negocio seguirá dentro de NestJS.

Se utilizará Authorization Code + PKCE para clientes públicos Web/Mobile. Los tokens se validarán contra issuer/JWKS y los roles/permisos de negocio no se confiarán ciegamente a claims sin validación.

**Motivo:** evita construir criptografía, recuperación de cuentas, sesiones y flujos OIDC desde cero; cubre Web y Mobile; es sustituible mediante OIDC.

**Coste operacional aceptado:** un componente adicional. No convierte el backend de negocio en microservicios.

### 3. Web — React 19.3 + Vite 8.3.x: ADOPTADO
Se elimina el estado provisional. React + TypeScript + Vite es el baseline web.

### 4. Mobile — Flutter 3.47.5 + Dart 3.13.4: ADOPTADO
Se elimina el estado provisional. Flutter es la plataforma móvil oficial del Ecosistema para Android/iOS.

**Motivo:** una base de código compartida reduce duplicación y mantiene una sola arquitectura de dominio/presentación. APIs nativas solo se incorporarán cuando exista requisito de plataforma.

### 5. Estado móvil — Riverpod 3.x: ADOPTADO
Se adopta Riverpod como gestión de estado/dependencias de presentación y aplicación.

**Motivo:** separación clara de estado, inyección y lógica; testabilidad; integración natural con arquitectura por capas.

### 6. Persistencia local móvil — Drift/SQLite: ADOPTADO
Se adopta Drift sobre SQLite para cache y datos operacionales offline.

**Motivo:** persistencia relacional, transacciones, migraciones, consultas tipadas y buena integración Flutter.

### 7. Offline — Offline-capable selectivo: ADOPTADO
No todo el ecosistema será offline-first. Web administrativa será online-first. La aplicación móvil operativa tendrá capacidad offline para datos previamente sincronizados, captura de eventos de entrega, evidencias y operaciones que puedan reconciliarse.

La sincronización será explícita, idempotente y auditable. El servidor mantiene la autoridad sobre el estado canónico.

**Motivo:** transporte y reparto pueden perder conectividad; hacer todo offline aumentaría complejidad innecesariamente.

### 8. Seguridad local móvil — flutter_secure_storage: ADOPTADO
Credenciales/tokens sensibles no se guardarán en SQLite plano. Se utilizará almacenamiento seguro de plataforma mediante flutter_secure_storage.

### 9. Cartografía — MapLibre: ADOPTADO
Se adopta MapLibre como motor de renderizado cartográfico: MapLibre GL JS para Web y MapLibre Native mediante integración Flutter para Android/iOS.

Se mantiene una abstracción de MapTileProvider; el renderer no queda acoplado al proveedor de tiles.

### 10. Tiles — OpenFreeMap: ADOPTADO inicialmente
Se adopta OpenFreeMap como proveedor inicial de vector tiles OSM para el basemap. Publica servicio gratuito, sin API key ni registro, permite uso comercial y ofrece posibilidad de self-hosting. La atribución requerida se conservará.

**Motivo:** satisface la restricción de costo y encaja directamente con MapLibre. No se utilizarán los servidores públicos de tiles de OSM como backend de producción.

### 11. Routing — Valhalla autogestionado: ADOPTADO
Se adopta Valhalla sobre datos OSM de Cuba, aislado detrás de RoutingProvider.

**Motivo:** además de route y matriz tiempo/distancia, ofrece optimized route/TSP, costing dinámico y perfiles adecuados para transporte, incluido truck. Su licencia del software es MIT.

**Limitación:** la optimización completa de reparto (VRP con capacidad, ventanas, prioridades y tiempos de servicio) seguirá siendo lógica del dominio; Valhalla suministra red, tiempos, distancias y optimización básica.

### 12. Trabajos asíncronos — pg-boss/PostgreSQL: ADOPTADO
Se adopta pg-boss para trabajos que realmente necesiten procesamiento asíncrono: importaciones pesadas, geocodificación por lotes, generación de documentos, notificaciones y tareas programadas.

**Motivo:** utiliza el PostgreSQL ya obligatorio, soporta retries, backoff, prioridades, dead-letter queues y concurrencia, y evita introducir Redis/Kafka para el volumen actual.

**Regla:** no todo endpoint se convierte en job. Las operaciones cortas permanecen síncronas.

### 13. Redis/Kafka/RabbitMQ — NO ADOPTADOS
No se incorporan. No existe evidencia actual que justifique otro sistema de mensajería/cola.

### 14. Almacenamiento de archivos — filesystem con ObjectStorage port: ADOPTADO
Para el primer despliegue se utilizará almacenamiento persistente del servidor mediante un adapter de ObjectStorage. PostgreSQL conservará metadatos, hash, MIME, tamaño, propietario y referencias.

No se adopta MinIO en el baseline: su situación actual y licenciamiento AGPL no aportan una ventaja proporcional para el volumen inicial.

Se mantiene una interfaz compatible con S3 para poder migrar posteriormente sin contaminar el dominio.

### 15. Notificaciones push — Firebase Cloud Messaging: ADOPTADO
FCM será el canal push inicial para Android/iOS/Web, con APNs integrado para iOS.

**Motivo:** API multiplataforma y ausencia de infraestructura propia de mensajería push. La aplicación mantendrá PushNotificationProvider para sustituibilidad.

Email/SMS/WhatsApp no se adoptan todavía porque no existe requisito operativo cerrado que los justifique.

### 16. Observabilidad — OpenTelemetry + Collector + Prometheus + Grafana + Loki: ADOPTADO
- OpenTelemetry: instrumentación y contexto.
- OTel Collector: recepción/procesamiento/exportación.
- Prometheus: métricas.
- Grafana: dashboards/alertas.
- Loki: logs estructurados.

Traces se conservarán inicialmente mediante OpenTelemetry; el backend de trazas concreto se incorporará cuando el volumen y el despliegue lo requieran.

**Motivo:** stack abierto, integrable y sustituible; evita acoplar instrumentación a un vendor.

### 17. Reverse proxy — Caddy: ADOPTADO
Caddy será el reverse proxy inicial para despliegues públicos y TLS. Nginx queda como alternativa de infraestructura si aparecen requisitos específicos.

**Motivo:** configuración mínima y HTTPS automático, reduciendo superficie operacional para una instalación pequeña.

### 18. CI/CD — GitHub Actions + environments: ADOPTADO
Se establecen environments development, staging y production. Producción requerirá protección/approval cuando el despliegue sea real.

Quality gates mínimos:
1. format/lint
2. typecheck
3. unit tests
4. integration/API tests
5. build
6. E2E para cambios afectados
7. dependency/security checks
8. artifact/report publication

CodeQL y Dependency Review se incorporan como controles de supply chain cuando la configuración del repositorio lo permita.

### 19. Seguridad — OWASP ASVS 5.0 + MASVS como referencia: ADOPTADO
ASVS 5.0 será la referencia para backend/Web. MASVS se utilizará para móvil. No se considera que cumplir una lista sustituya threat modeling, pruebas o revisión.

### 20. Tecnologías explícitamente no necesarias
Continúan fuera del baseline: microservicios, Kubernetes, service mesh, Kafka, GraphQL, serverless como arquitectura general, multi-cloud y bases de datos adicionales sin requisito.

## Consecuencias
El stack queda reducido a una arquitectura operacionalmente coherente:

Web/Mobile → REST/OpenAPI → NestJS → PostgreSQL/PostGIS

con servicios auxiliares aislados:

Keycloak | Geoapify/Nominatim | MapLibre/OpenFreeMap | Valhalla | pg-boss | FCM | OTel/Prometheus/Grafana/Loki | Caddy

Cada integración externa queda detrás de un port/adaptador cuando exista riesgo de sustitución.

## Riesgos aceptados
1. Dependencia de servicios OSM/tiles externos: mitigada por abstracciones y opción de self-hosting.
2. Complejidad de Keycloak: aceptada por evitar desarrollar identidad propia.
3. Calidad del routing OSM en Cuba: no se presume perfecta; se validará con casos reales antes de convertir resultados en decisiones operativas.
4. Operación del stack de observabilidad: se desplegará inicialmente en modo simple, no distribuido.
5. Offline: aumenta complejidad de sincronización; se limita a capacidades móviles que realmente lo necesitan.

## Evidencia técnica
Las fuentes oficiales consultadas respaldan compatibilidad PostgreSQL/Prisma, OIDC/Keycloak, offline-first Flutter, MapLibre/vector tiles, OpenFreeMap, Valhalla route/matrix/optimized route, pg-boss sobre PostgreSQL, FCM, OpenTelemetry, Prometheus, Loki, Caddy y OWASP ASVS.

## Estado
Esta ADR cierra las decisiones tecnológicas transversales pendientes del baseline v0.3.0. Las decisiones de detalle de implementación (esquema de roles, modelo exacto de sincronización, estilo cartográfico, parámetros de Valhalla y retención) se documentarán en Issues/ADRs específicos cuando se implementen.
