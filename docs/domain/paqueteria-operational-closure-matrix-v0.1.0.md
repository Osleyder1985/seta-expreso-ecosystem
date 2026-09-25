# Matriz de cierre operativo de Paquetería B-01…B-06

**Versión:** 0.1.0  
**Fecha:** 2026-09-24  
**Issue:** #44  
**Estado:** En validación

## Propósito

Establecer la puerta de control para cerrar los seis bloqueadores operativos identificados en ADR-001 antes del modelo lógico persistente de PostgreSQL/PostGIS.

Un bloqueador solo puede pasar a CERRADO cuando existe: fuente o procedimiento identificable; evidencia verificable; actor; condición; efecto operativo; regla explícita; prueba de aceptación; impacto de dominio; y decisión técnica justificada.

## Fuentes rectoras

1. Aduana General de la República — normativa y procedimientos aduaneros.
2. Gaceta Oficial de la República de Cuba — fuente primaria de publicación normativa.
3. AeroVaradero — operación aeroportuaria/carga cuando sea verificable.
4. Procedimientos/documentos operativos de SETA EXPRESO.
5. Evidencia real de manifiestos y operaciones.
6. Fuentes secundarias solo como apoyo.

La búsqueda oficial realizada el 2026-09-24 no produjo resultados indexados suficientes para cerrar por sí sola los seis bloqueadores. Por tanto, esta matriz no convierte hipótesis en reglas legales.

## Matriz maestra

| ID | Bloqueador | Estado | Evidencia disponible | Decisión actual | Evidencia faltante |
|---|---|---|---|---|---|
| B-01 | House / guía hija | PARCIAL | Manifiesto 649-31382945: Master AWB con múltiples House | Separar TransportDocument/Master AWB, House y PhysicalUnit | Confirmación de si House = guía hija |
| B-02 | Agrupación de entregas | ABIERTO | Varias House pueden compartir dirección/punto | Soportar Delivery ↔ House N:M sin imponer agrupación | Procedimiento que determine cuándo se agrupan |
| B-03 | POD mínimo | ABIERTO | El modelo permite evidencia; manifiesto no define mínimo | No imponer firma/foto/ID/GPS/OTP como requisito legal | Procedimiento de entrega y/o norma aplicable |
| B-04 | Unidad de destino | ABIERTO | Códigos CMW, CFG, HOG, SCU, HAV, VRA, MAY, PDR, SNU | Preservar código externo sin interpretación | Catálogo oficial/operativo |
| B-05 | Liberación a distribución | ABIERTO | Recepción, custodia, aduana y distribución son dimensiones distintas | Usar evaluación explícita de elegibilidad | Procedimiento, condiciones y actor de liberación |
| B-06 | Modificación/cancelación | ABIERTO | Auditoría y trazabilidad ya son requisitos | No DELETE destructivo de hechos operativos | Reglas de quién puede modificar/cancelar y cuándo |

## B-01 — House / guía hija

El manifiesto real contiene Master AWB 649-31382945, 127 House, 127 sacas y peso total declarado de 2123,23 kg. Esto demuestra múltiples House bajo un documento superior en el archivo analizado, pero no demuestra por sí solo la equivalencia jurídica u operativa House = guía hija.

Decisión técnica provisional: mantener TransportDocument/MasterAWB → House → PhysicalUnit[]. No utilizar Package como sustituto automático de House.

**Acceptance tests:** AT-B01-01: un Master AWB con varias House registra cada House separadamente. AT-B01-02: una House puede contener varias PhysicalUnit. AT-B01-03: confirmar la equivalencia House/guía hija no obliga a fusionar House con PhysicalUnit.

## B-02 — Agrupación de entregas

Varias House pueden compartir dirección/punto de entrega. Por ello se mantienen separados Address → DeliveryPoint → Stop → Delivery. El modelo soportará técnicamente Delivery ↔ House N:M, sin afirmar que toda operación real deba agruparlas.

**Acceptance tests:** AT-B02-01: dos House pueden compartir DeliveryPoint. AT-B02-02: puede registrarse una entrega individual aunque varias House compartan dirección. AT-B02-03: una entrega agrupada no duplica House.

## B-03 — Evidencia de entrega / POD

