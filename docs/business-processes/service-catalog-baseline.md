# Catálogo Inicial de Servicios y Fronteras de Proceso

**Versión:** 0.1.0  
**Estado:** Baseline inicial para validación empresarial  
**Issue:** #18  
**Fuentes:** Ecosistema.txt, Servicio 1.txt, Servicio 2.txt, Servicio 3.txt, Servicio 4.txt, Servicio 5.txt

---

## 1. Propósito

Consolidar las cinco definiciones de servicios disponibles para SETA EXPRESO S.U.R.L. y establecer una primera separación entre servicio empresarial, proceso operativo, subprocesos y capacidades transversales.

Este documento no congela todavía requisitos funcionales, modelo de datos, API, estados definitivos ni arquitectura técnica.

## 2. Base empresarial

Ecosistema.txt declara cinco actividades de servicio además de la actividad principal de transporte de carga por carretera:

1. Clasificación, distribución, transportación y entrega de mercancías provenientes del exterior mediante una entidad transitaria estatal, y admisión, clasificación, distribución, transportación y entrega de mercancías no provenientes del exterior.
2. Alquiler y arrendamiento de vehículos automotores, excepto al turismo.
3. Transporte terrestre de personal y gestión de transportación de pasajeros con fines no turísticos.
4. Mantenimiento y reparación de vehículos automotores y motocicletas, partes y piezas, incluyendo ponchera y limpieza.
5. Explotación de aparcamientos o garajes.

La fuente también identifica los macroprocesos empresariales de Servicios, Recursos Humanos, Economía, Logística, Administración, Auditoría y Comercial.

# 3. Catálogo de los cinco servicios

## Servicio 1 — Servicio de Paquetería

### Alcance

La definición disponible distingue dos flujos de mercancías:

- mercancías provenientes del exterior recibidas mediante una entidad transitaria estatal contratante;
- mercancías nacionales/no provenientes del exterior admitidas directamente para distribución y entrega.

Criterio actualmente establecido: el nombre comercial Servicio de Paquetería se utiliza para el servicio asociado a mercancías provenientes del exterior recibidas mediante la entidad transitaria estatal. El flujo nacional debe conservarse como un servicio/modalidad diferenciada hasta validar su denominación oficial.

### Proceso operativo asociado

Gestión integral de mercancías, como concepto de proceso, comprende:

Admisión/recepción → verificación → registro e identificación → clasificación → almacenamiento → preparación → distribución → planificación de transporte → transportación → entrega → incidencias/devoluciones → cierre.

### Capacidades/subprocesos destacados

- Importación y gestión de manifiestos.
- Gestión de paquetes.
- Normalización y validación de direcciones.
- Geolocalización y ubicación cartográfica.
- Planificación y optimización de rutas.
- Asignación de vehículo y empleado.
- Ejecución de entregas.
- Evidencias de entrega.
- Entregas no procedentes.
- Tracking de paquetes y manifiestos.
- Fichas de costo.
- Auditoría y trazabilidad.

### Reglas declaradas relevantes

- Estado inicial de manifiesto y paquetes: CREADO.
- Al incorporarse a una ruta: EN RUTA DE ENTREGA.
- Resultado de entrega: ENTREGADO o NO ENTREGADO.
- Ventana de entrega declarada: 07:00–20:00.
- Marco máximo de jornada declarado: 05:00–23:00.
- Descanso declarado: 1 hora.
- Tiempo estimado declarado: 10–15 minutos por paquete.
- Un vehículo: una ruta por jornada.
- Un empleado: una ruta activa y un vehículo por jornada.

Estas reglas requieren validación formal antes de convertirse en restricciones técnicas.

## Servicio 2 — Alquiler y arrendamiento de vehículos automotores, excepto al turismo

### Objetivo

Gestionar el ciclo completo:

Disponibilidad → solicitud → evaluación → aprobación → reserva → asignación → contratación → entrega → uso → control → devolución → liquidación → cierre.

### Subprocesos declarados

1. Gestión de vehículos disponibles.
2. Solicitud de alquiler/arrendamiento.
3. Evaluación del cliente.
4. Aprobación.
5. Reserva.
6. Asignación del vehículo.
7. Contratación.
8. Preparación del vehículo.
9. Entrega.
10. Control durante el alquiler.
11. Extensiones/modificaciones.
12. Incidencias y accidentes.
13. Devolución.
14. Inspección de entrada.
15. Liquidación económica.
16. Facturación/cobro.
17. Cierre.
18. Liberación del vehículo o envío a mantenimiento.

### Fronteras

- Alquiler/arrendamiento: relación contractual temporal cliente–vehículo.
- Gestión de flota: ciclo de vida organizacional del vehículo.
- Mantenimiento: conservación/reparación técnica.
- Economía: facturación, cobros, contabilidad y resultados.

