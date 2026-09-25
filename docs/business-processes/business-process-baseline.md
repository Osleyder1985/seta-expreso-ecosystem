# Baseline Integral de Procesos Empresariales

**Versión:** 0.1.0  
**Estado:** En validación
**Fuente primaria:** `Ecosistema.txt`  
**Issue:** #16

---

## 1. Propósito

Establecer el primer mapa estructurado de los procesos empresariales que el Ecosistema de SETA EXPRESO S.U.R.L. debe gestionar y, cuando sea posible, automatizar.

Este documento reproduce y organiza la información declarada en `Ecosistema.txt`. No constituye todavía el modelo definitivo de procesos, requisitos, datos ni arquitectura.

---

## 2. Objetivo empresarial

El archivo fuente establece como objetivo:

- Gestionar y controlar todos los procesos que se desarrollan en la MIPYME SETA EXPRESO S.U.R.L.
- Automatizar todos los procesos posibles que se desarrollan en la MIPYME SETA EXPRESO S.U.R.L.

Por tanto, el alcance del Ecosistema es empresarial e integral, no limitado al servicio de paquetería.

---

## 3. Actividades empresariales declaradas

### 3.1. Actividad principal

**Transporte de Carga por Carretera.**

### 3.2. Otras actividades

1. Brindar servicio de clasificación, distribución, transportación y entrega de mercancías provenientes del exterior contratadas a una entidad transitaria estatal, así como brindar servicios de admisión, clasificación, distribución, transportación y entrega de mercancías no provenientes del exterior.
2. Alquiler y arrendamiento de vehículos automotores, excepto al turismo.
3. Brindar servicios de transporte de personal por vía terrestre y servicios de gestión de transportación de pasajeros con fines no turísticos.
4. Brindar servicios de mantenimiento y reparación de vehículos automotores y motocicletas, así como de sus partes y piezas, incluidos los servicios de ponchera y limpieza de los mismos.
5. Explotación de aparcamientos o garajes.

---

## 4. Macroprocesos declarados

El archivo identifica los siguientes procesos:

1. **Servicios**
2. **Recursos Humanos**
3. **Economía**
4. **Logística**
5. **Administración**
6. **Auditoría**
7. **Comercial**

La fuente proporciona además una primera descomposición para algunos de ellos.

### 4.1. Servicios

La fuente identifica cinco servicios como elementos iniciales:

- Servicio 1
- Servicio 2
- Servicio 3
- Servicio 4
- Servicio 5

Los nombres y características de estos servicios todavía no están definidos en la fuente y deben levantarse posteriormente.

### 4.2. Recursos Humanos

Se identifica como macroproceso empresarial. Su descomposición detallada queda pendiente en este baseline.

### 4.3. Economía

Se identifica como macroproceso empresarial. Su descomposición detallada queda pendiente en este baseline.

### 4.4. Logística

La fuente identifica:

- Almacenes
- Transporte
- Combustible

### 4.5. Administración

La fuente identifica:

- Usuarios
- Personas
- Roles
- Permisos

### 4.6. Auditoría

Se identifica como macroproceso empresarial. Su descomposición detallada queda pendiente en este baseline.

### 4.7. Comercial

Se identifica como macroproceso empresarial. Su descomposición detallada queda pendiente en este baseline.

---

## 5. Aplicaciones y actores

El Ecosistema se plantea mediante tres aplicaciones.

### 5.1. Aplicación Web

Propósito declarado:

- Administración del Ecosistema completo.
- Administración y gestión de todos los procesos.

Usuarios declarados:

- Administradores.
- Empleados de la MIPYME.
- Usuarios autorizados.

### 5.2. Aplicación Mobile Android

Usuarios declarados:

**Empleados**
- Registrar entregas.
- Registrar incidencias.
- Consultar rutas.
- Otras operaciones que se definan posteriormente.

**Clientes**
- Consultar información de sus cargas.

### 5.3. Aplicación Mobile iOS

