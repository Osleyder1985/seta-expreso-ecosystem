# Protocolo de sincronización móvil offline-first — v0.1.0

**Estado:** Propuesto
**Issue:** #56  
**Derivado de:** PR #55 — arquitectura mobile offline-first  
**Alcance:** contrato conceptual/técnico para sincronización móvil ↔ backend

## 1. Propósito

La conectividad no determina si el trabajador puede ejecutar una jornada. La aplicación móvil debe poder ejecutar operaciones válidas localmente y sincronizarlas posteriormente.

Modelo:

**Pre-carga → ejecución local → persistencia durable → cola → sincronización → confirmación**

Este documento define el contrato de sincronización sin fijar todavía una tecnología concreta de almacenamiento local, un protocolo de streaming ni la frecuencia definitiva de GPS.

## 2. Principios

1. El servidor continúa siendo la fuente global de verdad.
2. El dispositivo mantiene una copia operacional local para trabajar offline.
3. Toda mutación offline debe ser durable antes de considerarse ejecutada.
4. Cada operación posee identidad única e idempotente.
5. Reintentar no puede producir duplicados.
6. El orden causal debe preservarse cuando una operación depende de otra.
7. Los hechos operacionales críticos no se resuelven con `last-write-wins`.
8. Un conflicto no implica eliminación silenciosa.
9. La sincronización debe ser incremental y reanudable.
10. La evidencia debe poder cargarse de forma separada y reanudable.
11. GPS, eventos, entregas y evidencia son flujos diferentes aunque puedan compartir infraestructura.
12. Toda operación sincronizada debe ser auditable.

## 3. Modelo de operación

Cada operación local debe contener conceptualmente:

- `operationId`: UUID único generado por el cliente.
- `idempotencyKey`: clave estable para evitar duplicación.
- `operationType`: tipo de comando.
- `aggregateType`: tipo de objeto afectado.
- `aggregateId`: identificador del objeto.
- `baseVersion`: versión conocida por el dispositivo antes de la mutación, cuando aplique.
- `occurredAt`: instante de ocurrencia en el dispositivo.
- `deviceId`: identificador técnico del dispositivo.
- `actorId`: identidad del usuario autenticado.
- `sequence`: orden local de operaciones cuando sea necesario.
- `payload`: datos del comando.
- `dependencies`: operaciones que deben confirmarse antes.
- `evidenceRefs`: referencias a evidencia asociada, cuando exista.

El dispositivo no puede modificar retrospectivamente una operación ya persistida para ocultar su historia.

## 4. Estados de sincronización

Estados conceptuales:

`LOCAL_CREATED` → `LOCAL_PERSISTED` → `SYNC_PENDING` → `SYNCING` → `SYNC_CONFIRMED`

Errores:

- `SYNC_FAILED_RETRYABLE` → `SYNC_PENDING`
- `SYNC_CONFLICT` → revisión/resolución según tipo de operación.
- error permanente de autorización/validación → no reintentar ciegamente; conservar trazabilidad.

## 5. Push

El cliente envía un lote de operaciones pendientes.

Cada operación debe poder recibir un resultado independiente:

### Confirmada
El servidor aceptó la operación y devuelve al menos:

- `operationId`
- estado de procesamiento
- identificador/version del recurso afectado cuando corresponda
- versión resultante
- timestamp de aceptación/procesamiento

### Reintentable
Ejemplos:

- timeout;
- pérdida de conexión;
- error temporal;
- disponibilidad transitoria del servidor.

El cliente conserva la operación y reintenta con la misma identidad.

### Rechazada por validación/autorización
El servidor determina que la operación no puede ejecutarse.

Debe devolver:

- código estable;
- mensaje operativo seguro;
- recurso/operación afectada;
- versión relevante cuando aplique;
- indicación de si requiere intervención.

No debe convertirse automáticamente en una nueva operación diferente.

### Conflicto
El servidor detecta que el estado base utilizado por el cliente ya no corresponde al estado vigente.

El conflicto debe conservar:

- operación original;
- versión base;
- versión actual;
- naturaleza del conflicto;
- representación suficiente para resolverlo;
- resultado de resolución.

## 6. Idempotencia

La idempotencia es obligatoria para mutaciones sincronizables.

Regla:

> La repetición de la misma operación lógica no puede crear un segundo hecho operacional.

