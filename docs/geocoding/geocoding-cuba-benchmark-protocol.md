# Protocolo de benchmark de geocodificación para Cuba

**Issue:** #157  
**Estado:** Protocolo inicial reproducible  
**Fecha:** 2026-09-26

## 1. Objetivo

Evaluar proveedores de geocodificación para las direcciones utilizadas por SETA EXPRESO, con énfasis en Cuba, sin seleccionar un proveedor únicamente por cuota, latencia o código HTTP.

El benchmark debe medir si el resultado geográfico es operacionalmente utilizable para provincia, municipio, asentamiento/localidad, calle o vía, inmueble/dirección cuando exista evidencia suficiente, y coordenadas para representación cartográfica y planificación de rutas.

## 2. Principio fundamental

Un resultado HTTP 200 no equivale a una dirección correctamente geocodificada.

La evaluación separará disponibilidad técnica, resolución geográfica, corrección territorial, precisión espacial, confianza, coste/límites y facilidad de integración/sustitución.

## 3. Proveedores iniciales

- Geoapify
- LocationIQ
- Nominatim público
- Nominatim/Photon autogestionado como alternativa de arquitectura, no como servicio público equivalente.

Los proveedores se integran mediante el puerto GeocodingProvider; ningún proveedor queda acoplado al dominio.

## 4. Dataset de prueba

El dataset será anonimizado y no contendrá nombres, teléfonos u otros datos personales.

Debe contener como mínimo:

### Cobertura territorial

- Camagüey: ciudad de Camagüey, Florida, Nuevitas, Vertientes y localidades menores/rurales.
- La Habana: varias municipalidades y casos relacionados con la particularidad territorial de La Habana.
- Al menos otras 3 provincias.
- Casos urbanos y rurales.

### Tipología de dirección

- dirección completa;
- dirección sin número;
- dirección con calle + localidad;
- dirección con municipio + provincia;
- localidad + referencia;
- intersecciones;
- carretera/carretera nacional;
- km;
- reparto/barrio;
- referencias locales;
- abreviaturas;
- ausencia de tildes;
- errores ortográficos;
- variantes de nombres;
- nombres históricos cuando sean relevantes;
- direcciones duplicadas;
- varias entregas en la misma dirección.

### Casos de control

El conjunto deberá contener direcciones cuya localización de referencia pueda verificarse independientemente.

Para los casos con coordenadas de referencia se registrará latitude/longitude, fuente, fecha y precisión esperada.

## 5. Modos de consulta

Cuando el proveedor lo permita se evaluarán dos formas: free-form, enviando la dirección completa como texto; y structured, separando los componentes disponibles. No se debe asumir que structured siempre será superior.

## 6. Métricas

### 6.1 Disponibilidad

- HTTP success rate
- HTTP error rate
- 429 rate
- timeout rate
- otros errores de proveedor

### 6.2 Resolución

- no_result
- country
- province/state
- municipality/county
- settlement/city
- street
- building/house

### 6.3 Corrección territorial

Para cada resultado: provincia correcta, municipio correcto, asentamiento correcto cuando exista referencia y país correcto.

### 6.4 Precisión espacial

Cuando exista coordenada de referencia se calculará la distancia Haversine en metros. Se reportarán media, mediana, p90, p95 y porcentaje dentro de 25 m, 50 m, 100 m, 250 m y 1 km.

Los umbrales se reportan descriptivamente; no se convertirán automáticamente en aceptación de una dirección.

### 6.5 Confianza

Registrar, cuando el proveedor lo entregue: confidence, confidence_city_level, confidence_street_level, confidence_building_level, match_type y result_type.

No se deben mezclar métricas propietarias de distintos proveedores como si fueran una escala común.

### 6.6 Rendimiento

- p50 latency
- p95 latency
- tiempo total
- throughput efectivo
- requests/minuto
- requests consumidas

### 6.7 Normalización

Evaluar si el resultado devuelve nombre normalizado, calle, número, localidad, municipio, provincia, país, código postal y place_id u otro identificador estable.

## 7. Validación SETA

El proveedor únicamente propone una resolución.

SETA deberá validar el resultado contra su catálogo territorial versionado:

provincia → municipio → asentamiento → variantes

Un resultado será ACCEPTED si existe evidencia suficiente y coherencia territorial; REVIEW si es plausible pero insuficiente para automatización; REJECTED si es incorrecto, contradictorio o insuficiente.