Usuarios declarados:

**Empleados**
- Registrar entregas.
- Registrar incidencias.
- Consultar rutas.
- Otras operaciones que se definan posteriormente.

**Clientes**
- Consultar información de sus cargas.

---

# 6. Servicio de Paquetería

La fuente contiene una especificación inicial considerablemente más detallada para este servicio.

## 6.1. Importación del manifiesto

Entrada:

- `Manifiesto.xlsx`

Operaciones declaradas:

1. Importar el manifiesto.
2. Guardar todos los datos del manifiesto.
3. Cambiar el estado de los paquetes del manifiesto a **CREADO**.
4. Cambiar el estado del manifiesto a **CREADO**.

## 6.2. Gestión de manifiestos

Se requieren las operaciones:

- Adicionar manifiesto.
- Modificar manifiesto.
- Eliminar manifiesto.
- Listar manifiestos.

## 6.3. Normalización de direcciones

Se requiere normalizar las direcciones de los destinatarios.

La estructura objetivo declarada es:

**Calle → Número de Casa → E/ entreCalle1 y entreCalle2 → Reparto → Municipio → Provincia**

La normalización debe acotejar la información disponible a dicha estructura.

## 6.4. Geolocalización

Se requiere:

1. Enviar direcciones.
2. Recibir las coordenadas correspondientes a la dirección.
3. Asociar las coordenadas a la información de la dirección/paquete.

El archivo no establece todavía un proveedor concreto de geocodificación.

## 6.5. Ubicación de paquetes en el mapa

Se requiere mostrar los paquetes en el mapa utilizando las coordenadas asociadas a sus direcciones.

El archivo no establece todavía un proveedor cartográfico concreto.

---

# 7. Planificación y optimización de rutas

El servicio requiere crear rutas optimizadas para realizar entregas.

## 7.1. Puntos de inicio y fin

La creación de rutas debe considerar:

- Punto de inicio.
- Punto de fin.

Se declaran dos tipos:

1. Punto de inicio y punto de fin distintos.
2. Punto de inicio y punto de fin iguales.

## 7.2. Selección de paquetes

El sistema debe seleccionar los paquetes que puedan entregarse en una ruta considerando las restricciones declaradas.

### Tiempo de entrega

- **10 a 15 minutos por paquete.**

### Jornada de trabajo

- Marco máximo: **5:00 AM a 11:00 PM**.

### Ventana para entregas

- **7:00 AM a 8:00 PM**.

### Descanso

- **1 hora por jornada de trabajo**.

## 7.3. Reglas de asignación declaradas

Pueden existir varias rutas dentro de una misma jornada de trabajo.

Sin embargo:

- Un vehículo solo puede tener **1 ruta por jornada de trabajo**.
- Un empleado solo puede tener **una ruta activa y un vehículo** en una misma jornada de trabajo.

## 7.4. Estado al incorporar paquetes a una ruta

Cuando los paquetes sean seleccionados para una ruta de entrega, se debe cambiar su estado a:

**EN RUTA DE ENTREGA**

---

# 8. Gestión de entregas

La entrega se ejecuta mediante las aplicaciones móviles Android/iOS.

## 8.1. Evidencias del destinatario

Se requiere obtener:

- Fotos.
- Carnet de Identidad.
- Firma.

## 8.2. Evidencia del paquete

Se requiere obtener:

- Foto de la etiqueta del paquete junto con el Carnet del Destinatario.

## 8.3. Entrega procedente

Cuando la entrega procede:

1. Recoger la evidencia mediante la aplicación móvil.
2. Registrar fecha y hora.
3. Registrar el empleado que realizó la entrega.
4. Marcar el paquete de la ruta como entregado.
5. Cambiar el estado del paquete a **ENTREGADO**.

## 8.4. Entrega no procedente

Cuando la entrega no procede:

1. Marcar el paquete de la ruta como no entregado.
2. Cambiar el estado del paquete a **NO ENTREGADO**.
3. Registrar fecha y hora.
4. Registrar el empleado que realizó la operación.

