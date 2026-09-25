# Diseño del pipeline de importación de manifiestos de Paquetería v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base:** `5283bd0f8db28859fb9c206b14fa952b45aab9a7`  
**Casos de uso:** UC-PQ-01, UC-PQ-02, UC-PQ-03

## 1. Propósito

Definir el diseño lógico del pipeline que transforma un archivo de manifiesto recibido en un resultado de importación validado y, posteriormente, en datos autorizados para procesamiento operacional.

El pipeline separa explícitamente:

**fuente documental → representación procesable → validación → discrepancias → conciliación → revalidación → aceptación operacional**

No define todavía tablas PostgreSQL, endpoints REST ni un proveedor concreto de Excel/geocodificación.

## 2. Objetivos de diseño

- Preservar la fuente original.
- Garantizar trazabilidad fila/celda cuando sea posible.
- Permitir validación reproducible.
- Aislar el lector XLSX del dominio.
- Evitar que datos no validados entren silenciosamente al modelo operacional.
- Permitir reintentos sin duplicar operaciones.
- Soportar errores parciales controlados.
- Mantener historial de validaciones y conciliaciones.
- Permitir sustituir componentes externos.
- Facilitar ejecución síncrona o asíncrona sin cambiar las reglas de dominio.

## 3. Arquitectura lógica

El pipeline se divide en ocho etapas:

### P0 — Receive
Recibir el archivo y crear identidad de operación.

### P1 — Preserve
Almacenar la fuente original, hash y metadatos.

### P2 — Inspect
Analizar libro, hojas, encabezados y estructura.

### P3 — Extract
Extraer valores sin aplicar reglas de negocio.

### P4 — Validate
Ejecutar reglas y generar hallazgos.

### P5 — Reconcile
Gestionar discrepancias y decisiones autorizadas.

### P6 — Revalidate
Ejecutar nuevamente las reglas afectadas.

### P7 — Accept
Transformar únicamente información autorizada en datos operacionales.

## 4. Flujo lógico

**Archivo Excel**  
↓  
**Receive**  
↓  
**Preserve**  
↓  
**Inspect**  
↓  
**Extract**  
↓  
**Validate**  
↓  
**¿Hay discrepancias?**  
├─ No → **Accept**  
└─ Sí → **Reconcile**  
   ↓  
   **Revalidate**  
   ↓  
   **Accept / permanecer pendiente**

## 5. Componentes lógicos

### Import Command Handler
Responsable de iniciar la operación, validar autorización y crear la identidad de importación.

### Source Preservation Service
Responsable de conservar el archivo y sus metadatos.

### Workbook Inspector
Responsable exclusivamente de descubrir estructura.

### Manifest Extractor
Convierte celdas del libro en una representación intermedia.

### Column Mapping Engine
Relaciona columnas de la fuente con conceptos esperados.

### Validation Engine
Ejecuta reglas versionadas.

### Findings Registry
Registra errores, warnings y otros hallazgos.

### Reconciliation Service
Gestiona decisiones humanas y evidencia.

### Revalidation Coordinator
Determina qué reglas deben ejecutarse nuevamente.

### Operational Acceptance Service
Promueve únicamente datos autorizados al modelo operacional.

### Audit Service
Registra acciones críticas y cambios.

### Event Publisher
Publica eventos de dominio cuando corresponda.

## 6. Regla de separación

Los componentes de infraestructura **no deben escribir directamente entidades operacionales**.

Ejemplo:

**XLSX Reader**
→ RawRow  
→ Validation Engine  
→ Validated/Accepted representation  
→ Operational domain

Nunca:

**XLSX Reader → INSERT directo a packages/house/etc.**

## 7. Representación intermedia

El pipeline necesita una representación neutral entre Excel y dominio.

Conceptualmente:

### SourceDocument
- identity
- hash
- filename
- receivedAt
- mediaType
- size
- storageReference

### WorkbookSnapshot
- documentIdentity
- workbookMetadata
- sheets[]

### SourceRow
- sheet
- rowNumber
- cells[]
- sourceCoordinates

### SourceCell
- column
- address
- rawValue
- normalizedCandidate
- dataType

### MappedRecord
- sourceRow
- mappedFields[]
- mappingVersion

Esta representación permite cambiar el lector XLSX sin modificar el dominio.

## 8. Mapeo de columnas

El mapeo debe ser explícito y versionado.

Ejemplo conceptual:

**Columna Excel**
→ **campo lógico**

El sistema debe distinguir:

- mapeo confirmado;
- mapeo candidato;
- columna desconocida;
- columna requerida ausente;
- conflicto de mapeo.

No se debe aceptar una columna por similitud textual sin una política definida.

## 9. Perfil del manifiesto