Alquiler y arrendamiento comparten el ciclo general, pero sus reglas contractuales específicas deben mantenerse diferenciadas hasta su validación.

## Servicio 3 — Gestión de Transporte de Personal y Pasajeros No Turísticos

### Alcance

Comprende dos modalidades relacionadas:

1. Transporte terrestre de personal: SETA EXPRESO ejecuta directamente el traslado.
2. Gestión de transportación de pasajeros con fines no turísticos: SETA EXPRESO gestiona, coordina o contrata la transportación.

### Objetivo

Gestionar el servicio desde la solicitud hasta el cierre, incluyendo vehículos, conductores, pasajeros, rutas, ejecución, control, seguridad, incidencias y liquidación.

### Subprocesos declarados

1. Gestión de solicitudes.
2. Planificación del transporte.
3. Gestión de rutas e itinerarios.
4. Gestión de pasajeros.
5. Asignación de vehículos.
6. Asignación de conductores.
7. Programación.
8. Ejecución.
9. Seguimiento y control.
10. Incidencias.
11. Sustituciones.
12. Transportistas terceros.
13. Seguridad.
14. Kilometraje/combustible.
15. Liquidación.
16. Facturación.
17. Atención y reclamaciones.
18. Cierre.
19. Indicadores y evaluación.

### Frontera importante

El transportista tercero es un actor externo cuando la modalidad contratada lo requiera; no debe modelarse automáticamente como empleado o recurso interno de SETA EXPRESO.

## Servicio 4 — Mantenimiento y reparación de vehículos automotores y motocicletas, partes y piezas

### Alcance

La definición disponible establece un proceso integral que incluye automóviles, vehículos comerciales, vehículos de transporte, vehículos de carga, motocicletas, partes y piezas, neumáticos/ponchera y limpieza.

### Ciclo

Solicitud → recepción → diagnóstico → presupuesto/autorización → mantenimiento/reparación → pruebas → entrega → liquidación → cierre.

### Subprocesos declarados

1. Recepción del vehículo.
2. Diagnóstico.
3. Presupuesto y autorización.
4. Mantenimiento preventivo.
5. Reparación correctiva.
6. Gestión de partes y piezas.
7. Gestión de mano de obra.
8. Ponchera/neumáticos.
9. Limpieza.
10. Control del estado de reparación.
11. Control de calidad y pruebas.
12. Entrega.
13. Facturación y cobro.
14. Gestión de residuos.
15. Garantías/retrabajos.
16. Actualización del historial.
17. Indicadores y cierre.

### Fronteras

- Mantenimiento/reparación: conserva o repara el vehículo.
- Gestión de flota: administra disponibilidad, utilización y ciclo de vida.
- Alquiler: administra la cesión temporal.
- Transporte: utiliza el vehículo para ejecutar servicios.
- Economía: administra la dimensión financiera.
- Auditoría: conserva la trazabilidad y control correspondiente.

La definición establece que Mantenimiento puede recibir vehículos propios, de flota, de clientes externos u otras áreas.

## Servicio 5 — Explotación de aparcamientos o garajes

### Objetivo

Gestionar integralmente:

Disponibilidad → acceso → estacionamiento → permanencia → salida → liquidación → control.

No se limita al cobro.

### Subprocesos declarados

1. Gestión de instalaciones.
2. Gestión de plazas.
3. Control de acceso.
4. Registro de entrada.
5. Gestión del estacionamiento.
6. Gestión de reservas.
7. Gestión de abonados.
8. Gestión de tarifas.
9. Control de permanencia.
10. Gestión de salida.
11. Gestión de cobros.
12. Gestión de incidencias.
13. Seguridad y vigilancia.
14. Mantenimiento de instalaciones.
15. Vehículos abandonados.
16. Convenios.
17. Facturación.
18. Cierre de jornada.
19. Control económico.
20. Indicadores y análisis.

### Fronteras

- Explotación de aparcamientos: administra el servicio de estacionamiento.
- Mantenimiento de vehículos: repara/mantiene vehículos.
- Gestión de flota: administra vehículos de la organización.
- Seguridad: controles generales de seguridad.
- Economía: contabilidad, facturación, cobros y resultados.
- Mantenimiento de instalaciones: conserva infraestructura y equipamiento.

# 4. Vista comparativa

| Servicio | Objeto principal | Ciclo central |
|---|---|---|
| Paquetería | Mercancías y entregas | Recepción → distribución → transporte → entrega → cierre |
| Alquiler/arrendamiento | Cesión temporal de vehículos | Solicitud → contrato → uso → devolución → liquidación |
| Transporte de personal/pasajeros | Traslado/gestión de pasajeros | Solicitud → planificación → asignación → ejecución → cierre |
| Mantenimiento/reparación | Estado técnico de vehículos | Recepción → diagnóstico → trabajo → pruebas → entrega |
| Aparcamientos/garajes | Estacionamiento | Acceso → plaza → permanencia → salida → cobro |

