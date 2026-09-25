# Informe de Auditoría Integral de Ingeniería del Ecosistema SETA EXPRESO

**Código:** AUD-001  
**Versión:** 1.0.0  
**Estado:** En ejecución — corte inicial  
**Fecha de auditoría:** 2026-09-25  
**Issue:** #74  
**Repositorio:** `Osleyder1985/seta-expreso-ecosystem`  
**Baseline auditado:** `main` @ `ea5a8eb1d21727412c23060dcc62dac341bfd59d`

---

## 1. Objetivo

Evaluar con rigor y evidencia el estado real del trabajo de Ingeniería de Software realizado hasta el corte de esta auditoría.

La auditoría **no penaliza al proyecto por funcionalidades futuras que todavía no corresponden a su fase**. Sí identifica cualquier defecto, inconsistencia, ausencia de control, riesgo o debilidad existente en los artefactos que ya fueron producidos.

El objetivo no es declarar conformidad con una norma mediante una puntuación artificial ni certificar el Ecosistema. El objetivo es determinar:

- qué está bien;
- qué está mal;
- qué es inconsistente;
- qué debe corregirse;
- qué debe actualizarse;
- qué debe eliminarse o consolidarse;
- qué riesgos existen;
- qué evidencia falta para sostener una decisión ya tomada;
- qué nivel de madurez tiene realmente el estado actual.

---

## 2. Principio de auditoría

Se aplican cuatro estados de evidencia:

1. **INTEGRADO:** existe en `main` y forma parte del baseline vigente.
2. **ABIERTO:** existe en una rama/PR, pero todavía no está integrado en `main`.
3. **EXPERIMENTAL:** existe como PoC/benchmark y no constituye capacidad productiva.
4. **NO EVIDENCIADO:** no se encontró evidencia suficiente durante la auditoría.

No se considera un artefacto de una PR abierta como parte del producto integrado.

---

## 3. Marcos de referencia

La auditoría utiliza como criterios de referencia, en la medida en que sean aplicables al nivel de madurez actual:

- ISO/IEC/IEEE 15288:2023 — procesos del ciclo de vida de sistemas.
- ISO/IEC/IEEE 12207:2026 — procesos del ciclo de vida de software.
- ISO/IEC/IEEE 29148:2018 — ingeniería de requisitos; se registra además que existe una DIS 29148 de tercera edición en desarrollo.
- ISO/IEC/IEEE 42010:2022 — descripción de arquitectura.
- ISO/IEC 25010:2023 — modelo de calidad de producto.
- ISO/IEC 25012:2008 — modelo de calidad de datos.
- ISO/IEC 27001:2022 — sistema de gestión de seguridad de la información.
- ISO/IEC 27002:2022 — controles de seguridad.
- ISO/IEC 27005:2022 — gestión de riesgos de seguridad.
- ISO/IEC 27701:2025 — gestión de privacidad, cuando resulte aplicable.
- ISO 31000:2018 — gestión del riesgo.
- ISO 22301:2019 + Amd 1:2024 — continuidad, cuando resulte aplicable.
- ISO/IEC/IEEE 16326:2019 — gestión de proyectos de ingeniería de sistemas/software.
- ISO/IEC/IEEE 14764:2022 — mantenimiento de software.
- ISO 19011:2026 — directrices para auditoría de sistemas de gestión.

**Nota:** estos marcos son criterios de evaluación. Este informe no afirma certificación ISO ni conformidad formal acreditada.

---

## 4. Contexto normativo cubano considerado

Para las áreas que ya manejan o prevén manejar datos personales y operación digital se consideran, entre otras fuentes:

- Ley 149/2022, “De Protección de Datos Personales”.
- Resolución 58/2022, Reglamento para la Seguridad y Protección de los Datos Personales en Soporte Electrónico.
- Decreto-Ley 370/2018, “Sobre la Informatización de la Sociedad en Cuba”.
- Decreto 359/2019, “Sobre el Desarrollo de la Industria Cubana de Programas y Aplicaciones Informáticas”.
- Decreto 360/2019, “Sobre la Seguridad de las Tecnologías de la Información y la Comunicación y la Defensa del Ciberespacio Nacional”.
- Normativa aduanera cubana aplicable al proceso de paquetería.
- Requisitos y procedimientos oficiales de las entidades externas con las que el proceso de paquetería interactúa.

La aplicabilidad concreta de cada disposición a cada proceso deberá establecerse mediante una matriz normativa formal; no se presume que una norma mencionada sea automáticamente aplicable a todas las funcionalidades.

---

## 5. Estado del repositorio al corte

### 5.1 Rama principal

La rama `main` está en:

`ea5a8eb1d21727412c23060dcc62dac341bfd59d`

El último cambio integrado corresponde a la consolidación del PoC de almacenamiento de evidencias POD y ADR-002.

### 5.2 Pull Requests

Al corte existen **18 Pull Requests abiertos**.

Una parte importante de ellos se basa en un baseline anterior de `main` (`68d305aa...`) y todavía no está integrada.

Esto produce una diferencia importante entre:

- **trabajo realizado**, y
- **baseline oficialmente integrado**.

La auditoría considera esa diferencia explícitamente.

### 5.3 Evidencia integrada destacada

En `main` se verificó directamente, entre otros:

- Plan Maestro de Ingeniería de Software.
- Baseline de arquitectura.
- ADR-0001.
- Technology Stack Baseline.
- Matriz de evaluación tecnológica.
- Modelo conceptual inicial de Paquetería.
- PoCs/benchmarks anteriores.
- PoC de almacenamiento de evidencias POD.
- Comparación de almacenamiento POD.
- ADR-002 de almacenamiento POD.

---

# 6. Fortalezas verificadas

## F-01 — Ingeniería basada en evidencia

**Resultado: FORTALEZA**

El PMIS establece explícitamente la prioridad de evidencia sobre suposiciones, reversibilidad, trazabilidad y validación mediante PoC/benchmark.

Esto es consistente con una ingeniería disciplinada para una fase de descubrimiento.

## F-02 — Prudencia arquitectónica

**Resultado: FORTALEZA**

La arquitectura no introduce microservicios, Kubernetes, serverless, Kafka u otras tecnologías distribuidas simplemente por moda.

La decisión de partir de un Modular Monolith está documentada y contiene condiciones para revisar la decisión.

## F-03 — Separación entre dominio y proveedores

**Resultado: FORTALEZA**

El baseline arquitectónico establece separación Clean/Hexagonal y aislamiento de proveedores externos mediante puertos/adaptadores cuando corresponde.

Esto es especialmente adecuado para geocodificación y almacenamiento de evidencias.

## F-04 — Tecnología no congelada prematuramente

**Resultado: FORTALEZA**

El Technology Stack Baseline distingue entre adoptado, provisional, candidato y pendiente.

Esta clasificación reduce el riesgo de convertir una propuesta en una decisión irreversible sin evidencia.

## F-05 — PoCs reproducibles

**Resultado: FORTALEZA**

Los PoCs de backend y almacenamiento utilizan runners y GitHub Actions, con datasets sintéticos y resultados verificables.

El enfoque experimental es apropiado para decisiones tecnológicas tempranas.

## F-06 — Reconocimiento explícito de limitaciones

**Resultado: FORTALEZA**

El ADR-002 declara que los resultados de una ejecución de CI no constituyen un benchmark estadístico y que todavía no se ha validado la recuperación conjunta de PostgreSQL y contenido físico.

Esta cautela evita sobreinterpretar evidencia.

---

# 7. Hallazgos y no conformidades

## H-01 — PoC de recuperación integrada falla en CI

**Severidad: ALTA**  
**Estado: ABIERTO**  
**Evidencia:** PR #73, commit `939b7fb4...`, workflow run `36101902755`.

