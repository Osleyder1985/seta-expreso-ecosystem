# Auditoría estricta del Ecosistema SETA EXPRESO SURL — 2026-09-26

## 1. Propósito y alcance

Auditoría de ingeniería del estado del repositorio y del producto al 26/09/2026. El objetivo es determinar qué está correctamente definido, qué está implementado y verificado, qué presenta incumplimientos o inconsistencias y qué acciones deben ejecutarse.

La auditoría se apoya en los marcos oficiales aplicables al tipo de evidencia revisada: ISO/IEC/IEEE 12207 (ciclo de vida), ISO/IEC/IEEE 29148 (requisitos), ISO/IEC/IEEE 42010 (descripción de arquitectura), ISO/IEC/IEEE 15288 cuando corresponde al sistema, ISO/IEC 25010 (calidad de producto), ISO/IEC 27001 como referencia de SGSI, OWASP ASVS 5.0 y OWASP MASVS, además de documentación oficial de las tecnologías adoptadas. Esta auditoría NO constituye una certificación de conformidad ISO.

## 2. Resumen ejecutivo

El Ecosistema presenta una base arquitectónica y de decisión tecnológica sólida, con ADRs, benchmarks, PoCs y una estrategia de modular monolith + Clean/Hexagonal. Sin embargo, existe una diferencia relevante entre estado DECIDIDO, DOCUMENTADO, IMPLEMENTADO, VERIFICADO y OPERACIONAL.

La auditoría identifica cinco hallazgos críticos:
- C-01: baseline de NestJS mezcla versión del framework con versiones de tooling; el PR #172 intentó instalar `@nestjs/cli@12.1.0`, versión que no está publicada.
- C-02: CI del bootstrap backend no está verde; por tanto el bootstrap no puede declararse verificado.
- C-03: documentación de decisiones/estado presenta inconsistencias y no existe una única fuente de verdad suficientemente controlada.
- C-04: seguridad está decidida arquitectónicamente pero todavía no existe evidencia de implementación y verificación ASVS/MASVS.
- C-05: requisitos funcionales y no funcionales aún no están formalizados con una baseline y trazabilidad completas.

Hallazgos altos:
- arquitectura formal todavía incompleta respecto al enfoque de ISO/IEC/IEEE 42010;
- persistencia/PostGIS aún no implementada;
- Keycloak/OIDC aún no implementado;
- routing Cuba sin PoC operacional;
- geocodificación Cuba sin benchmark experimental observable;
- offline sync sin contrato implementado;
- observabilidad no implementada;
- backup/restore no verificado;
- testing funcional todavía muy temprano;
- catálogo territorial nominal completo aún no cerrado;
- ObjectStorage y jobs aún no implementados;
- OpenAPI todavía no integrado en el bootstrap.

## 3. Escala

- CRÍTICO: impide considerar fiable/cerrado el baseline o introduce riesgo significativo inmediato.
- ALTO: afecta una capacidad esencial o una afirmación de arquitectura/calidad que aún no puede verificarse.
- MEDIO: defecto importante pero no bloqueante.
- BAJO: mejora de calidad/documentación sin impacto inmediato.

Los estados se expresan separadamente:
- DECIDIDO: decisión aprobada.
- DOCUMENTADO: existe documentación.
- IMPLEMENTADO: existe código/configuración.
- VERIFICADO: existe evidencia reproducible.
- OPERACIONAL: utilizado de forma integrada en el sistema.

## 4. Evaluación por disciplina

### 4.1 Ciclo de vida — 🟢/🟡
Fortalezas: Issue → evidencia → ADR → implementación → pruebas → PR → CI → integración; uso de ADRs y PoCs.
Brecha: faltan controles automáticos y trazabilidad completa para impedir decisiones/documentos/código divergentes.

### 4.2 Requisitos — 🟡
Existe una descripción funcional rica, pero falta una Requirements Baseline formal que distinga requisitos de negocio, sistema, software, funcionales, no funcionales, seguridad, datos, interfaces y operación, con criterios de aceptación y trazabilidad a pruebas.

