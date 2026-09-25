# Architecture Description del Ecosistema SETA EXPRESO SURL

**Versión:** 0.1.0  
**Estado:** Propuesto  
**Fecha:** 2026-09-25  
**Issue:** #80  
**Baseline:** `docs/architecture/architecture-baseline.md` v0.1.0  
**ADR:** `docs/architecture/adr/ADR-0001-modular-monolith.md`

## 1. Propósito y referencia

Esta Architecture Description (AD) estructura, de forma proporcional a la fase actual, los stakeholders, concerns, viewpoints, views, decisiones y trazabilidad del Ecosistema. Complementa al Architecture Baseline y no convierte por sí misma una propuesta en decisión aprobada.

La referencia normativa principal es **ISO/IEC/IEEE 42010:2022 — Software, systems and enterprise — Architecture description**, edición 2. La norma establece requisitos para la estructura y expresión de una AD y define conceptos como stakeholder, concern, architecture viewpoint y architecture view. La edición 2011 está retirada.

Referencia oficial: https://www.iso.org/standard/74393.html

## 2. Sistema de interés y alcance

El sistema de interés es el **Ecosistema SETA EXPRESO SURL**: Web, Android, iOS, backend central, persistencia, integraciones externas y capacidades transversales de seguridad, auditoría y observabilidad.

El primer dominio funcional prioritario es paquetería. Esta AD no congela su modelo de dominio definitivo.

## 3. Stakeholders

Se identifican roles/clases; la identificación de personas concretas queda para requisitos y análisis organizacional.

| ID | Stakeholder | Intereses / concerns |
|---|---|---|
| STK-01 | Propietario / dirección | Coste, control, continuidad, seguridad, evolución |
| STK-02 | Administración operativa | Procesos, estados, excepciones, reportes |
| STK-03 | Operadores | Usabilidad, productividad, exactitud, trazabilidad |
| STK-04 | Almacén / recepción | Custodia, identificación, estados, evidencia |
| STK-05 | Distribución / despacho | Rutas, asignación, sincronización, POD |
| STK-06 | Conductores / personal móvil | Offline, GPS, sincronización, simplicidad |
| STK-07 | Clientes / remitentes / destinatarios | Visibilidad, privacidad, exactitud, notificaciones |
| STK-08 | Administración / facturación | Integridad, documentos, conciliación |
| STK-09 | Soporte / administración técnica | Diagnóstico, despliegue, recuperación |
| STK-10 | Proveedores externos | Contratos, límites, disponibilidad, sustitución |
| STK-11 | Autoridades aplicables | Cumplimiento, evidencia, conservación, acceso |
| STK-12 | Desarrollo | Modularidad, mantenibilidad, testabilidad, CI/CD |

## 4. Concerns arquitectónicos

| ID | Concern |
|---|---|
| C-01 | Adecuación funcional al negocio real |
| C-02 | Modularidad y límites de dominio |
| C-03 | Evolucionabilidad |
| C-04 | Integración y contratos |
| C-05 | Interoperabilidad Web/Android/iOS/external |
| C-06 | Disponibilidad operacional |
| C-07 | Operación offline |
| C-08 | Consistencia e idempotencia de sincronización |
| C-09 | Seguridad y autorización |
| C-10 | Privacidad y control contextual de datos |
| C-11 | Trazabilidad operacional |
| C-12 | Auditabilidad |
| C-13 | Observabilidad |
| C-14 | Rendimiento medible |
| C-15 | Coste y restricción de herramientas gratuitas |
| C-16 | Simplicidad operacional |
| C-17 | Geocodificación/mapas desacoplados del proveedor |
| C-18 | Separación planificación/ejecución |
| C-19 | Integridad y trazabilidad de evidencia/POD |
| C-20 | Mantenibilidad |
| C-21 | Testabilidad |
| C-22 | Recuperabilidad |
| C-23 | Portabilidad/sustitución tecnológica |
| C-24 | Gobernanza y trazabilidad de decisiones |

## 5. Viewpoints seleccionados

La selección evita producir diagramas sin utilidad en esta fase.

