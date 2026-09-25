# Plan Maestro de Ingeniería de Software del Ecosistema SETA EXPRESO

**Código:** SEM-001  
**Versión:** 0.1.0  
**Estado:** En validación
**Idioma:** Español  
**Repositorio oficial:** `Osleyder1985/seta-expreso-ecosystem`

---

## 1. Propósito

El presente Plan Maestro de Ingeniería de Software (PMIS) establece el marco rector para analizar, especificar, diseñar, construir, verificar, desplegar, operar, mantener y evolucionar el Ecosistema de Software de SETA EXPRESO SURL.

Este documento no describe una implementación concreta ni presupone una tecnología determinada. Define el método mediante el cual se tomarán esas decisiones y los controles que deberán cumplirse durante el ciclo de vida.

El PMIS es un documento vivo. Su contenido evolucionará conforme se obtenga conocimiento del negocio, se descubran requisitos, se implementen funcionalidades, se detecten problemas y se adopten decisiones técnicas.

---

## 2. Alcance

El Plan aplica a todo el Ecosistema de Software de SETA EXPRESO SURL, incluyendo, cuando corresponda:

- Aplicación Web.
- Aplicación Android.
- Aplicación iOS.
- Backend y APIs.
- Bases de datos y almacenamiento.
- Integraciones con sistemas externos.
- Infraestructura y despliegue.
- Automatizaciones.
- Servicios de mapas y geolocalización.
- Sistemas de autenticación y autorización.
- Observabilidad y operación.
- Pruebas y aseguramiento de la calidad.
- Seguridad.
- Documentación oficial.
- Procesos de mantenimiento y evolución.

El Plan también establece las reglas de ingeniería para los componentes que todavía no hayan sido diseñados.

---

## 3. Naturaleza del documento

El PMIS es parte de la **documentación oficial del Ecosistema** y debe mantenerse dentro del directorio:

`docs/software-engineering/`

El repositorio GitHub constituye la fuente oficial de verdad para la documentación versionada del Ecosistema.

Las conversaciones, borradores, análisis exploratorios y propuestas realizadas fuera del repositorio pueden servir como material de trabajo, pero no constituyen documentación oficial hasta que la decisión o contenido correspondiente sea incorporado al repositorio mediante el proceso de control establecido.

---

## 4. Objetivos de Ingeniería de Software

Los objetivos principales son:

1. Construir software que satisfaga necesidades reales del negocio.
2. Mantener trazabilidad desde la necesidad empresarial hasta el software desplegado.
3. Reducir defectos mediante prevención, automatización y verificación continua.
4. Mantener la seguridad como propiedad transversal del sistema.
5. Evitar complejidad técnica que no aporte valor.
6. Facilitar mantenimiento y evolución.
7. Mantener costos y carga operativa compatibles con las capacidades reales de la organización.
8. Permitir que la arquitectura evolucione cuando cambien las necesidades.
9. Automatizar tareas repetitivas cuando exista una relación costo-beneficio favorable.
10. Generar evidencia objetiva de la calidad y del cumplimiento de los requisitos.

---

## 5. Principios rectores

### 5.1 Necesidad antes que tecnología

No se adoptará una tecnología por moda, popularidad o disponibilidad. Toda decisión tecnológica deberá responder a necesidades y restricciones verificables.

### 5.2 Simplicidad antes que complejidad

Se preferirá la solución más simple que satisfaga adecuadamente los requisitos presentes y las necesidades de evolución conocidas.

### 5.3 Evolución incremental

El Ecosistema se desarrollará por incrementos funcionales verificables.

### 5.4 Seguridad desde el diseño

La seguridad no será una actividad exclusivamente posterior al desarrollo. Los riesgos de seguridad se identificarán y tratarán durante requisitos, diseño, implementación, pruebas y operación.

### 5.5 Calidad incorporada

La calidad deberá construirse durante el ciclo de desarrollo y no depender exclusivamente de una inspección final.

### 5.6 Automatización con criterio

