# Baseline inicial del modelo de dominio y negocio

**Ecosistema:** SETA EXPRESO SURL  
**Versión:** 0.1.0  
**Estado:** Baseline inicial para descubrimiento  
**Issue:** #14  
**Arquitectura de referencia:** Architecture Baseline v0.1.0  
**Idioma:** Español

---

## 1. Propósito

Este documento establece el primer modelo conceptual del dominio del Ecosistema.

Su finalidad es crear un lenguaje común para la ingeniería de requisitos y el diseño posterior. No constituye todavía un modelo físico de base de datos ni una especificación definitiva de clases, tablas o APIs.

El modelo debe evolucionar con evidencia obtenida del negocio.

---

## 2. Principio de modelado

Se distinguirán tres niveles:

1. **Confirmado:** concepto o necesidad expresamente identificada para el Ecosistema.
2. **Tentativo:** interpretación razonable que todavía debe validarse.
3. **Abierto:** asunto que requiere descubrimiento antes de convertirlo en diseño.

Un concepto tentativo no deberá convertirse automáticamente en una entidad persistente ni en una regla de negocio.

---

## 3. Alcance inicial del dominio

El Ecosistema gestionará progresivamente procesos de una empresa de transportación terrestre de carga y pasajeros.

El primer proceso funcional seleccionado para profundización es **paquetería**.

El modelo inicial de paquetería necesita representar, como mínimo conceptual:

- manifiestos;
- paquetes;
- remitentes;
- destinatarios;
- direcciones;
- localizaciones geográficas;
- rutas;
- entregas.

La existencia de estos conceptos en este documento no significa que todos formen parte del primer incremento de software.

---

## 4. Lenguaje ubicuo inicial

| Concepto | Estado | Definición inicial |
|---|---|---|
| Manifiesto | Confirmado | Conjunto operativo de información de paquetería que puede ser importado, creado, modificado, eliminado y consultado. |
| Paquete | Confirmado | Unidad de paquetería gestionada dentro del proceso de manifiestos. |
| Remitente | Confirmado | Parte asociada al origen/envío de un paquete. |
| Destinatario | Confirmado | Parte asociada al destino/recepción de un paquete. |
| Dirección | Confirmado | Información de localización utilizada para el destino de un paquete. |
| Geocodificación | Confirmado | Proceso mediante el cual una dirección se transforma en información geográfica utilizable por el sistema. |
| Coordenadas | Confirmado | Información espacial obtenida o validada para una dirección y susceptible de almacenarse. |
| Ruta | Confirmado | Secuencia planificada de desplazamiento para realizar operaciones de entrega. |
| Entrega | Confirmado | Operación mediante la cual un paquete es entregado a su destinatario. |
| Punto de entrega | Tentativo | Representación operativa de una localización utilizada durante una ruta. Debe validarse si es un concepto distinto de Dirección. |
| House | Abierto | El término aparece en el conocimiento inicial del proyecto, pero todavía no está definido de forma suficiente para determinar su relación con Paquete. |

---

## 5. Manifiesto

### 5.1 Capacidades conocidas

El proceso inicial requiere contemplar:

- importar un manifiesto;
- crear un manifiesto;
- consultar/listar manifiestos;
- modificar un manifiesto;
- eliminar un manifiesto;
- gestionar los paquetes asociados.

La importación tiene como fuente inicial archivos Excel.

### 5.2 Importación

La importación deberá considerarse un proceso de transformación y validación, no simplemente una copia de filas.

Conceptualmente:

**Archivo de origen → lectura → validación → normalización → asociación con dominio → persistencia → resultado de importación**

Las reglas concretas de columnas, formatos, identificadores, duplicados, errores y correcciones todavía requieren especificación.

---

## 6. Paquete

El paquete es una unidad central del primer proceso.

Debe poder:

- crearse;
- incorporarse a un manifiesto;
- consultarse;
- modificarse;
- eliminarse;
- asociarse con información de origen y destino;
- asociarse con una dirección de destino;
- disponer de información geográfica cuando el proceso de geocodificación la haya producido.

El modelo definitivo deberá determinar qué atributos son obligatorios, cuáles son opcionales y qué invariantes deben cumplirse.

---

## 7. Dirección y geolocalización

La dirección es un concepto de negocio que no debe confundirse automáticamente con sus coordenadas.