El workflow “POD integrated recovery PoC” terminó con:

- estado: completed;
- conclusión: failure;
- paso fallido: “Run PoC”;
- error: `SyntaxError: unterminated string literal` en `poc/pod-evidence-recovery/runner.py`, línea 15.

El paso de validación de escenarios fue omitido porque el runner ni siquiera pudo iniciar.

**Impacto:** el PR #73 no dispone actualmente de evidencia CI válida para afirmar que R01–R10 se ejecutan correctamente.

**Acción correctiva:** corregir el runner, ejecutar nuevamente CI y conservar el resultado reproducible. No debe considerarse aprobado por diseño o por revisión documental.

---

## H-02 — Deuda de integración de Pull Requests

**Severidad: ALTA**  
**Estado: ABIERTO**

Existen 18 PRs abiertos, muchos derivados de un baseline anterior de `main`.

Entre ellos se encuentran artefactos relevantes de:

- descubrimiento normativo;
- matriz normativa;
- extracción normativa;
- cierre operativo;
- AS-IS;
- benchmark logístico;
- aplicaciones móviles;
- offline-first;
- protocolo de sincronización;
- PoC de sincronización;
- GPS/tracking;
- gobernanza POD;
- arquitectura técnica POD.

El problema no es que existan PRs abiertos. El problema auditado es que una cantidad considerable de conocimiento considerado ya producido permanece fuera del baseline integrado y puede quedar desalineado con los cambios posteriores.

**Impacto:** la fuente de verdad efectiva está fragmentada.

**Acción correctiva:** establecer una estrategia explícita de integración, cierre, supersesión o descarte de PRs abiertos y evitar mantener múltiples líneas históricas como si todas fueran simultáneamente baseline vigente.

---

## H-03 — Estado arquitectónico inconsistente

**Severidad: MEDIA**  
**Estado: ABIERTO**

Existe una inconsistencia documental:

- `architecture-baseline.md`: “Propuesto para revisión”.
- `ADR-0001`: “Propuesto”.
- `technology-stack-baseline.md`: Modular Monolith y Clean/Hexagonal aparecen como decisiones adoptadas del baseline.

La decisión conceptual está suficientemente documentada, pero el estado administrativo no es coherente entre los artefactos.

**Impacto:** dificulta determinar qué es decisión vigente, qué es propuesta y qué requiere aprobación.

**Acción correctiva:** normalizar estados y definir una taxonomía única: Proposed / Accepted / Accepted Provisionally / Superseded / Rejected / Deprecated.

---

## H-04 — Baseline de estándares necesita actualización normativa

**Severidad: MEDIA**  
**Estado: ABIERTO**

La auditoría detecta que el marco debe actualizarse a las ediciones actualmente vigentes.

En particular, ISO/IEC/IEEE 12207:2026 ya fue publicada y reemplazó a 12207:2017.

ISO 19011:2026 también fue publicada.

El PMIS actual debe reflejar estas ediciones vigentes y registrar una estrategia de transición cuando un documento histórico utilice referencias anteriores.

**Impacto:** una auditoría que pretendiera afirmar “alineación con ISO” utilizando únicamente referencias antiguas estaría metodológicamente desactualizada.

**Acción correctiva:** crear un catálogo de normas de referencia con versión, estado, aplicabilidad, evidencia y fecha de verificación.

---

## H-05 — Security assurance todavía no está demostrada por evidencia automatizada integral

**Severidad: MEDIA**  
**Estado: ABIERTO**

El PMIS exige seguridad, análisis de vulnerabilidades, secretos, dependencias y quality gates, pero el estado auditado no contiene evidencia suficiente para afirmar que existe un pipeline integral y obligatorio de seguridad para todo el repositorio.

Existe además una recomendación de utilizar una herramienta específica de análisis de seguridad del código; dicha herramienta todavía no está conectada.

