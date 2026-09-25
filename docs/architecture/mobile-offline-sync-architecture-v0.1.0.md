# Arquitectura Mobile Offline-First y Sincronización — v0.1.0

**Issue:** #54  
**Estado:** Propuesto para PoC y diseño incremental  
**Ámbito:** Aplicaciones móviles operativas Android/iOS — Paquetería

## 1. Objetivo

La conectividad móvil no debe determinar si el personal puede ejecutar una ruta.

**Pre-cargar -> trabajar localmente -> persistir durablemente -> sincronizar automáticamente -> confirmar**

El teléfono es una extensión operacional temporal del sistema, no una fuente permanente independiente de la verdad de negocio.

## 2. Datos disponibles offline

Antes de iniciar la jornada deben estar localmente:

- identidad y permisos;
- jornada y asignaciones;
- vehículo y tripulación;
- ruta y secuencia de paradas;
- paquetes/bultos;
- información necesaria para ejecutar entregas;
- instrucciones operativas;
- datos de direcciones necesarios;
- datos mínimos para mapa/ruta cuando sea posible.

Debe existir una indicación de **jornada lista para trabajar offline**.

## 3. Operaciones offline

El usuario podrá:

- consultar ruta, paradas y paquetes;
- marcar ENTREGADO/NO ENTREGADO;
- registrar intentos;
- registrar incidencias;
- capturar fotografías;
- capturar GPS;
- proponer correcciones geoespaciales;
- consultar realizado y pendiente.

Ninguna operación crítica de campo debe depender de una llamada inmediata al backend.

## 4. Persistencia local

Cada operación offline debe persistirse durablemente antes de considerarse aceptada por la interfaz.

Modelo conceptual:

- **Local Domain Data:** copia de datos necesarios de la jornada.
- **Local Operation Queue / Outbox:** operaciones pendientes.
- **Local Evidence Store:** fotografías pendientes de subida.
- **Sync Metadata:** estado, intentos, timestamps, identificadores de idempotencia y errores.

Debe sobrevivir pérdida de cobertura, cierre, suspensión y reinicio.

La tecnología concreta queda para PoC.

## 5. Idempotencia

Toda operación sincronizable tendrá un identificador único del dispositivo:

**operationId / idempotencyKey**

Repetir la misma operación no debe duplicar entregas, intentos, incidencias, evidencias u observaciones GPS.

## 6. Dependencias y orden

Las operaciones pueden depender unas de otras.

Ejemplo:

**Intento -> Entrega -> Evidencia**

La cola conservará dependencias.

Orden conceptual:

1. cambios de jornada/ruta;
2. intentos;
3. resultados de entrega;
4. evidencias;
5. incidencias;
6. GPS;
7. correcciones geoespaciales.

El orden definitivo se validará con los contratos API.

## 7. Sincronización automática

Al recuperar conectividad:

1. restablecer sesión;
2. consultar cambios relevantes;
3. enviar operaciones pendientes;
4. procesar respuestas;
5. subir evidencias;
6. confirmar;
7. actualizar estado local;
8. descargar cambios nuevos;
9. continuar mientras existan pendientes.

Debe ser reanudable y tolerante a interrupciones. No debe requerir acción manual del trabajador.

## 8. Estados de operación

**LOCAL_CREATED -> LOCAL_PERSISTED -> SYNC_PENDING -> SYNCING -> SYNC_CONFIRMED**

Alternativas:

**SYNC_FAILED_RETRYABLE -> SYNC_PENDING**

**SYNC_CONFLICT -> revisión/resolución**

Una operación confirmada no debe ejecutarse de nuevo por un reintento de red.

## 9. Conflictos

Un conflicto aparece cuando el teléfono estuvo offline y el servidor u otro proceso modificó el mismo objeto.

Ejemplos:

- otro proceso registró una entrega;
- una ruta fue reasignada;
- un paquete fue retirado;
- el servidor recibió una operación pero el teléfono no recibió la confirmación.

