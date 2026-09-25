# Aplicaciones móviles operativas y cliente — v0.1.0

**Issue:** #50  
**Estado:** Propuesto para implementación incremental  
**Ámbito:** Ecosistema SETA EXPRESO SURL / Paquetería  
**Última actualización:** 2026-09-25

---

## 1. Propósito

Las aplicaciones móviles forman parte del sistema operativo del Ecosistema y no constituyen clientes independientes con reglas de negocio propias.

Se distinguen dos grandes superficies móviles:

1. **Aplicación móvil operativa** para el personal que ejecuta las rutas en terreno.
2. **Aplicación móvil del cliente** para consulta de sus envíos, estados, seguimiento y evidencias autorizadas.

Ambas consumen los mismos servicios de negocio del backend y deben respetar los mismos contratos REST/OpenAPI, reglas de autorización, auditoría y trazabilidad.

---

## 2. Aplicación móvil operativa

### 2.1 Usuarios

Los usuarios principales son:

- Chofer/conductor.
- Segundo miembro de tripulación, denominado provisionalmente **conductor/comercial**. El nombre formal del cargo continúa pendiente de verificación.

La aplicación debe identificar al usuario autenticado y sus permisos, pero la ejecución de una ruta debe modelarse mediante las asignaciones de vehículo y tripulación definidas por el dominio.

### 2.2 Inicio de jornada

El usuario debe poder consultar:

- rutas asignadas;
- vehículo asignado;
- compañero de tripulación;
- horario planificado;
- origen y destino;
- tipo de ruta (abierta/cerrada);
- secuencia de paradas;
- paquetes/bultos que forman parte de la ejecución;
- instrucciones operativas relevantes;
- restricciones y alertas.

La aplicación no decide por sí misma qué ruta corresponde al trabajador. El backend determina la asignación y la aplicación la presenta.

### 2.3 Ejecución de ruta

Durante la jornada, la aplicación debe permitir:

- iniciar la ejecución;
- visualizar la ruta sobre mapa;
- visualizar las paradas ordenadas;
- visualizar los paquetes asociados a cada parada;
- registrar progreso;
- consultar información necesaria para ejecutar la entrega;
- registrar incidencias;
- registrar intentos de entrega;
- cerrar la ejecución cuando corresponda.

Debe distinguirse siempre:

**Route Plan != Route Execution**

El plan representa lo previsto; la ejecución representa lo ocurrido realmente.

---

## 3. Posicionamiento del vehículo y del personal

El teléfono móvil proporciona servicios de localización que pueden utilizarse para obtener observaciones de posición.

### 3.1 Observación de posición

Una posición debe registrarse como un dato temporal y contextual, por ejemplo:

- usuario/dispositivo;
- fecha y hora;
- latitud;
- longitud;
- precisión, cuando esté disponible;
- operación/ruta asociada;
- origen de la observación;
- estado de sincronización.

La posición observada no debe confundirse con una dirección postal ni con una coordenada geocodificada.

### 3.2 Tracking operativo

El backend puede construir el tracking de la ruta a partir de:

- posiciones recibidas;
- eventos de ruta;
- inicio/fin;
- llegada/salida de paradas;
- entregas;
- incidencias;
- otros hitos operativos.

La aplicación del personal debe poder mostrar la ejecución actual de la ruta y el vehículo sobre el mapa cuando la información esté disponible.

### 3.3 Conectividad

El escenario operativo supone teléfono con:

- GPS/servicio de localización;
- conectividad móvil de datos.

Sin embargo, la solución no debe asumir conectividad permanente. Debe diseñarse para:

**capturar localmente -> proteger/encolar -> sincronizar -> confirmar**

La sincronización debe ser idempotente y auditable.

---

## 4. Corrección geoespacial en campo

Esta es una capacidad específica derivada de la operación real.

Una dirección puede haber sido:

1. introducida desde el manifiesto;
2. normalizada;
3. geocodificada;
4. considerada operacionalmente válida;
5. y posteriormente resultar desplazada o incorrecta al llegar el personal al terreno.

El usuario operativo debe poder proponer/capturar una ubicación real observada en campo.

### 4.1 Regla fundamental

**Geocodificación != validación de dirección != corrección geoespacial en campo**

Una corrección en campo no debe sobrescribir silenciosamente la historia.

Debe conservarse, como mínimo:

- ubicación anterior;
- nueva ubicación propuesta/confirmada;
- fecha/hora;
- usuario que la realizó;
- operación/ruta/entrega relacionada;
- fuente de la posición;
- precisión disponible;
- motivo, cuando corresponda;
- evidencia asociada, si existe;
- estado de revisión/aprobación cuando el cambio afecte datos maestros.

### 4.2 Modelo conceptual

**Address**
-> ubicación geocodificada original

**AddressLocationRevision**
-> nueva observación/corrección

