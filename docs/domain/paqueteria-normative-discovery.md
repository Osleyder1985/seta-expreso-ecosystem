# Descubrimiento normativo y operativo del Servicio de Paquetería

**Versión:** 0.1.0  
**Estado:** Evidencia inicial para diseño de dominio  
**Issue:** #38  
**Alcance:** Servicio de Paquetería del Ecosistema SETA EXPRESO SURL

## 1. Propósito

Este documento establece la primera base de evidencia normativa y operativa para modelar el Servicio de Paquetería.

Regla de ingeniería:

**fuente oficial → evidencia → regla de proceso → requisito → modelo de dominio → implementación**

No se incorporan al software como reglas obligatorias los conceptos, estados, documentos o relaciones que no estén respaldados por una fuente aplicable.

## 2. Fuentes oficiales rectoras

1. Aduana General de la República de Cuba — https://www.aduana.gob.cu/
2. AeroVaradero — https://www.aerovaradero.com.cu/
3. Gaceta Oficial de la República de Cuba — https://www.gacetaoficial.gob.cu/es

Jerarquía:

- Gaceta Oficial: fuente primaria para el texto publicado de normas jurídicas.
- Aduana General de la República: fuente institucional principal para normativa y procedimientos aduaneros.
- AeroVaradero: fuente operacional para los procesos de carga que correspondan a su ámbito.
- Una práctica comercial privada no se convierte por sí sola en regla del dominio.

## 3. Evidencia normativa prioritaria identificada

### 3.1 Decreto-Ley 108 «De Aduanas»

La Gaceta Oficial No. 7 Ordinaria de 2026 publicó el Decreto-Ley 108 «De Aduanas», GOC-2026-107-O7.

Hallazgos relevantes:

- Regula la organización y funcionamiento de la Aduana respecto de regímenes aduaneros, desaduanamiento, mercancías, envíos, viajeros y equipajes.
- Reconoce los «envíos» y los «envíos urgentes y de socorro» dentro de los regímenes especiales.
- Permite requerir información en formato digital, adelantada o en tiempo real para determinados flujos.
- Establece responsabilidades de operadores postales u otros operadores autorizados para determinadas operaciones de envíos, incluyendo traslado, consolidación, desconsolidación, almacenamiento, manipulación, custodia, formalización ante Aduana, representación, distribución y entrega.
- Mantiene la vigencia de disposiciones dictadas al amparo del régimen anterior mientras no contradigan el nuevo marco.
- Deroga expresamente el Decreto-Ley 162 y otras normas indicadas en sus disposiciones finales.

**Impacto:** el modelo no debe seguir tratando el Decreto-Ley 162/1996 como marco normativo principal vigente. Debe utilizarse el Decreto-Ley 108 y sus disposiciones complementarias actuales.

### 3.2 Decreto 134 «Reglamento del Decreto-Ley 108 de Aduanas»

Publicado como GOC-2026-108-O7.

Hallazgos:

- Desarrolla los procedimientos para aplicar el Decreto-Ley 108.
- Regula, entre otros aspectos, tránsito, depósitos temporales, envíos urgentes y de socorro y formalización de operaciones.
- El capítulo XXIV regula el régimen aduanero especial de los envíos urgentes y de socorro.

**Impacto:** el flujo de Paquetería debe distinguir las etapas bajo control del operador de las actuaciones que corresponden a la autoridad aduanera.

### 3.3 Resolución 529/2025 — control aduanero a las mercancías

Publicada como GOC-2026-109-O7.

Establece normas para el control aduanero antes, durante y después del desaduanamiento. También establece obligaciones de conservación documental para sujetos sometidos al control aduanero, incluyendo declaraciones y documentos justificativos.

**Impacto preliminar:** el sistema necesita trazabilidad documental y retención histórica suficiente. El plazo legal concreto debe validarse contra el ámbito exacto de SETA EXPRESO y los documentos que efectivamente esté obligado a conservar.

### 3.4 Resolución 531/2025 — depósito temporal de mercancías

Publicada como GOC-2026-111-O7.

Regula habilitación, operación, permanencia y movimientos en depósitos temporales. Su anexo establece datos mínimos para controlar entradas, movimientos y salidas, incluyendo número de manifiesto y número de conocimiento de embarque marítimo o aéreo.

**Impacto:** si SETA EXPRESO opera o interactúa con un depósito temporal comprendido por esta regulación, el modelo debe poder relacionar mercancías con documentos de transporte y movimientos. No se asumirá que SETA EXPRESO sea operador de depósito temporal sin evidencia específica.

### 3.5 Resolución 532/2025 — aplicación de regímenes aduaneros

Publicada como GOC-2026-112-O7.

Establece obligaciones, requisitos y formalidades para la autorización y aplicación de regímenes aduaneros.

**Impacto:** el sistema debe separar el estado operativo interno de la situación/régimen aduanero. No debe existir una única enumeración que mezcle estados internos con estados jurídicos aduaneros.

### 3.6 Resolución 533/2025 — desaduanamiento de mercancías

Publicada como GOC-2026-113-O7.

Regula las normas para el desaduanamiento de mercancías.

**Impacto:** la liberación/desaduanamiento debe representarse como un hito verificable y no simplemente como un cambio manual de estado.

### 3.7 Resolución 534/2025 — abandono

Publicada como GOC-2026-114-O7.

Regula la declaración o aceptación del abandono de mercancías, bienes y valores a favor del Estado.

**Impacto:** abandono debe tratarse como resultado jurídico/operativo diferenciado de una incidencia ordinaria, devolución o entrega fallida.

## 4. Flujo de proceso respaldado preliminarmente

### Capa A — cadena logística