El manifiesto no demuestra un mínimo obligatorio. El dominio soportará evidencia sin convertir elementos no demostrados en obligaciones legales. Tipos técnicamente posibles: firma, fotografía, identificación, fecha/hora, GPS, OTP y observación. Son candidatos técnicos, no requisitos legales cerrados.

Cada evidencia deberá poder conservar tipo, origen, fecha/hora, referencia a entrega/intento, integridad y metadatos de auditoría.

**Acceptance tests:** AT-B03-01: una entrega registra la evidencia disponible sin exigir un tipo no establecido. AT-B03-02: el catálogo de evidencias puede evolucionar sin alterar Delivery.

## B-04 — Unidad de destino

El manifiesto contiene códigos como CMW, CFG, HOG, SCU, HAV, VRA, MAY, PDR y SNU. No se inferirá que representan provincia, municipio, terminal o ruta.

Decisión: preservar código original, descripción si existe, fuente, fecha y estado de validación.

**Acceptance tests:** AT-B04-01: el código se conserva exactamente. AT-B04-02: un código desconocido no rechaza ni destruye el House. AT-B04-03: incorporar un catálogo oficial posteriormente no modifica el valor original.

## B-05 — Liberación hacia distribución

Recepción, custodia, situación aduanera y disponibilidad para distribución son dimensiones independientes. Se usará una evaluación explícita DistributionEligibility. Conceptualmente deberá considerar recepción compatible, discrepancias gestionadas, situación aduanera compatible, custodia/liberación compatible, ausencia de bloqueo y documentación requerida.

No se implementará received = true → ready_for_distribution.

**Acceptance tests:** AT-B05-01: recibido pero bloqueado no pasa automáticamente a distribución. AT-B05-02: una discrepancia queda registrada sin destruir la declaración original. AT-B05-03: la liberación registra actor, fecha/hora, condición y evidencia.

## B-06 — Modificación y cancelación

Los hechos históricos de Paquetería no deben desaparecer mediante edición destructiva. No se utilizará DELETE físico como mecanismo normal para recepción, intentos, entregas, incidentes, movimientos de almacenamiento, acciones aduaneras registradas, evidencias o cambios de estado.

Las correcciones deben conservar valor anterior, valor nuevo, actor, fecha/hora, motivo y referencia documental cuando corresponda.

**Acceptance tests:** AT-B06-01: una corrección no elimina el valor histórico relevante. AT-B06-02: un hecho cerrado no se modifica sin regla/autorización explícita. AT-B06-03: una cancelación, si procede, queda registrada como evento/estado trazable.

## Impacto sobre el modelo lógico

### Puede avanzar
- entidades conceptuales;
- value objects;
- invariantes independientes;
- contratos de aplicación;
- importación no destructiva;
- auditoría;
- historial de estados;
- pruebas de dominio;
- interfaces de geocodificación;
- interfaces de mapas/ruteo;
- observabilidad.

### Permanece bloqueado
- migraciones PostgreSQL definitivas;
- enums legales irreversibles;
- cardinalidad física única Delivery → House;
- POD obligatorio único;
- interpretación automática de códigos de destino;
- regla definitiva de liberación aduanera;
- DELETE físico como semántica de negocio.

## Criterio de salida

El modelo lógico paqueteria-domain-model-v0.2.0.md y posteriormente PostgreSQL/PostGIS requieren B-01…B-06 cerrados o formalmente delimitados. Cuando una cuestión sea exclusivamente una decisión interna de SETA, deberá cerrarse mediante procedimiento empresarial explícito y no presentarse como obligación legal.

## Trazabilidad

B-01…B-06 → ADR-001 → modelo conceptual → especificación funcional → matriz de trazabilidad → acceptance tests → modelo lógico → PostgreSQL/PostGIS → API → UI.

## Fuentes rectoras

- https://www.aduana.gob.cu/
- https://www.aduana.gob.cu/documentos
- https://www.aerovaradero.com.cu/
- https://www.gacetaoficial.gob.cu/es

## Estado de control

**Ningún B-01…B-06 se declara cerrado exclusivamente por inferencia técnica.** La matriz queda como instrumento de control para el siguiente ciclo de descubrimiento normativo y operativo.
