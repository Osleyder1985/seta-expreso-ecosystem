# Casos de uso de Paquetería — v0.1.0

**Estado:** propuesta de especificación funcional y de dominio  
**Base:** modelo conceptual v0.1.0, extracción normativa v0.3.0, máquina de estados v0.1.0, manifiesto real 649-31382945 y modelo de dominio v0.2.0.

## 1. Objetivo

Definir los casos de uso que deberán validar el modelo de dominio antes de diseñar el esquema PostgreSQL definitivo y los endpoints de la API.

Los casos se expresan desde el comportamiento del negocio, no desde pantallas ni tablas.

## 2. Actores

### Actores internos

- Operador de Paquetería: recibe, revisa e importa documentación; gestiona expediciones.
- Supervisor de Paquetería: autoriza o revisa excepciones y operaciones sensibles.
- Operador de Distribución: prepara rutas, paradas y entregas.
- Conductor/Repartidor: ejecuta rutas, intentos y evidencias.
- Administrador del sistema: administra configuración y permisos transversales.
- Auditor: consulta trazabilidad y evidencias sin alterar la operación.

### Actores externos

- Agente/transitario: origen documental de información del manifiesto.
- Entidad de tránsito/carga externa: actor externo del flujo logístico.
- Autoridad aduanera: actor externo; el sistema registra sus actuaciones/resultados, no las ejecuta como autoridad.
- Destinatario/Receptor: persona que recibe la mercancía.
- Proveedor de geocodificación/mapas: servicio técnico externo.

## 3. Convenciones

Cada caso contiene:

- objetivo;
- precondiciones;
- flujo principal;
- excepciones;
- postcondiciones;
- invariantes;
- trazabilidad.

Los identificadores UC-01…UC-20 son estables y no deben reutilizarse para otro significado.

---

## UC-01 — Registrar/ingestar manifiesto

**Actor principal:** Operador de Paquetería.

**Objetivo:** incorporar al sistema un archivo de manifiesto sin perder su información original.

**Precondiciones**
- archivo disponible;
- formato soportado;
- usuario autorizado.

**Flujo principal**
1. Seleccionar archivo.
2. Calcular hash.
3. Identificar hoja y estructura.
4. Extraer cabecera.
5. Extraer filas House.
6. Conservar valores originales y posiciones.
7. Crear resultado de ingesta.
8. Ejecutar validaciones iniciales.

**Excepciones**
- formato no soportado;
- hoja inexistente;
- columnas obligatorias ausentes;
- archivo corrupto;
- duplicado de archivo según política.

**Postcondición**
Existe una representación trazable de la fuente y un resultado de validación.

**Reglas:** I01, I02.

---

## UC-02 — Validar manifiesto

**Actor principal:** Operador de Paquetería.

**Objetivo:** determinar si la información puede incorporarse al dominio.

**Validaciones**
- estructura;
- tipos;
- campos obligatorios;
- Master AWB;
- House;
- peso;
- cantidad de bultos;
- personas;
- identificaciones;
- dirección;
- unidad de destino;
- duplicidades;
- reglas de negocio aplicables.

**Resultado**
Cada fila puede quedar:
- aceptada;
- aceptada con advertencias;
- rechazada.

Las discrepancias globales se registran aparte.

**Reglas:** I03, I07.

---

## UC-03 — Conciliar totales del manifiesto

**Actor:** Operador/Supervisor.

**Objetivo:** comparar valores declarados con valores derivados.

**Controles**
- cantidad de House;
- peso total;
- sacas/bultos cuando sean comparables;
- personas cuando la estructura permita reconciliación.

**Regla fundamental**
Una discrepancia no elimina datos válidos.

**Salida**
ManifestDiscrepancyDetected.

**Reglas:** M-04, M-05, M-06.

---

## UC-04 — Aceptar importación

**Actor:** Supervisor u operador autorizado.

**Objetivo:** convertir una importación validada en información operativa.

**Precondiciones**
- validación completada;
- errores bloqueantes resueltos o política de aceptación parcial aplicada.

**Postcondiciones**
- Manifest registrado;
- House aceptados registrados;
- personas/direcciones vinculadas según reglas;
- trazabilidad conservada;
- estado documental actualizado.

No requiere geocodificación exitosa.

---

## UC-05 — Registrar/actualizar House

**Actor:** Operador/Supervisor.

**Objetivo:** gestionar una expedición documental.

**Reglas**
- House conserva su valor original;
- identidad única según ámbito cerrado posteriormente;
- modificación condicionada al estado;
- cambios auditables;
- no alterar silenciosamente la fuente importada.

**Excepciones**
- House duplicado;
- estado no modificable;
- modificación sin autorización.

---

## UC-06 — Registrar unidades físicas

**Actor:** Operador.

**Objetivo:** representar físicamente el contenido de un House.

**Regla**
House puede tener N PhysicalUnit.

La cantidad declarada del manifiesto no debe confundirse automáticamente con una fila física individual.

**Excepción**
No permitir inconsistencia entre unidades registradas y reglas de conciliación sin registrar la discrepancia.

---

