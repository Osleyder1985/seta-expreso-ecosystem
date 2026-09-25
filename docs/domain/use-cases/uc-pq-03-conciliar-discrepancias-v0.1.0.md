# UC-PQ-03 — Conciliar discrepancias v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base:** ce5f2597909166ace342977fd2053406b3f0c383  
**RF:** RF-PQ-003  
**Capacidad:** CAP-PQ-02 — Validación/conciliación  
**Casos relacionados:** UC-PQ-01, UC-PQ-02  
**Reglas relacionadas:** RN-PQ-002, RN-PQ-003  
**Pruebas:** AT-PQ-019..030

## 1. Objetivo

Permitir que un usuario autorizado revise, clasifique, resuelva y deje evidencia de las discrepancias detectadas durante la importación y validación de un manifiesto, preservando los valores originales y evitando que una corrección operacional destruya la historia.

La conciliación es una **decisión controlada y auditable**, no una edición silenciosa de la fuente.

## 2. Principios

1. La fuente declarada es inmutable.
2. Toda corrección conserva el valor anterior.
3. Toda resolución identifica actor, fecha/hora y motivo.
4. Una discrepancia puede permanecer abierta.
5. No se obliga a aceptar una interpretación cuando la evidencia sea insuficiente.
6. Las decisiones deben poder revisarse.
7. La conciliación complementa la validación; no la sustituye.
8. Una resolución no elimina el hallazgo original.
9. Las reglas automáticas se distinguen de las decisiones humanas.
10. Los cambios críticos requieren autorización según RBAC.

## 3. Actores

### Principal
Operador o usuario autorizado para conciliación.

### Secundarios
- Supervisor autorizado, cuando exista escalamiento.
- Motor de validación.
- Sistema de auditoría.
- Repositorio de evidencias.
- Fuente externa cuando se solicite confirmación.

## 4. Precondiciones

- Existe una importación.
- Existe al menos un hallazgo/discrepancia conciliable.
- El usuario está autenticado y autorizado.
- El hallazgo conserva su origen y regla.
- Existe acceso a la evidencia necesaria, cuando aplique.

## 5. Disparadores

- El operador abre la bandeja de discrepancias.
- El sistema identifica una discrepancia durante validación.
- Se recibe nueva evidencia.
- Se solicita una revisión posterior.

## 6. Modelo conceptual

Una discrepancia contiene como mínimo:

- discrepancyId
- importId
- validationRunId
- sourceLocation
- field
- ruleId
- type
- severity
- declaredValue
- observedValue o propuesta
- difference
- status
- resolution
- resolutionReason
- resolvedBy
- resolvedAt
- evidenceReferences
- createdAt
- updatedAt

Los nombres son conceptuales y no constituyen nombres definitivos de tablas o API.

## 7. Tipos candidatos

- DATO_AUSENTE
- FORMATO_INVALIDO
- VALOR_FUERA_DE_DOMINIO
- DUPLICADO_POTENCIAL
- IDENTIDAD_AMBIGUA
- DIRECCION_AMBIGUA
- DIRECCION_NO_VALIDADA
- DIFERENCIA_DOCUMENTAL
- INCONSISTENCIA_ENTRE_REGISTROS
- CONFLICTO_DE_CATALOGO
- DEPENDENCIA_NO_CONFIRMADA

## 8. Estados candidatos

- OPEN
- UNDER_REVIEW
- PENDING_EVIDENCE
- PROPOSED
- RESOLVED
- REJECTED
- ESCALATED
- REOPENED
- CANCELLED

Una discrepancia RESOLVED no elimina su historial.

## 9. Flujo normal

### Fase A — Selección

1. Consultar discrepancias.
2. Filtrar por manifiesto, severidad, regla, estado o ubicación.
3. Seleccionar una discrepancia.
4. Mostrar valor declarado, interpretación/propuesta, regla, evidencia y contexto.
5. Mostrar historial.

### Fase B — Análisis

6. Revisar evidencia.
7. Consultar registro original.
8. Solicitar evidencia adicional si es necesario.
9. Registrar transición a UNDER_REVIEW.