Se automatizarán actividades repetitivas, deterministas y de alto valor, evitando automatizar procesos que todavía no estén suficientemente comprendidos.

### 5.7 Trazabilidad

Los elementos importantes deberán poder relacionarse entre sí:

**Objetivo → Proceso → Requisito → Issue → Diseño → Código → Prueba → Pull Request → Release.**

### 5.8 Evidencia sobre suposiciones

Las decisiones importantes deberán sustentarse en requisitos, pruebas, mediciones, documentación técnica, experimentos o evidencia operacional.

### 5.9 Reversibilidad cuando sea posible

Las decisiones difíciles de revertir deberán analizarse con mayor profundidad antes de su adopción.

### 5.10 No asumir capacidades futuras

Microservicios, serverless, Kubernetes, arquitecturas distribuidas, event-driven, inteligencia artificial u otras capacidades no se considerarán obligatorias. Su adopción requerirá una necesidad demostrable y una evaluación explícita.

---

## 6. Ciclo de vida de ingeniería

El ciclo de vida será iterativo e incremental:

1. Descubrir.
2. Analizar.
3. Especificar.
4. Diseñar.
5. Implementar.
6. Verificar.
7. Revisar.
8. Integrar.
9. Liberar.
10. Operar.
11. Medir.
12. Aprender.
13. Incorporar el aprendizaje al siguiente ciclo.

Las fases no constituyen necesariamente etapas rígidas y secuenciales. Su aplicación dependerá del tamaño, riesgo y naturaleza del cambio.

---

## 7. Ingeniería del negocio

Antes de automatizar un proceso se deberá comprenderlo.

Para cada proceso relevante se buscará identificar:

- objetivo;
- alcance;
- actores;
- entradas;
- actividades;
- decisiones;
- reglas de negocio;
- salidas;
- excepciones;
- problemas actuales;
- riesgos;
- indicadores;
- oportunidades de mejora;
- oportunidades de automatización.

No se automatizará ciegamente un proceso deficiente. Cuando sea necesario, primero se analizará su rediseño.

---

## 8. Ingeniería de requisitos

Los requisitos deberán ser:

- identificables;
- comprensibles;
- verificables;
- trazables;
- consistentes;
- suficientemente precisos;
- priorizados;
- gestionables durante su evolución.

Se distinguirán, como mínimo:

- requisitos de negocio;
- requisitos de usuario;
- requisitos funcionales;
- requisitos no funcionales;
- reglas de negocio;
- restricciones;
- requisitos de integración;
- requisitos de seguridad;
- requisitos de datos;
- requisitos operacionales.

Cada requisito significativo deberá tener criterios que permitan determinar objetivamente si fue satisfecho.

---

## 9. Gestión de requisitos

Un cambio significativo de requisitos deberá registrar:

- qué cambia;
- por qué cambia;
- origen del cambio;
- impacto;
- dependencias;
- riesgos;
- componentes afectados;
- pruebas afectadas;
- documentación afectada.

Los cambios no deberán realizarse únicamente mediante conversaciones informales.

---

## 10. Modelado del dominio

El modelo de dominio se desarrollará progresivamente a partir del conocimiento real del negocio.

Podrá incluir:

- entidades;
- objetos de valor;
- agregados;
- relaciones;
- servicios de dominio;
- eventos;
- estados;
- invariantes;
- políticas;
- reglas de negocio.

El modelo deberá evitar introducir abstracciones que no representen conceptos reales o útiles del dominio.

---

## 11. Arquitectura

La arquitectura se definirá a partir de los drivers arquitectónicos del Ecosistema.

Se considerarán, según corresponda:

- funcionalidad;
- seguridad;
- disponibilidad;
- rendimiento;
- mantenibilidad;
- escalabilidad;
- interoperabilidad;
- costo;
- capacidad operacional;
- resiliencia;
- evolución.

Antes de adoptar una arquitectura significativa se evaluarán alternativas.

### 11.1 Tecnologías no predeterminadas

No se establecerá anticipadamente que el Ecosistema deberá utilizar:

