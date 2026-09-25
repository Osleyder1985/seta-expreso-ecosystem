# Corte de auditoría

Este informe es el baseline integral del corte posterior al informe histórico v1.0.0.

# Auditoría integral del repositorio — corte 2026-09-25

**Código:** AUD-2026-09-25-01  
**Versión:** 2.0.0  
**Estado formal:** En validación  
**Repositorio:** `Osleyder1985/SETA-EXPRESO-ECOSYSTEM`  
**Commit auditado:** `43a3a4cda8911dfe60016ed2e106b28f11efe5c9`  
**Rama:** `main`  
**Fecha de corte:** 2026-09-25  
**Archivos en el árbol auditado:** 94  
**Issue principal:** #101 y Issues derivadas #102–#111

---

## 1. Objetivo

Realizar un examen estricto del estado real del repositorio **hasta el commit auditado**, sin penalizar al Ecosistema por capacidades que pertenecen a fases futuras cuando:

1. están explícitamente identificadas como futuras;
2. existe una decisión o plan que explica que todavía no se implementan;
3. no se afirma falsamente que ya estén implementadas.

La auditoría distingue:

- **Defecto actual:** inconsistencia, control insuficiente, evidencia contradictoria o incumplimiento del propio criterio adoptado.
- **No conformidad potencial:** requiere una condición o ámbito que ya existe y cuyo control no está demostrado.
- **Observación:** mejora de madurez sin evidencia de incumplimiento.
- **Trabajo futuro documentado:** no se penaliza.
- **Limitación de auditoría:** no puede evaluarse todavía porque el artefacto/producto aún no existe.
- **Fortaleza:** control o práctica respaldada por evidencia.

---

## 2. Método de auditoría

Se aplica un enfoque basado en evidencia y riesgo, siguiendo la lógica de auditoría de **ISO 19011:2026**: criterios definidos, evidencia verificable, independencia del juicio, presentación justa y conclusiones limitadas al alcance. ISO 19011:2026 es la edición publicada vigente de la guía de auditoría y no constituye por sí misma una norma certificable. 

La auditoría utiliza cuatro niveles:

1. **Inventario:** estructura y totalidad del árbol.
2. **Revisión documental:** propósito, estado, versión, trazabilidad, decisiones, evidencia y coherencia interna.
3. **Revisión técnica:** workflows, PoCs, scripts, manifiestos y configuración disponible.
4. **Revisión normativa:** correspondencia entre los artefactos y los criterios internacionales/cubanos aplicables.

No se declara certificación ISO ni conformidad legal formal.

---

## 3. Criterios normativos

### 3.1 Ingeniería de sistemas y software

Se utilizan como criterios principales:

- ISO/IEC/IEEE 12207:2026 — ciclo de vida de software.
- ISO/IEC/IEEE 15288:2023 — ciclo de vida de sistemas.
- ISO/IEC/IEEE 29148:2018 — ingeniería de requisitos.
- ISO/IEC/IEEE 42010:2022 — descripción de arquitectura.
- ISO/IEC/IEEE 15289:2019 — contenido de información/documentación del ciclo de vida.
- ISO/IEC/IEEE 16326:2019 — gestión de proyectos.
- ISO/IEC/IEEE 14764:2022 — mantenimiento de software.

ISO confirma que 12207:2026 sustituyó a 12207:2017; 15288:2023 sigue publicada; 29148:2018 fue confirmada en 2024; 42010:2022 es la edición publicada vigente; 15289:2019 sigue publicada mientras existe una revisión en desarrollo; 16326:2019 fue confirmada en 2026; y 14764:2022 es la edición publicada vigente. 

### 3.2 Calidad

- ISO/IEC 25010:2023 — modelo de calidad de producto.
- ISO/IEC 25002:2024 — marco para modelos de calidad.
- ISO/IEC 25012:2008 — calidad de datos.
- ISO/IEC 5055:2021 — medidas automatizadas de calidad de código.

ISO 25010:2023 define un modelo de calidad para productos TIC/software; ISO 25002:2024 establece el marco para modelos de calidad; ISO 25012:2008 continúa vigente tras confirmación en 2025; e ISO 5055:2021 permanece publicada y en revisión. 

### 3.3 Seguridad, privacidad, riesgo y continuidad