El pipeline debe permitir perfiles de importación.

Un perfil puede definir:

- hojas esperadas;
- columnas esperadas;
- aliases;
- campos obligatorios;
- tipos;
- transformaciones permitidas;
- reglas aplicables;
- versión.

Esto permitirá admitir futuras variantes de Excel sin contaminar el núcleo de dominio.

## 10. Versionado

Como mínimo deben identificarse:

- versión del pipeline;
- versión del perfil de importación;
- versión del mapeo;
- versión del conjunto de reglas;
- versión del validador;
- versión de la fuente.

Una nueva ejecución no debe reinterpretarse retrospectivamente como si hubiera utilizado versiones actuales.

## 11. Estados del pipeline

Estados candidatos:

- RECEIVED
- PRESERVED
- INSPECTING
- EXTRACTING
- VALIDATING
- REQUIRES_RECONCILIATION
- REVALIDATING
- ACCEPTED
- REJECTED
- BLOCKED
- FAILED

Los estados son del proceso técnico y no deben confundirse con los estados del manifiesto operacional.

## 12. Idempotencia

La identidad de la operación debe permitir distinguir:

- reintento del mismo comando;
- mismo archivo;
- mismo archivo con una nueva ejecución deliberada;
- archivo diferente.

El hash identifica contenido; **no sustituye por sí solo la identidad de la operación**.

## 13. Atomicidad

El pipeline debe soportar dos niveles:

### Nivel técnico
Cada etapa debe poder registrar su progreso y fallo.

### Nivel operacional
La promoción a datos operacionales debe cumplir una política transaccional explícita.

No se establece todavía si todo el manifiesto debe promoverse atómicamente o si podrán aceptarse subconjuntos.

Esta decisión permanece relacionada con DEC-PQ-006.

## 14. Errores

Cada etapa debe producir errores clasificados.

### Técnicos
- almacenamiento;
- lectura;
- memoria;
- timeout;
- dependencia.

### Estructurales
- hoja inexistente;
- encabezado ausente;
- estructura incompatible.

### De datos
- campo obligatorio;
- formato;
- tipo;
- rango;
- catálogo.

### De negocio
- inconsistencia;
- conflicto;
- regla incumplida.

La capa técnica no debe convertir un error de infraestructura en un error de datos.

## 15. Procesamiento parcial

Cuando sea seguro continuar:

**fila válida + fila inválida**

debe permitir obtener resultados independientes.

Sin embargo, la promoción operacional debe depender de la política de aceptación definida para el manifiesto.

Esto evita dos extremos:

- abortar inútilmente todo por una fila defectuosa;
- aceptar silenciosamente datos no conciliados.

## 16. Direcciones dentro del pipeline

La dirección debe recorrer un subpipeline independiente:

**DeclaredAddress**  
↓  
**InterpretedAddress**  
↓  
**NormalizedAddress**  
↓  
**ValidatedAddress**  
↓  
**GeocodedAddress**

Cada transformación conserva trazabilidad.

La geocodificación no pertenece al lector XLSX ni debe ser requisito para conservar el registro.

## 17. Dependencias externas

Las dependencias externas deben estar detrás de puertos/adaptadores.

Ejemplos:

**Geocoding Port**  
→ proveedor concreto

**Territorial Catalog Port**  
→ catálogo concreto

**Recipient Verification Port**  
→ canal concreto

El dominio no debe depender directamente de SDKs de proveedores.

## 18. Ejecución síncrona vs asíncrona

El diseño lógico permite ambos modelos.

### Síncrono
Adecuado para operaciones pequeñas y respuesta inmediata.

### Asíncrono
Adecuado si:
- el archivo es grande;
- la validación tarda;
- existen llamadas externas;
- se requiere reintento;
- el usuario no necesita mantener una petición HTTP abierta.

La decisión debe basarse en mediciones reales, no en una preferencia arquitectónica.

## 19. Observabilidad

Cada ejecución debe disponer de:

- operationId;
- correlationId;
- importId;
- validationRunId;
- timestamps por etapa;
- duración;
- resultado;
- errores;
- reintentos.

Los logs deben permitir reconstruir el recorrido sin registrar innecesariamente datos personales.

## 20. Seguridad

El pipeline debe aplicar:

- autenticación;
- autorización;
- validación del archivo;
- límites de tamaño;
- protección contra archivos maliciosos;
- control de acceso al documento;
- aislamiento del procesamiento;
- auditoría;
- protección de datos personales.

El archivo de origen debe tratarse como entrada no confiable.

## 21. Recuperación

Cada etapa debe poder identificar:

- iniciada;
- completada;
- fallida;
- reintentada.

Un fallo recuperable no debe exigir necesariamente volver a procesar desde cero.

