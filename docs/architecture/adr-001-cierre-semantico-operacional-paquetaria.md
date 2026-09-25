# ADR-001 — Cierre semántico operacional de Paquetería: decisiones vigentes y bloqueadores

**Estado:** aceptado como baseline de diseño; no implica cierre de los puntos marcados como abiertos  
**Fecha:** 2026-09-24  
**Ámbito:** Servicio de Paquetería  
**Relacionados:** D01–D12, RF-PQ-001…020, UC-01…20, AT-01…26

## 1. Contexto

La especificación funcional y la matriz de trazabilidad ya permiten describir el ciclo de Paquetería, pero algunas decisiones de negocio no pueden resolverse mediante intuición de software.

La ingeniería debe distinguir tres situaciones:

1. una regla suficientemente respaldada para diseñar;
2. una decisión técnica provisional necesaria para mantener flexibilidad;
3. una decisión de negocio/operación que permanece abierta.

No se debe convertir una hipótesis operacional en una restricción irreversible de PostgreSQL.

## 2. Decisiones vigentes

### D01 — jerarquía documental

**Decisión:** el modelo conceptual separará Manifest, TransportDocument/Master AWB, House y PhysicalUnit.

**Estado:** parcialmente cerrado.

**Regla:** no se usará Master AWB como sinónimo de Manifest ni House como sinónimo universal de PhysicalUnit.

**Pendiente:** confirmación operacional de que el campo House del manifiesto SETA corresponde exactamente a la guía hija/House de la documentación operacional.

### D02 — House vs PhysicalUnit

**Decisión:** House y PhysicalUnit son conceptos diferentes.

**Estado:** cerrado conceptualmente.

**Consecuencia:** House puede tener cero, una o varias PhysicalUnit según el proceso real de recepción y fraccionamiento.

### D03 — cardinalidad documental

**Decisión provisional:** un documento de transporte superior puede contener múltiples House.

**Evidencia operativa disponible:** el manifiesto 649-31382945 contiene un Master AWB y múltiples House.

**Estado:** provisional hasta ampliar evidencia.

### D04 — House → PhysicalUnit

**Decisión:** el modelo debe soportar House → N PhysicalUnit.

**Estado:** estructuralmente cerrado.

### D05 — personas y roles

**Decisión:** Person es independiente de Customer; Sender y Recipient son roles.

**Estado:** cerrado para diseño conceptual.

### D06 — Customer

**Decisión:** no inferir que Sender o Recipient sea Customer de SETA.

**Estado:** abierto para el dominio comercial.

### D07 — reutilización de direcciones

**Decisión:** conservar Address como concepto reutilizable y preservar el snapshot/original de la fuente.

**Estado:** parcialmente cerrado.

**Pendiente:** definir mediante reglas de negocio cuándo dos direcciones representan el mismo destino operacional.

### D08 — DeliveryPoint y Stop

**Decisión:** DeliveryPoint representa destino operacional; Stop representa su ocurrencia dentro de una Route.

**Estado:** cerrado para diseño conceptual.

### D09 — múltiples House en una Delivery

**Decisión técnica provisional:** el modelo debe poder representar Delivery ↔ House N:M.

**Estado:** abierto operacionalmente.

**Importante:** esta decisión técnica no afirma que la operación real agrupe House en una sola entrega.

**Criterio de cierre:** procedimiento real de distribución/entrega que determine si varios House con un mismo DeliveryPoint se entregan:
- como una sola Delivery;
- como múltiples Delivery dentro de una misma Stop;
- o mediante otra unidad operacional.

### D10 — fallos, reintentos y devoluciones

**Decisión:** DeliveryFailed, RetryScheduled, ReturnPending y Returned pertenecen al flujo operacional de entrega y conservan historial independiente.

**Estado:** cerrado conceptualmente.

**Restricción:** DeliveryFailed no produce automáticamente Abandoned.

### D11 — estados

**Decisión:** mantener seis dimensiones independientes:
Documental, Recepción, Custodia, Aduanera, Distribución y Entrega.

**Estado:** arquitectura conceptual cerrada; catálogos operacionales/jurídicos detallados pendientes.

### D12 — POD

**Decisión:** no imponer todavía firma, fotografía, identificación, OTP, GPS u otro mecanismo como requisito universal.

**Estado:** abierto.

**Criterio de cierre:** procedimiento operativo de SETA que establezca el mínimo obligatorio para declarar una entrega completada y las excepciones autorizadas.

## 3. Reglas que quedan firmes

1. La fuente documental original se conserva.
2. Una discrepancia de recepción no elimina automáticamente la información declarada.
3. StorageLocation no es DeliveryAddress.
4. DeliveryFailed no es Abandoned.
5. El abandono se registra como resultado/acto aduanero separado cuando corresponda.
6. SETA registra información y resultados externos; no ejecuta actos reservados a la autoridad.
7. Los intentos de entrega son hechos históricos independientes.
8. Los cambios relevantes son auditables.
9. La geocodificación no debe destruir ni invalidar el dato documental.
10. No existe un PackageStatus global que sustituya las dimensiones independientes.

## 4. Bloqueadores que requieren procedimiento operativo

### B-01 — House/guía hija

Necesitamos confirmar la equivalencia semántica del campo House utilizado por SETA.

### B-02 — agrupación de entregas

Necesitamos determinar la unidad real que el repartidor considera una entrega cuando existen varios House en una misma dirección.

### B-03 — POD

Necesitamos determinar el conjunto mínimo de evidencia requerido para cerrar una entrega.

### B-04 — Unidad de destino

Necesitamos el catálogo y significado operacional de los códigos de destino observados en el manifiesto.

### B-05 — liberación a distribución

Necesitamos precisar qué condiciones documentales, de recepción, custodia y aduaneras habilitan la preparación para distribución.

### B-06 — modificación/cancelación

Necesitamos definir qué actor puede corregir, cancelar o rectificar información en cada etapa del ciclo.

## 5. Estrategia de resolución

Cada bloqueador debe cerrarse con:

**Fuente/procedimiento → regla explícita → actor → condición → efecto de negocio → evidencia → caso de aceptación → impacto en modelo.**

No se aceptará como evidencia suficiente una suposición basada únicamente en nombres de columnas, prácticas de otros operadores o conveniencia técnica.

## 6. Consecuencia arquitectónica

Hasta cerrar B-01…B-06:

- no se congelan migraciones PostgreSQL definitivas;
- no se fijan enums jurídicos irreversibles;
- no se fija una relación única Delivery → House;
- no se fija un POD obligatorio universal;
- no se interpreta automáticamente Unidad de destino;
- no se implementan reglas de liberación aduanera como lógica propia de SETA.

Sí pueden continuar:

- entidades y value objects conceptuales;
- invariantes independientes de esos bloqueadores;
- contratos de aplicación candidatos;
- pruebas de aceptación;
- infraestructura técnica;
- adaptadores de geocodificación;
- importación no destructiva;
- auditoría;
- observabilidad.

## 7. Criterio para pasar al modelo lógico

El modelo lógico PostgreSQL/PostGIS podrá congelarse cuando B-01…B-06 tengan evidencia suficiente o una decisión empresarial explícita documentada.

Cada excepción deberá quedar registrada como ADR y tener estrategia de migración si posteriormente cambia.

## 8. Resultado

Esta ADR establece una frontera clara entre lo que ya puede considerarse regla del dominio y lo que sigue siendo una decisión operacional pendiente.

**No se inventan reglas para cerrar artificialmente el diseño.**