- microservicios;
- serverless;
- Kubernetes;
- arquitectura orientada a eventos;
- múltiples bases de datos;
- múltiples nubes;
- inteligencia artificial;
- blockchain;
- u otras tecnologías de complejidad elevada.

Cada una será evaluada cuando exista un problema concreto que pueda justificarla.

---

## 12. Decisiones arquitectónicas

Las decisiones arquitectónicas importantes deberán registrarse mediante Architecture Decision Records (ADR).

Cada ADR deberá contener como mínimo:

- contexto;
- problema;
- requisitos relacionados;
- alternativas consideradas;
- criterios de evaluación;
- decisión;
- consecuencias;
- riesgos;
- fecha;
- estado;
- Issue o PR relacionados cuando existan.

---

## 13. Arquitectura de aplicaciones

El Ecosistema contempla una aplicación Web, una aplicación Android y una aplicación iOS.

La arquitectura deberá establecer progresivamente:

- responsabilidades de cada aplicación;
- límites entre presentación, aplicación y dominio;
- comunicación con backend;
- gestión de autenticación;
- gestión de estado;
- almacenamiento local;
- comportamiento offline, si fuera necesario;
- sincronización;
- notificaciones;
- observabilidad;
- estrategia de actualización.

No se duplicará lógica de negocio innecesariamente entre clientes.

---

## 14. Datos

La ingeniería de datos deberá contemplar:

- modelo conceptual;
- modelo lógico;
- modelo físico;
- integridad;
- consistencia;
- identificadores;
- relaciones;
- restricciones;
- migraciones;
- auditoría;
- retención;
- copias de seguridad;
- recuperación;
- protección de datos;
- calidad de datos.

La tecnología de persistencia se seleccionará mediante requisitos y evaluación, no por preferencia aislada.

---

## 15. Seguridad

La seguridad abarcará:

- identidad;
- autenticación;
- autorización;
- roles;
- permisos;
- sesiones;
- protección de credenciales;
- secretos;
- cifrado;
- seguridad de APIs;
- validación de entradas;
- protección de datos;
- auditoría;
- gestión de vulnerabilidades;
- actualización de dependencias;
- copias de seguridad;
- recuperación ante incidentes.

El principio de mínimo privilegio será aplicado cuando corresponda.

---

## 16. APIs e integraciones

Las APIs deberán definir contratos explícitos.

Se establecerán progresivamente:

- convenciones de recursos;
- operaciones;
- validación;
- errores;
- autenticación;
- autorización;
- versionado;
- idempotencia;
- paginación;
- filtros;
- límites;
- observabilidad.

Las integraciones externas deberán documentar sus dependencias, límites, costos, disponibilidad y riesgos.

---

## 17. Geolocalización y mapas

Las capacidades de dirección, geocodificación, coordenadas y mapas serán tratadas como una capacidad especializada del Ecosistema.

Antes de seleccionar un proveedor se evaluarán, como mínimo:

- cobertura geográfica;
- precisión;
- límites de uso;
- condiciones de licencia;
- disponibilidad;
- latencia;
- costos;
- posibilidad de uso gratuito;
- privacidad;
- dependencia del proveedor;
- posibilidad de sustitución.

Las restricciones reales del proveedor deberán verificarse antes de comprometer la arquitectura.

---

## 18. Desarrollo

Todo código deberá cumplir estándares definidos para el lenguaje y plataforma correspondiente.

El proceso incluirá:

1. Preparación del cambio.
2. Implementación.
3. Pruebas.
4. Revisión.
5. Corrección de observaciones.
6. Integración.
7. Actualización documental cuando corresponda.

Se evitará introducir cambios no relacionados dentro del mismo Pull Request.

---

## 19. Git y GitHub

GitHub será el sistema oficial de control del código y de la documentación versionada del Ecosistema.

Las reglas principales son:

- código y estructura técnica en inglés;
- documentación oficial en español;
- Issues en español;
- Pull Requests en español;
- decisiones relevantes documentadas;
- cambios trazables;
- revisiones antes de integrar;
- historial conservado.

### 19.1 Flujo de problemas

