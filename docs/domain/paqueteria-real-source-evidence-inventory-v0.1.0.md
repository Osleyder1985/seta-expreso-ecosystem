# Evidencia de fuentes reales de Paquetería y operación económica — v0.1.0

**Estado:** En validación  
**Tipo:** Evidencia operacional / insumo para requisitos y diseño  
**Fecha de incorporación:** 2026-09-25

## 1. Propósito

Este documento registra evidencia real aportada por SETA EXPRESO para sustituir supuestos genéricos por observaciones sobre archivos efectivamente utilizados en la operación.

Los archivos originales contienen datos personales, identificadores, teléfonos, direcciones y otra información operacional. Por razones de privacidad y seguridad, este documento no reproduce registros personales ni datos sensibles. Se registra estructura, metadatos y observaciones de ingeniería.

Los archivos originales permanecen como fuentes de evidencia proporcionadas en el contexto del proyecto; su incorporación al repositorio como binarios no se considera necesaria para esta primera etapa.

## 2. Manifiestos reales inspeccionados

Se inspeccionaron ocho libros Excel de manifiesto:

| Master AWB | Fecha | Houses declarados | Peso total declarado (kg) | Hojas relevantes |
|---|---|---:|---:|---|
| 649-31382864 | 08/12/2025 | 63 | 2,193.36 | Manifiesto, CONSOLIDADO y hojas auxiliares |
| 649-31382875 | 17/12/2025 | 101 | 3,316.18 | Manifiesto |
| 649-31382886 | 18/12/2025 | 155 | 4,184.64 | Manifiesto |
| 649-31382890 | 08/01/2026 | 77 | 2,793.24 | Manifiesto |
| 649-31382901 | 21/01/2026 | 107 | 3,188.18 | Manifiesto |
| 649-31382912 | 28/01/2026 | 164 | 4,596.90 | Manifiesto |
| 649-31382923 | 04/02/2026 | 145 | 4,592.04 | Manifiesto, Aduana |
| 649-31382934 | 16/02/2026 | 136 | 4,596.44 | Manifiesto |

**Cobertura observada:** 948 Houses y aproximadamente 29,460.98 kg.

La variación de tamaño confirma que el sistema debe soportar manifiestos de tamaño variable y no asumir un número fijo de registros.

## 3. Estructura real del manifiesto

La hoja principal Manifiesto presenta una cabecera documental seguida por registros operacionales y una fila de totales.

Campos observados:

1. House
2. Naturaleza y Cantidad
3. Peso (Kg)
4. Bultos (Cant.)
5. Nombre y Apellidos del REMITENTE
6. Passport
7. Nombre y Apellidos del DESTINATARIO
8. No. de Carnet de Identidad
9. Teléfono del DESTINATARIO
10. Dirección del DESTINATARIO
11. Identificación si el House está COBRADO o NO COBRADO en origen
12. Unidad de destino

Metadatos documentales observados:
- agente transitario;
- fecha;
- país;
- consignatario;
- cantidad de House;
- total de sacas;
- Master AWB;
- total de personas.

Esto confirma que el diseño preliminar de campos canónicos debe mantenerse separado de los nombres físicos del Excel.

## 4. Variaciones reales relevantes

### 4.1 Identificador House

Se observan al menos dos familias de formato:
- identificadores con prefijo CACC-...;
- identificadores numéricos.

Por tanto, el identificador no debe modelarse como entero obligatorio. Debe tratarse como identificador externo textual, preservando exactamente el valor fuente.

### 4.2 Bultos

Aunque la mayoría de registros presentan un bulto, existen registros con cantidades superiores a uno. En el manifiesto 649-31382875 se observa un registro con 7 bultos.

Por tanto: **House ≠ PhysicalUnit** y la cardinalidad House → PhysicalUnit debe permanecer 1:N.

### 4.3 Direcciones

Las direcciones contienen texto libre y estructuras heterogéneas: calle, número, entrecalles, reparto, municipio, provincia, zonas operativas y referencias adicionales.