| ID | Viewpoint | Propósito | Concerns principales |
|---|---|---|---|
| VP-01 | Contexto y stakeholders | Fronteras, actores y sistemas externos | C-01,C-04,C-05,C-15,C-24 |
| VP-02 | Estructura lógica y modular | Capas, módulos y dependencias | C-02,C-03,C-16,C-20,C-21 |
| VP-03 | Información y datos | Conceptos, flujos y persistencia | C-01,C-08,C-10,C-11,C-12,C-19 |
| VP-04 | Integración y contratos | API, puertos, adaptadores y proveedores | C-04,C-05,C-17,C-23 |
| VP-05 | Mobile/offline/sync | Operación local, cola, sync y recuperación | C-06,C-07,C-08,C-11,C-19,C-22 |
| VP-06 | Seguridad/auditoría | Identidad, autorización, confianza y auditoría | C-09,C-10,C-11,C-12,C-13,C-19 |
| VP-07 | Despliegue/operación | Topología, observabilidad y recuperación | C-06,C-13,C-15,C-16,C-22,C-23 |
| VP-08 | Proceso/ejecución | Relación arquitectura-proceso | C-01,C-14,C-18,C-19,C-22 |

## 6. Views de la fase actual

| ID | View | Viewpoint | Madurez | Evidencia/artefacto |
|---|---|---|---|---|
| V-01 | Contexto del ecosistema | VP-01 | Conceptual | Architecture Baseline §4 |
| V-02 | Estructura lógica | VP-02 | Conceptual | Baseline §§5–7 |
| V-03 | Información/persistencia | VP-03 | Parcial | Baseline §8 + dominio en evolución |
| V-04 | Integraciones | VP-04 | Parcial | Baseline §§9–10 |
| V-05 | Mobile/offline/sync | VP-05 | En validación | Contratos mobile/GPS/POD |
| V-06 | Seguridad/auditoría | VP-06 | Parcial | Baseline §§11–12 + Issue #82 |
| V-07 | Despliegue/operación | VP-07 | Parcial | Baseline + decisiones de infraestructura |
| V-08 | Proceso operativo | VP-08 | En evolución | AS-IS Paquetería + requisitos/TO-BE |

Una view puede existir como modelo textual/conceptual; no se exige un diagrama cuando éste no aporta información adicional.

## 7. Decisiones relacionadas

| ID | Decisión | Estado | Concerns |
|---|---|---|---|
| AD-01 | Modular Monolith inicial | Propuesto | C-02,C-03,C-16,C-20,C-21 |
| AD-02 | Clean/Hexagonal conceptual | Propuesto | C-02,C-04,C-17,C-20,C-21,C-23 |
| AD-03 | API como frontera de clientes | Propuesto | C-04,C-05,C-09 |
| AD-04 | Persistencia relacional inicial | Propuesto | C-01,C-08,C-11,C-20 |
| AD-05 | Geolocalización desacoplada | Propuesto | C-04,C-17,C-23 |
| AD-06 | Sin broker distribuido inicial | Propuesto | C-03,C-15,C-16 |
| AD-07 | Sin microservicios/serverless/Kubernetes como requisito inicial | Propuesto | C-03,C-15,C-16,C-23 |
| AD-08 | Contratos transversales mobile/GPS/POD | Adoptado según artefacto | C-07,C-08,C-11,C-19,C-22 |

AD-01–AD-07 permanecen subordinadas al estado del Baseline/ADR; la AD no las eleva unilateralmente.

## 8. Matriz Concern → View → decisión/evidencia

| Concern | View(s) | Decisión/evidencia |
|---|---|---|
| C-01 | V-01,V-03,V-08 | AS-IS/TO-BE + requisitos; dominio pendiente |
| C-02 | V-02 | ADR-0001 + Baseline |
| C-03 | V-02,V-07 | ADR-0001 + criterios de extracción |
| C-04 | V-01,V-04 | API + puertos/adaptadores |
| C-05 | V-01,V-04 | API como frontera |
| C-06 | V-05,V-07 | Sync + requisitos operativos |
| C-07 | V-05 | Contratos mobile/offline |
| C-08 | V-03,V-05 | Idempotencia, causalidad, retries |
| C-09 | V-06 | Baseline §11 + Issue #82 |
| C-10 | V-03,V-06 | Acceso contextual + requisitos |
| C-11 | V-03,V-05,V-06 | Audit trail + contratos transversales |
| C-12 | V-06 | Baseline §12 + Issue #82 |
| C-13 | V-06,V-07 | Observabilidad + Issue #83 |
| C-14 | V-07,V-08 | Métricas/benchmarks pendientes |
| C-15 | V-01,V-07 | Restricción económica + stack |
| C-16 | V-02,V-07 | Modular Monolith; distribución no inicial |
| C-17 | V-03,V-04 | Geocoding Port |
| C-18 | V-08 | Dominio/logística en evolución |
| C-19 | V-03,V-05,V-06 | POD/evidence contracts + recuperación |
| C-20 | V-02 | Modularidad + Clean/Hexagonal |
| C-21 | V-02,V-07 | Separación + quality gates |
| C-22 | V-05,V-07 | Reintentos/recuperación + PoCs |
| C-23 | V-04,V-07 | Puertos/adaptadores |
| C-24 | V-01,V-02,V-06,V-07 | Issues, ADR, PR y taxonomía |

