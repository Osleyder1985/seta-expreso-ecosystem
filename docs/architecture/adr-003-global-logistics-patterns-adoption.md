# ADR-003 — Adopción selectiva de patrones de logística internacional para Z Express

- **Estado:** Propuesto
- **Fecha:** 2026-09-25
- **Issue:** #48
- **Relacionado:** AS-IS Paquetería #46 / PR #47
- **Ámbito:** Arquitectura de dominio y capacidades de Paquetería

## Contexto

El benchmark de operadores logísticos y plataformas empresariales muestra patrones recurrentes: separación de shipment/documentos/unidades físicas, eventos y milestones, gestión de excepciones, warehouse/custody, planificación y ejecución de transporte, delivery attempts, POD, workflow, costing/revenue, billing/settlement, visibilidad operacional e integración mediante APIs/adapters.

SETA ya posee varios de estos conceptos en su operación real. Ignorarlos produciría un modelo demasiado simple y dificultaría la evolución hacia automatización, analítica e IA.

Sin embargo, copiar arquitecturas enterprise completas introduciría complejidad innecesaria.

## Decisión

Z Express adoptará selectivamente patrones de dominio y operación, no productos ni arquitecturas completas de terceros.

Se adoptan como principios:

1. Shipment/operación logística como concepto de alto nivel, sin sustituir todavía Manifest ni cerrar D01–D04.
2. Master → House → Physical Bulto.
3. Historial de eventos/milestones.
4. Exception Management.
5. Warehouse/Custody separado de Delivery Address.
6. Route Planning separado de Route Execution.
7. Delivery Attempt separado de Delivery/POD.
8. POD como conjunto de evidencias.
9. Workflow basado en eventos/reglas/acciones.
10. Separación Buy/Cost y Sell/Revenue.
11. Rate Cards versionadas y parametrizables.
12. Document Management trazable.
13. Adaptadores para integraciones externas.
14. Mobile operational execution.
15. Operational Control/Visibility.
16. Analytics/KPI y preparación de datos para IA.

## No se decide

Este ADR no decide:
- microservicios;
- Kubernetes;
- serverless;
- Kafka/event streaming distribuido;
- proveedor de routing;
- proveedor de geocoding;
- proveedor de tracking;
- WMS/TMS externo;
- proveedor de identidad;
- algoritmo de optimización;
- modelo físico definitivo de PostgreSQL;
- reglas legales aduaneras;
- tarifas comerciales definitivas;
- mínimo definitivo de POD.

Estas decisiones requieren evidencia específica.

## Consecuencias positivas

- mayor trazabilidad;
- mejor separación de responsabilidades;
- menor acoplamiento a proveedores;
- mejor capacidad de auditoría;
- soporte para reintentos e incidencias;
- preparación para costes y rentabilidad;
- mejor base para automatización;
- mejor base para IA futura;
- posibilidad de evolucionar desde un modular monolith sin rediseño conceptual completo.

## Consecuencias negativas

- mayor número de conceptos de dominio;
- mayor trabajo inicial de modelado;
- necesidad de definir eventos, excepciones y documentos;
- mayor disciplina de trazabilidad;
- posible sobreingeniería si se implementan todas las capacidades simultáneamente.

## Mitigación

La adopción será incremental y feature-first.

Primero se implementarán únicamente las capacidades necesarias para el flujo real de Paquetería. Las capacidades enterprise avanzadas permanecerán como extensiones futuras.

## Regla de cierre

Este ADR no autoriza el diseño físico irreversible mientras sigan abiertos los bloqueadores B-01…B-06 y las decisiones D01–D12 que dependan de evidencia adicional.

## Trazabilidad

Benchmark → #48 → este ADR → TO-BE Paquetería → requisitos → diseño → implementación → pruebas.
