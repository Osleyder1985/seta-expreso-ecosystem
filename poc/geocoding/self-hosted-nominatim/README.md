# PoC — Nominatim autogestionado para Cuba

Issue #159. Diseño ejecutable; campaña pendiente.

Objetivo: evaluar Nominatim autogestionado con el extracto OSM de Cuba como alternativa o fallback, sin seleccionarlo todavía como proveedor definitivo.

## Entorno
- Windows 11 Pro como host.
- Docker Desktop para ejecutar la infraestructura.
- No se introduce Ubuntu como requisito del entorno del usuario.
- Endpoint Nominatim local; el servidor público no participa.
- Integración mediante GeocodingProvider.

## Componentes
- Nominatim 5.3.x.
- PostgreSQL/PostGIS.
- osm2pgsql.
- Extracto Cuba OSM PBF de Geofabrik.
- Runner común del benchmark Cuba.

## Datos
URL por defecto: https://download.geofabrik.de/central-america/cuba-latest.osm.pbf. La importación se realiza desde archivo local mediante PBF_PATH para que el artefacto exacto quede bajo control de la PoC.

Antes de importar se descarga el PBF y se calcula SHA-256. Si se dispone de un hash publicado por la fuente, debe verificarse; si no, el hash local se conserva como identificación del artefacto, no como prueba independiente de autenticidad.

## Ejecución
1. Copiar .env.example a .env.
2. Ejecutar .\download-cuba-pbf.ps1.
3. Verificar que .\data\cuba-latest.osm.pbf exista y conservar su SHA-256.
4. Ejecutar docker compose pull.
5. Ejecutar docker compose up -d.
6. Observar logs hasta finalizar importación/indexación.
7. Ejecutar health check.

Prueba forward: http://localhost:8080/search?q=Camagüey%2C%20Cuba&format=jsonv2&addressdetails=1&limit=5

Prueba reverse: http://localhost:8080/reverse?lat=21.3808&lon=-77.9169&format=jsonv2&addressdetails=1

Estas consultas solo demuestran funcionamiento técnico; no constituyen evidencia de precisión.

## Benchmark
Se ejecuta exactamente el dataset existente de Cuba v0.1. No se modifica el corpus.

Variables: GEOCODING_PROVIDER=nominatim; NOMINATIM_BASE_URL=http://localhost:8080/search; NOMINATIM_USER_AGENT=SETA-EXPRESO-Nominatim-PoC/0.1; GEOCODING_INTERVAL_MS=100.

El runner genera resultados JSONL y provenance. La validación sigue: HTTP -> resultado -> validación territorial SETA -> control espacial -> ACCEPTED/REVIEW/REJECTED.

## Evidencia
Registrar versión de Nominatim, PostgreSQL/PostGIS, Docker, URL y SHA-256 del PBF, fecha, tiempo de importación, tamaño de almacenamiento, CPU/RAM, latencia p50/p95, errores, resultados JSONL y provenance.

El tamaño del PBF no debe confundirse con el tamaño final de la base indexada.

## Actualización
La campaña inicial usa un snapshot fijo y reproducible. La actualización automática no se activa durante la primera medición. Después se evaluará snapshot periódico frente a replication de OSM.

## Criterio de cierre
La PoC debe demostrar instalación reproducible, forward/reverse, ejecución del corpus, resultados auditables, métricas comunes, consumo de recursos y estrategia de actualización.

No se asignará ranking ni puntuación ganadora. La decisión posterior considerará calidad territorial, precisión espacial, falsos positivos, estabilidad, licenciamiento, coste y sustituibilidad.