Todo problema técnico o funcional significativo deberá seguir:

**Detección → Issue → Análisis → Implementación → Pruebas → Pull Request → Revisión → Merge → Documentación.**

No se utilizará un cambio directo como sustituto de este proceso cuando el cambio requiera trazabilidad.

---

## 20. Estrategia de ramas

La estrategia de ramas será definida antes de establecer restricciones permanentes sobre el repositorio.

Como principio general:

- las ramas tendrán nombres en inglés;
- cada cambio significativo tendrá una rama identificable;
- las ramas deberán asociarse al Issue correspondiente cuando sea aplicable;
- la rama protegida no deberá recibir cambios no revisados;
- la estrategia deberá mantenerse lo suficientemente simple para el tamaño real del proyecto.

---

## 21. Pull Requests

Todo Pull Request relevante deberá permitir responder:

- ¿qué problema resuelve?
- ¿por qué se necesita?
- ¿qué se modificó?
- ¿qué requisitos están involucrados?
- ¿qué pruebas fueron ejecutadas?
- ¿qué riesgos existen?
- ¿qué documentación debe actualizarse?
- ¿qué Issue resuelve?

Los PRs deberán ser revisables y de alcance controlado.

---

## 22. Estrategia de pruebas

La estrategia será proporcional al riesgo.

Podrá incluir:

- pruebas unitarias;
- pruebas de integración;
- pruebas de API;
- pruebas de contrato;
- pruebas end-to-end;
- pruebas de seguridad;
- pruebas de rendimiento;
- pruebas de regresión;
- pruebas de compatibilidad;
- pruebas específicas de aplicaciones móviles.

No se utilizará cobertura de código como único indicador de calidad.

---

## 23. Quality Gates

Antes de integrar cambios deberán cumplirse las condiciones establecidas para el tipo de cambio.

Podrán incluir:

- compilación correcta;
- pruebas exitosas;
- análisis estático;
- ausencia de vulnerabilidades críticas conocidas;
- revisión de código;
- criterios de aceptación satisfechos;
- documentación actualizada;
- migraciones verificadas;
- observabilidad adecuada.

Los Quality Gates evolucionarán con la madurez del Ecosistema.

---

## 24. Definition of Ready

Un trabajo podrá considerarse preparado cuando, según su naturaleza:

- el objetivo sea conocido;
- el problema esté suficientemente entendido;
- el alcance sea claro;
- los criterios de aceptación estén definidos;
- dependencias relevantes estén identificadas;
- riesgos importantes estén registrados;
- exista información suficiente para comenzar el diseño o implementación.

---

## 25. Definition of Done

Un trabajo estará terminado cuando:

- la implementación esté completa;
- los criterios de aceptación se cumplan;
- las pruebas requeridas sean satisfactorias;
- el código haya sido revisado;
- no existan defectos conocidos que impidan aceptar el cambio;
- la documentación requerida esté actualizada;
- el cambio esté integrado;
- la trazabilidad correspondiente esté completa.

---

## 26. CI/CD

La integración y entrega continua se automatizarán progresivamente.

El pipeline podrá incluir:

1. instalación reproducible de dependencias;
2. validación;
3. compilación;
4. análisis estático;
5. pruebas;
6. análisis de seguridad;
7. generación de artefactos;
8. empaquetado;
9. despliegue;
10. verificaciones posteriores al despliegue.

La automatización deberá justificarse por valor y confiabilidad.

---

## 27. Infraestructura y ambientes

Se establecerán ambientes según las necesidades reales, pudiendo incluir:

- desarrollo;
- pruebas;
- staging;
- producción.

La configuración deberá separarse del código cuando corresponda.

Los secretos no deberán almacenarse en el repositorio.

---

## 28. Observabilidad

Los sistemas en operación deberán proporcionar mecanismos adecuados para conocer su comportamiento.

Según las necesidades se utilizarán:

- logs;
- métricas;
- trazas;
- health checks;
- alertas;
- auditoría;
- indicadores de disponibilidad y rendimiento.