**FieldObservation**
-> contexto de la observación en terreno

La solución física se definirá posteriormente; este documento establece el comportamiento requerido, no un esquema SQL definitivo.

### 4.3 Reutilización futura

Cuando una corrección sea validada y aprobada como dato maestro, podrá mejorar futuras rutas y geocodificaciones del mismo punto.

No debe asumirse que toda observación de un trabajador se convierte automáticamente en la ubicación maestra.

---

## 5. Entrega de paquetes

Desde la aplicación operativa se debe poder ejecutar el proceso:

**Parada -> paquete/bulto -> intento de entrega -> resultado -> evidencia**

Resultados mínimos:

- ENTREGADO;
- NO ENTREGADO;
- incidencia asociada, cuando corresponda.

Debe conservarse el historial de intentos.

### 5.1 Entrega exitosa

La aplicación debe permitir capturar las evidencias definidas por el dominio, actualmente contempladas como:

- fotografía del documento de identidad del receptor asociada al paquete;
- fotografías del estado/integridad del paquete;
- firma del receptor;
- confirmación de ENTREGADO.

El conjunto mínimo definitivo de POD continúa sujeto al cierre de la decisión B-03.

### 5.2 Entrega fallida

Cuando no pueda realizarse la entrega:

- registrar el intento;
- registrar el motivo;
- marcar operacionalmente el resultado correspondiente;
- mantener el paquete dentro del circuito de reintento/devolución;
- permitir la posterior reprogramación.

**Delivery Attempt != Delivery**

**Delivery Failure != terminal closure**

---

## 6. Incidencias

El personal debe poder registrar incidencias desde el terreno.

Una incidencia debe quedar vinculada al objeto operacional correspondiente, por ejemplo:

- ruta;
- parada;
- entrega;
- intento;
- paquete/bulto;
- vehículo;
- ubicación.

El sistema debe conservar fecha, usuario, contexto y evidencias disponibles.

---

## 7. Aplicación móvil del cliente

La aplicación del cliente tiene un propósito diferente: **visibilidad y consulta controlada**, no ejecución operacional.

### 7.1 Consulta de envíos

El cliente debe poder consultar:

- sus envíos actuales;
- paquetes/bultos asociados;
- información relevante del envío;
- estado/hitos;
- historial.

### 7.2 Tracking

El cliente debe poder consultar el recorrido lógico del envío mediante un timeline de eventos/milestones.

Ejemplo conceptual:

**Recepcionado -> En proceso aduanero -> Liberado/resultado registrado -> En custodia -> Preparado para distribución -> En ruta -> Intento de entrega -> Entregado**

Los estados concretos visibles al cliente dependerán del modelo de visibilidad que se defina.

El tracking del cliente debe derivarse del historial operacional real y no de un texto estático.

### 7.3 Ubicación y avance

Cuando exista información de tracking suficiente y el usuario tenga autorización, el cliente podrá consultar:

- posición/avance del vehículo;
- ruta en ejecución;
- parada o zona aproximada;
- progreso;
- información temporal estimada.

La exposición exacta de la posición debe definirse mediante reglas de privacidad y seguridad. No se debe asumir que la posición GPS cruda del dispositivo debe ser visible permanentemente al cliente.

### 7.4 Importe aduanero

El cliente debe poder consultar el importe aduanero registrado para su bulto cuando ese dato esté disponible y sea autorizado para su visualización.

La naturaleza jurídica, fuente y semántica definitiva de este importe continúan pendientes de verificación documental.

### 7.5 Fecha de entrega

El cliente debe poder consultar una fecha/hora:

- estimada;
- propuesta;
- planificada;
- o confirmada,

según el nivel de certeza disponible.

La interfaz debe distinguir una estimación de una confirmación.

---

## 8. Historial del cliente

El cliente debe poder consultar su historial autorizado:

- envíos anteriores;
- entregas anteriores;
- paquetes/bultos;
- recibos/comprobantes;
- resultados de entrega;
- intentos, cuando sea apropiado;
- evidencias disponibles.

La consulta histórica debe ser de solo lectura salvo que un proceso específico autorice una acción del cliente.

---

## 9. Evidencias de entrega para el cliente

Cuando una entrega tenga evidencias disponibles y exista autorización para mostrarlas, el cliente podrá consultar las evidencias relacionadas.

Ejemplos:

- fotografía del documento de identidad;
- fotografías del paquete;
- firma;
- comprobante/recibo.

La publicación de evidencias debe respetar:

- autorización;
- privacidad;
- protección de datos;
- control de acceso;
- retención;
- trazabilidad de acceso.

No toda evidencia interna tiene que ser automáticamente visible al cliente.

---

## 10. Arquitectura de interacción

Las dos aplicaciones móviles deben consumir un backend común.

