# Contrato canónico de datos del manifiesto de Paquetería v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Relacionados:** UC-PQ-01..03, pipeline de importación, modelo de reglas

## Propósito
Define la representación lógica canónica entre fuente Excel y dominio. No congela tablas ni DTO REST.

## Principio
El contrato distingue **fuente declarada**, **interpretación**, **dato validado** y **dato operacional**. Ninguna transformación destruye el valor fuente.

## Jerarquía lógica
**Manifest** → **House** → **PhysicalUnit[]**  
**House** → **Person/Contact references**  
**House** → **DeclaredAddress / Address lifecycle**  
**Delivery** puede relacionarse con múltiples House y una House puede participar en distintos contextos de entrega, sujeto a reglas operacionales pendientes.

## Entidades canónicas

### Manifest
- manifestId
- masterReference
- sourceDocumentRef
- sourceHash
- origin
- destinationCode
- receivedAt
- status
- version

### House
- houseId
- manifestId
- houseReference
- declaredValues
- validatedValues
- operationalValues
- sourceReference
- version

### PhysicalUnit
- physicalUnitId
- houseId
- unitReference
- quantity/measurements/weight cuando estén disponibles
- sourceReference
- custody state

**House ≠ PhysicalUnit.**

### Person/Contact
- personReference
- declaredIdentity
- validatedIdentity
- contact methods
- sourceReference
- identity confidence/status

La coincidencia nominal nunca constituye por sí sola identidad confirmada.

### Address
- addressId
- declaredAddress
- interpretedAddress
- normalizedAddress
- validatedAddress
- geocoded result
- validation/geocoding references
- sourceReference

### GeocodedResult
- provider
- providerVersion cuando esté disponible
- latitude
- longitude
- precision/confidence si existe
- response/reference
- evaluatedAt
- status

La ausencia de geocodificación no elimina la dirección.

## Proveniencia obligatoria
Todo dato proveniente de fuente externa debe poder localizarse mediante:
- documento;
- hoja;
- fila;
- columna/celda cuando sea posible;
- valor original;
- transformación;
- versión de transformación.

## Semántica de valores
**Declared** = lo que afirmó la fuente.  
**Interpreted** = interpretación controlada.  
**Validated** = resultado de comprobación.  
**Operational** = valor autorizado para operación.

## Tipos lógicos
Los tipos se definirán por semántica, no por el tipo de celda Excel:
- identifier
- code
- text
- decimal
- integer
- date/time
- boolean
- measurement
- address
- reference
- evidence-reference

## Unidades
Peso y dimensiones deben almacenar unidad explícita. No se debe asumir kg/cm/etc. únicamente por el formato de la celda.

## Nulabilidad
La ausencia de dato debe distinguir:
- no informado;
- no aplicable;
- no disponible;
- no validado;
- bloqueado;
- desconocido.

No convertir ausencia en cadena vacía o cero sin regla explícita.

## Identificadores
Los identificadores externos y los internos se distinguen. El sistema no debe sustituir un identificador documental por un ID interno perdiendo el original.

## Fechas
Deben conservar:
- valor original;
- interpretación;
- zona horaria si aplica;
- precisión conocida.

## Integridad
El contrato debe impedir:
- House sin contexto de manifest cuando el dominio lo requiera;
- PhysicalUnit huérfana;
- referencias de persona no trazables;
- dirección corregida sin dirección declarada;
- coordenada sin referencia de resultado geográfico.

## Seguridad y privacidad
Los datos personales deben clasificarse posteriormente según política de privacidad y normativa aplicable. La trazabilidad no justifica exponerlos indiscriminadamente.

## Compatibilidad
Los cambios compatibles deben conservar consumidores existentes. Cambios semánticos incompatibles requieren versión nueva del contrato.

## Criterios de aceptación
- CT-001 conserva fuente original.
- CT-002 distingue House y PhysicalUnit.
- CT-003 distingue valor declarado y operacional.
- CT-004 conserva provenance.
- CT-005 distingue ausencia/no aplicable/no validado.
- CT-006 no confirma identidad por nombre.
- CT-007 una coordenada mantiene referencia del resultado geográfico.
- CT-008 unidades son explícitas.
- CT-009 identificadores externos se conservan.
- CT-010 cambios incompatibles son versionados.

## Decisiones pendientes
- jerarquía documental definitiva;
- campos oficiales del Excel;
- cardinalidades definitivas;
- catálogos territoriales;
- política fiscal/económica;
- reglas de modificación/cancelación;
- mínimo POD;
- retención y clasificación de datos personales.

## Trazabilidad
Excel → pipeline → contrato canónico → validación → conciliación → dominio operacional → API/UI futuras.

**Estado: En validación.**