**Impacto:** existe una diferencia entre el control definido documentalmente y la evidencia automatizada del control.

**Acción correctiva:** establecer controles de seguridad verificables y ejecutados por CI antes de considerar el control implantado.

---

## H-06 — Cumplimiento de protección de datos todavía no está cerrado como matriz de control

**Severidad: MEDIA**  
**Estado: ABIERTO**

El trabajo realizado reconoce correctamente la sensibilidad de evidencias POD y la existencia de Ley 149/2022 y Resolución 58/2022.

Sin embargo, la evidencia auditada no permite afirmar todavía que exista una matriz completa que relacione:

**dato → finalidad → base/condición de tratamiento → responsable/encargado → acceso → ubicación → retención → transferencia → eliminación → evidencia de cumplimiento.**

Esto es especialmente relevante porque el Ecosistema contempla documentos de identidad, direcciones, teléfonos, geolocalización y evidencias fotográficas.

**Impacto:** riesgo de diseñar controles técnicos antes de cerrar completamente las obligaciones de tratamiento.

**Acción correctiva:** consolidar la matriz de privacidad/compliance antes de convertir las políticas provisionales en controles irreversibles.

---

# 8. Observaciones de calidad documental

## O-01 — El PMIS es fuerte como marco, pero todavía es un marco y no evidencia por sí mismo su implantación

El documento define procesos, gates, trazabilidad, riesgos, documentación, pruebas y seguridad.

La auditoría debe distinguir siempre:

**“el proceso está definido”** de **“el proceso se está ejecutando y existe evidencia de su ejecución”.**

Esta distinción será un principio obligatorio del resto de la auditoría.

## O-02 — La trazabilidad está bien concebida, pero debe auditarse con muestras reales

El PMIS define:

**Objetivo → Proceso → Requisito → Issue → Diseño → Código → Prueba → PR → Release → Funcionalidad.**

La siguiente prueba de auditoría debe tomar muestras reales y comprobar cada salto, no solamente verificar que la matriz existe.

## O-03 — Los PoCs no deben confundirse con producto

Los PoCs actuales están correctamente utilizados como evidencia experimental en varios casos.

Debe mantenerse una identificación explícita entre:

- PoC;
- prototipo;
- benchmark;
- código candidato;
- código productivo.

---

# 9. Evaluación preliminar frente a los marcos

| Área | Evidencia actual | Estado |
|---|---|---|
| Ciclo de vida | PMIS + Issues + PRs + PoCs | Parcialmente implantado |
| Requisitos | estructura y trazabilidad previstas; varios artefactos abiertos | Parcial |
| Arquitectura | baseline + ADR-0001 | Adecuado con inconsistencia de estado |
| Calidad de producto | criterios definidos, producto aún temprano | No evaluable integralmente |
| Calidad de datos | principios y PostgreSQL/PostGIS definidos; modelo físico aún no cerrado | Parcial |
| Seguridad | principios documentados | Evidencia de implantación insuficiente |
| Privacidad | investigación iniciada | Parcial |
| Riesgos | proceso definido en PMIS | Evidencia de registro integral pendiente |
| Continuidad | PoC POD iniciado | Parcial |
| Auditoría | esta auditoría constituye la primera auditoría formal documentada | Inicial |
| CI/CD | GitHub Actions y PoCs | Parcial |
| Gestión de configuración | Git/GitHub y PRs | Parcial |
| Trazabilidad | diseñada y parcialmente evidenciada | Parcial |
| Gestión documental | fuerte baseline inicial, pero fragmentación por PRs abiertos | Parcial |

---

# 10. Qué está bien y debe conservarse

No se recomienda eliminar por el mero hecho de que el proyecto sea inicial:

- el PMIS;
- el enfoque incremental;
- el Modular Monolith como decisión provisional;
- Clean/Hexagonal;
- PostgreSQL/PostGIS como baseline;
- la abstracción de proveedores;
- el uso de ADR;
- los PoCs reproducibles;
- la separación entre dominio e infraestructura;
- la exigencia de evidencia;
- la distinción entre estado actual y futuro;
- el principio de no introducir complejidad distribuida sin necesidad.