- ISO/IEC 27001:2022 — requisitos del sistema de gestión de seguridad.
- ISO/IEC 27002:2022 — controles de seguridad.
- ISO/IEC 27005:2022 — gestión de riesgos de seguridad.
- ISO/IEC 27701:2025 — gestión de privacidad.
- ISO 31000:2018 — gestión del riesgo.
- ISO 22301:2019 + Amd 1:2024 — continuidad, cuando resulte aplicable.

ISO confirma 27001:2022, 27005:2022 y 27701:2025; ISO 31000:2018 sigue siendo la edición publicada vigente aunque existe una revisión en desarrollo; ISO 22301:2019 sigue publicada y tiene la Enmienda 1:2024, mientras la siguiente edición está en desarrollo. 

### 3.4 Marco jurídico cubano considerado

Cuando el proceso trate datos personales, seguridad TIC o servicios digitales, se consideran como fuentes de referencia:

- Ley 149/2022, de Protección de Datos Personales.
- Resolución 58/2022, Reglamento para la Seguridad y Protección de los Datos Personales en Soporte Electrónico.
- Decreto-Ley 370/2018, sobre la Informatización de la Sociedad en Cuba.
- Decreto 359/2019, sobre desarrollo de la industria cubana de programas y aplicaciones informáticas.
- Decreto 360/2019, sobre seguridad de las TIC y defensa del ciberespacio nacional.
- normativa aduanera y procedimientos oficiales aplicables a la operación de paquetería.

La Gaceta Oficial No. 90/2022 identifica la Ley 149/2022 y la Resolución 58/2022; la Gaceta Oficial No. 45/2019 contiene el Decreto-Ley 370/2018 y los Decretos 359/2019 y 360/2019. 

**Regla:** la presencia de una norma en esta lista no significa automáticamente que cada artículo sea aplicable al Ecosistema. La aplicabilidad debe determinarse por proceso, dato, actor y obligación.

---

## 4. Estado real del repositorio

Verificación GitHub del corte:

- `main`: `43a3a4cda8911dfe60016ed2e106b28f11efe5c9`.
- PR abiertas: **0**.
- Issues abiertas antes de esta auditoría: **#10**.
- Issues creadas por este corte: **#101–#111**.
- Total de archivos: **94**.
- El repositorio sigue siendo principalmente documental/experimental; no contiene todavía el producto Web/Android/iOS productivo.

---

## 5. Criterio fundamental solicitado para esta auditoría

### 5.1 Lo que NO se penaliza

No se considera defecto que todavía no exista:

- backend productivo;
- aplicación Web productiva;
- Android/iOS productivos;
- PostgreSQL/PostGIS físico definitivo;
- proveedor de geocodificación;
- proveedor de mapas/routing;
- identidad definitiva;
- estrategia productiva definitiva de almacenamiento POD;
- benchmark final NestJS vs ASP.NET Core;
- reglas jurídicas/operativas todavía no demostradas;
- capacidades de IA;
- despliegue productivo.

Estas cuestiones están explícitamente identificadas como pendientes en los documentos correspondientes.

### 5.2 Lo que SÍ se evalúa

Sí se evalúa si:

- la decisión futura está identificada;
- el criterio para resolverla está escrito;
- la evidencia requerida está definida;
- la frontera entre hipótesis y decisión está clara;
- los documentos se contradicen;
- el repositorio afirma una capacidad que no existe;
- una política dice que un control es obligatorio pero el control efectivo no lo garantiza;
- la trazabilidad documental está rota;
- la evidencia histórica se presenta como si fuera actual.

---

# 6. Fortalezas verificadas

## F-01 — Ingeniería basada en evidencia

El proyecto distingue propuesta, PoC, evidencia y decisión. Los documentos evitan convertir automáticamente una hipótesis en una restricción física.

## F-02 — Arquitectura proporcional

La decisión de comenzar con Modular Monolith evita complejidad distribuida no justificada. Las condiciones de eventual extracción están documentadas.

## F-03 — Separación dominio/infraestructura

La documentación mantiene el dominio desacoplado de PostgreSQL, proveedores de geocodificación, mapas, routing y almacenamiento físico de evidencias.

## F-04 — Trazabilidad de Paquetería

Existe una cadena explícita AS-IS → alcance → requisitos → casos de uso → dominio → estados → diseño → implementación → pruebas.

## F-05 — Decisiones abiertas explícitas