Se distinguirán conceptualmente:

**Dirección textual**  
↓  
**Validación / normalización**  
↓  
**Geocodificación**  
↓  
**Resultado geográfico**  
↓  
**Coordenadas persistidas**

Una dirección puede requerir corrección o normalización antes de obtener coordenadas.

El proveedor concreto de geocodificación permanece pendiente de evaluación.

La arquitectura deberá conservar la abstracción del proveedor y evitar que el dominio dependa de una API externa específica.

---

## 8. Relación entre paquete y dirección

La información actual indica que cada paquete posee una dirección de destino, aunque múltiples paquetes pueden compartir una misma dirección.

Esto implica una pregunta importante de modelado:

> ¿La dirección es un valor propio de cada paquete o una entidad reutilizable que puede ser compartida por múltiples paquetes?

Esta decisión no se congela en este baseline.

La respuesta deberá considerar:

- identidad de la dirección;
- cambios históricos;
- normalización;
- reutilización;
- geocodificación;
- auditoría;
- necesidad de conservar el estado utilizado en una entrega histórica.

---

## 9. Ruta

El proceso previsto contempla seleccionar localizaciones sobre un mapa y construir una ruta de entrega.

También se ha identificado la necesidad de considerar:

- punto de salida;
- hora de salida;
- destinos/paradas;
- orden de visita;
- tiempos de entrega;
- múltiples paquetes en una misma localización.

Todavía no se define:

- algoritmo de optimización;
- motor de routing;
- criterio de optimización;
- restricciones completas de vehículos;
- ventanas horarias definitivas;
- tratamiento de tráfico;
- capacidad máxima de una ruta.

Por tanto, estos elementos permanecen abiertos.

---

## 10. Entrega

La entrega debe tratarse como un proceso operativo y no simplemente como un atributo booleano del paquete.

El modelo deberá determinar posteriormente estados como, por ejemplo:

- pendiente;
- planificada;
- en ruta;
- entregada;
- no entregada;
- reprogramada;
- cancelada.

Esta lista es **exploratoria**, no una decisión definitiva.

También deben descubrirse:

- evidencia de entrega;
- fecha y hora;
- persona que realizó la entrega;
- persona que recibió;
- incidencias;
- observaciones;
- fotografías o documentos, si fueran necesarios.

---

## 11. Tiempo de servicio

Para planificación de rutas se ha identificado una necesidad de estimar el tiempo dedicado a cada entrega.

Existe una referencia inicial de aproximadamente 10–15 minutos por paquete, con un posible comportamiento diferente cuando varios paquetes corresponden a una misma dirección.

Esto debe tratarse actualmente como **hipótesis operativa**, no como regla de negocio definitiva.

La ingeniería posterior deberá determinar si el tiempo depende de:

- número de paquetes;
- dirección;
- tipo de entrega;
- características del destinatario;
- zona;
- vehículo;
- condiciones operativas;
- datos históricos.

---

## 12. Relaciones conceptuales iniciales

La representación conceptual actual puede expresarse así:

**Manifiesto**
→ contiene → **Paquetes**

**Paquete**
→ tiene → **Remitente**

**Paquete**
→ tiene → **Destinatario**

**Paquete**
→ tiene → **Dirección de destino**

**Dirección**
→ puede producir → **Coordenadas**

**Paquetes**
→ pueden agruparse operativamente por → **Punto de entrega**

**Ruta**
→ contiene/secuencia → **Paradas**

**Parada**
→ corresponde potencialmente a → **Punto de entrega**

**Entrega**
→ materializa operativamente → entrega de **Paquete(s)**

Estas relaciones son conceptuales y deberán refinarse durante el modelado detallado.

---

## 13. Preguntas de descubrimiento prioritarias

Antes de congelar el modelo se deberán resolver, como mínimo:

### Manifiestos
1. ¿Qué identifica inequívocamente un manifiesto?
2. ¿Puede un manifiesto tener versiones?
3. ¿Puede modificarse después de comenzar operaciones?
4. ¿Qué estados tiene?
5. ¿Puede eliminarse físicamente o debe conservarse históricamente?

