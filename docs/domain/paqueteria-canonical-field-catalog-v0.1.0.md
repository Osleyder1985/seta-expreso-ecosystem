# Catálogo canónico preliminar de campos de Paquetería v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Naturaleza:** catálogo lógico preliminar; no constituye mapeo definitivo del Excel.

## 1. Objetivo
Establecer el vocabulario de datos que deberá utilizar el dominio independientemente de cómo lleguen los datos desde Excel.

## 2. Convención
Cada campo se clasifica por:
- identidad;
- semántica;
- origen;
- obligatoriedad;
- transformación;
- validación;
- sensibilidad;
- trazabilidad.

## 3. Manifest

| Campo lógico | Semántica | Origen | Estado |
|---|---|---|---|
| manifestId | identidad interna | sistema | generado |
| masterReference | referencia documental Master | fuente | declarado |
| sourceDocumentRef | referencia al archivo | sistema | generado |
| sourceHash | huella de fuente | sistema | generado |
| originCode | origen/código documental | fuente | declarado |
| destinationCode | destino | fuente | declarado |
| receivedAt | recepción | sistema | operacional |
| version | versión del agregado | sistema | control |

Los códigos de destino deben preservarse sin reinterpretar su significado hasta cerrar la decisión normativa correspondiente.

## 4. House

| Campo | Semántica |
|---|---|
| houseId | identidad interna |
| manifestId | pertenencia al manifiesto |
| houseReference | referencia House declarada |
| sourceReference | ubicación de origen |
| declaredValues | valores fuente |
| interpretedValues | interpretación |
| validatedValues | resultado validado |
| operationalValues | valores autorizados |

## 5. PhysicalUnit

| Campo | Semántica |
|---|---|
| physicalUnitId | identidad interna |
| houseId | House asociada |
| unitReference | referencia de unidad |
| quantity | cantidad cuando aplique |
| weight | peso |
| weightUnit | unidad de peso |
| dimensions | dimensiones |
| dimensionUnit | unidad dimensional |
| custodyState | estado de custodia |

No se debe derivar una PhysicalUnit únicamente porque exista una fila Excel.

## 6. Person/Contact

| Campo | Semántica |
|---|---|
| personReference | referencia interna |
| declaredName | nombre declarado |
| validatedName | nombre validado |
| contactMethods | medios de contacto |
| identityStatus | estado de identidad |
| identityEvidence | evidencia |

La identidad debe conservar incertidumbre cuando exista.

## 7. Address

| Campo | Semántica |
|---|---|
| addressId | identidad interna |
| declaredAddress | dirección original |
| interpretedAddress | interpretación |
| normalizedAddress | normalización |
| validatedAddress | dirección validada |
| territorialReferences | referencias territoriales |
| addressStatus | estado |

## 8. Geocoding

| Campo | Semántica |
|---|---|
| geocodeId | identidad del resultado |
| addressId | dirección consultada |
| provider | proveedor |
| providerVersion | versión disponible |
| latitude | latitud |
| longitude | longitud |
| precision | precisión declarada |
| confidence | confianza si existe |
| resultStatus | estado |
| evaluatedAt | momento |

Las coordenadas nunca sustituyen la dirección declarada.

## 9. Provenance

Todo registro importado debe poder relacionarse con:
- sourceDocumentId;
- sheetName;
- rowNumber;
- columnName;
- cellAddress cuando exista;
- rawValue;
- transformationId;
- transformationVersion.

## 10. Estados de dato

El contrato debe distinguir al menos:
- DECLARED;
- INTERPRETED;
- VALIDATED;
- OPERATIONAL;
- REJECTED;
- BLOCKED;
- UNKNOWN;
- NOT_APPLICABLE.

## 11. Campos técnicos transversales

Según el agregado:
- createdAt;
- updatedAt;
- version/baseVersion;
- operationId;
- correlationId;
- actorReference;
- auditReference.

No todos son campos de negocio y no deben mezclarse indiscriminadamente con ellos.

## 12. Reglas de nombres

- identificadores internos con semántica inequívoca;
- referencias externas conservadas;
- unidades explícitas;
- nombres sin depender del encabezado Excel;
- evitar abreviaturas ambiguas;
- separar estado actual de historial.

## 13. Nulabilidad

No informado ≠ no aplicable ≠ no disponible ≠ desconocido ≠ bloqueado.

La persistencia futura debe conservar esta semántica.

## 14. Sensibilidad

Se clasificará posteriormente:
- público/operacional;
- interno;
- personal;
- sensible según normativa aplicable.

La clasificación definitiva requiere análisis jurídico y de seguridad.

## 15. Reglas de compatibilidad

Los campos del dominio no deben cambiar de significado para acomodar una variante del Excel.

La adaptación se realiza mediante:
**perfil → mapping → representación canónica**.

## 16. Criterios de aceptación

- FC-001 cada dato fuente conserva provenance.
- FC-002 House y PhysicalUnit permanecen separados.
- FC-003 referencias externas no se pierden.
- FC-004 unidades son explícitas.
- FC-005 dirección declarada se conserva.
- FC-006 coordenadas mantienen referencia de geocodificación.
- FC-007 estados de dato no se reducen a null/empty.
- FC-008 cambios de Excel se absorben mediante mapping.
- FC-009 identificadores internos no sustituyen silenciosamente referencias externas.
- FC-010 historial y estado actual son distinguibles.

## 17. Pendientes
El catálogo definitivo dependerá de:
- estructura real y versiones de manifiestos Excel;
- jerarquía documental;
- campos legalmente requeridos;
- catálogos territoriales;
- decisiones D09/D12 y restantes;
- política de privacidad;
- modelo económico/fiscal.

**Estado: En validación.**