La fuente no especifica todavía las causas o categorías de una entrega no procedente.

---

# 9. Ubicación en tiempo real

Se requiere poder mostrar en tiempo real por dónde se encuentra un determinado paquete.

La fuente no define todavía:

- Frecuencia de actualización.
- Fuente de posicionamiento.
- Política de disponibilidad.
- Almacenamiento histórico.
- Comportamiento sin conectividad.

Estos aspectos requieren levantamiento posterior.

---

# 10. Tracking de paquetes y manifiestos

Se requiere realizar tracking de:

- Paquetes.
- Manifiestos.

El seguimiento debe abarcar:

**Desde su inicio hasta su fin.**

Cada movimiento debe mostrar:

- Fecha.
- Hora.
- Ubicación.

La fuente no define todavía el catálogo completo de estados ni todas las transiciones permitidas.

---

# 11. Ficha de costo

Se requiere crear una **Ficha de Costo**.

La fuente establece que cada ficha debe contener todos los parámetros que rijan en la documentación oficial correspondiente en Cuba.

La ficha debe contemplarse para:

- Cada ruta.
- Cada manifiesto.
- Cada paquete.
- Cada municipio.
- Cada provincia.

Este requisito tiene dependencia directa con el proceso de **Economía** y requiere posteriormente el levantamiento de la normativa y documentación oficial aplicable.

---

# 12. Relaciones entre procesos

El servicio de Paquetería declara relación con:

- **Economía**
- **Logística**
- **Recursos Humanos**
- **Auditoría**

Por tanto, Paquetería debe considerarse un proceso transversal y no un módulo completamente aislado.

Una vista inicial:

```text
                 PAQUETERÍA
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
   LOGÍSTICA      RR. HH.       ECONOMÍA
       │             │             │
       └─────────────┼─────────────┘
                     │
                     ▼
                 AUDITORÍA
```

Este esquema representa relaciones de proceso declaradas; no define todavía dependencias técnicas entre módulos.

---

# 13. Cadena operacional inicial de Paquetería

A partir exclusivamente de las operaciones declaradas, puede organizarse el flujo inicial así:

```text
MANIFIESTO
   │
   ▼
IMPORTACIÓN
   │
   ▼
PAQUETES CREADOS
   │
   ▼
NORMALIZACIÓN
DE DIRECCIONES
   │
   ▼
GEOLOCALIZACIÓN
   │
   ▼
UBICACIÓN EN MAPA
   │
   ▼
PLANIFICACIÓN DE RUTA
   │
   ▼
EN RUTA DE ENTREGA
   │
   ├───────────────┐
   ▼               ▼
ENTREGADO      NO ENTREGADO
   │               │
   └───────┬───────┘
           ▼
       TRACKING
           │
           ▼
       COSTOS / FICHA
```

Este flujo es una **organización del contenido de la fuente**, no una especificación definitiva de estados.

---

# 14. Reglas de negocio declaradas

Las siguientes reglas aparecen explícitamente en la fuente y deben pasar posteriormente por ingeniería de requisitos y validación empresarial:

| ID | Regla declarada |
|---|---|
| BR-001 | Al importar un manifiesto, sus paquetes pasan a estado CREADO. |
| BR-002 | Al importar un manifiesto, el manifiesto pasa a estado CREADO. |
| BR-003 | Una entrega debe registrar fecha y hora. |
| BR-004 | Una entrega debe identificar al empleado que la realizó. |
| BR-005 | Una entrega procedente cambia el paquete a ENTREGADO. |
| BR-006 | Una entrega no procedente cambia el paquete a NO ENTREGADO. |
| BR-007 | Una ruta puede tener punto de inicio y fin distintos o iguales. |
| BR-008 | Un vehículo solo puede tener una ruta por jornada de trabajo. |
| BR-009 | Un empleado solo puede tener una ruta activa y un vehículo en una misma jornada. |
| BR-010 | La ventana declarada para entregas es de 7:00 AM a 8:00 PM. |
| BR-011 | El marco máximo declarado de jornada es de 5:00 AM a 11:00 PM. |
| BR-012 | Se declara una hora de descanso por jornada. |
| BR-013 | El tiempo estimado de entrega es de 10 a 15 minutos por paquete. |
| BR-014 | Los movimientos de tracking deben registrar fecha, hora y ubicación. |
| BR-015 | Las rutas deben seleccionar paquetes considerando las restricciones declaradas. |

