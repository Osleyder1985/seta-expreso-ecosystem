# Especificación funcional de Paquetería — v0.1.1

**Estado:** En validación
**Ámbito:** Servicio de Paquetería de SETA EXPRESO SURL
**Base:** modelo de dominio v0.2.0, casos de uso v0.1.0, decisiones críticas v0.2.0, máquina de estados y evidencia del manifiesto 649-31382945.

## 1. Propósito

Definir qué debe hacer el sistema durante el ciclo operacional de Paquetería, separando recepción documental, recepción física, custodia, situación aduanera, preparación para distribución, planificación de rutas, ejecución de entregas, incidencias, devoluciones y trazabilidad.

Esta especificación no define todavía tablas PostgreSQL ni endpoints concretos.

## 2. Principio fundamental

El sistema no debe modelar Paquetería como un único estado.

Debe mantener dimensiones independientes:

Documental → Recepción → Custodia → Aduanera → Distribución → Entrega

Una operación puede estar recibida físicamente y simultáneamente pendiente de una condición aduanera. No se debe resolver esa situación mediante un único status.

## 3. Flujo funcional de extremo a extremo

### Fase A — Ingreso documental

Archivo → Ingesta → Validación → Conciliación → Registro

El sistema conserva archivo, hash, hoja, filas, columnas, valores originales, resultado de validación y discrepancias.

### Fase B — Recepción

Expected → Receiving → Received

Durante la recepción se compara información documental contra mercancía efectivamente recibida.

Resultados posibles:
- recibido conforme;
- faltante;
- sobrante;
- no manifestado;
- averiado;
- otra discrepancia.

### Fase C — Custodia

NotInStorage → InStorage → Moved → ReleasedFromStorage

Cada movimiento debe quedar trazado.

### Fase D — Situación aduanera

El sistema registra actuaciones, documentos, referencias, resultados, liberaciones/autorizaciones aplicables y abandono cuando exista acto correspondiente.

SETA no actúa como autoridad aduanera.

### Fase E — Preparación para distribución

Un House puede pasar a preparación únicamente cuando se cumplen las condiciones operacionales y aduaneras aplicables.

El sistema debe poder explicar por qué un House no está listo.

Ejemplos:
- pendiente de recepción;
- discrepancia no resuelta;
- pendiente de condición aduanera;
- dirección insuficiente;
- incidencia bloqueante;
- devolución pendiente.

### Fase F — Planificación

ReadyForDistribution → Planned

Se seleccionan House, DeliveryPoint, fecha, ruta, vehículo, conductor y secuencia de paradas.

### Fase G — Ejecución

Planned → InDistribution → DistributionCompleted

Se registra salida, llegada a parada, inicio de servicio, finalización, tiempos, ubicación e incidencias.

### Fase H — Entrega

Pending → Attempted → Delivered

Alternativas:
- Attempted → DeliveryFailed → RetryScheduled → Attempted
- DeliveryFailed → ReturnPending → Returned

Abandono aduanero no pertenece a esta máquina de entrega.

## 4. Reglas de elegibilidad para distribución

Un objeto es elegible para distribución solamente si:
- existe identidad documental;
- recepción compatible;
- no existe bloqueo de custodia;
- condiciones aduaneras necesarias satisfechas;
- destino suficientemente identificado;
- DeliveryPoint disponible o creable;
- no existe incidencia bloqueante;
- no existe devolución pendiente incompatible.

El sistema debe devolver las razones de bloqueo.

## 5. Regla de geocodificación

La geocodificación es una capacidad de soporte.

Flujo:
OriginalAddress → ParsedAddress → NormalizedAddress → ValidatedAddress → Geolocation

Una falla de geocodificación no destruye ni invalida automáticamente el dato documental.

Para planificación de ruta puede existir una regla adicional que exija una geolocalización válida.

## 6. Modelo de recepción

El sistema crea una expectativa a partir de documentación válida.

Durante recepción debe poder registrar:
- cantidad esperada;
- cantidad recibida;
- peso esperado;
- peso recibido cuando exista;
- estado físico;
- observaciones;
- evidencia.

Una discrepancia conserva valor declarado, valor recibido, diferencia, tipo, actor, fecha/hora y documento/evidencia.

## 7. Custodia y almacenamiento

El sistema debe poder responder: ¿Dónde está o estuvo una mercancía?