Estos elementos constituyen una base de ingeniería razonable para continuar.

---

# 11. Qué debe corregirse

Prioridad inmediata:

1. Corregir PR #73 y obtener CI PASS real.
2. Resolver la fragmentación de los 18 PRs abiertos.
3. Normalizar estados de arquitectura/ADR/stack.
4. Actualizar el catálogo de normas de referencia a las ediciones vigentes.
5. Separar explícitamente “control definido” de “control demostrado”.
6. Consolidar evidencia de seguridad automatizada.
7. Consolidar la matriz de cumplimiento y privacidad.
8. Auditar trazabilidad mediante muestras reales.

---

# 12. Qué NO se considera defecto por la fase actual

No se marca como defecto simplemente por no estar implementado:

- aplicación Web completa;
- Android/iOS completos;
- modelo físico definitivo de toda la base de datos;
- proveedor definitivo de geocodificación;
- proveedor definitivo de almacenamiento POD;
- routing engine definitivo;
- identidad definitiva;
- despliegue productivo completo;
- observabilidad productiva completa;
- IA;
- microservicios;
- Kubernetes;
- event streaming distribuido;
- alta disponibilidad empresarial;
- escalabilidad de producción.

Estos elementos deberán auditarse cuando exista evidencia de que forman parte del estado implementado o de un requisito aplicable al incremento auditado.

---

# 13. Criterio para el nivel “top mundial”

Para elevar la ingeniería sin penalizar injustamente la fase inicial, el criterio será:

> **No exigir que el sistema ya tenga todas las capacidades de un producto maduro; exigir que cada decisión y control que el proyecto ya afirma tener esté realmente respaldado por evidencia.**

El salto de calidad más importante ahora no es agregar más tecnología. Es aumentar:

- coherencia;
- control de configuración;
- evidencia;
- reproducibilidad;
- trazabilidad;
- seguridad verificable;
- cumplimiento demostrable;
- disciplina de integración;
- control de cambios;
- claridad entre decisión, hipótesis y experimento.

---

# 14. Conclusión del corte inicial

**Dictamen:** el Ecosistema presenta una **base de ingeniería documental y arquitectónica sólida para una fase temprana**, pero **no debe considerarse todavía auditado integralmente ni listo para afirmar conformidad formal con normas ISO o cumplimiento regulatorio completo**.

Los principales problemas encontrados no son una falta injustificada de funcionalidades futuras. Son problemas actuales de:

1. integración del conocimiento producido;
2. evidencia CI defectuosa en el PoC más reciente;
3. estados documentales inconsistentes;
4. actualización del marco normativo de referencia;
5. diferencia entre controles definidos y controles demostrados;
6. maduración de seguridad y cumplimiento.

La auditoría continuará sobre el baseline real, sin convertir capacidades futuras en defectos del presente.

---

## 15. Próxima fase de auditoría

La siguiente fase deberá profundizar, con evidencia de repositorio, en este orden:

1. gobernanza y configuración;
2. requisitos y trazabilidad;
3. arquitectura y ADR;
4. dominio y reglas;
5. código y estructura técnica;
6. pruebas;
7. CI/CD;
8. seguridad;
9. datos;
10. privacidad y cumplimiento;
11. PoCs y reproducibilidad;
12. documentación;
13. riesgos y deuda técnica;
14. calidad y mantenibilidad;
15. preparación para operación.

Cada hallazgo posterior deberá indicar:

**criterio → evidencia → condición → impacto → severidad → acción correctiva → verificación.**

---

## Control de cambios

| Versión | Fecha | Estado | Descripción |
|---|---|---|---|
| 1.0.0 | 2026-09-25 | En ejecución | Corte inicial de auditoría integral basado en evidencia del repositorio |