### Fase C — Decisión

10. Seleccionar una resolución permitida.
11. Introducir motivo cuando sea requerido.
12. Adjuntar evidencia cuando corresponda.
13. Verificar permisos.
14. Validar transición mediante la máquina de estados.

### Fase D — Aplicación

15. Conservar valor declarado.
16. Registrar nuevo valor interpretado/operacional.
17. Registrar decisión, actor y timestamp.
18. Generar auditoría.
19. Actualizar estado.
20. Solicitar nueva validación cuando corresponda.

## 10. Resoluciones candidatas

- ACCEPT_DECLARED — aceptar valor declarado.
- ACCEPT_CORRECTED — aceptar valor corregido.
- ACCEPT_PROPOSED — aceptar propuesta.
- REJECT_PROPOSAL — rechazar propuesta.
- REQUEST_EVIDENCE — solicitar evidencia.
- MARK_NOT_APPLICABLE — marcar como no aplicable cuando exista fundamento.
- ESCALATE — escalar.
- REOPEN — reabrir.

No se permite una resolución genérica de “arreglar” sin indicar qué cambió y por qué.

## 11. Versionado del dato

Para un dato conciliado se distinguen:

**Valor declarado** → contenido original.

**Valor observado/interpretado** → resultado del análisis.

**Valor corregido** → modificación sustentada.

**Valor operacional** → valor autorizado para uso operativo.

La conciliación no destruye estados anteriores.

## 12. Direcciones

Una dirección ambigua puede requerir:

1. conservar dirección declarada;
2. generar interpretación;
3. consultar catálogo;
4. consultar geocoder;
5. contactar destinatario;
6. registrar corrección;
7. volver a validar;
8. posteriormente geocodificar.

Un resultado de geocodificación no sustituye por sí mismo la dirección declarada.

## 13. Personas

Ante una posible coincidencia:

**posible coincidencia → revisión → evidencia → decisión**

No se considera válida la regla:

**mismo nombre → misma persona**.

Si no existe evidencia suficiente, la discrepancia puede permanecer abierta o escalarse.

## 14. Diferencias documentales

Cuando existan diferencias entre datos declarados y observados:

- conservar ambos;
- registrar tipo de diferencia;
- registrar fuente de observación;
- registrar momento;
- conservar evidencia;
- no sobrescribir el documento fuente.

## 15. Autorización

Debe distinguirse como mínimo:

- consultar;
- analizar;
- proponer;
- resolver;
- reabrir;
- escalar;
- modificar datos críticos.

Una propuesta automática no equivale a una decisión autorizada.

## 16. Escalamiento

Cuando una discrepancia exceda las facultades del operador:

1. solicitar escalamiento;
2. conservar estado e historial;
3. asignar a autoridad definida;
4. revisar evidencia;
5. resolver o solicitar evidencia adicional;
6. registrar decisión y auditoría.

Los roles concretos quedan sujetos al modelo de autorización del ecosistema.

## 17. Revalidación

Después de una resolución que modifica un dato:

1. registrar resolución;
2. determinar reglas afectadas;
3. ejecutar nueva validación cuando corresponda;
4. generar nuevos hallazgos;
5. conservar las ejecuciones anteriores.

No se modifica retroactivamente una ejecución histórica.

## 18. Concurrencia

Dos usuarios no deben sobrescribir silenciosamente una misma discrepancia.

El mecanismo técnico queda pendiente, pero debe existir protección mediante versión, control optimista, bloqueo explícito o equivalente.

Ante conflicto, el cambio obsoleto debe rechazarse o requerir revisión.

## 19. Idempotencia

Un mismo comando de resolución repetido no debe crear dos decisiones.

Debe existir una identidad de operación o mecanismo equivalente para detectar reintentos.

## 20. Auditoría

Cada transición o resolución relevante registra:

- actor;
- acción;
- discrepancia;
- estado anterior/nuevo;
- valor anterior/nuevo;
- motivo;
- evidencia;
- timestamp;
- correlación;
- versión.