Debe conservar historial de entrada, ubicación, traslado y salida.

Una ubicación de almacenamiento no se reutiliza como dirección de entrega.

## 8. Preparación para distribución

La preparación crea una decisión operacional explícita: READY_FOR_DISTRIBUTION.

El sistema debe registrar quién o qué produjo esa transición y las condiciones satisfechas.

## 9. DeliveryPoint

Un DeliveryPoint representa un destino operacional.

Puede relacionarse con Address, Geolocation, referencias de acceso, instrucciones, contactos y múltiples House.

## 10. Route

Una Route contiene:
- fecha;
- origen;
- destino;
- vehículo;
- conductor;
- paradas ordenadas;
- tiempos planificados;
- estado.

La optimización automática no forma parte todavía del núcleo obligatorio.

## 11. Stop

Una parada representa un punto de operación.

Debe registrar:
- secuencia;
- DeliveryPoint;
- llegada planificada;
- llegada real;
- salida planificada;
- salida real;
- duración planificada;
- duración real;
- estado.

Varias entregas pueden ejecutarse en una misma parada si D09 se confirma operacionalmente.

## 12. Delivery

Una Delivery representa la operación de entrega, no simplemente el cambio de estado de House.

Debe registrar House asociado, parada, receptor, resultado, tiempo, ubicación, observaciones y evidencia.

La asociación múltiple con House se mantiene soportada por el modelo hasta cerrar D09.

## 13. DeliveryAttempt

Cada intento debe ser independiente.

Ejemplo:
Attempt 1 → Failed
Attempt 2 → Delivered

No se modifica el registro del Attempt 1 para convertirlo en exitoso.

## 14. Proof of Delivery

El sistema debe permitir diferentes tipos de evidencia:
- nombre del receptor;
- identificación;
- firma;
- fotografía;
- ubicación;
- fecha/hora;
- referencia documental;
- observaciones.

Para una entrega exitosa, la evidencia mínima obligatoria es la fotografía del documento de identidad del receptor asociada al paquete/operación. Firma, fotografía del bulto, OTP y geolocalización no son obligatorios por esta regla; su uso puede depender de otros procedimientos o decisiones.

## 15. Fallos y reintentos

Cuando una entrega falla:
1. registrar intento;
2. registrar motivo;
3. conservar evidencia;
4. evaluar reintento;
5. programar nueva fecha si procede;
6. crear nuevo intento.

No convertir automáticamente el fallo en abandono.

## 16. Devoluciones

Una devolución es un flujo operacional separado:

DeliveryFailed → ReturnPending → Returned

Debe conservar motivo, fecha, ubicación, responsable, evidencia, mercancía afectada y documento de referencia.

## 17. Incidencias

Una incidencia puede afectar manifest, House, PhysicalUnit, recepción, almacenamiento, condición aduanera, dirección, ruta, vehículo, parada o entrega.

Debe conservar tipo, severidad, fecha, actor, descripción, estado, evidencia y resolución.

## 18. Trazabilidad

Desde cualquier House autorizado debe poder reconstruirse:

Archivo → Manifest → TransportDocument → House → PhysicalUnit → Person → Address → Geolocation → DeliveryPoint → Route → Stop → Delivery → Attempt → POD/Incident

La trazabilidad no debe depender únicamente del estado actual.

## 19. Reglas de modificación

La modificación depende del estado.

Antes de registro definitivo existe mayor capacidad de corrección, manteniendo origen.

Después de recepción, los cambios sensibles requieren autorización y auditoría.

Después de liberación o entrega, no se modifican silenciosamente datos históricos.

Después de cierre, las correcciones deben realizarse mediante mecanismos de ajuste o auditoría.

## 20. Reglas de eliminación

No se permite borrado físico de información operacional histórica crítica.

Debe preferirse cancelación, anulación, corrección, reversión o estado histórico.

## 21. Seguridad funcional

Cada operación debe estar autorizada por rol, permiso, ámbito organizacional y estado del objeto.

Operaciones sensibles incluyen aceptar importación, modificar House, corregir recepción, liberar para distribución, alterar ruta en ejecución, cerrar entrega, registrar POD, cancelar/devolver y corregir históricos.

## 22. Auditoría

Para operaciones críticas:
- actor;
- timestamp;
- objeto;
- operación;
- valor anterior cuando aplique;
- valor nuevo;
- motivo;
- referencia;
- resultado.