Esto satisface el criterio de cobertura: cada concern identificado tiene al menos una view y/o decisión/evidencia explícita.

## 9. Criterios de evaluación

**EV-01 Cobertura:** ningún concern crítico sin view, decisión o evidencia.

**EV-02 Dependencias:** dominio sin dependencia directa de infraestructura concreta.

**EV-03 Integración:** proveedores externos aislados mediante contratos cuando corresponda.

**EV-04 Seguridad:** autenticación, autorización, secretos y protección de datos verificables; desarrollo en Issue #82.

**EV-05 Mobile:** casos offline con idempotencia, reintentos, recuperación y trazabilidad cuando sean requisito.

**EV-06 Observabilidad:** información suficiente para diagnóstico, sin exposición innecesaria de datos sensibles.

**EV-07 Rendimiento:** objetivos cuantificables derivados de requisitos y pruebas, no cifras arbitrarias.

**EV-08 Coste/complejidad:** cada componente distribuido debe demostrar necesidad y beneficio frente a alternativa simple.

**EV-09 Evolución:** decisiones importantes tienen criterios de revisión/sustitución.

**EV-10 Trazabilidad:** Concern → View/decisión → Issue/ADR → implementación → prueba → PR → evidencia.

## 10. Relaciones con otros artefactos

- Architecture Baseline v0.1.0: decisiones estructurales actuales.
- ADR-0001: justificación del Modular Monolith.
- Document State Taxonomy v0.1.0: estados y gobernanza.
- Technology Stack Baseline: relación necesidad/tecnología.
- Normative Standards Catalog: referencias normativas.
- Paquetería AS-IS: realidad operacional.
- Paquetería Operational Closure Matrix: bloqueadores y decisiones pendientes.
- Mobile/GPS/POD transversal contracts: invariantes de sincronización.
- Issue #81: evidencia de evaluación tecnológica.
- Issue #82: assurance de seguridad.
- Issue #83: quality gates.

## 11. Elementos deliberadamente abiertos

No quedan cerrados por esta AD: modelo definitivo de dominio; House/Package; agrupación de entregas; mínimos legales de POD; geocoder/mapas/routing; frecuencia GPS; streaming vs HTTP; almacenamiento móvil; resolución de conflictos; base geoespacial; particionamiento; número de bases de datos; microservicios; serverless; Kubernetes; broker; retención definitiva de evidencias; objetivos cuantitativos de rendimiento; topología productiva definitiva.

## 12. Regla de evolución

**Stakeholder → Concern → Viewpoint/View → Requisito o decisión → Evidencia → ADR/artefacto → Implementación → Prueba → actualización de AD**

Un cambio arquitectónico significativo no debe ocultarse mediante una actualización silenciosa del documento.

## 13. Criterio de cierre de #80

- stakeholders explícitos;
- concerns explícitos;
- viewpoints seleccionados;
- views identificadas con madurez;
- cobertura concern → view/decisión/evidencia;
- criterios de evaluación;
- distinción explícita entre descripción y aprobación arquitectónica;
- integración mediante PR.

## 14. Estado

**Estado del documento:** Propuesto.

El cierre de #80 no convierte Architecture Baseline ni ADR-0001 en decisiones **Vigentes**. Esa elevación requiere la gobernanza definida en la taxonomía de estados.

## 15. Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 0.1.0 | 2026-09-25 | Primera AD estructurada para #80 |