Esto confirma que la dirección debe conservar valor declarado original, interpretación, normalización, validación y resultado geográfico. No se debe reemplazar destructivamente el texto original.

### 4.4 Teléfonos

Se observan teléfonos múltiples en una misma celda, separados por /. Por tanto, el modelo canónico debe permitir una colección de teléfonos/contactos y no asumir un único número.

### 4.5 Personas

Se observan múltiples Houses asociados al mismo remitente o destinatario y múltiples paquetes asociados a una misma dirección.

Esto respalda la separación entre Person/Contact, House, PhysicalUnit y Address. No debe crearse automáticamente una persona nueva por cada fila sin aplicar una estrategia explícita de identidad.

### 4.6 Unidades de destino

Se observan códigos operativos como ART, CMW, CFG, HOG, SCU, HAV, VRA, PDR, SNU y MAY. Deben conservarse como códigos fuente/operacionales sin reinterpretarlos durante la importación.

## 5. Hoja Aduana

El manifiesto 649-31382923 contiene una hoja adicional denominada Aduana.

La estructura observada incluye HOUSE, GUIA, PAGAR, MERCANCIA, PESO, BULTOS, REMITENTE, PASSPORT, DESTINATARIO, CI, TELEFONO, TELEF.1, TELEF.2, DIRECCION, COBRADO, PROV., MUNICIPIO, NOTAS, LATITUD y LONGITUD.

También existen fórmulas para separar teléfonos y valores de coordenadas que pueden resultar #N/A.

Esto aporta evidencia directa de que el proceso real ya contiene una fase de enriquecimiento geográfico y una separación operacional relacionada con aduana.

No debe asumirse que la hoja Aduana representa una autoridad aduanera ni que todos sus campos tienen autoridad jurídica; su semántica debe verificarse con el proceso operativo.

## 6. Hoja CONSOLIDADO

El manifiesto 649-31382864 contiene una hoja CONSOLIDADO con una estructura más amplia.

Campos observados incluyen GUIA, HOUSE, MERCANCIA, PESO, BULTOS, PAGAR, REMITENTE, PASSPORT, CI, CLIENTE, TELEFONO, TELEFONO 1, TELEFONO 2, DIRECCION, COBRADO, MUNICIPIO, PROVINCIA, LATITUD, LONGITUD y ESTADO.

La hoja contiene fórmulas para generar identificadores, realizar búsquedas de coordenadas y derivar estado.

Esto constituye evidencia de que existen artefactos derivados/consolidados además del manifiesto fuente.

## 7. Evidencia de geolocalización