### Paquetes
6. ¿Qué identifica inequívocamente un paquete?
7. ¿Puede un paquete cambiar de manifiesto?
8. ¿Qué datos son obligatorios?
9. ¿Qué información puede modificarse después de importado?
10. ¿Existen paquetes relacionados o agrupaciones?

### Direcciones
11. ¿Cómo se escribe actualmente una dirección?
12. ¿Qué constituye una dirección válida?
13. ¿Cómo se normaliza?
14. ¿Se conserva el texto original?
15. ¿Se conserva el texto normalizado?
16. ¿Cómo se registran correcciones?
17. ¿Una dirección puede compartirse entre paquetes?

### Geolocalización
18. ¿Qué ocurre cuando no existe una coincidencia suficientemente confiable?
19. ¿Se permiten correcciones manuales?
20. ¿Debe conservarse el proveedor utilizado?
21. ¿Debe conservarse la fecha de geocodificación?
22. ¿Debe conservarse un nivel de confianza?

### Entrega
23. ¿Qué significa exactamente "entregado"?
24. ¿Qué evidencia debe conservarse?
25. ¿Qué ocurre ante una entrega fallida?
26. ¿Cuántos intentos pueden realizarse?
27. ¿Quién puede cambiar el estado?

### Rutas
28. ¿Quién crea una ruta?
29. ¿Puede modificarse una ruta durante su ejecución?
30. ¿Qué restricciones del vehículo deben considerarse?
31. ¿Cómo se determina el orden de las paradas?
32. ¿Cómo se calcula el tiempo estimado?
33. ¿Cómo se registra el tiempo real?

---

## 14. Invariantes que deberán investigarse

Todavía no se declaran invariantes definitivas, pero deberán analizarse al menos:

- un paquete debe pertenecer a un contexto de manifiesto válido;
- una entrega no debería existir sin un paquete identificable;
- una entrega completada debería conservar información suficiente para auditoría;
- las coordenadas deberán corresponder a una dirección o localización identificable;
- los datos geográficos inválidos no deberán pasar silenciosamente a planificación;
- las operaciones críticas deberán conservar trazabilidad.

Estas afirmaciones son objetivos de análisis, no reglas finales.

---

## 15. Separación entre dominio y proveedores

El dominio no deberá conocer directamente:

- APIs de geocodificación;
- APIs de mapas;
- motores externos de routing;
- proveedores de notificaciones;
- almacenamiento externo;
- proveedores concretos de identidad.

Cuando corresponda, estas capacidades deberán entrar mediante puertos/interfaces y adapters de infraestructura.

Esto mantiene coherencia con la arquitectura Clean/Hexagonal establecida.

---

## 16. Primer mapa de subdominios

Como hipótesis inicial para continuar el descubrimiento:

### Núcleo inicial
- **Paquetería**
- **Manifiestos**
- **Entregas**

### Capacidades relacionadas
- **Direcciones y geolocalización**
- **Rutas**
- **Clientes/partes**

### Capacidades transversales
- **Identidad y acceso**
- **Auditoría**
- **Notificaciones**
- **Documentos**

Esta clasificación es provisional y no implica que cada elemento se convierta en un módulo independiente.

---

## 17. Qué NO queda decidido

Este baseline no decide:

- esquema definitivo de base de datos;
- nombres definitivos de tablas;
- agregados definitivos;
- entidades definitivas;
- estados definitivos;
- proveedor de geocodificación;
- proveedor de mapas;
- motor de routing;
- algoritmo de optimización;
- estrategia de IA;
- diseño definitivo de APIs;
- estrategia de identidad;
- estrategia offline;
- equivalencia House = Package.

---

## 18. Próximo nivel de ingeniería

La evolución recomendada será:

**Modelo conceptual**
→ **descubrimiento del proceso**
→ **requisitos**
→ **casos de uso**
→ **reglas de negocio**
→ **modelo de dominio detallado**
→ **arquitectura de módulos**
→ **contratos API**
→ **modelo de datos**
→ **implementación**
→ **pruebas**

No se deberá saltar directamente del modelo conceptual a las tablas o endpoints sin haber identificado las reglas de negocio relevantes.

---

## 19. Estado

**Estado:** Baseline inicial para descubrimiento.

El documento será actualizado cuando se obtenga nueva evidencia del negocio.

**Trazabilidad:** Issue #14 → modelo de dominio → requisitos → diseño → implementación → pruebas → Pull Request.