Estas reglas **no deben convertirse todavía en código sin su correspondiente especificación y validación**.

---

# 15. Elementos todavía no definidos por la fuente

Para evitar decisiones prematuras, quedan explícitamente abiertos:

### Negocio

- Nombres y características de los cinco servicios.
- Procesos detallados de RR. HH.
- Procesos detallados de Economía.
- Procesos detallados de Administración.
- Procesos detallados de Auditoría.
- Procesos detallados de Comercial.
- Catálogo completo de tipos de incidencia.
- Catálogo completo de estados.
- Reglas de transición entre estados.
- Reglas completas de entrega no procedente.

### Paquetería

- Definición formal de paquete.
- Relación exacta entre paquete, manifiesto, remitente y destinatario.
- Tratamiento de múltiples paquetes para una misma dirección.
- Reglas de normalización de direcciones.
- Reglas de validación de direcciones.
- Precisión mínima aceptable de geocodificación.
- Proveedor de geocodificación.
- Proveedor cartográfico.
- Motor de routing.
- Algoritmo definitivo de optimización.
- Criterios adicionales de optimización.
- Tratamiento de tráfico, averías, retrasos y cambios de ruta.
- Política de tracking en tiempo real.
- Operación offline.
- Sincronización y resolución de conflictos.
- Política de conservación de evidencias.
- Seguridad y privacidad de las evidencias.

### Economía

- Estructura definitiva de la Ficha de Costo.
- Parámetros oficiales aplicables.
- Fórmulas.
- Fuentes de datos.
- Periodicidad de actualización.
- Responsables de aprobación.

---

# 16. Principio de parametrización

Los valores como:

- 10–15 minutos por paquete.
- 5:00 AM–11:00 PM.
- 7:00 AM–8:00 PM.
- 1 hora de descanso.

deben tratarse durante el análisis de requisitos como **reglas/parametrizaciones empresariales declaradas**, no como constantes técnicas permanentes.

Antes de implementarlos de forma rígida debe determinarse si son:

- reglas obligatorias;
- parámetros configurables;
- valores iniciales;
- valores diferentes según servicio, empleado, vehículo o jornada.

---

# 17. Siguiente nivel de ingeniería

Este baseline permite avanzar ordenadamente hacia:

1. **Mapa integral de procesos de la MIPYME.**
2. Descomposición de cada macroproceso en procesos y subprocesos.
3. Identificación de actores y responsables.
4. Levantamiento de entradas, actividades, decisiones, salidas y excepciones.
5. Ingeniería de requisitos.
6. Casos de uso y/o historias de usuario.
7. Modelo de dominio.
8. Reglas de negocio verificadas.
9. Matriz de trazabilidad.
10. Diseño técnico e implementación.

La prioridad inmediata será profundizar **Paquetería**, porque es el proceso con mayor nivel de detalle disponible en la fuente, pero manteniendo sus relaciones con las demás áreas del Ecosistema.

---

## 18. Trazabilidad

```text
Ecosistema.txt
      │
      ▼
Baseline de Procesos #16
      │
      ▼
Requisitos
      │
      ▼
Casos de Uso
      │
      ▼
Modelo de Dominio
      │
      ▼
Diseño
      │
      ▼
Implementación
      │
      ▼
Pruebas
      │
      ▼
Release
```

**Estado:** Baseline inicial — sujeto a validación y evolución mediante Issues/PRs.


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