No se utilizará **last-write-wins** para borrar hechos operativos críticos.

Las entregas, intentos, evidencias, incidencias y observaciones relevantes deben conservarse como hechos auditables. La incompatibilidad se registra para revisión.

## 10. Evidencias offline

Las fotografías deben:

- almacenarse localmente de forma segura;
- vincularse a una operación;
- tener identificador único;
- quedar pendientes de subida;
- reintentarse automáticamente;
- eliminarse del almacenamiento temporal solo cuando la política definida lo permita y exista confirmación segura.

## 11. Seguridad offline

El dispositivo puede contener datos personales, direcciones, paquetes, documentos de identidad y coordenadas.

Debe evaluarse:

- cifrado local;
- protección de claves;
- expiración de sesión;
- bloqueo por inactividad;
- revocación remota;
- limpieza selectiva;
- minimización de datos;
- protección de capturas cuando sea necesario.

## 12. GPS

Durante ejecución activa se evaluará una captura aproximada de **5–10 segundos**.

No toda observación debe transmitirse inmediatamente:

**GPS -> almacenamiento local -> lote/stream -> servidor**

Se medirán volumen, batería, datos, latencia, precisión y continuidad.

## 13. Correcciones geoespaciales

Una corrección offline queda:

**PENDIENTE_DE_VALIDACIÓN**

No modifica automáticamente el dato maestro.

Debe conservar ubicación anterior, nueva ubicación, precisión, fecha/hora, usuario, ruta/entrega, contexto e identificador de operación.

## 14. Recuperación ante fallo

Después de reinicio del teléfono:

- la entrega sigue registrada;
- la evidencia sigue pendiente;
- la cola se reconstruye;
- la interfaz conserva el estado correcto;
- la sincronización continúa.

No se dependerá de memoria RAM ni de estado efímero.

## 15. Arquitectura conceptual

**Flutter Mobile**
-> presentación
-> aplicación móvil
-> almacenamiento local
-> outbox
-> sync engine
-> evidence store
-> GPS/location adapter
-> REST/OpenAPI
-> **Backend modular**
-> PostgreSQL/PostGIS
-> almacenamiento de evidencias

Se usarán adaptadores nativos Android/iOS cuando sean necesarios para background location, almacenamiento seguro y comportamiento energético.

## 16. Observabilidad

Debe medirse:

- operaciones pendientes/confirmadas/reintentadas;
- conflictos;
- tiempo de sincronización;
- tamaño de cola;
- evidencias pendientes;
- fallos de subida;
- última sincronización;
- última posición recibida;
- retraso de tracking.

No se deben registrar en logs normales fotografías ni contenido sensible de documentos de identidad.

## 17. Decisiones abiertas

- almacenamiento local;
- formato de outbox;
- protocolo de sincronización;
- resolución de conflictos por operación;
- límites de cola;
- compresión de fotografías;
- cifrado local;
- background location;
- frecuencia definitiva GPS;
- limpieza después de sincronización;
- recuperación tras pérdida total del dispositivo.

## 18. Criterios de aceptación de PoC

La PoC debe demostrar:

1. ruta completa disponible antes de salir;
2. horas sin conexión sin impedir operación;
3. entregas y evidencias offline;
4. reinicio sin pérdida;
5. sincronización automática;
6. ausencia de duplicados por reintento;
7. persistencia de fotografías pendientes;
8. conflictos sin destrucción histórica;
9. GPS offline;
10. consumo de batería/datos aceptable;
11. reconstrucción del historial en servidor;
12. tracking posterior de los propios envíos del cliente.

## 19. Principios

1. **Offline != modo degradado; es un modo operativo válido.**
2. **Local persistence != source of truth global.**
3. **Sync retry != duplicate operation.**
4. **Conflict != deletion.**
5. **Evidence capture != evidence permanently stored on device.**
6. **GPS capture != immediate network transmission.**
7. **Device != worker identity.**
8. **Historical fact != mutable current state.**