Los bloqueadores B-01…B-06 y decisiones D01…D12 no se cierran por intuición. Esto es una práctica correcta de ingeniería.

## F-06 — PoCs reproducibles y sintéticos

Los PoCs de backend y POD utilizan datos sintéticos y runners versionados. Se evita usar datos personales reales.

## F-07 — Seguridad proporcional a la fase

La política de seguridad diferencia controles actuales de controles condicionales. No se afirma que SAST/DAST/mobile security estén implantados antes de existir sus respectivos artefactos.

## F-08 — Calidad documental orientada a evolución

La política de Quality Gates distingue gates globales de gates específicos y reconoce explícitamente que un gate futuro no es un control ya implantado.

---

# 7. Hallazgos actuales

| ID | Severidad | Hallazgo | Estado |
|---|---|---|---|
| #101 | Alta | Informe integral de auditoría anterior ya no representa el baseline actual | Abierto |
| #102 | Media | Cierre de auditoría contiene SHA histórico sin separación suficiente del baseline actual | Abierto |
| #103 | Media | Dos documentos usan ADR-002 | Abierto |
| #104 | Alta | Verificación de permisos CI insuficiente y permisos excesivos en un job de seguridad | Abierto |
| #105 | Alta | Acciones de CI no están fijadas a SHA inmutable | Abierto |
| #106 | Alta | Reproducibilidad del benchmark debilitada por ausencia de lockfile y tags de imágenes no inmutables | Abierto |
| #107 | Baja | README NestJS declara versión de TypeScript distinta al manifiesto | Abierto |
| #108 | Alta | main no está protegido ni tiene required status checks efectivos | Abierto |
| #109 | Media | Catálogo de referencias no cubre todas las normas usadas por la propia auditoría | Abierto |
| #110 | Media | Falta una puerta de entrada y gobierno público completo del repositorio | Abierto |
| #111 | Media | Estados documentales no siempre usan la taxonomía formal definida | Abierto |

---

# 8. Análisis de los hallazgos

## H-101 — Auditoría histórica presentada junto al baseline actual

El informe integral v1.0.0 contiene información de un corte anterior, incluyendo SHA y número de PR abiertos que ya no corresponden a main.

**Conclusión:** defecto documental actual.

**Acción:** #101.

## H-102 — Cierre de auditoría con referencia histórica ambigua

El cierre v1.1.0 es válido como evidencia de su corte, pero su SHA no corresponde al baseline actual. Debe quedar inequívocamente marcado como corte histórico.

**Conclusión:** problema de gobierno de evidencia, no invalida el trabajo histórico.

**Acción:** #102.

## H-103 — Identificadores ADR duplicados

La unicidad del identificador de decisión es un requisito práctico de trazabilidad.

**Conclusión:** no conformidad documental de trazabilidad.

**Acción:** #103.

## H-104 — Control de permisos CI incompleto

SEC-03 comprueba presencia de una declaración de permisos, no el conjunto completo de workflows/jobs. Además, un job de secret scanning declara permisos de escritura que deben justificarse.

**Conclusión:** el principio está documentado, pero la prueba automatizada no lo demuestra con suficiente rigor.

**Acción:** #104.

## H-105 — Supply chain de Actions

GitHub recomienda fijar acciones de terceros a SHA completo para ejecutar exactamente el código revisado. El repositorio usa tags.

**Conclusión:** riesgo de reproducibilidad y cadena de suministro.

**Acción:** #105.

## H-106 — Reproducibilidad experimental

El benchmark pretende ser reproducible, pero el PoC Node no contiene lockfile y los contenedores usan tags no inmutables.

**Conclusión:** el protocolo es bueno, pero la infraestructura experimental necesita endurecimiento antes de usar el resultado como evidencia de decisión.

**Acción:** #106.

## H-107 — Inconsistencia documental de versión

README NestJS: TypeScript 5.9.2.  
package.json: TypeScript 5.9.3.

**Conclusión:** defecto de consistencia documental.

**Acción:** #107.

## H-108 — Política versus enforcement

El repositorio define Quality Gates, pero main no está protegido.

GitHub permite exigir revisiones y status checks mediante branch protection. La ausencia actual significa que la política documental no constituye todavía un mecanismo efectivo contra bypass. 

**Conclusión:** control de gobernanza incompleto.

