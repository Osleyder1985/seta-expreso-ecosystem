# Modelo de reglas de validación de manifiestos de Paquetería v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base:** 48d6e8b337bbca93051f0fd6ef846687106b6832  
**Relacionados:** UC-PQ-01, UC-PQ-02, UC-PQ-03

## 1. Propósito

Definir el modelo lógico mediante el cual SETA EXPRESO identifica, versiona, ejecuta y explica las reglas utilizadas para validar manifiestos importados.

Este documento define el metamodelo de reglas y no congela todavía el catálogo definitivo de columnas del Excel ni el esquema físico de persistencia.

## 2. Principios

1. Cada regla tiene identidad estable.
2. Cada regla tiene versión.
3. Cada regla declara su aplicabilidad.
4. Cada regla produce un resultado explicable.
5. Las reglas no dependen directamente del lector XLSX.
6. Las reglas de fuente, estructura, datos y negocio pueden distinguirse.
7. Las reglas no convierten supuestos pendientes en hechos.
8. Una regla externa declara su dependencia.
9. Las reglas son testeables de forma aislada.
10. Cada ejecución conserva la versión de regla utilizada.

## 3. Tipos de regla

- R-STRUCT — estructural.
- R-REQUIRED — obligatoriedad.
- R-TYPE — tipo/formato.
- R-DOMAIN — dominio.
- R-CONSISTENCY — consistencia.
- R-BUSINESS — negocio.
- R-EXTERNAL — dependencia externa.
- R-RECONCILIATION — requiere decisión humana.

## 4. Metamodelo conceptual

Una regla contiene como mínimo:

- ruleId
- version
- name
- description
- type
- severity
- blocking
- applicability
- scope
- inputs
- condition
- expected
- failureCode
- message
- evidenceRequirements
- externalDependency
- effectiveFrom
- effectiveTo
- status
- owner
- tests

Estos nombres son conceptuales.

## 5. Identidad y estados

Ejemplo de identidad:

**RN-PQ-IMP-001 v1**

Estados candidatos:

- PROPOSED
- ADOPTED
- ACTIVE
- DEPRECATED
- RETIRED

Los estados deben alinearse con la taxonomía documental del ecosistema.

## 6. Severidad y bloqueo

Cada regla declara:

- severity: ERROR / WARNING / INFO
- blocking: true / false

No debe inferirse que todo ERROR sea bloqueante.

## 7. Aplicabilidad

Cada regla declara cuándo aplica.

Ejemplo conceptual:

**perfil compatible + campo presente → ejecutar regla**

Esto evita aplicar reglas de un formato a otro.

## 8. Fuentes de datos

Una regla puede consumir:

- valor de celda;
- fila;
- otras filas;
- metadatos del documento;
- catálogo interno;
- dato interpretado;
- resultado de otra regla;
- dependencia externa.

El origen debe quedar identificado.

## 9. Orden lógico

Orden recomendado:

1. archivo;
2. estructura;
3. mapeo;
4. obligatoriedad;
5. tipos/formato;
6. dominio;
7. integridad intra-registro;
8. integridad inter-registro;
9. negocio;
10. dependencias externas;
11. consolidación.

Es una estrategia inicial, no una dependencia implícita.

## 10. Dependencias entre reglas

Cuando una regla depende de otra, debe declararse.

Ejemplo:

**mapeo confirmado → validación específica**

No se ejecuta una regla sobre una entrada que no existe.

## 11. Catálogo inicial candidato

### Archivo

- R-FILE-001 — formato admitido.
- R-FILE-002 — archivo legible.
- R-FILE-003 — tamaño permitido.

### Estructura

- R-STR-001 — hoja requerida.
- R-STR-002 — encabezados identificables.
- R-STR-003 — columnas requeridas.
- R-STR-004 — filas procesables.

### Campos

- R-FLD-001 — campo obligatorio no vacío.
- R-FLD-002 — tipo compatible.
- R-FLD-003 — longitud/formato permitido.
- R-FLD-004 — valor dentro de rango.

### Dominio

- R-DOM-001 — código de destino permitido.
- R-DOM-002 — unidad de medida reconocida.
- R-DOM-003 — valor perteneciente a catálogo vigente.

### Consistencia

- R-CON-001 — identificador único en contexto aplicable.
- R-CON-002 — relación entre campos coherente.
- R-CON-003 — duplicado potencial detectable.
- R-CON-004 — consistencia entre registros.

### Dirección

- R-ADDR-001 — dirección declarada presente cuando sea requerida.
- R-ADDR-002 — dirección interpretable.
- R-ADDR-003 — dirección normalizable.
- R-ADDR-004 — validación territorial.
- R-ADDR-005 — geocodificación disponible.

R-ADDR-005 no significa que una dirección sin coordenadas deba eliminarse.

### Personas

- R-PER-001 — datos mínimos disponibles.
- R-PER-002 — posible identidad duplicada.
- R-PER-003 — no confirmar identidad únicamente por coincidencia nominal.

### Documento

- R-DOC-001 — origen del registro trazable.
- R-DOC-002 — discrepancia documental identificable.

Este catálogo es candidato y debe ajustarse a la estructura real del Excel y a las decisiones de dominio.

## 12. Regla versus hallazgo

Deben distinguirse.

**Regla**
→ qué comprobamos.

**Hallazgo**
→ qué ocurrió en una ejecución.

Ejemplo:

Regla: R-ADDR-002  
Hallazgo: PQ-ADDR-002

## 13. Resultado de evaluación