La observabilidad deberá facilitar diagnóstico, no simplemente producir grandes cantidades de datos.

---

## 29. Gestión de incidentes y problemas

Se diferenciarán:

**Incidente:** interrupción o degradación de un servicio.

**Problema:** causa o condición que origina uno o varios incidentes o defectos.

Los incidentes importantes deberán generar análisis posterior cuando el riesgo o impacto lo justifique.

---

## 30. Gestión de riesgos

Los riesgos relevantes deberán registrarse y evaluar:

- probabilidad;
- impacto;
- exposición;
- estrategia de tratamiento;
- responsable;
- estado.

Las estrategias podrán incluir:

- evitar;
- reducir;
- transferir;
- aceptar;
- contingencia.

---

## 31. Gestión de deuda técnica

La deuda técnica deberá ser visible.

Cada elemento relevante deberá indicar:

- problema;
- causa;
- impacto;
- riesgo;
- beneficio de resolverlo;
- prioridad;
- Issue asociado cuando corresponda.

No toda deuda técnica debe eliminarse inmediatamente; deberá gestionarse racionalmente.

---

## 32. Automatización e Inteligencia Artificial

El Ecosistema podrá incorporar automatización avanzada o IA cuando exista un caso de uso real.

La evaluación deberá considerar:

- problema que se pretende resolver;
- alternativa determinista;
- datos disponibles;
- precisión requerida;
- costo;
- latencia;
- privacidad;
- seguridad;
- explicabilidad;
- capacidad de supervisión humana;
- consecuencias de errores;
- mantenimiento.

La autonomía no será un objetivo por sí misma.

Cuando una decisión automatizada pueda afectar significativamente la operación, deberá definirse el nivel apropiado de supervisión humana.

---

## 33. Gestión de documentación

Toda documentación oficial deberá:

- estar en español;
- utilizar nombres de archivos y directorios en inglés;
- estar versionada;
- tener propietario o responsabilidad definida cuando sea necesario;
- mantener consistencia con el software;
- registrar cambios importantes;
- evitar duplicación de información;
- enlazar artefactos relacionados.

La documentación obsoleta no deberá mantenerse como verdad vigente. Cuando sea necesario conservarla por razones históricas, deberá identificarse explícitamente como obsoleta.

---

## 34. Trazabilidad

La trazabilidad mínima buscada será:

**Objetivo empresarial**  
↓  
**Proceso de negocio**  
↓  
**Necesidad**  
↓  
**Requisito**  
↓  
**Historia de usuario / Caso de uso**  
↓  
**Issue**  
↓  
**Diseño / ADR**  
↓  
**Código**  
↓  
**Prueba**  
↓  
**Pull Request**  
↓  
**Release**  
↓  
**Funcionalidad operativa**

No todos los cambios necesitarán todos los niveles, pero los cambios relevantes deberán conservar suficiente trazabilidad para explicar su origen y validación.

---

## 35. Métricas

Las métricas se introducirán de forma progresiva y deberán servir para tomar decisiones.

Podrán incluir:

- tiempo de ciclo;
- frecuencia de despliegue;
- tasa de fallos;
- tiempo de recuperación;
- defectos;
- cobertura de pruebas;
- vulnerabilidades;
- disponibilidad;
- rendimiento;
- deuda técnica;
- estabilidad de builds;
- tiempo de revisión.

No se utilizará una métrica aislada como representación completa de la calidad del equipo o del producto.

---

## 36. Releases

Cada release deberá ser identificable y reproducible.

Según el tipo de release se documentará:

- versión;
- cambios;
- Issues incluidos;
- PRs incluidos;
- correcciones;
- riesgos conocidos;
- migraciones;
- instrucciones especiales;
- estrategia de rollback cuando sea necesaria.

---

## 37. Gestión de cambios del propio Plan Maestro

Este documento tendrá control de versiones.

Cada cambio relevante deberá registrar:

- versión;
- fecha;
- descripción;
- motivo;
- impacto;
- artefactos afectados;
- Issue;
- PR.

La versión inicial es:

**0.1.0 — Baseline inicial del Plan Maestro.**

---

## 38. Criterios para adoptar nuevas tecnologías

Antes de incorporar una tecnología o patrón con impacto arquitectónico significativo se deberá responder:

1. ¿Qué problema resuelve?
2. ¿Existe una alternativa más simple?
3. ¿Qué requisito exige esta solución?
4. ¿Cuál es el costo de adopción?
5. ¿Cuál es el costo operativo?
6. ¿Qué complejidad introduce?
7. ¿Qué conocimientos requiere?
8. ¿Qué riesgos introduce?
9. ¿Cómo se probará?
10. ¿Cómo se monitorizará?
11. ¿Cómo se reemplazaría si fuera necesario?
12. ¿Qué evidencia justifica la decisión?

La respuesta deberá quedar documentada cuando la decisión sea relevante.

---

## 39. Evolución de la arquitectura

La arquitectura no será considerada permanente.

Podrá evolucionar por:

- crecimiento;
- nuevos procesos;
- nuevos requisitos;
- problemas de rendimiento;
- problemas de seguridad;
- nuevas necesidades de integración;
- cambios regulatorios;
- cambios operacionales;
- reducción de costos;
- eliminación de deuda técnica.

Toda evolución significativa deberá preservar la trazabilidad y documentar sus consecuencias.

---

## 40. Gobernanza de ingeniería

Las decisiones técnicas importantes deberán tener una fuente identificable y quedar registradas.

La gobernanza deberá asegurar:

- coherencia;
- trazabilidad;
- revisión;
- control de cambios;
- calidad;
- seguridad;
- evolución ordenada.

El Plan Maestro define el marco. Los ADRs registran decisiones concretas. Los Issues registran problemas y trabajo. Los PRs registran implementaciones revisadas.

---

## 41. Artefactos oficiales de ingeniería

Como mínimo, el Ecosistema podrá mantener:

- Plan Maestro de Ingeniería de Software;
- documentación de negocio;
- catálogo de requisitos;
- modelo de dominio;
- documentación arquitectónica;
- ADRs;
- especificaciones de APIs;
- documentación de datos;
- documentación de seguridad;
- estrategia de pruebas;
- documentación de infraestructura;
- procedimientos operativos;
- documentación de releases;
- registros de riesgos;
- documentación de decisiones relevantes.

La lista crecerá solamente cuando exista una necesidad real.

---

## 42. Regla de actualización continua

La documentación no deberá convertirse en una actividad separada del desarrollo.

Cuando una modificación cambie una decisión, requisito, arquitectura, contrato, proceso, riesgo, procedimiento o comportamiento documentado, se deberá evaluar si corresponde actualizar la documentación oficial.

La documentación deberá evolucionar junto al sistema.

---

## 43. Baseline 0.1

Esta versión establece el marco inicial de Ingeniería de Software del Ecosistema.

No pretende cerrar las decisiones que todavía requieren investigación.

Quedan expresamente abiertas para fases posteriores, entre otras:

- arquitectura definitiva;
- stack tecnológico definitivo;
- estrategia de base de datos;
- proveedor de mapas/geocodificación;
- estrategia de infraestructura;
- estrategia de autenticación;
- estrategia de despliegue;
- arquitectura de integración;
- estrategia de notificaciones;
- incorporación de IA;
- estrategia de escalabilidad.

Estas decisiones deberán tomarse mediante el proceso establecido en este Plan.

---

## 44. Principio final

El objetivo del Plan Maestro no es producir documentación por sí misma.

Su objetivo es asegurar que el Ecosistema SETA EXPRESO sea construido de manera:

**comprensible, trazable, verificable, segura, mantenible, evolutiva y técnicamente justificada.**

La Ingeniería de Software será un proceso continuo de aprendizaje y control del Ecosistema, no una fase que termina cuando comienza la programación.

---

## Control de versiones

| Versión | Estado | Descripción |
|---|---|---|
| 0.1.0 | Baseline inicial | Creación del Plan Maestro de Ingeniería de Software |



**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