**Acción:** #108.

## H-109 — Cobertura normativa del catálogo

El catálogo maestro no contiene todas las referencias que la propia auditoría utiliza. La solución correcta no es añadir normas indiscriminadamente, sino determinar aplicabilidad.

**Conclusión:** defecto de trazabilidad normativa.

**Acción:** #109.

## H-110 — Gobernanza pública del repositorio

La documentación interna es amplia, pero el repositorio carece de una entrada raíz y de algunos mecanismos habituales de gobierno de repositorio.

**Conclusión:** observación de madurez; no se declara incumplimiento ISO por este hecho aislado.

**Acción:** #110.

## H-111 — Taxonomía de estados no aplicada uniformemente

La taxonomía formal existe, pero diversos documentos utilizan etiquetas de fase que no son estados formales.

**Conclusión:** inconsistencia de gobernanza documental.

**Acción:** #111.

---

# 9. Trabajo futuro correctamente documentado — NO hallazgos

Estos puntos quedan registrados como **pendientes de ingeniería**, no como defectos del corte:

| Área | Evidencia de que está planificada |
|---|---|
| Benchmark backend | Issue #10 + protocolo + PoC |
| Identidad/autorización | Technology Stack + arquitectura |
| Geocoder | Stack + dominio + fronteras |
| Routing | Dominio + arquitectura |
| PostgreSQL/PostGIS físico | decisiones abiertas de Paquetería |
| House/Package/Bulto | D01/B-01 |
| Agrupación Delivery/House | D09/B-02 |
| POD mínimo | D12/B-03 |
| Unidad de destino | B-04 |
| Liberación a distribución | B-05 |
| Modificación/cancelación | B-06 |
| Mobile offline | arquitectura y contratos |
| GPS | PoC + contrato transversal |
| Retención de evidencias | documentos POD |
| Seguridad SAST/DAST/mobile | Security Assurance como controles condicionales |
| Producto Web/Android/iOS | stack y plan maestro |
| IA/ML | baseline la deja como capacidad evolutiva |

**Estos puntos no se convierten en Issues de defecto solo por estar pendientes.**

---

# 10. Evaluación por norma/familia

| Familia | Estado actual |
|---|---|
| ISO 12207 | **Fuerte en definición de ciclo de vida; implantación productiva aún no evaluable** |
| ISO 15288 | **Adecuada como marco de sistema; falta evidencia de ejecución de procesos productivos** |
| ISO 29148 | **Buena base de requisitos y trazabilidad; debe consolidarse la cadena en main** |
| ISO 42010 | **Buena cobertura conceptual de stakeholders/concerns/viewpoints; mantener evolución** |
| ISO 15289 | **Buena disciplina documental; catálogo y tipos de información aún deben madurar** |
| ISO 16326 | **Plan de ingeniería y trazabilidad presentes; gestión cuantitativa completa aún no evaluable** |
| ISO 14764 | **Trabajo futuro correctamente identificado; mantenimiento productivo no evaluable** |
| ISO 25010/25002 | **Modelo de calidad contemplado; medición cuantitativa de producto aún no evaluable** |
| ISO 25012 | **Calidad de datos reconocida; métricas y controles de datos aún deben desarrollarse** |
| ISO 5055 | **Aún no evaluable sobre producto, porque no existe código productivo** |
| ISO 27001/27002 | **Controles iniciales documentados; no equivale a un ISMS implantado** |
| ISO 27005 | **Riesgo de seguridad reconocido; registro/riesgo formal debe evolucionar** |
| ISO 27701 | **Privacidad reconocida; PIMS/matriz de tratamiento aún no implantados** |
| ISO 31000 | **Riesgo tratado conceptualmente; falta consolidación de registro y tratamiento formal** |
| ISO 22301 | **Continuidad reconocida; pruebas de continuidad productiva aún no evaluables** |
| ISO 19011 | **Metodología de auditoría aplicada; este documento corrige la necesidad de mantener cortes claramente fechados** |

---

# 11. Evaluación jurídica cubana

La documentación actual reconoce correctamente la existencia de normativa cubana relevante, especialmente protección de datos y seguridad TIC.

La Ley 149/2022 y la Resolución 58/2022 son especialmente relevantes porque el Ecosistema contempla datos de personas, direcciones, teléfonos, identificaciones, geolocalización y evidencias de entrega. La Resolución 58/2022 establece requerimientos para la seguridad y protección de datos personales en soporte electrónico. 