Ejemplos:

- no crear dos entregas por un reintento;
- no crear dos intentos;
- no duplicar un incidente;
- no registrar dos veces la misma evidencia;
- no duplicar una operación de cambio de estado.

El backend debe poder reconocer una operación previamente procesada incluso si el cliente perdió la respuesta.

## 7. Orden causal

Cuando exista dependencia:

`Attempt → Delivery → Evidence`

la sincronización debe respetar esa causalidad.

Ejemplo:

1. registrar intento;
2. registrar resultado de entrega;
3. asociar evidencia;
4. confirmar el conjunto.

GPS y observaciones independientes pueden procesarse por separado, salvo que una regla de negocio establezca una dependencia explícita.

El orden de transporte de red no debe sustituir al orden de negocio.

## 8. Pull incremental

El cliente debe poder solicitar cambios desde un punto conocido mediante un cursor/checkpoint.

Modelo conceptual:

`pull(cursor)` → cambios + nuevo cursor

El cursor debe permitir:

- reanudar después de interrupción;
- descargar sólo cambios nuevos;
- evitar depender de una descarga completa;
- detectar invalidación del cursor;
- reconstruir progresivamente el estado local.

La respuesta debe permitir distinguir:

- cambios aplicables;
- recursos eliminados lógicamente o invalidados;
- conflictos/acciones requeridas;
- nuevo checkpoint.

No se debe asumir borrado físico como mecanismo de sincronización.

## 9. Ciclo completo

Secuencia conceptual:

1. autenticar;
2. validar sesión/permisos;
3. recuperar cambios del servidor;
4. actualizar estado local;
5. seleccionar operaciones pendientes;
6. respetar dependencias;
7. enviar lote;
8. procesar resultados individualmente;
9. reintentar sólo operaciones reintentables;
10. subir evidencia pendiente;
11. actualizar checkpoint;
12. descargar cambios posteriores;
13. repetir mientras existan pendientes/cambios;
14. registrar último sync exitoso.

La aplicación debe poder detenerse y continuar posteriormente sin perder el estado de sincronización.

## 10. Concurrencia y versiones

Los recursos mutables relevantes deben disponer de una versión/concurrency token.

El cliente envía `baseVersion` cuando una mutación depende de un estado previamente leído.

Si la versión ya cambió:

`baseVersion != currentVersion`

el servidor debe evaluar la operación como potencial conflicto.

No todas las operaciones requieren la misma política:

- hechos históricos: normalmente append-only;
- datos maestros: pueden requerir resolución;
- asignaciones operativas: conflicto explícito;
- entrega/no entrega: operación crítica, sin sobrescritura silenciosa;
- evidencia: append-only;
- GPS: observaciones append-only;
- corrección geoespacial: flujo PENDING_DE_VALIDACIÓN.

## 11. Entregas offline

La aplicación puede registrar offline:

- ENTREGADO;
- NO ENTREGADO;
- intento;
- incidencia;
- evidencia.

La sincronización posterior no debe cambiar automáticamente un hecho histórico sólo porque el servidor tenga un estado diferente.

Si existe conflicto, debe preservarse la operación local y el estado del servidor para resolución trazable.

## 12. Evidencia

La evidencia se trata como objeto independiente asociado a una operación.

Para la entrega, la fotografía del documento de identidad del destinatario es obligatoria según la decisión funcional vigente.

Flujo conceptual:

**captura → almacenamiento local seguro → referencia local → sincronización de metadatos → carga binaria → confirmación → asociación definitiva**

La carga binaria debe poder reanudarse si la conexión se interrumpe.

La política de eliminación local después de sincronización segura queda condicionada a la política de retención y recuperación que se defina posteriormente.

No almacenar fotografías sensibles en logs.

## 13. GPS

GPS se considera un flujo de observaciones:

`GPS Observation = latitude + longitude + timestamp + accuracy + source + context`

Durante una jornada activa:

**GPS → persistencia local → cola/buffer → sincronización**

La hipótesis actual de PoC es captura de 5–10 segundos y sincronización aproximada de 10 segundos, pero estos valores NO son una decisión definitiva.

Debe medirse:

- precisión;
- continuidad;
- latencia;
- batería;
- volumen de datos;
- almacenamiento local;
- comportamiento en pérdida de cobertura;
- recuperación después de suspensión/reinicio.