### 4.3 Arquitectura — 🟢/🟡
Modular Monolith + Clean/Hexagonal, puertos/adaptadores y separación de proveedores son decisiones coherentes.
Brecha: falta una Architecture Description completa con stakeholders, concerns, viewpoints, views, correspondencias y escenarios de calidad.

### 4.4 Clean/Hexagonal — 🟡
La regla de independencia del dominio está correctamente adoptada, pero el código existente todavía es demasiado pequeño para demostrar conformidad arquitectónica.

### 4.5 Backend — 🔴/🟡
La decisión NestJS 12.1.0 + TypeScript 6.0.3 + Node 24.21.0 es contextual; sin embargo, el tooling Nest no comparte necesariamente la misma versión. El PR #172 quedó bloqueado por una referencia inválida a `@nestjs/cli@12.1.0`. Deben separarse framework y tooling en el baseline.

### 4.6 CI/CD — 🔴
El bootstrap backend no está verificado porque CI falla en instalación. Además, debe establecerse política reproducible basada en lockfile (`npm ci` cuando exista lockfile válido), y los workflows deben reflejar exactamente la configuración actual.

### 4.7 Seguridad — 🔴/🟡
Keycloak/OIDC/PKCE/RBAC, secure storage y ASVS/MASVS son buenas decisiones. No existe todavía evidencia suficiente de token validation, issuer/audience/JWKS, autorización de objeto, rate limiting, CORS/headers, gestión de secretos, auditoría, threat model, SAST/DAST y controles móviles.

### 4.8 Datos — 🟡
PostgreSQL/PostGIS + Prisma/SQL controlado es una base correcta. Faltan schema/migrations, constraints, índices, SRID policy, spatial indexes, backup/restore, roles y least privilege.

### 4.9 Territorio Cuba — 🟢/🟡
ONEI como fuente primaria, DPA separada de asentamientos y Consejo Popular, versionado y variantes son correctos. Falta el catálogo nominal operacional completo verificable; no debe inventarse.

### 4.10 Geocodificación — 🟡
Geoapify primario + Nominatim autogestionado fallback está documentado como decisión operacional. No debe presentarse como prueba de superioridad de precisión en Cuba hasta ejecutar un corpus representativo. El Quality Gate ACCEPT/REVIEW/REJECT es correcto.

### 4.11 Mapas — 🟡
MapLibre y abstracción de tiles son buenas decisiones. OpenFreeMap requiere validación operacional de disponibilidad, límites, atribución, caching y fallback.

### 4.12 Routing — 🟡/🔴
Valhalla + RoutingProvider es una arquitectura adecuada. Falta PoC con extracto cubano, perfiles y workloads reales.

### 4.13 XLSX — 🟢/🟡
Existe investigación y certificación previa sobre Excel real. Falta convertirla en contrato de importación versionado con mapping, validación, normalización, errores, auditoría y criterios de aceptación.

### 4.14 Testing — 🟡/🔴
La estrategia de herramientas es adecuada, pero la cobertura funcional real todavía es mínima. Faltan tests de dominio, integración DB, contratos API, seguridad, Web, Mobile, offline, geocoding y routing.

### 4.15 Calidad — 🟡/🔴
ISO/IEC 25010 debe traducirse a objetivos medibles. Existe benchmark backend real, pero no caracteriza XLSX, DB, geocoding, routing, auth, sync ni cargas sostenidas.

### 4.16 Observabilidad — 🟡
OpenTelemetry + Collector + Prometheus + Grafana + Loki está correctamente decidido. No está implementado ni verificado.

### 4.17 Mobile/offline — 🟡/🔴
Flutter/Riverpod/Drift/secure storage y offline selectivo son decisiones coherentes. Falta implementación de outbox/inbox, idempotency keys, conflictos, autoridad del servidor y pruebas de sincronización.