La decisión no dependerá exclusivamente de la confianza declarada por el proveedor.

## 8. Falsos positivos

Debe medirse explícitamente el caso en que el proveedor devuelve coordenadas válidas pero corresponden a otra provincia, municipio, localidad o calle. Este caso tiene mayor relevancia operacional que un no_result porque puede producir una ruta de entrega incorrecta.

## 9. Cache

Cada consulta deberá poder conservar hash de entrada normalizada, proveedor, versión del adaptador, parámetros relevantes, respuesta original, resultado interpretado, timestamp, estado de validación y versión del catálogo territorial.

La cache debe impedir solicitudes innecesarias y permitir auditoría/reproducibilidad.

## 10. Estrategia de ejecución

1. usar exactamente el mismo dataset;
2. ejecutar los mismos casos para cada proveedor;
3. mantener iguales los modos de consulta comparables;
4. registrar fecha/hora;
5. registrar versión del adaptador;
6. registrar límites/rate-limit observados;
7. no repetir solicitudes innecesariamente cuando la política del proveedor lo desaconseje;
8. separar resultados de proveedor de resultados del normalizador SETA;
9. conservar los JSON crudos cuando las condiciones de licencia lo permitan;
10. publicar únicamente datos anonimizados.

## 11. Decisión

La selección del proveedor se realizará después del benchmark.

No se define ganador por mayor cuota, menor latencia, mayor número de resultados o menor precio.

La decisión deberá considerar conjuntamente exactitud territorial, precisión espacial, tasa de resultados utilizables, falsos positivos, estabilidad, límites, licenciamiento/atribución, coste y capacidad de sustitución.

## 12. Criterio de arquitectura

El resultado del benchmark puede cambiar la configuración de infraestructura o el proveedor inicial, pero no debe cambiar el dominio de SETA.

El contrato estable será GeocodingProvider, con adaptadores independientes por proveedor.

## 13. Fuentes territoriales

La referencia administrativa primaria será ONEI.

La DPA y el Nomenclador de Asentamientos Humanos se mantendrán como datasets distintos y versionados.

El Nomenclador Censo 2012 / ONEI 2017 se tratará como baseline histórico mientras no se recupere una edición nacional posterior verificable.

## 14. Entregables

- dataset anonimizado;
- esquema/versionado del dataset;
- adaptador común;
- runner reproducible;
- resultados JSON;
- resultados CSV;
- informe comparativo;
- decisión técnica;
- ADR si la decisión modifica arquitectura;
- actualización del baseline tecnológico si procede.

## 15. Regla de cierre

No se seleccionará proveedor definitivo hasta disponer de evidencia suficiente sobre casos cubanos representativos.

Si ningún proveedor externo alcanza calidad operacional suficiente, se evaluará una estrategia híbrida:

normalización SETA + catálogo territorial ONEI + proveedor externo + fallback/autogestionado.

## 16. Estrategia de infraestructura controlable

La evaluación distinguirá entre API pública de terceros, servicio de terceros con cuota gratuita y geocodificador autogestionado. Una API pública puede servir para PoC, pero sus límites y política de uso no están bajo control de SETA. Un servicio gratuito puede ser candidato operativo solo si la evidencia cubana demuestra calidad suficiente y sus condiciones permiten el uso previsto. Un geocodificador autogestionado permite controlar endpoint, capacidad, caché y política de ejecución; su calidad seguirá dependiendo de los datos OSM importados y de su cobertura.

Nominatim autogestionado es técnicamente viable con PostgreSQL/PostGIS y osm2pgsql. La documentación oficial indica PostgreSQL 13+, PostGIS 3.0+ y osm2pgsql como componentes de ejecución. La política restrictiva del servidor público de Nominatim no se aplica a una instancia propia.

Para Cuba existe además un extracto OSM específico de Geofabrik en formato PBF, de aproximadamente 58 MB en la edición consultada, con datos hasta septiembre de 2026. Esto demuestra viabilidad de datos e infraestructura para estudiar una instancia autogestionada de alcance nacional sin descargar el planeta completo. No demuestra por sí mismo la calidad de geocodificación de las direcciones cubanas.

El benchmark mantendrá separadas estas preguntas: qué implementación resuelve mejor las direcciones cubanas del corpus, y qué opción puede operar SETA de forma sostenible y sustituible sin depender de un servicio externo. La segunda requerirá una PoC autogestionada si las alternativas externas no proporcionan evidencia suficiente.
