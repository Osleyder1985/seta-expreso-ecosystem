# Análisis del manifiesto real de referencia — 649-31382945

**Fuente:** 649-31382945.xlsx  
**Hoja:** Manifiesto  
**Propósito:** confrontar el modelo conceptual de Paquetería con una estructura real de manifiesto.

## 1. Evidencia observada

El archivo contiene una cabecera documental con:

- agente transitario;
- fecha;
- país de origen;
- consignatario;
- cantidad de House;
- total de sacas;
- Master AWB;
- total de personas.

La tabla operacional contiene, por House:

- código House;
- naturaleza y cantidad;
- peso en kg;
- cantidad de bultos;
- nombre y apellidos del remitente;
- Passport;
- nombre y apellidos del destinatario;
- número de carnet de identidad;
- teléfono del destinatario;
- dirección del destinatario;
- identificación de cobrado/no cobrado en origen;
- unidad de destino.

## 2. Observaciones estructurales

El manifiesto de referencia declara:

- Master AWB: 649-31382945;
- cantidad de House: 127;
- total de sacas: 127;
- total de personas: 83;
- peso total indicado: 2123.23 kg.

Las filas de detalle muestran un House por fila y, en el archivo analizado, Bultos (Cant.) = 1 en las filas de detalle observadas.

Esto proporciona evidencia suficiente para afirmar que **en este archivo concreto** el House funciona operacionalmente como la unidad de registro de una expedición/bulto, pero no basta para establecer como regla universal que House = Package = unidad física en todos los manifiestos.

## 3. Nueva interpretación del modelo

### 3.1 Master AWB

Debe conservarse como identificador documental de la expedición superior.

No debe asumirse todavía que Master AWB sea sinónimo de Manifest.

Propuesta:

Manifest
→ referencia documental Master AWB
→ House entries

La cardinalidad exacta entre manifiesto, Master AWB y otros documentos de transporte continúa pendiente de validación con más archivos.

### 3.2 House

El archivo contiene un código House por registro.

Por tanto, el House debe modelarse como un identificador documental/operativo propio, no simplemente como un campo dentro de Package.

El modelo deberá permitir:

- House único dentro del ámbito correspondiente;
- relación con documento superior;
- remitente;
- destinatario;
- contenido declarado;
- peso;
- cantidad de bultos declarada;
- estado documental/operativo;
- dirección de destino;
- unidad de destino.

### 3.3 Bulto / unidad física

Bultos (Cant.) es una columna independiente.

Esto es importante:

**House no debe quedar definitivamente definido como unidad física.**

Un House puede declarar una cantidad de bultos distinta de 1 en otros manifiestos. El modelo debe poder representar:

House 1 → N unidades físicas

sin obligar a que cada House tenga exactamente una unidad.

### 3.4 Personas

El archivo diferencia explícitamente:

- remitente;
- destinatario.

Por tanto, Persona debe ser un concepto independiente de Cliente.

El rol de una persona en la operación debe modelarse mediante relaciones/roles.

No debe asumirse que todo remitente o destinatario sea necesariamente un Customer.

### 3.5 Identificación

El manifiesto contiene Passport del remitente y CI del destinatario.

El modelo de dominio debe conservar:

- tipo de identificación;
- valor original;
- rol de la persona;
- origen del dato.

No debe convertir automáticamente esos valores en una identidad interna del sistema.

### 3.6 Teléfono

El destinatario puede tener uno o más teléfonos representados en una misma celda, separados por /.

Por tanto, el dominio no debería modelar el teléfono como un único string indivisible si el objetivo es explotación operacional.

La importación deberá conservar primero el valor original y posteriormente normalizar teléfonos a una colección cuando proceda.

### 3.7 Dirección

La dirección aparece como texto libre y contiene información heterogénea:

- calle;
- número;
- entrecalles;
- reparto;
- municipio;
- provincia;
- zona operacional.

Por tanto, el proceso de importación debe separar:

OriginalAddress
→ ParsedAddress
→ NormalizedAddress
→ GeocodedAddress

sin destruir el texto original.

### 3.8 Unidad de destino

El campo Unidad de destino contiene códigos como CMW, CFG, HOG, SCU, HAV, VRA, MAY, PDR y SNU.

Estos códigos deben conservarse como **dato externo de origen**.

No deben convertirse todavía en provincias, municipios, rutas o centros internos hasta disponer de un catálogo oficial/operativo que determine su significado.

## 4. Decisiones D02–D09

### D02 — House/Bulto/Package

**Estado: parcialmente resuelto.**

Para este manifiesto:

House = registro documental de expedición/bulto declarado.

Pero House ≠ necesariamente unidad física.

El modelo debe permitir múltiples unidades físicas por House.

### D03 — TransportDocument → House

**Estado: provisional.**

El archivo evidencia:

Master AWB → múltiples House

Para este archivo:

1 Master AWB → 127 House

No se generaliza todavía a todos los documentos.

### D04 — House → unidades físicas

**Estado: abierto pero estructuralmente definido.**

El campo Bultos (Cant.) demuestra que debe existir una relación potencial:

House 1 → N PhysicalUnit

aunque en este archivo los registros observados tienen cantidad 1.

### D05 — Personas