**Aplicación operativa**
-> API REST/OpenAPI
-> módulos de negocio
-> PostgreSQL/PostGIS
-> almacenamiento de evidencias
-> adaptadores externos

**Aplicación cliente**
-> API REST/OpenAPI
-> capa de autorización/visibilidad
-> módulos de negocio
-> PostgreSQL/PostGIS
-> almacenamiento de evidencias
-> tracking/eventos

Las reglas de negocio no deben duplicarse en Android/iOS.

---

## 11. Capacidades funcionales identificadas

| ID | Capacidad | Superficie |
|---|---|---|
| MOB-01 | Autenticación y contexto operativo | Personal |
| MOB-02 | Consulta de rutas asignadas | Personal |
| MOB-03 | Ejecución de ruta | Personal |
| MOB-04 | Mapa y navegación operativa | Personal |
| MOB-05 | Posicionamiento GPS | Personal |
| MOB-06 | Tracking de vehículo/ruta | Personal + Cliente |
| MOB-07 | Registro de entrega | Personal |
| MOB-08 | Registro de intento | Personal |
| MOB-09 | Evidencias/POD | Personal + Cliente autorizado |
| MOB-10 | Incidencias | Personal |
| MOB-11 | Corrección geoespacial en campo | Personal |
| MOB-12 | Sincronización offline/online | Personal |
| MOB-13 | Consulta de envíos | Cliente |
| MOB-14 | Timeline de tracking | Cliente |
| MOB-15 | Consulta de importe aduanero | Cliente |
| MOB-16 | Fecha estimada/propuesta de entrega | Cliente |
| MOB-17 | Historial de envíos/entregas | Cliente |
| MOB-18 | Recibos/comprobantes | Cliente |
| MOB-19 | Consulta de evidencias autorizadas | Cliente |

---

## 12. Requisitos de seguridad y trazabilidad

Las capacidades móviles requieren como mínimo:

- autenticación fuerte;
- autorización por rol y contexto;
- protección de tokens/credenciales;
- cifrado de comunicaciones;
- control de acceso a evidencias;
- auditoría de operaciones críticas;
- auditoría de cambios de ubicación;
- protección contra duplicación de eventos;
- idempotencia de sincronización;
- control de dispositivos/sesiones;
- política de retención;
- trazabilidad de acceso a información sensible.

La implementación concreta se definirá en los requisitos de seguridad del Ecosistema.

---

## 13. Decisiones que permanecen abiertas

Este documento no cierra:

- proveedor cartográfico;
- proveedor de geocodificación;
- proveedor de routing;
- proveedor de tracking externo;
- almacenamiento concreto de fotografías/evidencias;
- política exacta de exposición de posición al cliente;
- frecuencia de envío de posiciones GPS;
- estrategia definitiva offline-first;
- política de precisión mínima para aceptar una corrección geoespacial;
- aprobación automática/manual de correcciones de dirección;
- política de privacidad y retención de fotografías;
- mínimo definitivo de POD;
- nomenclatura oficial del segundo miembro de tripulación.

Estas decisiones deben evaluarse mediante requisitos, seguridad, coste, cobertura en Cuba, rendimiento y PoC cuando corresponda.

---

## 14. Invariantes

1. **Mobile App != Domain Logic.**
2. **GPS Observation != Address.**
3. **Geocoding != Address Validation.**
4. **Field Correction != Silent Overwrite.**
5. **Route Plan != Route Execution.**
6. **Delivery != Delivery Attempt.**
7. **Tracking != Raw GPS Feed.**
8. **Evidence != Delivery Status.**
9. **Customer Visibility != Internal Operational Data.**
10. **Offline Capture != Uncontrolled Local Mutation.**
11. **Current State != Historical Timeline.**
12. **Archive != Deletion.**

---

## 15. Relación con el modelo global de logística

Estas capacidades implementan patrones ya adoptados en el benchmark global de logística:

- Mobile Operational Execution;
- Event/Milestone History;
- Exception Management;
- Route Planning vs Execution;
- Delivery Attempt History;
- Composite POD;
- Integration Adapter Layer;
- Operational Visibility / Control Tower;
- AI-ready historical data.

La adopción no implica seleccionar un producto comercial específico ni cambiar la arquitectura base del Ecosistema.

---

## 16. Próximos artefactos derivados

Este documento deberá alimentar posteriormente:

1. requisitos funcionales móviles;
2. casos de uso de ejecución de ruta;
3. contratos API de operación móvil;
4. contratos API de tracking;
5. modelo de eventos de posición;
6. modelo de evidencias/POD;
7. modelo de revisión de ubicación;
8. modelo de sincronización offline;
9. matriz de permisos;
10. pruebas de aceptación móviles;
11. ADR de estrategia mobile/offline;
12. ADR de tracking y exposición de ubicación.

No se debe implementar el modelo físico definitivo hasta cerrar las decisiones de dominio que lo condicionan.
