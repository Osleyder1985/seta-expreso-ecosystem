# Modelo conceptual del Servicio de Paquetería

**Versión:** 0.1.0  
**Estado:** Propuesta de dominio para revisión  
**Issue:** #36  
**Alcance:** Servicio de Paquetería del Ecosistema SETA EXPRESO SURL

## 1. Propósito

Este documento define el modelo conceptual inicial del dominio de Paquetería antes de diseñar tablas, entidades ORM, endpoints o contratos de persistencia.

El modelo separa explícitamente:

- conceptos documentales;
- unidades físicas/operativas;
- personas y roles;
- direcciones y geolocalización;
- planificación de transporte;
- ejecución de entrega;
- evidencia;
- incidencias e historial de estados.

Los nombres que aparecen como equivalentes en la operación —por ejemplo House, Bulto y Package— no se consideran automáticamente sinónimos. Su equivalencia queda como decisión de dominio pendiente.

## 2. Principios de modelado

1. El dominio no depende de PostgreSQL, PostGIS, NestJS, ASP.NET Core, Flutter ni de un proveedor cartográfico.
2. Una dirección no es una coordenada.
3. Una ubicación de entrega no es necesariamente una dirección física única.
4. Una parada de ruta no es una entrega individual.
5. Una entrega puede involucrar varios bultos cuando comparten punto de entrega.
6. Un intento de entrega fallido debe conservarse; no debe sobrescribirse con el intento posterior.
7. El estado actual no sustituye al historial de transiciones.
8. Las reglas de modificación/eliminación dependen del estado del proceso y deberán formalizarse como invariantes.
9. La geocodificación debe estar detrás de una abstracción de proveedor.
10. Las cardinalidades de este documento son candidatas; las decisiones de negocio aún abiertas están marcadas explícitamente.

## 3. Conceptos y responsabilidades

### 3.1 Manifiesto

Representa el conjunto documental/operativo mediante el cual ingresa información de una expedición al ecosistema.

Responsabilidades:

- identificar la entrada documental;
- conservar origen y metadatos de importación;
- relacionar la información de la expedición con sus unidades documentales;
- mantener trazabilidad del archivo/documento fuente cuando corresponda.

No se define todavía que Manifiesto y Guía/AWB sean la misma entidad.

### 3.2 Guía / AWB

Representa una unidad documental de transporte/envío identificada por un código AWB.

Responsabilidades:

- identificar el envío;
- mantener su ciclo de vida;
- agrupar una o más unidades House/Bulto si esa relación se confirma;
- conservar fechas y estados relevantes;
- permitir trazabilidad de las unidades que contiene.

La relación exacta entre Master AWB, Guía y House queda pendiente de decisión D01.

### 3.3 House / Bulto / Package

Representa la unidad individual descrita por los requisitos actuales como House/Bulto.

Atributos conceptuales conocidos:

- identificador/código;
- peso;
- naturaleza;
- cantidad;
- remitente;
- destinatario;
- información de destino;
- estado operativo.

No se establece todavía que un House sea exactamente igual a un Package técnico del software.

### 3.4 Persona y roles

Se propone un concepto general de Persona y roles de negocio:

- Remitente;
- Destinatario;
- receptor de la entrega;
- otros roles que puedan aparecer posteriormente.

Un mismo individuo puede desempeñar roles distintos en operaciones diferentes.

**Pendiente:** determinar si Cliente es una entidad distinta de Persona y si Remitente/Destinatario se modelan como roles o como relaciones especializadas.

### 3.5 Dirección

Representa la información postal/local del destino.

Debe poder conservar:

- dirección original;
- dirección normalizada;
- componentes estructurados cuando estén disponibles;
- municipio;
- provincia;
- país;
- referencias;
- información de validación.

Una Dirección puede ser reutilizada por múltiples destinatarios y/o unidades de envío.

### 3.6 Geolocalización

Representa el resultado geográfico asociado a una dirección o punto operativo.

Debe poder conservar:

- latitud;
- longitud;
- proveedor;
- identificador externo, si existe;
- precisión/confianza cuando el proveedor la entregue;
- fecha de obtención;
- estado del resultado.

La geolocalización no sustituye a la dirección original ni a la dirección normalizada.