El mecanismo de checkpoints queda sujeto a la implementación y volumen real.

## 22. Rendimiento

Las métricas deben medirse separadamente:

- recepción;
- preservación;
- inspección;
- extracción;
- validación;
- dependencias externas;
- conciliación;
- aceptación.

No se debe atribuir al lector XLSX el tiempo consumido por geocodificación, ni atribuir al validador tiempos de espera externos.

## 23. Evidencia

Cada ejecución debe poder relacionarse con:

**source hash**  
→ **pipeline version**  
→ **profile version**  
→ **mapping version**  
→ **rule-set version**  
→ **validator version**  
→ **result**

Esto permite reproducir o explicar el resultado posteriormente.

## 24. Contratos internos candidatos

### ImportRequest
Solicita una importación.

### ImportReceipt
Confirma recepción.

### InspectionResult
Describe estructura.

### ExtractionResult
Representa filas/celdas extraídas.

### ValidationResult
Contiene hallazgos y consolidado.

### ReconciliationDecision
Representa una decisión autorizada.

### RevalidationResult
Resultado posterior a una corrección.

### AcceptanceResult
Confirma o rechaza promoción operacional.

Son contratos lógicos; no son todavía DTOs REST ni esquemas físicos.

## 25. Eventos candidatos

- ManifestImportReceived
- ManifestSourcePreserved
- ManifestInspectionCompleted
- ManifestExtractionCompleted
- ManifestValidationCompleted
- ManifestDiscrepancyDetected
- ManifestReconciliationCompleted
- ManifestRevalidationCompleted
- ManifestAccepted

La infraestructura de publicación queda abierta.

## 26. Seguridad contra duplicación

Debe evitarse:

**misma operación → dos promociones operacionales**

La aceptación debe ser idempotente y verificable mediante identidad de operación y versión/baseVersion cuando corresponda.

## 27. Pruebas del pipeline

Se requiere una pirámide:

### Unitarias
Reglas, mapeos y transformaciones.

### Contract
Interfaces de lector, almacenamiento y proveedores.

### Integración
Excel → pipeline → resultados.

### E2E
Importación → validación → conciliación → revalidación → aceptación.

### Resiliencia
Fallos de almacenamiento, lector y dependencias externas.

### Seguridad
Archivos no confiables, autorización y acceso a evidencia.

### Reproducibilidad
Misma fuente + mismas versiones → mismo resultado esperado.

## 28. Criterios de aceptación del diseño

### AT-PIPE-001
El archivo fuente permanece disponible después del procesamiento.

### AT-PIPE-002
El hash de fuente se conserva.

### AT-PIPE-003
Cada hallazgo puede trazarse a su origen.

### AT-PIPE-004
El lector XLSX no escribe directamente datos operacionales.

### AT-PIPE-005
Una dirección no geocodificable no destruye el registro.

### AT-PIPE-006
Una corrección conserva la versión declarada.

### AT-PIPE-007
Una nueva validación conserva la anterior.

### AT-PIPE-008
Un reintento idempotente no duplica la aceptación.

### AT-PIPE-009
Una dependencia externa indisponible se diferencia de un dato inválido.

### AT-PIPE-010
El resultado identifica las versiones que participaron.

### AT-PIPE-011
Un error de una fila no oculta resultados de otras filas cuando el modo de procesamiento permita continuar.

### AT-PIPE-012
No puede promoverse información que permanezca bloqueada por una regla de aceptación.

## 29. Decisiones que siguen abiertas

- perfil exacto de Excel;
- columnas oficiales;
- política de mapeo automático;
- atomicidad de aceptación;
- estados definitivos;
- política de reimportación;
- proveedor geográfico;
- catálogo territorial;
- estrategia síncrona/asíncrona;
- retención de archivos/evidencias;
- umbrales de rendimiento.

## 30. Relación con la arquitectura

El diseño encaja con el baseline vigente:

**Modular Monolith + Clean/Hexagonal**

No requiere microservicios, serverless, broker ni Kubernetes.

Si posteriormente el volumen, aislamiento, escalabilidad o integración justifican separar alguna etapa, deberá existir una decisión arquitectónica explícita y reversible.

## 31. Trazabilidad

**UC-PQ-01**  
→ recepción/preservación/inspección/extracción

**UC-PQ-02**  
→ validación/hallazgos

**UC-PQ-03**  
→ conciliación/evidencia/decisión

**UC-PQ-02**  
→ revalidación

**Acceptance**  
→ promoción operacional

## 32. Estado

**En validación.**

Este documento define el diseño lógico del pipeline y constituye el puente entre la especificación de casos de uso y el futuro diseño técnico de componentes/contratos. No congela todavía API pública, esquema físico, proveedor externo ni infraestructura distribuida.