**Estado: suficientemente respaldado para diseño conceptual.**

Debe existir:

Person
+
Role = Sender | Recipient

La relación no debe depender de Customer.

### D06 — Cliente

**Estado: abierto.**

Este manifiesto no demuestra que remitente/destinatario sean clientes en el sentido comercial/contractual de SETA.

### D07 — reutilización de Address

**Estado: abierto.**

El archivo demuestra que una misma dirección textual aparece asociada a varios House.

Esto justifica técnicamente una estrategia de reutilización/canonicalización de direcciones, pero no permite decidir todavía si la dirección debe ser una entidad compartida o un snapshot por expedición.

Recomendación de diseño provisional:

- conservar originalAddress por registro;
- resolver una normalizedAddress;
- permitir vinculación posterior a una dirección canónica.

### D08 — múltiples entregas por parada

**Estado: respaldado como necesidad operativa.**

Varias filas comparten exactamente la misma dirección de destinatario.

Por tanto:

DeliveryPoint
→ múltiples House

y:

Stop
→ un DeliveryPoint

es una relación viable.

### D09 — múltiples House en una entrega

**Estado: abierto.**

El manifiesto evidencia múltiples House para una misma dirección, pero no demuestra todavía si SETA debe considerar una única Delivery con múltiples House o entregas separadas.

Este punto debe resolverse con el procedimiento real de entrega.

### D12 — cierre exitoso

**Estado: abierto.**

El manifiesto no contiene evidencia suficiente para definir el conjunto mínimo de POD.

Debe definirse a partir del procedimiento operativo real.

## 5. Reglas de importación derivadas

### I01 — Importación en dos niveles

El archivo debe procesarse como:

ManifestHeader
+
ManifestRows

No como una tabla plana sin contexto.

### I02 — Preservación de origen

Debe conservarse:

- archivo de origen;
- hash del archivo;
- hoja;
- fila original;
- columna original;
- valor original.

Esto permite reconstrucción determinista y auditoría.

### I03 — Validación de totales

El importador debe verificar:

cantidad de House declarada == cantidad de filas House

cuando la estructura del archivo permita esa comparación.

También debe verificar:

peso total declarado == suma de pesos

cuando el manifiesto proporcione ambos valores.

Una diferencia no debe provocar pérdida de datos; debe generar una discrepancia de importación.

### I04 — Identificadores

Los valores Master AWB y House deben conservarse exactamente como fueron recibidos, además de una representación normalizada para búsqueda cuando corresponda.

### I05 — Personas

No fusionar personas únicamente por nombre.

La identidad debe considerar los identificadores disponibles y reglas explícitas de matching.

### I06 — Direcciones

No geocodificar directamente el texto sin pasar por validación/normalización.

El proceso debe ser:

Original → Parse → Normalize → Validate → Geocode → Review

y debe conservar resultados anteriores.

### I07 — Errores parciales

Una fila inválida no debe destruir automáticamente las filas válidas.

El proceso de importación debe poder producir:

- aceptadas;
- aceptadas con advertencias;
- rechazadas;
- discrepancias de manifiesto.

## 6. Casos de prueba que ahora podemos definir

El manifiesto real permite crear fixtures para:

1. un Master AWB con múltiples House;
2. varios House para el mismo destinatario;
3. varios House para la misma dirección;
4. varios destinatarios en una misma dirección;
5. múltiples teléfonos en una celda;
6. remitente con Passport;
7. destinatario con CI;
8. dirección con municipio/provincia/zona;
9. peso decimal;
10. contenido descriptivo libre;
11. código de unidad de destino;
12. discrepancia entre totales y filas;
13. House con cantidad de bultos > 1 en un fixture sintético;
14. House sin destinatario completo;
15. dirección no geocodificable.

## 7. Consecuencia arquitectónica

La importación no debe ser un simple:

Excel → INSERT

Debe ser un pipeline:

Archivo
→ Ingesta
→ Detección de estructura
→ Extracción
→ Validación sintáctica
→ Validación semántica
→ Normalización
→ Conciliación
→ Persistencia
→ Geocodificación
→ Resultado de importación
→ Auditoría

La geocodificación no debe bloquear necesariamente la persistencia del manifiesto si el dato documental ya es válido. Debe poder operar como etapa posterior y trazable.

## 8. Decisión de diseño importante

A partir de este manifiesto, queda descartado como diseño definitivo:

Manifest → Package → Address

como único modelo.

El modelo debe representar al menos:

Manifest
→ TransportDocument/MasterAWB
→ House
→ PhysicalUnit[]

y además:

House
→ Sender
→ Recipient
→ OriginalAddress
→ NormalizedAddress
→ Geolocation[]

La forma exacta de los agregados todavía queda pendiente.

## 9. Próximo paso

El siguiente artefacto debe ser:

**paqueteria-domain-model-v0.2.0.md**

Debe consolidar:

- entidades;
- value objects;
- relaciones;
- cardinalidades;
- agregados candidatos;
- invariantes;
- comandos;
- eventos de dominio;
- decisiones D01–D12;
- trazabilidad con el manifiesto real.

Después de ese documento podremos diseñar el modelo lógico PostgreSQL con mucha mayor seguridad.