### 3.7 Punto de entrega

Representa el destino operativo utilizado para planificar y ejecutar una entrega.

Permite separar:

**Dirección postal** → **localización operativa/geográfica** → **punto de entrega**

Esto es importante porque varias unidades pueden compartir una misma dirección y deben poder consolidarse en una misma parada.

### 3.8 Ruta

Representa una planificación operativa de transporte.

Puede contener:

- fecha;
- origen;
- destino;
- vehículo;
- conductor;
- secuencia de paradas;
- horarios planificados;
- estado;
- información operacional de ejecución.

La ruta no se reduce a una lista de coordenadas.

### 3.9 Parada

Representa una ubicación concreta dentro de una ruta.

Una parada puede agrupar varias operaciones de entrega.

Relación conceptual:

**Ruta 1 → N Paradas**

### 3.10 Entrega

Representa la operación de intentar entregar una o varias unidades en un punto de entrega.

Una entrega debe poder registrar:

- unidades involucradas;
- punto de entrega;
- fecha/hora;
- receptor;
- resultado;
- observaciones;
- ubicación efectiva de la operación;
- evidencia asociada.

### 3.11 Intento de entrega

Se propone separar la Entrega del Intento de Entrega para conservar fallos y reintentos.

Ejemplo:

Entrega → Intento 1 → fallido  
Entrega → Intento 2 → fallido  
Entrega → Intento 3 → exitoso

No debe perderse el historial de los intentos anteriores.

### 3.12 Evidencia de entrega / POD

Representa la prueba de ejecución de una entrega.

Puede incluir:

- firma;
- fotografía;
- identificación del receptor;
- fecha/hora;
- ubicación;
- observaciones;
- otros soportes documentales.

La evidencia debe quedar vinculada al evento de entrega correspondiente.

### 3.13 Incidencia

Representa una situación anómala o excepción operacional.

Puede relacionarse con:

- Manifiesto;
- Guía;
- House/Bulto;
- Ruta;
- Parada;
- Entrega;
- Intento de entrega;
- transporte;
- vehículo;
- dirección.

La incidencia debe conservar su ciclo de vida y resolución.

### 3.14 Historial de estados

Representa las transiciones de estado de los objetos que tengan ciclo de vida.

Como mínimo conceptualmente:

- estado anterior;
- estado nuevo;
- fecha/hora;
- actor;
- motivo/observación;
- referencia al evento que produjo la transición.

El estado actual puede ser una proyección del historial, pero el historial no debe eliminarse.

## 4. Relaciones y cardinalidades candidatas

| Relación | Cardinalidad candidata | Observación |
|---|---:|---|
| Manifiesto → Guía/AWB | 1:N | Una entrada documental puede contener varias unidades documentales |
| Guía/AWB → House/Bulto | 1:N | Propuesta; requiere confirmar D03 |
| House/Bulto → Remitente | N:1 | Un remitente puede aparecer en múltiples unidades |
| House/Bulto → Destinatario | N:1 | Un destinatario puede recibir múltiples unidades |
| Destinatario → Dirección | 1:N | Un destinatario puede tener varias direcciones |
| Dirección → Geolocalización | 1:N | Puede haber múltiples resultados/versiones de geocodificación |
| Dirección → Punto de entrega | 1:N | Una dirección puede dar lugar a puntos operativos distintos |
| Ruta → Parada | 1:N | Ordenadas dentro de la ruta |
| Parada → Punto de entrega | N:1 | Una misma ubicación puede aparecer en diferentes rutas |
| Parada → Entrega | 1:N | Una parada puede ejecutar varias entregas |
| Entrega → House/Bulto | N:M | Propuesta; permite entregar varios bultos en una operación y debe validarse D09 |
| Entrega → Intento | 1:N | Permite conservar reintentos |
| Intento → Evidencia POD | 0:N | Puede existir más de una evidencia |
| Cualquier objeto operativo → Incidencia | 1:N | Asociación contextual; se debe concretar técnicamente |
| Objeto con ciclo de vida → Historial de estados | 1:N | Cada transición queda registrada |

## 5. Relaciones especialmente importantes

### 5.1 Manifiesto → Guía → House

La jerarquía documental propuesta es:

**Manifiesto**
→ una o más **Guías/AWB**
→ una o más **House/Bultos**

Esta jerarquía es una hipótesis de modelado y no una decisión definitiva sobre la semántica documental de la operación.

### 5.2 House → Dirección → Geolocalización

La cadena operacional propuesta es:

**House/Bulto**
→ **Destino/Dirección**
→ **Normalización**
→ **Geolocalización**
→ **Punto de entrega**

Debe conservarse tanto la información original como el resultado normalizado/geocodificado.

### 5.3 Ruta → Parada → Entrega

La ejecución propuesta es:

**Ruta**
→ **Parada**
→ **Entrega**
→ **Intentos**
→ **Evidencia**

Esto evita modelar la ruta únicamente como una relación directa entre paquetes y coordenadas.

## 6. Invariantes de dominio candidatas

Estas reglas deben validarse durante el diseño detallado:

1. Un código AWB debe ser único dentro del ámbito de negocio correspondiente.
2. Un código House debe ser único dentro del ámbito definido por la operación.
3. Una entrega no debe cerrarse como exitosa sin resultado válido y la información mínima exigida por el proceso.
4. Un intento fallido no debe eliminarse al crear un reintento.
5. Una incidencia cerrada debe conservar su resolución.
6. Un cambio de estado debe dejar trazabilidad.
7. Una dirección original no debe perderse por normalización.
8. Un resultado de geocodificación no debe reemplazar silenciosamente resultados anteriores si estos son necesarios para auditoría.
9. Una parada debe pertenecer a una ruta concreta.
10. Una unidad no debe aparecer simultáneamente como entregada y pendiente sin una transición explícita que explique el cambio.
11. La modificación de manifiestos, guías y bultos debe estar condicionada por su estado operativo.

Estas son invariantes candidatas, no reglas aprobadas todavía.

## 7. Decisiones de dominio pendientes

### D01 — Master AWB / Guía / House

Determinar la jerarquía documental exacta:

- Manifiesto → Master AWB → House
- Manifiesto → Guía → House
- Manifiesto → Guía/AWB
- otra estructura.

### D02 — House, Bulto y Package

Determinar si son:

- sinónimos de negocio;
- conceptos distintos;
- un concepto de negocio y otro técnico.

### D03 — Cardinalidad Guía → House

Confirmar si una Guía puede contener múltiples House.

### D04 — House → unidades físicas

Determinar si un House representa:

- exactamente un bulto físico;
- una agrupación de unidades físicas;
- otra unidad documental/operativa.

### D05 — Persona y roles

Determinar si Remitente y Destinatario son roles de Persona o entidades especializadas.

### D06 — Cliente

Determinar si Cliente es:

- Persona;
- Organización;
- una entidad comercial independiente;
- o una relación/rol sobre Persona u Organización.

### D07 — Reutilización de dirección

Confirmar que una misma dirección puede ser compartida por múltiples destinatarios y unidades.

### D08 — Parada

Confirmar que una parada puede contener múltiples entregas.

### D09 — Entrega múltiple

Confirmar si una única operación de entrega puede cerrar simultáneamente varios House/Bultos.

### D10 — Intentos

Determinar número máximo, estados y reglas de reintento.

### D11 — Estados

Definir catálogo de estados y máquina de estados para Manifiesto, Guía, House, Ruta y Entrega.

### D12 — Cierre de entrega

Definir información mínima obligatoria para considerar una entrega exitosa.

## 8. Próximo paso de ingeniería

No se debe crear todavía el esquema físico de PostgreSQL ni las entidades ORM.

El siguiente paso es resolver D01–D12 mediante:

1. reglas del proceso real;
2. documentación disponible;
3. datos reales de manifiestos;
4. casos normales y excepcionales;
5. definición de invariantes;
6. máquina de estados;
7. agregados y límites de consistencia.

Después se podrá pasar a:

**Modelo conceptual → Modelo lógico → Agregados DDD → Modelo relacional → API/contratos → implementación.**

## 9. Trazabilidad

- Issue de alcance: #35
- Issue de modelo conceptual: #36
- Evidencia documental: requisitos y material operativo disponible del Servicio de Paquetería
- Estado: propuesta de dominio v0.1.0; no constituye todavía contrato de persistencia
