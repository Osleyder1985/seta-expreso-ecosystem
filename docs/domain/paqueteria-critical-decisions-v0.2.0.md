# Cierre de decisiones críticas de Paquetería — v0.2.0

**Estado:** análisis de evidencia oficial y propuesta de cierre parcial  
**Fecha:** 2026-09-24

## 1. Objetivo

Resolver mediante evidencia normativa los bloqueadores D01, D09 y D12, y actualizar el modelo de dominio sin convertir interpretaciones no demostradas en reglas de software.

## 2. Evidencia normativa relevante

### 2.1 Decreto 134 — manifiesto y recepción aérea

El Decreto 134 establece que las mercancías manifestadas para desembarque en puerto o aeropuerto cubano son descargadas independientemente del régimen aduanero ulterior y del tipo de manifiesto.

Para la recepción, los artículos 137–139 describen el manifiesto rectificado y las diferencias entre lo manifestado y lo efectivamente descargado: faltante total, faltante parcial, sobrante y carga no manifestada.

Esto confirma que el sistema debe modelar una diferencia entre cantidad documental/manifiesta y cantidad efectivamente recibida.

### 2.2 Guía aérea

La normativa de control de aeronaves contempla guía master y guía hija, además de número de guía, cantidad de bultos, peso, embalaje, mercancía, proveedor, consignado y notificado.

Esto aporta evidencia para diferenciar Master AWB y House.

La equivalencia exacta entre la guía hija y el campo House del manifiesto real 649-31382945 todavía requiere confirmación operacional específica.

### 2.3 Depósito temporal

El Decreto 134 establece control de entradas, salidas, movimientos y existencias en depósitos temporales, incluyendo ubicación, faltantes, sobrantes, mercancías no manifestadas y averiadas.

Por tanto, StorageLocation no debe ser DeliveryAddress.

### 2.4 Desaduanamiento

La Resolución 533/2025 regula las formalidades, condiciones, términos y plazos del desaduanamiento.

El sistema debe registrar la situación documental/aduanera necesaria, pero no sustituir actos de la autoridad aduanera.

### 2.5 Abandono

La Resolución 534/2025 establece que el jefe de la aduana de control es la autoridad facultada para declarar abandono legal o aceptar abandono voluntario.

Consecuencia:

**DeliveryFailed no es Abandoned.**

El abandono debe registrarse como acto/resultado aduanero separado.

## 3. D01 — Master AWB / Guide / House

### Estado: PARCIALMENTE CERRADO

Estructura suficientemente respaldada:

Manifest → TransportDocument → MasterAWB → House/ChildAirWaybill → PhysicalUnit[]

El manifiesto real contiene Master AWB 649-31382945 y 127 House.

No se debe usar Master AWB como sinónimo de Manifest ni House como sinónimo universal de PhysicalUnit.

La etiqueta House frente a guía hija queda pendiente de confirmación operacional.

## 4. D09 — múltiples House en una Delivery

### Estado: ABIERTO

El manifiesto demuestra varios House y direcciones repetidas, pero no demuestra que el procedimiento real de SETA obligue a agruparlos en una misma entrega.

Decisión técnica provisional:

**Delivery ↔ House = N:M**

Esto permite tanto una entrega individual como una operación agrupada.

No debe crearse una FK única delivery.house_id como diseño definitivo.

## 5. D12 — mínimo de POD

### Estado: ABIERTO

La evidencia disponible no permite imponer todavía firma, foto, documento de identidad, geolocalización, OTP u otro elemento como requisito legal de POD.

Regla provisional:

DeliveryCompleted debe tener un resultado y una evidencia mínima definida por el procedimiento operativo de SETA.

## 6. Modelo refinado de recepción

Documental:

Manifested

Recepción:

Expected → Receiving → Received

Resultados de conciliación:

- ReceivedAsDeclared
- ReceivedWithShortage
- ReceivedWithSurplus
- ReceivedWithUnmanifestedCargo
- ReceivedWithDamage

Estos resultados no sustituyen necesariamente el estado principal.