Conceptualmente, RuleEvaluation contiene:

- evaluationId
- ruleId
- ruleVersion
- executionId
- sourceReference
- inputSnapshot
- outcome
- severity
- blocking
- findingCode
- message
- evaluatedAt
- evidenceReference

Outcomes candidatos:

- PASS
- FAIL
- NOT_APPLICABLE
- BLOCKED
- ERROR

## 14. FAIL versus ERROR

**FAIL**
→ la regla se ejecutó correctamente y encontró incumplimiento.

**ERROR**
→ no fue posible determinar el resultado por fallo técnico o de dependencia.

Esto evita confundir indisponibilidad de un servicio con dato inválido.

## 15. Reglas externas

Una regla externa debe identificar:

- dependencia;
- timeout;
- política de reintento;
- resultado negativo;
- indisponibilidad;
- timestamp;
- referencia de respuesta.

Ejemplo:

**Geocoder disponible + sin coincidencia**
→ resultado funcional negativo.

**Geocoder indisponible**
→ BLOCKED/ERROR según política.

## 16. Regla de no inferencia

El motor no puede inventar datos para obtener PASS.

No debe convertir automáticamente:

- nombre parecido → misma persona;
- dirección parecida → misma dirección;
- código desconocido → código conocido;
- coordenada aproximada → coordenada validada;
- ausencia de información → valor operacional por defecto.

## 17. Transformaciones

Las transformaciones se distinguen de las validaciones.

Ejemplo:

**trim**
→ transformación técnica.

**normalización de dirección**
→ transformación de dominio controlada.

**corrección manual**
→ decisión de conciliación.

Cada transformación conserva origen y versión.

## 18. Catálogos

Los catálogos deben ser versionables.

Una validación debe poder indicar:

**catálogo X, versión Y**

Esto es especialmente relevante para:

- destinos;
- provincias;
- municipios;
- unidades;
- estados;
- códigos operacionales.

## 19. Reproducibilidad

Para reproducir una ejecución deben conservarse:

- archivo/hash;
- perfil;
- mapeo;
- reglas;
- versiones;
- catálogos;
- configuración relevante;
- dependencias externas cuando sea posible;
- timestamp.

Los resultados externos no controlables deben quedar identificados.

## 20. Política de cambios

### Cambio compatible
Puede incrementar versión menor.

### Cambio semántico
Debe incrementar versión mayor o crear nueva identidad según impacto.

### Regla retirada
No se elimina su historial.

Toda ejecución histórica debe identificar la regla utilizada.

## 21. Testabilidad

Cada regla debe tener pruebas para:

- PASS;
- FAIL;
- límites;
- dato ausente;
- entrada inválida;
- NOT_APPLICABLE;
- dependencia no disponible cuando aplique;
- regresión.

Las reglas críticas requieren pruebas de aceptación además de unitarias.

## 22. Motor conceptual

**RuleSet**
→ determina reglas aplicables

**RuleEvaluator**
→ ejecuta reglas

**RuleEvaluation**
→ produce resultados

**Finding**
→ materializa hallazgos

**ValidationSummary**
→ consolida resultados

Esto permite mantener el motor genérico y las reglas separadas.

## 23. No introducir BRMS prematuramente

No se adopta todavía un BRMS o motor especializado.

La primera implementación debe utilizar la alternativa más simple que permita:

- versionado;
- pruebas;
- trazabilidad;
- composición;
- cambio controlado.

Una tecnología adicional requerirá evidencia de necesidad.

## 24. Criterios de aceptación

### AT-RULE-001
Cada regla activa posee identidad y versión.

### AT-RULE-002
Una evaluación conserva la versión exacta de la regla.

### AT-RULE-003
Una regla declara severidad y condición de bloqueo.

### AT-RULE-004
Una regla no aplicable produce NOT_APPLICABLE y no PASS.

### AT-RULE-005
Un fallo técnico se diferencia de FAIL funcional.

### AT-RULE-006
Un hallazgo puede localizarse hasta la fuente.

### AT-RULE-007
Una regla externa identifica su dependencia.

### AT-RULE-008
Una indisponibilidad externa no se registra como dato inválido.

### AT-RULE-009
Una regla histórica no desaparece cuando se sustituye.

### AT-RULE-010
Cada regla crítica tiene pruebas PASS y FAIL.

### AT-RULE-011
Una transformación conserva origen y versión.

### AT-RULE-012
El motor no inventa valores para obtener PASS.

### AT-RULE-013
Los catálogos utilizados pueden identificarse por versión.

### AT-RULE-014
Una entrada y conjunto de versiones controladas producen resultados reproducibles.

## 25. Decisiones pendientes

- columnas oficiales del Excel;
- perfiles concretos;
- catálogo territorial;
- catálogo de destinos;
- política definitiva de severidades;
- reglas legales aplicables;
- política de dependencias externas;
- reglas de identidad;
- reglas de aceptación operacional;
- mecanismo físico de versionado.

## 26. Trazabilidad

**UC-PQ-01**
→ extracción y mapeo.

**UC-PQ-02**
→ RuleSet → RuleEvaluation → Finding → ValidationSummary.

**UC-PQ-03**
→ Finding → ReconciliationDecision.

**Revalidación**
→ nuevo ValidationRun con versiones identificables.

## 27. Estado

**En validación.**

Este documento establece el metamodelo necesario para construir el catálogo definitivo de reglas una vez confirmada la estructura real de los manifiestos y las decisiones de dominio pendientes.