Los datos originales del manifiesto deben permanecer auditables.

## 23. Contratos funcionales principales

El futuro API deberá expresar operaciones de negocio y no simples CRUD genéricos.

Ejemplos:
- importar manifiesto;
- validar importación;
- aceptar importación;
- consultar discrepancias;
- registrar recepción;
- registrar movimiento;
- registrar resultado aduanero;
- liberar para distribución;
- crear ruta;
- asignar parada;
- iniciar ruta;
- registrar intento;
- completar entrega;
- registrar fallo;
- programar reintento;
- registrar devolución;
- consultar trazabilidad.

## 24. Indicadores funcionales iniciales

El sistema debe quedar preparado para medir:
- manifiestos procesados;
- House aceptados/rechazados;
- discrepancias de recepción;
- tiempo desde recepción hasta disponibilidad;
- tiempo de almacenamiento;
- porcentaje de direcciones geocodificadas;
- entregas por ruta;
- intentos por House;
- tasa de entrega exitosa;
- reintentos;
- devoluciones;
- incidencias;
- tiempo de resolución;
- duración planificada vs real;
- distancia planificada vs real cuando exista telemetría.

No se establecen metas numéricas todavía.

## 25. Reglas de consistencia críticas

1. No perder valores originales.
2. No confundir House con PhysicalUnit.
3. No confundir Address con DeliveryPoint.
4. No confundir StorageLocation con DeliveryAddress.
5. No confundir DeliveryFailed con Abandoned.
6. No convertir un evento externo en una acción ejecutada por SETA.
7. No sobrescribir historial.
8. No depender de geocodificación para conservar documentación válida.
9. No usar un estado global para representar todos los procesos.
10. No crear migraciones definitivas hasta cerrar las reglas pendientes.

## 26. Requisitos funcionales derivados

RF-PQ-001: importar manifiestos conservando trazabilidad del archivo fuente.
RF-PQ-002: validar estructura y contenido.
RF-PQ-003: registrar discrepancias sin destruir información.
RF-PQ-004: representar Master AWB, House y unidades físicas separadamente.
RF-PQ-005: gestionar personas con roles Sender/Recipient.
RF-PQ-006: conservar dirección original y normalizada.
RF-PQ-007: obtener y versionar geolocalizaciones.
RF-PQ-008: gestionar custodia y movimientos.
RF-PQ-009: registrar información aduanera relevante sin sustituir a la autoridad.
RF-PQ-010: determinar elegibilidad para distribución.
RF-PQ-011: crear y ejecutar rutas.
RF-PQ-012: registrar múltiples intentos.
RF-PQ-013: registrar evidencia de entrega.
RF-PQ-014: gestionar devoluciones.
RF-PQ-015: registrar incidencias.
RF-PQ-016: mantener trazabilidad completa.
RF-PQ-017: aplicar autorización basada en rol y estado.
RF-PQ-018: mantener historial de transiciones.
RF-PQ-019: permitir auditoría de operaciones críticas.
RF-PQ-020: soportar asociación de múltiples House a un mismo Delivery hasta el cierre de D09.

## 27. Criterios de salida

Esta especificación podrá pasar a diseño de aplicación cuando:
- UC-01…UC-20 estén cubiertos;
- RF-PQ-001…RF-PQ-020 tengan trazabilidad;
- AT-01…AT-26 puedan mapearse a pruebas;
- D01…D12 tengan estado explícito;
- reglas aduaneras que deban convertirse en restricciones tengan evidencia;
- D09 sea cerrado por procedimiento operativo;
- permisos por rol estén definidos.

## 28. Estado actual

Modelo de dominio: apto para especificación funcional.

Especificación funcional: v0.1.0.

Modelo lógico PostgreSQL: todavía bloqueado.

Motivo: permanece la decisión operacional sobre agrupación de entregas, además de jerarquía documental exacta y catálogos operativos.

Siguiente artefacto: matriz completa Requisito → Caso de Uso → Regla → Evento → Prueba → futura API, seguida por el diseño lógico PostgreSQL/PostGIS cuando los bloqueadores estén cerrados.


**Fase/nota:** El estado anterior, si existía, se conserva como descripción histórica de fase; el campo `Estado` usa exclusivamente la taxonomía formal de gobernanza.