Los registros permanecen aunque la discrepancia sea reabierta.

## 21. Eventos candidatos

- DiscrepancyOpened
- DiscrepancyUnderReview
- DiscrepancyEvidenceRequested
- DiscrepancyResolved
- DiscrepancyEscalated
- DiscrepancyReopened

Son eventos de dominio candidatos y no obligan a utilizar un broker.

## 22. Flujos alternativos

### FA-01 — Evidencia insuficiente
Estado PENDING_EVIDENCE.

### FA-02 — Propuesta rechazada
Se conserva la propuesta y el rechazo.

### FA-03 — Sin autorización
Operación rechazada y auditada.

### FA-04 — Conflicto de concurrencia
Actualización obsoleta rechazada.

### FA-05 — Dato crítico
Requiere autorización adicional.

### FA-06 — Reapertura
Una discrepancia resuelta puede reabrirse ante nueva evidencia.

### FA-07 — Dependencia externa no disponible
Permanece abierta o bloqueada; no se fuerza resolución.

## 23. Criterios de aceptación

### AT-PQ-019
Una discrepancia puede consultarse mostrando origen y regla.

### AT-PQ-020
Una resolución conserva el valor declarado original.

### AT-PQ-021
Una corrección registra valor anterior, nuevo, actor, fecha/hora y motivo.

### AT-PQ-022
Una resolución sin permisos suficientes es rechazada.

### AT-PQ-023
Una discrepancia puede permanecer abierta por falta de evidencia.

### AT-PQ-024
Una posible coincidencia de persona no se confirma automáticamente.

### AT-PQ-025
Una corrección de dirección conserva la dirección declarada.

### AT-PQ-026
Una nueva validación no modifica el historial de validaciones anteriores.

### AT-PQ-027
Una actualización concurrente obsoleta no sobrescribe una decisión posterior.

### AT-PQ-028
Un reintento de la misma operación no duplica la resolución.

### AT-PQ-029
Una discrepancia resuelta puede reabrirse conservando historial.

### AT-PQ-030
Una resolución escalada registra autoridad y trazabilidad.

## 24. Métricas candidatas

- discrepancias abiertas;
- tiempo hasta revisión;
- tiempo hasta resolución;
- porcentaje resuelto;
- porcentaje escalado;
- porcentaje reabierto;
- discrepancias por regla;
- discrepancias por origen;
- solicitudes de evidencia;
- conflictos de concurrencia;
- correcciones por tipo.

No se establecen objetivos numéricos todavía.

## 25. Dependencias

- UC-PQ-01;
- UC-PQ-02;
- autenticación/autorización;
- auditoría;
- almacenamiento de evidencias;
- catálogos;
- comunicación con destinatarios/agencia cuando aplique;
- motor de revalidación.

## 26. Fuera de alcance

No define todavía:

- esquema físico PostgreSQL;
- PostGIS;
- API REST concreta;
- UI definitiva;
- proveedor de geocodificación;
- workflow engine;
- broker;
- microservicios;
- reglas legales aún no determinadas.

## 27. Trazabilidad

RF-PQ-003 → CAP-PQ-02 → UC-PQ-03 → RN-PQ-002/RN-PQ-003 → AT-PQ-019..030

Cadena funcional:

**UC-PQ-01 Importar**  
→ **UC-PQ-02 Validar**  
→ **UC-PQ-03 Conciliar**  
→ **UC-PQ-02 Revalidar**

## 28. Decisiones pendientes

- DEC-PQ-001: jerarquía documental.
- DEC-PQ-005: criterios de liberación a distribución.
- DEC-PQ-006: modificación/cancelación.
- DEC-PQ-007: jerarquía Master AWB/Guide/House.
- DEC-PQ-009: catálogos territoriales.
- políticas definitivas de autorización y escalamiento.

## 29. Estado

**En validación.**

Este caso de uso completa el primer circuito de control de calidad del manifiesto. Antes de implementar la conciliación productiva deben consolidarse el catálogo de reglas, estados definitivos, facultades por rol y decisiones de dominio pendientes.