**Origen / remitente** → transporte internacional → llegada a Cuba → recepción/manifestación → control y formalización aduanera → desaduanamiento/liberación según corresponda → entrega al operador que corresponda → almacenamiento/clasificación → distribución → transporte nacional → intento de entrega → entrega o resultado alternativo → cierre.

### Capa B — control aduanero

**Presentación de información/documentos** → control aduanero → verificaciones/inspecciones cuando correspondan → formalidades → desaduanamiento → liberación o actuación posterior prevista por la normativa.

Estas capas no deben fusionarse en una única máquina de estados.

## 5. Clasificación de reglas

### 🟢 Legal / regulatoria
Obligaciones aduaneras, prohibiciones/restricciones, formalidades, abandono, conservación documental y responsabilidades establecidas por norma.

### 🔵 Procedimiento oficial
Presentación de documentos, controles, formalización, desaduanamiento y actuaciones de operadores autorizados.

### 🟡 Regla operacional externa
Procesos concretos del aeropuerto, horarios, puntos operativos, documentos o formatos exigidos por una entidad externa. Deben obtenerse de la entidad oficial correspondiente.

### 🟣 Regla de negocio SETA EXPRESO
Agrupación de entregas, tiempos objetivo, asignación de rutas, reintentos, notificaciones y prioridades.

### ⚪ Decisión de software
UUID, REST, PostgreSQL/PostGIS, agregados DDD, ORM, eventos internos y proveedor de geocodificación.

## 6. Impacto sobre D01–D12

| Decisión | Estado | Evidencia/acción |
|---|---|---|
| D01 Master AWB / Guía / House | 🟡 Abierta | Confirmar estructura documental exacta de la operación. |
| D02 House / Bulto / Package | 🟡 Abierta | No asumir equivalencia; revisar documentos reales. |
| D03 Guía → House | 🟡 Abierta | Requiere documento de transporte real y reglas del operador/transitario. |
| D04 House → unidades físicas | 🟡 Abierta | Requiere datos reales y terminología operacional. |
| D05 Persona y roles | 🟡 Abierta | Modelar la operación concreta de remitente/destinatario. |
| D06 Cliente | 🟡 Abierta | Es principalmente una decisión comercial interna. |
| D07 Reutilización de dirección | 🟡 Abierta | Validar con casos reales. |
| D08 Parada | 🟣 Propuesta interna | No es categoría aduanera; puede definirse para distribución. |
| D09 Entrega múltiple | 🟣 Abierta | Definir unidad de operación de entrega. |
| D10 Intentos | 🟣 Abierta | Regla operacional interna. |
| D11 Estados | 🟡 Abierta | Separar estados documentales, aduaneros y operativos. |
| D12 Cierre de entrega | 🟣 Abierta | Regla interna condicionada por requisitos legales aplicables. |

## 7. Cambios de ingeniería derivados

1. No modelar el proceso aduanero como si fuera propiedad de SETA EXPRESO.
2. Separar explícitamente estado aduanero/documental, logístico, distribución y entrega.
3. Mantener trazabilidad de documentos fuente y eventos relevantes.
4. Mantener historial; no sobrescribir cambios críticos.
5. Preparar el modelo para documentos digitales y metadatos de origen.
6. No crear entidades basadas exclusivamente en términos informales como «paquete».
7. No implementar restricciones aduaneras sin identificar norma aplicable y vigencia.
8. No tratar devolución, reembarque, abandono y entrega fallida como el mismo resultado.
9. Mantener frontera clara entre SETA EXPRESO y actores/sistemas externos.
10. Mantener una matriz de trazabilidad normativa para cada regla legal implementada.

## 8. Evidencia pendiente

### Aduana

Continuar revisión de:

- normativa específica sobre envíos;
- definiciones de manifiesto, conocimiento de embarque, envío, bulto y documentos asociados;
- formalización específica de envíos;
- distribución y entrega;
- reembarque/devolución;
- restricciones y requisitos especiales;
- conservación documental;
- transmisión electrónica;
- procedimientos de operadores autorizados.

### AeroVaradero

Revisar cuando el sitio oficial esté accesible:

- recepción de carga;
- documentación;
- almacenamiento;
- entrega al operador/transitario;
- identificación de bultos;
- movimientos;
- incidencias;
- puntos de control.

En esta revisión el sitio oficial no respondió correctamente; por tanto, no se incorporan reglas de AeroVaradero como hechos.

### Gaceta Oficial

Usar para verificar publicación, número/año, vigencia, derogaciones, modificaciones y disposiciones complementarias.

## 9. Regla de vigencia

El Decreto-Ley 162/1996 fue derogado expresamente por el Decreto-Ley 108.

Por tanto, cualquier documento previo del proyecto que use el Decreto-Ley 162 como fundamento normativo debe revisarse contra el marco 2026.

## 10. Próximo paso

Construir una matriz normativa y de proceso detallada con:

- fuente;
- norma/documento;
- artículo/sección;
- fecha;
- vigencia;
- actor;
- objeto afectado;
- obligación/regla;
- evento;
- documento requerido;
- estado resultante;
- impacto en dominio;
- impacto en datos;
- impacto en API;
- evidencia;
- D01–D12 relacionada.

Después:

**Proceso normativo/operativo → casos de uso → máquina de estados → agregados DDD → modelo lógico → persistencia → API.**

## 11. Fuentes

- https://www.aduana.gob.cu/
- https://www.aduana.gob.cu/documentos
- https://www.aerovaradero.com.cu/
- https://www.gacetaoficial.gob.cu/es
- https://www.gacetaoficial.gob.cu/es/busqueda-avanzada

**Nota:** para decisiones jurídicas concretas debe conservarse siempre la referencia exacta de la norma y su texto oficial vigente.