Los archivos aportados confirman que existen registros con latitud, longitud, resultados de búsqueda y valores no resueltos (#N/A).

Por tanto, la decisión arquitectónica previamente adoptada —separar validación de dirección y geocodificación— queda reforzada por evidencia real.

Debe conservarse el resultado de geocodificación junto con su proveedor, versión y fecha cuando se implemente el sistema.

## 8. Registro de ingresos y gastos

También se aportó REGISTRO DE INGRESOS Y GASTOS PAQUETERIA.xlsx.

El libro contiene 18 hojas:

- REGISTRO DIARIO
- ESTADO DE CUENTAS
- CUADRE
- Hoja3
- YENMA
- YENMA KG
- CONDOR SURL
- OTROS
- Hoja2
- YANAY
- COMBUSTIBLE
- PRECIOS
- VARIANTE
- CUENTAS
- CONFIG
- KMS
- MUNICIPIOS
- CAJA FUERTE

La estructura evidencia que la operación económica está actualmente distribuida entre varias hojas especializadas y fórmulas.

## 9. Capacidades operacionales adicionales evidenciadas

El libro económico contiene evidencia de procesos que deberán integrarse progresivamente al ecosistema:

- registro diario;
- estado de cuentas;
- cuadre;
- ingresos y gastos por terceros/servicios;
- combustible;
- precios;
- variantes de cálculo;
- catálogo de cuentas;
- configuración;
- matriz de kilómetros;
- costos por municipio;
- caja fuerte;
- costos de viaje;
- combustible y consumo;
- salarios/viáticos;
- utilidad;
- distribución territorial.

Esto amplía el alcance conocido del ecosistema más allá del simple flujo de paquetería.

## 10. Evidencia de planificación económica de rutas

Las hojas PRECIOS, VARIANTE, KMS y MUNICIPIOS contienen fórmulas y datos relacionados con origen/destino, kilómetros planificados y reales, desviaciones, litros, importe de combustible, gastos diarios, dietas, salarios, hospedaje, costo total, cantidad de bultos, costo por bulto, utilidad y costos municipales.

Esto confirma que el futuro módulo de planificación de rutas debe considerar simultáneamente variables operacionales y económicas.

No se debe copiar literalmente la hoja Excel como modelo de dominio. La hoja es evidencia de un proceso actual y deberá transformarse a conceptos y reglas explícitos.

## 11. Nuevos hallazgos que modifican la prioridad

1. El importador debe soportar variaciones estructurales entre archivos.
2. El House debe ser un identificador externo textual.
3. House y PhysicalUnit deben permanecer separados.
4. Una dirección puede agrupar múltiples Houses.
5. Una persona puede aparecer en múltiples Houses.
6. Deben soportarse múltiples teléfonos.
7. Las coordenadas pueden estar ausentes o ser inválidas.
8. Existen documentos/hojas derivados además del manifiesto fuente.
9. Existe información económica suficientemente rica para requerir un futuro bounded context o módulo financiero/operacional separado.
10. La planificación de rutas está acoplada actualmente a cálculos de costos, combustible y utilidad.
11. Los Excel contienen fórmulas y referencias cruzadas; la importación debe distinguir valores fuente de valores derivados.
12. La estrategia de mapping profile definida en PR #138 queda validada como necesidad real.

## 12. Implicación para el diseño

La prioridad inmediata pasa a ser:

**fuente Excel → snapshot preservado → inspección estructural → mapping profile → modelo intermedio → validación → conciliación → modelo canónico → persistencia operacional**

y no:

**Excel → tabla de base de datos**

La segunda estrategia perdería trazabilidad y dificultaría explicar cómo se obtuvo cada valor.

## 13. Privacidad

Los archivos contienen datos personales y operacionales sensibles. El repositorio de código no debe incorporar estos datos sin una política explícita de tratamiento, minimización, anonimización y acceso.

Para pruebas automatizadas se deben generar fixtures sintéticos o anonimizados conservando las características estructurales relevantes.

## 14. Próximas acciones derivadas

1. Crear fixtures sintéticos basados en las variaciones observadas.
2. Extender el catálogo canónico con teléfonos múltiples y campos derivados.
3. Añadir reglas para House textual y PhysicalUnit múltiple.
4. Modelar documentos/hojas derivadas como fuentes relacionadas, no como sustitutos del manifiesto.
5. Definir provenance para fórmulas y valores calculados.
6. Separar explícitamente datos operacionales de datos económico-financieros.
7. Diseñar el futuro módulo de costos/rutas usando la evidencia de PRECIOS, VARIANTE, KMS y MUNICIPIOS.
8. Mantener las hojas reales como evidencia de negocio y no como modelo físico de base de datos.

## 15. Relación con artefactos existentes

Esta evidencia alimenta directamente:

- docs/domain/paqueteria-requirements-traceability-matrix-v0.1.0.md
- docs/domain/paqueteria-canonical-data-contract-v0.1.0.md
- docs/domain/paqueteria-canonical-field-catalog-v0.1.0.md
- docs/domain/paqueteria-mapping-profile-strategy-v0.1.0.md
- docs/domain/paqueteria-import-pipeline-design-v0.1.0.md
- docs/domain/paqueteria-import-state-machine-v0.1.0.md
- docs/domain/paqueteria-import-result-contracts-v0.1.0.md

**Conclusión:** la documentación anterior del proyecto no debe continuar tratándose como un conjunto de supuestos. Con estos archivos ya disponemos de una muestra real y suficientemente diversa para comenzar a validar el diseño del importador contra la operación efectiva de SETA EXPRESO.