# 5. Capacidades transversales identificadas

Los cinco servicios comparten capacidades, pero esto no significa que deban convertirse en un único proceso empresarial.

## Personas y organización

- Clientes.
- Empleados.
- Conductores.
- Técnicos.
- Usuarios autorizados.
- Proveedores/transportistas terceros.
- Responsables de operaciones.

## Vehículos

- Identificación.
- Disponibilidad.
- Estado.
- Ubicación.
- Kilometraje.
- Combustible.
- Documentación.
- Mantenimiento.
- Historial.

## Ubicación y movilidad

- Direcciones.
- Geolocalización.
- Mapas.
- Rutas.
- Posicionamiento.
- Seguimiento.

## Incidencias

- Registro.
- Clasificación.
- Evidencias.
- Responsable.
- Resolución.
- Seguimiento.
- Cierre.

## Economía

- Tarifas.
- Costos.
- Fichas de costo.
- Presupuestos.
- Facturación.
- Cobros.
- Liquidaciones.

## Evidencias y documentos

- Fotografías.
- Identificación.
- Firmas.
- Contratos.
- Órdenes de trabajo.
- Manifiestos.
- Documentación del vehículo.

## Auditoría y trazabilidad

Los procesos requieren registrar quién realizó una operación, cuándo, sobre qué objeto y, cuando corresponda, dónde y con qué evidencia.

# 6. Relaciones entre los cinco servicios

**Alquiler → Mantenimiento:** un vehículo alquilado puede presentar una avería y entrar en mantenimiento.

**Transporte → Mantenimiento:** los vehículos utilizados para transportar personal/pasajeros requieren mantenimiento.

**Paquetería → Logística + RRHH + Economía + Auditoría:** la planificación y ejecución de entregas depende de recursos, costos, trazabilidad y control.

**Aparcamiento → Vehículos + Clientes + Economía + Mantenimiento de instalaciones:** el servicio administra vehículos estacionados, clientes, tarifas, cobros, plazas e infraestructura.

**Mantenimiento → Partes/Piezas + Economía + Historial de vehículos:** las reparaciones generan consumo de piezas, mano de obra, costos e historial técnico.

# 7. Fronteras que debemos preservar

No debemos fusionar prematuramente:

- Alquiler con Gestión de Flota.
- Mantenimiento con Gestión de Flota.
- Transporte de pasajeros con Gestión de Flota.
- Aparcamiento con Gestión de Flota.
- Economía con la liquidación específica de cada servicio.
- Auditoría con los procesos operativos.
- Seguridad con la explotación del aparcamiento.
- Transportistas terceros con empleados internos.

Estas relaciones deben resolverse mediante interfaces y responsabilidades de proceso, no mediante duplicación de conceptos.

# 8. Situación actual del modelo empresarial

A partir de las fuentes disponibles, podemos establecer provisionalmente:

Empresa → Macroproceso Servicios → 5 servicios identificados → procesos/subprocesos operativos → capacidades transversales de RRHH, Economía, Logística, Administración, Auditoría y Comercial.

Esta estructura es una hipótesis de organización empresarial para validación, no una decisión definitiva sobre módulos de software.

# 9. Cuestiones abiertas

1. Nombre oficial del servicio nacional de mercancías asociado al segundo flujo de Servicio 1.
2. Si Paquetería y el flujo nacional son servicios distintos o modalidades de un servicio superior.
3. Relación exacta entre Servicios y el macroproceso de Logística.
4. Definición formal de Gestión de Flota.
5. Definición detallada de Recursos Humanos.
6. Definición detallada de Economía.
7. Definición detallada de Administración.
8. Definición detallada de Auditoría.
9. Definición detallada de Comercial.
10. Catálogo común de incidencias.
11. Catálogo común de documentos y evidencias.
12. Catálogo de estados y transiciones por servicio.
13. Responsabilidades exactas de cada actor.
14. Reglas legales/contractuales específicas de alquiler y arrendamiento.
15. Reglas económicas y normativas específicas de cada servicio.

# 10. Principio de ingeniería

Los cinco servicios no deben convertirse automáticamente en cinco módulos aislados del software.

Primero debemos determinar:

Servicio → Proceso → Subproceso → Actividad → Regla → Información → Actor → Evidencia → Resultado

Después se determinará la correspondencia con:

Dominio → Bounded Context → Módulo → Caso de uso → API → Persistencia → UI

Esto mantiene separada la realidad empresarial de la estructura técnica.

# 11. Trazabilidad

Ecosistema.txt + Servicio 1.txt + Servicio 2.txt + Servicio 3.txt + Servicio 4.txt + Servicio 5.txt
→ Catálogo de Servicios #18
→ Mapa integral de procesos
→ Ingeniería de requisitos
→ Modelo de dominio
→ Arquitectura
→ Implementación
→ Pruebas

**Estado:** Baseline inicial para validación empresarial.
