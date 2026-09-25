# UC-PQ-02 — Validar importación de manifiesto v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base:** `ce5f2597909166ace342977fd2053406b3f0c383`  
**RF:** RF-PQ-002  
**Capacidad:** CAP-PQ-02 — Validación/conciliación  
**Caso de uso relacionado:** UC-PQ-01  
**Pruebas:** AT-PQ-009..016

## 1. Objetivo

Determinar, de forma reproducible y trazable, si los datos incorporados mediante una importación cumplen las reglas estructurales, de formato, obligatoriedad, integridad y consistencia aplicables.

La validación **no modifica destructivamente la fuente** y no debe confundirse con la conciliación humana ni con la aprobación operacional.

## 2. Principios

1. **No destructiva:** el valor declarado permanece disponible.
2. **Determinista:** una misma entrada y una misma versión de reglas deben producir el mismo resultado, salvo dependencias externas explícitamente versionadas.
3. **Trazable:** cada error/advertencia debe poder localizarse hasta la fuente.
4. **Explicable:** el sistema debe indicar qué regla produjo el resultado.
5. **Repetible:** una validación puede ejecutarse nuevamente.
6. **Versionada:** reglas y versión del validador forman parte de la evidencia.
7. **Separación de responsabilidades:** validar no equivale a aprobar.
8. **Tolerancia controlada:** un error de una fila no debe ocultar los resultados de otras filas cuando el proceso permita continuar.

## 3. Actores

### Principal
Operador autorizado de Paquetería.

### Secundarios
- Motor de validación.
- Catálogos maestros.
- Sistema de importación.
- Servicios externos, únicamente cuando una regla dependa de ellos.

## 4. Precondiciones

- Existe una importación registrada.
- El archivo fuente está disponible o su representación procesable está preservada.
- El formato fue reconocido o existe un resultado de inspección.
- Las reglas aplicables tienen una versión identificable.
- El actor posee autorización para consultar/ejecutar validación.

## 5. Disparadores

La validación puede iniciarse:

- automáticamente después de la recepción;
- manualmente por un operador;
- mediante reintento técnico;
- mediante una nueva versión explícita del proceso de validación.

El disparador concreto no cambia la trazabilidad del resultado.

## 6. Clasificación de validaciones

### V01 — Archivo
- extensión/formato;
- integridad;
- tamaño;
- legibilidad.

### V02 — Estructura
- hojas;
- encabezados;
- columnas;
- filas;
- estructura esperada.

### V03 — Obligatoriedad
- campos requeridos;
- valores vacíos;
- valores ausentes.

### V04 — Tipo y formato
- números;
- fechas;
- códigos;
- identificadores;
- formatos de texto.

### V05 — Dominio
- valores permitidos;
- catálogos;
- códigos de destino;
- unidades y rangos.

### V06 — Integridad intra-registro
Relaciones entre campos de una misma fila.

### V07 — Integridad inter-registro
Comparación entre filas del mismo manifiesto:
- duplicados;
- referencias repetidas;
- inconsistencias.

### V08 — Integridad documental
Consistencia con metadatos del manifiesto y su fuente.

### V09 — Reglas de negocio
Reglas de Paquetería aplicables sin asumir decisiones todavía abiertas.

### V10 — Dependencias externas
Validaciones que requieren catálogos o servicios externos. Deben distinguir **fallo de validación** de **servicio no disponible**.

## 7. Severidades

Se establecen tres niveles iniciales:

| Severidad | Significado | Efecto |
|---|---|---|
| ERROR | Incumplimiento que impide considerar válido el elemento | Requiere corrección/conciliación |
| WARNING | Anomalía que no impide continuar | Requiere revisión según política |
| INFO | Resultado informativo | No bloquea |

La política definitiva de bloqueo debe quedar asociada a cada regla, no solamente a la severidad global.

## 8. Resultado por regla

Cada evaluación debe producir, como mínimo:

- identificador de validación;
- regla;
- versión de regla;
- importación;
- registro/fila;
- campo/columna;
- severidad;
- código;
- mensaje;
- valor declarado, cuando sea apropiado;
- resultado;
- timestamp;
- versión del validador;
- correlación de ejecución.

## 9. Flujo normal

### Fase A — Preparación

