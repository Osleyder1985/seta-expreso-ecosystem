# Baseline vigente de importación XLSX de Paquetería v0.2.0

**Estado:** En validación técnica  
**Issue rector:** #228  
**Fecha:** 2026-09-27

## 1. Propósito

Consolidar en un único artefacto vigente las decisiones de dominio y arquitectura recuperadas de los PR históricos #134–#150, sin fusionar sus ramas antiguas.

Este documento es la referencia de reconciliación. No declara que el importador esté terminado ni que una librería XLSX haya sido adoptada definitivamente.

## 2. Boundary

La importación XLSX pertenece al bounded context **Paquetería** y debe seguir un pipeline explícito:

**preservar fuente → inspeccionar → extraer → mapear → validar → reconciliar cuando sea necesario → preparar aceptación → promover operacionalmente**.

La ejecución técnica (**ImportExecution**) y el estado operacional de **Manifest** son conceptos separados.

## 3. Modelo intermedio

El pipeline debe conservar, como mínimo:

- ImportSnapshot;
- workbook/sheet/row/cell;
- row kind;
- rawValue y displayedValue cuando estén disponibles;
- fórmula y resultado cacheado cuando existan;
- formato numérico;
- visibilidad de hojas;
- MappedFieldValue;
- ExtractedRecord;
- Finding;
- Discrepancy/ReconciliationCase;
- Canonical Candidate;
- provenance completa.

La representación intermedia no debe depender de una biblioteca XLSX concreta.

## 4. Provenance

Todo dato crítico debe poder remontarse a:

- sourceDocumentId;
- contentHash;
- sheetName;
- rowNumber;
- columnIndex;
- columnHeaderRaw;
- cellAddress;
- rawValue;
- mappingProfileId/version;
- transformación aplicada.

La transformación nunca sustituye silenciosamente el valor declarado.

## 5. Mapping

El mapping es explícito y versionado.

Reglas:

- exact match tiene prioridad;
- aliases sólo cuando el perfil los autorice;
- mapping crítico ambiguo → BLOCKED;
- campo crítico ausente → finding bloqueante según regla;
- columnas desconocidas no se descartan silenciosamente;
- cambios de estructura del proveedor se absorben mediante MappingProfile, no modificando el significado del dominio;
- no se permite inferencia silenciosa de campos críticos.

## 6. Dominio observado

La evidencia histórica establece como conceptos separados:

- Manifest;
- TransportDocument/MasterAwb;
- House;
- PhysicalUnit;
- Person/Contact;
- Address;
- Geolocation;
- Customs/Consolidated source artifacts;
- provenance.

Una fila XLSX no implica automáticamente una PhysicalUnit.

Un House puede contener múltiples unidades físicas.

Una misma dirección puede estar relacionada con múltiples Houses.

## 7. Validación y reconciliación

Se distinguen:

- PASS;
- FAIL;
- BLOCKED;
- ERROR;
- WARNING/INFO según severidad;
- discrepancia de negocio;
- fallo técnico.

Un fallo técnico no debe convertirse automáticamente en una discrepancia de negocio.

Una discrepancia no debe eliminar el valor declarado.

La promoción operacional exige que los hallazgos bloqueantes estén ausentes o formalmente resueltos y auditados.

## 8. Estados de ImportExecution

Estados definidos provisionalmente:

RECEIVED → PRESERVED → INSPECTING → EXTRACTING → MAPPED → VALIDATING → READY_FOR_ACCEPTANCE → ACCEPTED

Ramas explícitas:

- REQUIRES_RECONCILIATION;
- REVALIDATING;
- BLOCKED;
- FAILED;
- REJECTED;
- CANCELLED.

No se permiten transiciones implícitas.

Las reejecuciones generan una ejecución identificable y conservan la anterior.

## 9. Idempotencia y concurrencia

Una importación se identifica por el contexto de fuente, perfil, versión y operación/idempotency key.