Los Decretos 370/2018, 359/2019 y 360/2019 forman parte del marco cubano de informatización, software y seguridad TIC. 

**Conclusión de este corte:** la normativa está reconocida y se han dejado explícitamente abiertos los puntos que requieren determinación jurídica/operativa. No se declara conformidad legal porque todavía no existe una matriz artículo→control→evidencia completa.

La construcción de esa matriz está identificada como trabajo futuro y será objeto de un ciclo específico, no se convierte artificialmente en una no conformidad del producto que todavía no existe.

---

# 12. Evaluación de arquitectura

### Correcto

- Modular Monolith como punto de partida.
- Clean/Hexagonal como orientación.
- API como frontera.
- proveedores externos desacoplados.
- evolución mediante ADR.
- no sobreuso de microservicios/Kubernetes/serverless.

### A corregir

- unicidad de ADR (#103);
- uniformidad de estados (#111);
- gobierno efectivo de integración (#108);
- separación de cortes históricos de auditoría (#101/#102).

### No se penaliza

Que microservicios, serverless, Kubernetes, broker, routing engine o proveedor de geocoding aún no estén decididos.

El repositorio establece criterios para decidirlos posteriormente.

---

# 13. Evaluación del dominio Paquetería

El dominio presenta una madurez documental elevada para una fase de descubrimiento:

- AS-IS;
- modelo conceptual;
- modelo de dominio;
- casos de uso;
- especificación funcional;
- matriz de trazabilidad;
- máquina de estados;
- decisiones críticas;
- bloqueadores operativos;
- fronteras de contexto;
- gobernanza POD;
- patrones logísticos.

La principal fortaleza es que las incertidumbres se conservan como incertidumbres.

No se detecta motivo para penalizar la ausencia de modelo físico definitivo porque los propios documentos justifican que B-01…B-06 deben resolverse antes de congelarlo.

---

# 14. Evaluación de seguridad

### Existente

- secret scanning;
- control de permisos;
- dependency review condicional;
- política de excepciones;
- separación de controles actuales/condicionales;
- documentación de evidencia CI.

### Hallazgos

- endurecer permisos y su verificación (#104);
- pinning de Actions (#105).

### No evaluable todavía

- SAST productivo;
- DAST;
- seguridad móvil;
- seguridad de runtime;
- SBOM de artefactos productivos.

No se penalizan porque el repositorio documenta su activación futura condicionada a la aparición de esos artefactos.

---

# 15. Evaluación del benchmark

El diseño metodológico es correcto en intención:

- equivalencia funcional;
- mismo PostgreSQL;
- varias ejecuciones;
- alternancia;
- p50/p95;
- throughput;
- errores;
- CPU/memoria;
- metadatos;
- commit;
- hardware;
- separación Docker/native.

El benchmark **no debe cerrarse** hasta ejecutarlo sobre el entorno de referencia.

Antes de utilizarlo como evidencia de decisión se deben resolver #106 y #107 y después ejecutar #10.

---

# 16. Nivel de madurez del corte

Se evita una puntuación artificial. El resultado cualitativo es:

### 🟢 Madurez fuerte
- ingeniería documental;
- trazabilidad conceptual;
- arquitectura evolutiva;
- descubrimiento de dominio;
- separación de decisiones;
- PoCs;
- prudencia tecnológica.

### 🟡 Madurez intermedia
- gobierno documental;
- enforcement de CI;
- seguridad de cadena de suministro;
- catálogo normativo;
- gestión formal de riesgos;
- calidad cuantitativa.

### ⚪ No evaluable todavía
- calidad del producto final;
- seguridad de producto desplegado;
- rendimiento real del producto;
- continuidad operacional real;
- mantenimiento real;
- UX;
- aplicaciones móviles productivas;
- API productiva;
- base de datos productiva.

### 🔴 Defectos actuales que requieren corrección
- evidencia de auditoría histórica desalineada (#101/#102);
- identificador ADR duplicado (#103);
- enforcement/permisos CI (#104);
- Actions no fijadas (#105);
- reproducibilidad del benchmark (#106);
- inconsistencia documental de versión (#107);
- protección efectiva de main (#108);
- catálogo de referencias (#109);
- gobierno público (#110);
- estados documentales (#111).

---

# 17. Dictamen del corte

**Resultado:** el repositorio presenta una base de ingeniería documental y arquitectónica sólida para su fase actual, pero todavía no puede considerarse un repositorio de nivel élite porque existen defectos concretos de gobernanza, evidencia, enforcement de CI y reproducibilidad experimental.

Esto **no significa** que el proyecto esté mal diseñado ni que deba evaluarse como si fuera un producto terminado.

El dictamen correcto es:

> **La ingeniería realizada hasta el corte es sustancialmente coherente y disciplinada para una fase de descubrimiento y diseño, pero necesita cerrar las no conformidades documentales y de gobierno identificadas antes de poder afirmar un nivel de excelencia de repositorio de élite.**

No se afirma certificación ISO ni cumplimiento legal formal.

---

# 18. Regla para el siguiente ciclo

Cada Issue abierta por esta auditoría seguirá:

**Hallazgo → causa → impacto → solución → evidencia → PR → CI → revisión → integración → verificación → cierre**

Las tareas futuras que ya estén correctamente documentadas permanecerán fuera del conjunto de defectos hasta que exista evidencia de que, llegado su momento de aplicabilidad, el control no fue implantado.

---

# 19. Inventario archivo por archivo

La siguiente tabla constituye el inventario completo del árbol del commit auditado. La revisión estructural se realizó sobre los 94 archivos. La revisión semántica se concentró adicionalmente en los artefactos normativos, arquitectónicos, de dominio, seguridad, gobernanza y PoC que pueden afectar decisiones o controles del estado actual.

### .github (5 archivos)

| Archivo | Revisión del corte |
|---|---|
| `.github/workflows/backend-poc.yml` | Revisado contra controles CI/seguridad; hallazgos #104/#105 aplican transversalmente |
| `.github/workflows/pod-evidence-integrated-recovery-poc.yml` | Revisado contra controles CI/seguridad; hallazgos #104/#105 aplican transversalmente |
| `.github/workflows/pod-evidence-storage-poc.yml` | Revisado contra controles CI/seguridad; hallazgos #104/#105 aplican transversalmente |
| `.github/workflows/pod-evidence-storage-s3-poc.yml` | Revisado contra controles CI/seguridad; hallazgos #104/#105 aplican transversalmente |
| `.github/workflows/security-assurance.yml` | Revisado contra controles CI/seguridad; hallazgos #104/#105 aplican transversalmente |

### docs (47 archivos)

| Archivo | Revisión del corte |
|---|---|
| `docs/architecture/adr-001-cierre-semantico-operacional-paquetaria.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/adr-002-global-logistics-patterns-adoption.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/adr-002-pod-evidence-storage-provider.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/adr/ADR-0001-modular-monolith.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/architecture-baseline.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/architecture-description-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/gps-tracking-poc-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/mobile-gps-pod-transversal-contracts-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/mobile-offline-sync-architecture-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/mobile-sync-poc-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/mobile-sync-protocol-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/pod-evidence-management-architecture-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/pod-evidence-storage-comparison-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/architecture/pod-evidence-storage-poc-v0.1.0.md` | Revisado; colisión ADR-002 en #103; decisiones abiertas correctamente explicitadas |
| `docs/audit/audit-closure-v1.1.0.md` | Revisado; los cortes históricos requieren separación del baseline actual (#101/#102) |
| `docs/audit/software-engineering-integral-audit-v1.0.0.md` | Revisado; los cortes históricos requieren separación del baseline actual (#101/#102) |
| `docs/business-processes/business-process-baseline.md` | Revisión estructural realizada |
| `docs/business-processes/service-catalog-baseline.md` | Revisión estructural realizada |
| `docs/domain/domain-model-baseline.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/mobile-operational-customer-applications-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-as-is-process-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-conceptual-model.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-critical-decisions-v0.2.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-domain-model-v0.2.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-functional-specification-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-global-logistics-benchmark-adoption-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-manifest-analysis-649-31382945-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-normative-discovery.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-normative-extraction-v0.2.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-normative-extraction-v0.3.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-normative-process-matrix.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-operational-closure-matrix-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-operational-process-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-pod-evidence-governance-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-scope-boundaries-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-state-machine-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-traceability-matrix-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/domain/paqueteria-use-cases-v0.1.0.md` | Revisado; decisiones abiertas y trazabilidad preservadas; no se penaliza trabajo futuro documentado |
| `docs/governance/document-state-taxonomy-v0.1.0.md` | Revisado; catálogo/estados sujetos a #109/#111 |
| `docs/governance/normative-standards-catalog-v0.2.0.md` | Revisado; catálogo/estados sujetos a #109/#111 |
| `docs/governance/quality-gates-policy-v0.1.0.md` | Revisado; catálogo/estados sujetos a #109/#111 |
| `docs/security/security-assurance-v0.1.0.md` | Revisión estructural realizada |
| `docs/software-engineering/software-engineering-master-plan.md` | Revisión estructural realizada |
| `docs/technology/backend-benchmark-protocol.md` | Revisado; benchmark permanece abierto en #10 |
| `docs/technology/backend-evaluation-nestjs-vs-aspnet-core.md` | Revisado; benchmark permanece abierto en #10 |
| `docs/technology/technology-evaluation-matrix.md` | Revisado; benchmark permanece abierto en #10 |
| `docs/technology/technology-stack-baseline.md` | Revisado; benchmark permanece abierto en #10 |

### poc (42 archivos)

| Archivo | Revisión del corte |
|---|---|
| `poc/backend/README.md` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/Dockerfile` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/Program.cs` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/README.md` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/SetaExpreso.Poc.Tests/SetaExpreso.Poc.Tests.csproj` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/SetaExpreso.Poc.Tests/SmokeTests.cs` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/SetaExpreso.Poc.csproj` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/SetaExpreso.Poc.sln` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/docker-compose.yml` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/aspnet-core/init.sql` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/README.md` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/benchmark-report-template.md` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/benchmark-template.csv` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/http-benchmark.mjs` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/reset-database.mjs` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/run-benchmark-native.ps1` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/benchmark/run-benchmark.ps1` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/Dockerfile` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/README.md` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/docker-compose.yml` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/init.sql` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/nest-cli.json` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/package.json` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/app.module.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/health.controller.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/http-exception.filter.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/main.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/packages/dto.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/packages/packages.controller.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/packages/packages.module.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/src/packages/packages.service.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/test/packages.e2e-spec.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/tsconfig.build.json` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/tsconfig.json` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/backend/nestjs/vitest.config.ts` | Revisado; reproducibilidad del benchmark sujeta a #106/#107 |
| `poc/pod-evidence-recovery/README.md` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-recovery/runner.py` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-storage/.gitignore` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-storage/README.md` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-storage/requirements-s3.txt` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-storage/runner.py` | Revisado como PoC; no se trata como producto productivo |
| `poc/pod-evidence-storage/s3_runner.py` | Revisado como PoC; no se trata como producto productivo |

---

# 20. Evidencia externa principal

- ISO/IEC/IEEE 12207:2026 — fuente oficial ISO.
- ISO 19011:2026 — fuente oficial ISO.
- ISO/IEC/IEEE 15288:2023 — fuente oficial ISO.
- ISO/IEC/IEEE 29148:2018 — fuente oficial ISO.
- ISO/IEC/IEEE 42010:2022 — fuente oficial ISO.
- ISO/IEC/IEEE 15289:2019 — fuente oficial ISO.
- ISO/IEC/IEEE 16326:2019 — fuente oficial ISO.
- ISO/IEC/IEEE 14764:2022 — fuente oficial ISO.
- ISO/IEC 25010:2023 y 25002:2024 — fuente oficial ISO.
- ISO/IEC 25012:2008 y 5055:2021 — fuente oficial ISO.
- ISO/IEC 27001:2022, 27005:2022 y 27701:2025 — fuentes oficiales ISO.
- ISO 31000:2018 — fuente oficial ISO.
- ISO 22301:2019/Amd 1:2024 — fuente oficial ISO.
- Gaceta Oficial de la República de Cuba, No. 90/2022 — Ley 149/2022 y Resolución 58/2022.
- Gaceta Oficial de la República de Cuba, No. 45/2019 — Decreto-Ley 370/2018 y Decretos 359/2019 y 360/2019.
- GitHub Docs — branch protection y seguridad de GitHub Actions.

---

# 21. Estado

**Estado formal:** En validación.

Este documento es el baseline de auditoría del corte 2026-09-25. No sustituye automáticamente auditorías posteriores.

