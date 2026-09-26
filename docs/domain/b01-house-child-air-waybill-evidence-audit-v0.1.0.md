# Auditoría de evidencia B-01/D01 — House y Child Air Waybill

**Versión:** 0.1.0  
**Fecha:** 2026-09-26  
**Issue:** #209  
**Estado:** B-01/D01 no cerrado — equivalencia operacional pendiente

## 1. Resultado

La evidencia disponible permite afirmar que el modelo debe distinguir:

- Manifest;
- Master AWB / documento de transporte superior;
- guía hija / Child Air Waybill;
- House como término operacional utilizado actualmente por SETA;
- PhysicalUnit / bulto físico.

La evidencia **no permite afirmar todavía** que:

**House = número de Child Air Waybill / HAWB**

Por tanto, B-01/D01 permanece **PARCIAL / ABIERTO** para la equivalencia operacional.

## 2. Evidencia SETA

El AS-IS de Paquetería registra que el manifiesto real contiene, entre otros campos:

- Master AWB;
- House;
- cantidad House;
- bultos;
- datos del destinatario;
- dirección;
- unidad de destino.

El manifiesto real analizado corresponde al Master AWB **649-31382945** y contiene **127 House, 127 sacas, 83 personas y 2123.23 kg**.

El AS-IS también establece expresamente:

**House 1:N Bulto físico**

y advierte que House no debe modelarse como sinónimo de bulto físico.

Sin embargo, el material operacional disponible no presenta una columna o documento identificable de **Child Air Waybill / HAWB** que pueda emparejarse inequívocamente con cada House.

## 3. Evidencia normativa cubana

La Resolución 537/2025 de la Aduana General de la República, en el formato XML de manifiestos aéreos, distingue explícitamente:

- `guia_numero` = número de guía master;
- `guia_hija` = número de guía hija;
- `tipo_guia`;
- cantidad de bultos;
- peso;
- embalaje;
- mercancía;
- proveedor;
- consignado;
- notificado.

La estructura se repite según la cantidad de guías contenidas en el manifiesto.

Esta evidencia confirma la existencia de una relación documental Master/Child Air Waybill y que el número de guía hija es un dato propio, diferenciado del número de guía master.

**No demuestra por sí sola que el campo SETA `House` sea ese identificador de guía hija.**

## 4. Matriz de cierre

| Criterio B-01 | Estado | Evidencia |
|---|---|---|
| Definición oficial de guía master/hija | CUBIERTO | Resolución 537/2025 |
| Existencia de identificador de guía hija | CUBIERTO | `guia_hija` |
| Uso de término House por SETA | CUBIERTO | AS-IS + manifiesto real |
| Correspondencia House ↔ guía hija | **NO PROBADA** | Falta documento/registro emparejable |
| Identificador de correspondencia | **NO PROBADO** | No identificado en evidencia disponible |
| Actor/proceso que genera ese identificador | **NO PROBADO** | Falta procedimiento operativo |
| Condiciones de múltiples House bajo un documento superior | PARCIAL | Estructura normativa + manifiesto real, pero falta equivalencia House/HAWB |
| Efecto sobre recepción/custodia/distribución | PARCIAL | AS-IS describe House como unidad operacional, pero no establece equivalencia documental |
| Regla explícita House = Child AWB | **NO PROBADA** | No existe evidencia operacional suficiente |
| Acceptance test de equivalencia | **BLOQUEADO** | No puede verificarse sin correspondencia documental |

## 5. Decisión de ingeniería

Hasta obtener evidencia operacional específica:

1. **No fusionar** `House` y `ChildAirWaybill` en un único concepto.
2. Mantener `House` como lenguaje operacional de SETA.
3. Mantener la capacidad de representar una guía hija como concepto documental diferenciado.
4. No exigir que el identificador House sea un HAWB.
5. No crear una restricción de unicidad o formato de HAWB sobre House.
6. No cerrar D01/B-01 por inferencia terminológica.
7. Mantener la trazabilidad de la fuente que permita demostrar la correspondencia cuando aparezca.

## 6. Evidencia necesaria para cerrar

El cierre requiere al menos una evidencia operacional verificable que muestre una correspondencia del tipo:

**Master AWB + House SETA + número Child Air Waybill/HAWB**

preferiblemente sobre el mismo envío real, acompañada de:

- quién genera el identificador;
- quién lo recibe/utiliza;
- dónde aparece;
- cuándo se asigna;
- cómo se usa en recepción, custodia y distribución;
- regla de cardinalidad;
- aceptación reproducible.

## 7. Consecuencia sobre el modelo actual

La representación conceptual provisional:

**Manifest → TransportDocument → MasterAWB → House → PhysicalUnit[]**

continúa siendo válida para el lenguaje operacional SETA.

La relación con:

**MasterAWB → ChildAirWaybill**

debe mantenerse explícita hasta que la evidencia permita decidir si:

- `House` es el identificador operacional de `ChildAirWaybill`;
- `House` es un concepto SETA que referencia una guía hija;
- o ambos representan conceptos diferentes.

## 8. Regla de gobernanza

La ausencia de prueba de equivalencia no debe resolverse mediante un alias técnico.

**Terminología coincidente ≠ identidad de dominio.**

La decisión permanecerá abierta hasta obtener evidencia documental/operacional emparejable.