## 7. Modelo refinado de custodia

NOT_IN_STORAGE → IN_STORAGE → MOVED → IN_STORAGE → RELEASED_FROM_STORAGE

Debe registrarse:

- entrada;
- ubicación;
- movimiento;
- salida;
- faltante;
- sobrante;
- no manifestado;
- avería;
- documento de referencia.

## 8. Modelo aduanero

No utilizar un único estado que mezcle:

CUSTOMS_STATUS = DELIVERED / FAILED / ABANDONED

Separar:

**Aduanero**
- control;
- formalización;
- resultado;
- liberación/autorización;
- abandono cuando exista acto aduanero.

**Operacional**
- preparación;
- ruta;
- intento;
- entrega;
- devolución.

## 9. Regla crítica de abandono

Queda prohibida conceptualmente la transición:

DELIVERY_FAILED → ABANDONED

Debe existir una gestión intermedia y un acto/resultado aduanero documentado antes de registrar abandono.

## 10. Impacto sobre el dominio

### ReceptionDiscrepancy

Tipos candidatos:

- SHORTAGE
- SURPLUS
- UNMANIFESTED
- DAMAGE
- OTHER

Debe conservar cantidad documental, cantidad recibida, diferencia, fecha, documento, actor y evidencia.

### StorageMovement

Debe conservar origen, destino, fecha/hora, mercancía/bulto, documento autorizante, actor y motivo.

### CustomsAction

Debe conservar tipo de acto, referencia, autoridad, fecha/hora, resultado, evidencia y documento fuente.

### AbandonmentRecord

Debe conservar tipo legal, autoridad, resolución/referencia, fecha, causal, mercancía afectada y evidencia.

## 11. Actualización D01–D12

| Decisión | Estado |
|---|---|
| D01 | Parcialmente cerrada |
| D02 | Parcialmente cerrada: House ≠ PhysicalUnit |
| D03 | Provisional: documento superior → múltiples House |
| D04 | Estructuralmente definida: House → N PhysicalUnit |
| D05 | Cerrada para diseño conceptual |
| D06 | Abierta |
| D07 | Abierta |
| D08 | Respaldada |
| D09 | Abierta; soporte técnico N:M |
| D10 | Cerrada conceptualmente |
| D11 | Arquitectura cerrada; detalle jurídico/operacional pendiente |
| D12 | Abierta |

## 12. Nuevos criterios de aceptación

- AT-18: faltante parcial → registrar discrepancia sin borrar House.
- AT-19: sobrante → registrar cantidad recibida y discrepancia.
- AT-20: carga no manifestada → registrar incidencia.
- AT-21: bulto averiado → registrar daño y evidencia.
- AT-22: movimiento entre ubicaciones → crear StorageMovement.
- AT-23: DeliveryFailed no crea abandono automáticamente.
- AT-24: abandono con referencia de autoridad → crear AbandonmentRecord.
- AT-25: House sin geocodificación no se pierde ni se invalida documentalmente.
- AT-26: varios House pueden asociarse a un mismo Delivery.

## 13. Fuentes

La Gaceta Oficial No. 7 Ordinaria de 2026 contiene el Decreto-Ley 108, Decreto 134 y las Resoluciones 529–537.

El Decreto 134 contiene las reglas sobre manifiesto rectificado, diferencias de bultos recibidos frente a lo declarado y control del depósito temporal.

La Resolución 533/2025 regula el desaduanamiento.

La Resolución 534/2025 regula el abandono.

La normativa de control de aeronaves documenta guía master, guía hija, cantidad de bultos y peso.

## 14. Resultado

D01 queda suficientemente definido para continuar el diseño conceptual, pero la equivalencia House = guía hija requiere confirmación operacional.

D09 permanece abierto, pero el modelo debe soportar N:M.

D12 permanece abierto.

**No se autoriza todavía el esquema físico PostgreSQL definitivo.**

El siguiente paso es cerrar la semántica operacional de recepción → liberación → preparación para distribución → entrega y convertir las reglas confirmadas en especificación funcional y contratos de aplicación.