1. Identificar la importación.
2. Identificar la versión de reglas.
3. Crear ejecución de validación.
4. Cargar la representación preservada de la fuente.
5. Resolver los catálogos necesarios.

### Fase B — Validación estructural

6. Verificar estructura.
7. Mapear columnas conocidas.
8. Registrar columnas desconocidas.
9. Identificar filas procesables.
10. Registrar anomalías estructurales.

### Fase C — Validación de registros

11. Ejecutar obligatoriedad.
12. Ejecutar tipos/formato.
13. Ejecutar dominio.
14. Ejecutar integridad intra-registro.
15. Ejecutar integridad inter-registro.

### Fase D — Reglas de negocio

16. Aplicar únicamente reglas vigentes y aplicables.
17. Registrar la regla exacta que produjo cada resultado.
18. No inferir decisiones que permanezcan pendientes.

### Fase E — Consolidación

19. Contabilizar:
   - filas evaluadas;
   - errores;
   - warnings;
   - infos;
   - filas válidas;
   - filas afectadas.
20. Determinar el estado de validación.
21. Generar resultado reproducible.
22. Registrar auditoría.
23. Emitir evento correspondiente.

## 10. Estados candidatos

- VALIDATING
- VALID
- VALID_WITH_WARNINGS
- INVALID
- REQUIRES_RECONCILIATION
- BLOCKED_BY_DEPENDENCY
- FAILED

Estos estados son del **proceso de validación**, no necesariamente del manifiesto operacional.

## 11. Reglas de decisión

### Regla VD-01
Si existe al menos un ERROR bloqueante, la ejecución no puede clasificarse como VALID.

### Regla VD-02
WARNING no convierte automáticamente una ejecución en INVALID.

### Regla VD-03
Una dependencia externa caída debe distinguirse de un dato inválido.

### Regla VD-04
Una regla desconocida/no disponible no debe tratarse silenciosamente como PASS.

### Regla VD-05
Los resultados de una versión anterior del validador deben conservarse como evidencia histórica cuando se ejecute una nueva validación.

### Regla VD-06
El resultado consolidado debe poder explicarse mediante sus resultados elementales.

## 12. Validación de direcciones

La validación de dirección debe dividirse en etapas:

**Declarada**  
→ **interpretada**  
→ **normalizada/rectificada**  
→ **validada operacionalmente**  
→ **geocodificada**

No son equivalentes.

Una dirección que no pueda geocodificarse:

- no se considera automáticamente inexistente;
- conserva el valor declarado;
- registra el fallo del geocoder;
- puede pasar a rectificación/verificación.

## 13. Validaciones de personas

No se debe fusionar automáticamente a dos personas solamente por coincidencia de nombre.

Cuando existan coincidencias potenciales, el resultado debe ser:

**posible coincidencia → revisión/conciliación**

y no:

**coincidencia confirmada**.

## 14. Duplicados

El sistema debe distinguir:

- duplicado exacto de fuente;
- duplicado potencial de registro;
- repetición operacional legítima;
- conflicto de identificador.

No se debe borrar una fila para resolver un duplicado.

## 15. Discrepancias

Una discrepancia debe poder conservar:

- valor declarado;
- valor observado/interpretado;
- diferencia;
- tipo;
- regla;
- actor;
- fecha/hora;
- evidencia.

Esto permite que la conciliación sea auditable.

## 16. Dependencias externas

Cuando una validación depende de un servicio externo:

1. registrar proveedor/servicio;
2. registrar resultado;
3. registrar timestamp;
4. registrar versión/configuración disponible;
5. diferenciar respuesta negativa de indisponibilidad;
6. permitir reintento;
7. evitar convertir una indisponibilidad técnica en un dato inválido.

Esto es especialmente importante para geocodificación y catálogos externos.

## 17. Idempotencia y repetición

Una misma ejecución debe poder identificarse.

Si se repite la validación:

- no se destruye la ejecución anterior;
- se crea una nueva ejecución identificable cuando corresponda;
- se conserva la versión del validador;
- se conserva la versión de reglas;
- se permite comparar resultados.

## 18. Seguridad

Debe comprobarse:

- autenticación;
- autorización;
- acceso al archivo;
- autorización para consultar resultados;
- protección de datos personales;
- control de entrada;
- límites de procesamiento;
- auditoría de operaciones sensibles.

Los mensajes de error para el usuario deben ser útiles sin revelar información interna innecesaria.

## 19. Auditoría

Registrar:

- actor o proceso;
- importación;
- ejecución;
- versión del validador;
- versión de reglas;
- inicio/fin;
- resultado;
- conteos;
- errores críticos;
- dependencia externa utilizada;
- correlación.

## 20. Eventos candidatos

### ManifestValidationStarted
Inicio de una ejecución.

### ManifestValidationCompleted
Finalización correcta con resultado consolidado.

### ManifestValidationBlocked
Validación impedida por dependencia o condición bloqueante.

### ManifestDiscrepancyDetected
Una o más discrepancias relevantes fueron detectadas.

Los nombres son candidatos de dominio y no implican todavía infraestructura distribuida.

## 21. Flujos alternativos

### FA-01 — Archivo ilegible
Resultado FAILED, conservando evidencia disponible.

### FA-02 — Estructura desconocida
Se registra la estructura y se detiene únicamente si las reglas determinan que no es procesable.

### FA-03 — Catálogo no disponible
Resultado BLOCKED_BY_DEPENDENCY; no se registra PASS.

### FA-04 — Muchas filas con errores
El sistema conserva resultados por fila y produce consolidado.

### FA-05 — Regla no aplicable
Se registra como no aplicable cuando la condición de aplicabilidad esté definida; no como PASS.

### FA-06 — Regla pendiente de decisión
No debe implementarse como regla productiva hasta que sea adoptada.

## 22. Contrato lógico del resultado

Sin congelar todavía una API, el resultado conceptual es:

**ValidationRun**
- identity
- importIdentity
- ruleSetVersion
- validatorVersion
- startedAt
- finishedAt
- status
- counts
- findings[]

**Finding**
- ruleId
- severity
- code
- sourceLocation
- field
- declaredValue/reference
- message
- status
- evidenceReference

## 23. Criterios de aceptación

### AT-PQ-009
Una importación válida produce un resultado VALID o VALID_WITH_WARNINGS según los hallazgos.

### AT-PQ-010
Un ERROR bloqueante impide clasificar la ejecución como VALID.

### AT-PQ-011
Cada error puede localizarse hasta hoja/fila/columna cuando la fuente lo permita.

### AT-PQ-012
Cada hallazgo identifica la regla que lo produjo.

### AT-PQ-013
Una dependencia externa indisponible no se registra como dato inválido.

### AT-PQ-014
La validación repetida conserva la ejecución anterior y permite identificar la nueva.

### AT-PQ-015
Una dirección no geocodificable conserva su valor declarado.

### AT-PQ-016
Una posible coincidencia de persona no se convierte automáticamente en identidad confirmada.

### AT-PQ-017
Los duplicados potenciales se registran sin eliminación destructiva.

### AT-PQ-018
El consolidado puede reconstruirse a partir de los hallazgos elementales.

## 24. Métricas candidatas

- duración total;
- duración por fase;
- filas/segundo;
- reglas evaluadas;
- errores por regla;
- warnings por regla;
- porcentaje de filas afectadas;
- tiempo de dependencias externas;
- reintentos;
- fallos técnicos.

Los objetivos cuantitativos quedan pendientes de evidencia operacional.

## 25. Fuera de alcance

Este UC no congela:

- tablas PostgreSQL;
- PostGIS;
- API REST concreta;
- librería XLSX;
- proveedor de geocodificación;
- proveedor cartográfico;
- algoritmo de routing;
- arquitectura de microservicios;
- broker;
- UI.

## 26. Trazabilidad

`RF-PQ-002 → CAP-PQ-02 → UC-PQ-02 → RN-PQ-001..003 + reglas VD-01..06 → AT-PQ-009..018`

Relación directa:

`UC-PQ-01 → UC-PQ-02 → UC-PQ-03`

Es decir:

**Importar → Validar → Conciliar discrepancias**

## 27. Estado

**En validación.**

La especificación queda preparada para que el siguiente paso sea diseñar el **modelo de reglas de validación y el pipeline de importación**, sin congelar todavía la persistencia física ni los contratos HTTP.