## UC-07 — Resolver personas y roles

**Actor:** Operador.

**Objetivo:** asociar remitente y destinatario con una Person sin crear duplicados incorrectos.

**Reglas**
- nombre no basta para fusionar personas;
- Passport/CI se conservan como identificación de origen;
- Sender y Recipient son roles;
- Customer no se infiere automáticamente.

---

## UC-08 — Normalizar y validar dirección

**Actor:** sistema + operador cuando exista revisión.

**Flujo**
OriginalAddress → Parse → Normalize → Validate → Review.

**Reglas**
- conservar texto original;
- conservar resultado de normalización;
- registrar versión/procedimiento;
- no sobrescribir silenciosamente información anterior.

**Resultado**
Dirección validada, advertida o rechazada.

---

## UC-09 — Geocodificar dirección

**Actor:** sistema.

**Objetivo:** obtener coordenadas para un destino operativo.

**Precondiciones**
- dirección suficientemente normalizada;
- proveedor disponible.

**Postcondiciones**
- resultado guardado;
- latitud/longitud;
- proveedor;
- referencia externa;
- confianza;
- fecha;
- versión/procedimiento.

**Excepciones**
- sin coincidencia;
- múltiples coincidencias;
- baja confianza;
- proveedor no disponible.

Una dirección no geocodificada no invalida necesariamente el manifiesto.

---

## UC-10 — Crear punto de entrega

**Actor:** Operador de Distribución.

**Objetivo:** convertir una dirección utilizable en un destino operacional.

**Reglas**
- DeliveryPoint no es sinónimo de Address;
- puede reutilizarse para varios House;
- debe tener información suficiente para la operación;
- una geolocalización puede ser necesaria para planificación, según política.

---

## UC-11 — Preparar distribución

**Actor:** Operador de Distribución.

**Objetivo:** identificar House/DeliveryPoint aptos para distribución.

**Precondiciones**
- recepción compatible;
- controles aduaneros compatibles;
- información de destino suficiente;
- incidencias bloqueantes resueltas.

**Resultado**
Los objetos aptos pasan a READY_FOR_DISTRIBUTION.

---

## UC-12 — Crear y planificar ruta

**Actor:** Operador de Distribución.

**Objetivo:** crear una Route con paradas ordenadas.

**Datos**
- fecha;
- origen;
- destino;
- vehículo;
- conductor;
- DeliveryPoint;
- secuencia;
- tiempos planificados.

La optimización automática será un servicio posterior y debe poder sustituirse.

---

## UC-13 — Ejecutar ruta

**Actor:** Conductor/Repartidor.

**Flujo**
1. Iniciar ruta.
2. Navegar a parada.
3. Registrar llegada.
4. Ejecutar entregas.
5. Registrar salida.
6. Continuar siguiente parada.
7. Completar ruta.

Debe conservarse tiempo planificado frente a tiempo real.

---

## UC-14 — Ejecutar intento de entrega

**Actor:** Conductor/Repartidor.

**Objetivo:** registrar un intento real.

**Resultado posible**
- entrega exitosa;
- entrega fallida;
- resultado operativo especial pendiente de catálogo.

Cada intento tiene identidad propia.

---

## UC-15 — Registrar entrega exitosa y POD

**Actor:** Conductor/Repartidor.

**Precondiciones**
- intento activo;
- mercancía apta;
- receptor identificado según procedimiento.

**Postcondiciones**
- Delivery = DELIVERED;
- POD registrado;
- hora y localización registradas;
- evidencia asociada;
- transición trazable.

El mínimo obligatorio de POD permanece pendiente de confirmación operacional.

---

## UC-16 — Registrar entrega fallida y reintento

**Actor:** Conductor/Repartidor / Operador.

**Flujo**
1. Registrar intento.
2. Determinar motivo.
3. Marcar DELIVERY_FAILED.
4. Registrar evidencia/observación.
5. Crear RETRY_SCHEDULED si corresponde.
6. Ejecutar nuevo ATTEMPTED.

Un intento anterior nunca se sobrescribe.

---

## UC-17 — Gestionar devolución

**Actor:** Operador/Supervisor.

**Objetivo:** gestionar mercancía que no será entregada en el intento actual y debe retornar.

**Flujo**
DELIVERY_FAILED → RETURN_PENDING → RETURNED.

No debe confundirse con abandono aduanero.

---

## UC-18 — Registrar incidencia

**Actor:** cualquier actor autorizado según tipo.

**Objetivo:** registrar anomalías que afectan a manifest, House, recepción, custodia, distribución, ruta, entrega o transporte.

**Requisitos**
- tipo;
- descripción;
- fecha/hora;
- actor;
- evidencia cuando proceda;
- resolución;
- trazabilidad.

---

## UC-19 — Consultar trazabilidad

**Actor:** Supervisor/Auditor/roles autorizados.

**Objetivo:** reconstruir el ciclo de una expedición.

Debe ser posible navegar:

archivo → manifest → Master AWB → House → unidades → personas → dirección → geolocalización → punto de entrega → ruta → parada → intentos → POD/incidencias.