Una repetición equivalente no debe crear duplicados.

El pipeline debe conservar:

- executionId;
- version/baseVersion;
- operationId;
- correlationId;
- idempotencyKey;
- actor/proceso.

Los conflictos de versión no se resuelven mediante sobrescritura silenciosa.

## 10. Puertos

El dominio/aplicación no conoce proveedores concretos.

Puertos principales:

- SourceStoragePort;
- WorkbookReaderPort;
- MappingProfilePort;
- RuleSetPort;
- ValidationRunnerPort;
- FindingsRepositoryPort;
- ReconciliationPort;
- GeocodingPort;
- persistencia/promoción;
- auditoría/observabilidad.

El lector XLSX es un adapter intercambiable.

## 11. Fixtures mínimos

La suite debe cubrir al menos:

- House textual;
- múltiples bultos;
- dirección compartida;
- múltiples teléfonos;
- coordenadas válidas;
- coordenadas no resueltas;
- Aduana;
- CONSOLIDADO;
- fórmulas;
- discrepancias de totales;
- alias de headers;
- headers ambiguos;
- campos críticos ausentes;
- columnas adicionales;
- filas TOTAL/SUBTOTAL;
- valores numéricos problemáticos;
- identidad ambigua;
- reimportación idéntica;
- mismo contenido con diferente versión de mapping.

Los datos deben ser sintéticos y no contener PII real.

## 12. Lector XLSX

ExcelJS 4.4.0 permanece únicamente como **candidato/PoC histórico**, encapsulado detrás de WorkbookReaderPort.

No se adopta como dependencia productiva hasta completar:

- comparación con alternativas;
- lockfile reproducible;
- árbol real de dependencias;
- revisión de seguridad;
- límites de recursos;
- pruebas F01–F20;
- prueba con evidencia real anonimizada;
- decisión ADR vigente.

Los PR #144/#148 contienen implementación PoC recuperable, pero no deben fusionarse directamente por su divergencia histórica.

## 13. Relación con el modelo actual

El modelo Prisma actual ya contiene Manifest, TransportDocument, MasterAwb, House, PhysicalUnit, Person, Address y Geolocation.

Por tanto, el importador debe producir candidatos intermedios compatibles con esas entidades, pero **no debe escribir directamente entidades operacionales durante la extracción**.

La frontera de promoción será explícita y autorizada.

## 14. Seguridad

La ingesta de archivos externos requiere:

- límites de tamaño;
- control de recursos;
- aislamiento apropiado del parser;
- validación del contenedor/formato;
- protección contra archivos especialmente construidos;
- provenance;
- auditoría;
- fixtures sin PII.

La selección del parser y sus mitigaciones se mantiene abierta hasta completar la evaluación tecnológica.

## 15. Artefactos históricos

Fuentes preservadas en GitHub:

#134 catálogo de campos  
#135 máquina de estados  
#136 contratos de servicio  
#137 contratos de resultados  
#138 mapping profile  
#139 evidencia de fuentes reales  
#140 impacto sobre modelo  
#141 modelo intermedio  
#142 fixtures  
#143 vertical slice  
#144 reader  
#146 evaluación tecnológica  
#148 hardening del reader  
#149 protocolo/fixtures de benchmark  
#150 harness comparativo

La historia de esos PR no se pierde aunque sus ramas no se fusionen.

## 16. Próximo incremento técnico

El siguiente incremento de #228 será:

1. recuperar el contrato `WorkbookReaderPort` en código actual;
2. crear fixtures XLSX sintéticos F01–F07;
3. implementar un adapter experimental aislado;
4. probar provenance, headers, fórmulas y filas especiales;
5. añadir límites de recursos;
6. ejecutar CI;
7. sólo después ampliar hacia mapping y promoción de Manifest/House.

**Estado global: PARCIAL — baseline reconciliado; implementación productiva pendiente.**