La posición exacta del vehículo puede exponerse al cliente únicamente dentro del ámbito autorizado de sus propios envíos.

## 14. Correcciones geoespaciales

Una corrección capturada en campo no sustituye inmediatamente la ubicación maestra.

Estado inicial:

`PENDING_DE_VALIDACIÓN`

Debe conservar:

- ubicación anterior;
- ubicación propuesta;
- precisión;
- timestamp;
- usuario;
- contexto de ruta/entrega;
- operación;
- resultado de validación.

## 15. Seguridad y autorización

Cada operación debe evaluarse contra:

- identidad del actor;
- sesión;
- permisos;
- alcance organizacional;
- objeto afectado;
- relación del usuario con la jornada/route/ship­ment.

El hecho de que una operación haya sido creada offline no elimina la autorización server-side.

El cliente sólo puede descargar datos necesarios para la jornada y el usuario.

La visibilidad del cliente está restringida a sus propios envíos y datos autorizados.

## 16. Observabilidad

Métricas mínimas:

- operaciones pendientes;
- operaciones confirmadas;
- reintentos;
- conflictos;
- tiempo de sincronización;
- último sync exitoso;
- tamaño de cola;
- evidencia pendiente;
- fallos de carga;
- último GPS recibido;
- antigüedad de la posición;
- errores de autenticación.

Los logs normales no deben contener fotografías de documentos de identidad ni otros datos sensibles innecesarios.

## 17. Compatibilidad REST/OpenAPI

El protocolo debe poder expresarse mediante contratos REST/OpenAPI.

Los contratos futuros deberán especificar:

- request/response schemas;
- códigos de resultado;
- errores;
- idempotencia;
- paginación/cursor;
- versiones;
- límites;
- autenticación/autorización;
- correlación;
- trazabilidad.

La existencia de este protocolo no obliga a introducir WebSockets, MQTT, Kafka u otra tecnología de mensajería. La necesidad se evaluará mediante PoC y requisitos medidos.

## 18. Conflictos mínimos a probar

La PoC debe demostrar al menos:

1. Entrega creada offline mientras servidor cambia el paquete.
2. Ruta reasignada mientras dispositivo está offline.
3. Operación aceptada por servidor pero respuesta perdida.
4. Reintento de la misma operación.
5. Evidencia cargada parcialmente y pérdida de conexión.
6. Dos operaciones locales sobre el mismo recurso.
7. Usuario revocado mientras permanece offline.
8. Corrección geoespacial pendiente de validación.
9. Reinicio del dispositivo con cola pendiente.
10. Cursor de pull interrumpido.

## 19. Criterios de aceptación

- Ninguna operación válida se pierde por falta de conectividad.
- Ningún reintento genera duplicados.
- El sistema reconstruye la historia de las operaciones.
- Los conflictos críticos son explícitos.
- La sincronización se reanuda después de interrupciones.
- La evidencia no se pierde por interrupción de red.
- GPS puede acumular observaciones offline.
- El servidor conserva trazabilidad de actor, dispositivo y operación.
- El cliente no obtiene datos fuera de su ámbito autorizado.
- La implementación futura puede derivarse a OpenAPI y pruebas automatizadas.

## 20. Decisiones aún abiertas

- tecnología de almacenamiento local;
- formato físico de outbox;
- mecanismo exacto de cursor;
- tamaño máximo de lotes;
- límites de payload;
- compresión de evidencia;
- protocolo de carga resumible;
- estrategia exacta de resolución de conflictos;
- background execution Android/iOS;
- frecuencia/adaptación definitiva del GPS;
- retención de evidencia según normativa cubana;
- política de limpieza local;
- recuperación ante pérdida total del dispositivo.

## 21. Relación con otros artefactos

- PR #53: decisiones funcionales de móvil, tracking, offline, POD y visibilidad.
- PR #55: arquitectura offline-first.
- Issue #56: especificación de este protocolo.
- Próximos artefactos: contrato OpenAPI de sincronización, PoC de sincronización, PoC GPS y arquitectura de evidencia.

## 22. Regla de cierre

No implementar endpoints definitivos ni persistencia local definitiva hasta que este protocolo y sus pruebas de PoC hayan sido revisados.



**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