No debe depender exclusivamente del estado actual.

---

## UC-20 — Aplicar transición de estado

**Actor:** sistema como servicio de dominio, invocado por operaciones autorizadas.

**Objetivo:** garantizar que las transiciones sean válidas.

**Reglas**
- estado anterior;
- evento;
- nuevo estado;
- actor;
- fecha/hora;
- motivo/referencia;
- StatusHistory.

El sistema debe rechazar transiciones incompatibles.

---

# 4. Reglas transversales

## RT-01 — Auditabilidad

Toda modificación operacional relevante debe poder atribuirse a actor, fecha/hora y motivo/referencia.

## RT-02 — Preservación de fuente

Los datos originales del manifiesto no se sobrescriben por normalización.

## RT-03 — Idempotencia

La reimportación del mismo archivo debe ser detectable mediante hash y política de importación.

Los comandos que puedan reintentarse por fallos de red deberán diseñarse con claves de idempotencia cuando corresponda.

## RT-04 — Errores parciales

Una fila inválida no invalida automáticamente todo el manifiesto, salvo que una regla posterior determine que la inconsistencia es global y bloqueante.

## RT-05 — Separación de responsabilidades

SETA registra y opera sobre información logística y resultados externos; no atribuye al sistema facultades de una autoridad aduanera.

## RT-06 — Estado multidimensional

No sustituir las seis dimensiones por un único PackageStatus.

## RT-07 — Historial

Las transiciones importantes son hechos históricos y no deben perderse al actualizar el estado actual.

## RT-08 — Geocodificación desacoplada

El manifiesto puede quedar persistido aunque una dirección no pueda geocodificarse inmediatamente.

---

# 5. Matriz de validación D01–D12

| Decisión | Casos que la validan |
|---|---|
| D01 | UC-01, UC-04, UC-05, UC-19 |
| D02 | UC-05, UC-06 |
| D03 | UC-01, UC-04, UC-05 |
| D04 | UC-06 |
| D05 | UC-07 |
| D06 | UC-07, procesos comerciales futuros |
| D07 | UC-08, UC-10 |
| D08 | UC-10, UC-12, UC-13 |
| D09 | UC-14, UC-15 |
| D10 | UC-16, UC-17 |
| D11 | UC-11, UC-13, UC-14, UC-20 |
| D12 | UC-15 |

# 6. Casos de prueba de aceptación iniciales

### Importación

**AT-01:** archivo válido → importación aceptada.

**AT-02:** mismo archivo nuevamente → duplicado detectado según política.

**AT-03:** House declarado ≠ filas → discrepancia registrada.

**AT-04:** peso declarado ≠ suma → discrepancia registrada.

**AT-05:** una fila inválida → filas válidas preservadas.

### Dominio

**AT-06:** House con 3 PhysicalUnit → válido.

**AT-07:** dos House con misma dirección → pueden compartir DeliveryPoint.

**AT-08:** dos personas con mismo nombre pero identificaciones distintas → no fusionar automáticamente.

**AT-09:** dirección normalizada conserva original.

**AT-10:** geocodificación fallida no elimina la dirección.

### Entrega

**AT-11:** intento fallido permanece después de programar reintento.

**AT-12:** segundo intento crea nuevo registro.

**AT-13:** entrega exitosa genera POD conforme al mínimo vigente.

**AT-14:** fallo de entrega no cambia automáticamente estado aduanero a abandono.

### Estados

**AT-15:** transición válida → aceptada y auditada.

**AT-16:** transición prohibida → rechazada sin alterar estado anterior.

### Trazabilidad

**AT-17:** una House puede reconstruirse desde fuente de importación hasta entrega/incidencia.

---

# 7. Huecos que bloquean el cierre del dominio

Los siguientes puntos no deben resolverse por intuición de software:

1. Jerarquía legal/operacional exacta Master AWB → Guide → House.
2. Definición oficial/operacional de House frente a bulto/saca.
3. Regla real para agrupar varios House en una Delivery.
4. Requisitos mínimos de POD.
5. Catálogo y significado de Unidad de destino.
6. Reglas de recepción con discrepancias.
7. Estados aduaneros exactos que SETA necesita registrar.
8. Reglas de devolución/reembarque frente a abandono.
9. Permisos necesarios para modificar/cancelar información en cada etapa.
10. Reglas de almacenamiento y liberación que afectan a distribución.

Estos huecos se resolverán mediante evidencia oficial y procedimiento operativo, no mediante decisiones arbitrarias de persistencia.

# 8. Criterio de salida

Antes de diseñar PostgreSQL definitivo:

- UC-01…UC-20 deben ser revisados contra el procedimiento real;
- D01, D09 y D12 deben cerrarse;
- catálogo UnitDestination debe tener fuente;
- estados jurídicos relevantes deben tener evidencia;
- reglas de modificación/cancelación deben estar definidas;
- casos AT-01…AT-17 deben convertirse en pruebas de aceptación.

**Conclusión de esta versión:** el modelo de dominio ya puede utilizarse para estructurar la especificación funcional y los tests; todavía no debe congelarse como esquema físico de base de datos.