### 4.18 ObjectStorage/jobs — 🟡/🔴
Las abstracciones son adecuadas, pero aún faltan implementación, seguridad de archivos, checksum, límites, retries, DLQ, idempotencia y observabilidad.

### 4.19 Gobernanza/documentación — 🟡
Issues, PRs, ADRs, SECURITY y CONTRIBUTING aportan una buena base. Deben corregirse referencias rotas, estados contradictorios, CODEOWNERS y sincronización entre documentación y código.

## 5. Matriz de hallazgos

| ID | Severidad | Hallazgo | Acción |
|---|---|---|---|
| C-01 | CRÍTICO | Versionado Nest framework/tooling incorrectamente modelado; `@nestjs/cli@12.1.0` no existe | Corregir baseline/manifests y política de versionado |
| C-02 | CRÍTICO | CI del backend bootstrap falla | Corregir dependencias, lockfile y CI; exigir verde |
| C-03 | CRÍTICO | Documentación con estados contradictorios | Consolidar fuente de verdad y supersede |
| C-04 | CRÍTICO | Seguridad sin implementación/verificación suficiente | Implementar baseline ASVS/MASVS |
| C-05 | CRÍTICO | Requirements baseline y trazabilidad insuficientes | Crear requisitos formales y RTM |
| H-01 | ALTO | Architecture Description incompleta | Crear descripción arquitectónica conforme 42010 |
| H-02 | ALTO | Persistencia/PostGIS no implementada | Implementar schema/migrations/espacial/backup |
| H-03 | ALTO | Keycloak/OIDC/RBAC no implementado | Implementar contrato + adapter + tests |
| H-04 | ALTO | Routing Cuba no validado | Ejecutar PoC reproducible con extracto Cuba |
| H-05 | ALTO | Geocoding Cuba sin evidencia experimental | Ejecutar benchmark representativo sin afirmar precisión previa |
| H-06 | ALTO | Offline sync no implementado | Implementar contrato de sincronización |
| H-07 | ALTO | Observabilidad no implementada | Implementar OTel/metrics/logs/dashboards |
| H-08 | ALTO | Testing funcional muy temprano | Construir pirámide de pruebas y gates |
| H-09 | ALTO | Catálogo territorial nominal completo no cerrado | Recuperar/validar fuente primaria antes de seed |
| H-10 | ALTO | ObjectStorage no implementado | Implementar port/adaptador/controles |
| H-11 | ALTO | Jobs pg-boss no implementados | Implementar idempotencia/retry/DLQ/metrics |
| H-12 | ALTO | OpenAPI todavía no integrado | Generar/validar contrato API |
| M-01 | MEDIO | CODEOWNERS incompleto | Ampliar ownership crítico |
| M-02 | MEDIO | Falta threat model | Crear modelo de amenazas y mitigaciones |
| M-03 | MEDIO | Falta política de API errors/pagination/versioning | Estandarizar contrato HTTP |
| M-04 | MEDIO | Falta backup/restore test formal | Ejecutar restauración reproducible |
| M-05 | MEDIO | Documentación de PR puede quedar obsoleta respecto a cambios | Añadir checklist de sincronización |

## 6. Regla de cierre

Un hallazgo sólo se considera cerrado cuando exista:
1. implementación o corrección;
2. prueba automatizada cuando sea aplicable;
3. evidencia reproducible;
4. documentación actualizada;
5. CI verde cuando corresponda;
6. revisión/integración por PR.

No se considerará “cerrado” por el mero hecho de existir una ADR.

## 7. Prioridad de remediación

P0: C-01, C-02, C-03, C-04, C-05.
P1: H-01 a H-12.
P2: M-01 a M-05.

## 8. Conclusión

El Ecosistema posee una base de arquitectura y gobernanza valiosa, pero debe pasar de “decisiones documentadas” a “decisiones implementadas y verificadas”. La principal mejora de ingeniería es establecer una disciplina explícita de evidencia y una única fuente de verdad, evitando declarar cerrada una capacidad que sólo está decidida o documentada.
