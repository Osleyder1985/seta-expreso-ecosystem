# PoC de GPS y Tracking Vehicular — v0.1.0

**Issue:** #60  
**Estado:** Propuesto
**Tipo:** PoC de arquitectura y comportamiento

## 1. Objetivo

Validar, antes de fijar una tecnología o política definitiva, que el Ecosistema SETA EXPRESO puede mantener una representación temporal y geoespacial fiable de la posición de un vehículo durante una jornada operativa, incluso con conectividad intermitente o inexistente.

El requisito funcional ya establecido es que la posición del vehículo pueda representarse mediante coordenadas exactas, con autorización por objeto. Para clientes, el acceso queda limitado a sus propios envíos.

El PoC separa captura GPS, persistencia local, transmisión, confirmación y exposición autorizada. Una frecuencia de captura de 5–10 s y una transmisión aproximada de 10 s son únicamente hipótesis iniciales.

## 2. Principios

1. GPS no depende de conectividad.
2. La observación GPS se persiste localmente antes de considerarse durable.
3. Captura y transmisión son procesos independientes.
4. Una observación no confirmada permanece pendiente.
5. Reintentar no puede duplicar la historia lógica.
6. La historia GPS es append-only; una nueva observación no sobrescribe una anterior.
7. La posición actual es una proyección de observaciones históricas.
8. El tracking del cliente está restringido a sus propios envíos.
9. Exactitud geográfica y frecuencia temporal son propiedades distintas.
10. Cada observación conserva timestamp y accuracy.
11. El modo offline no debe impedir la ejecución.
12. Una corrección espacial de campo queda PENDING_DE_VALIDACIÓN y no modifica silenciosamente el dato maestro.

## 3. Modelo conceptual

### GPS Observation

Cada observación debe poder representar como mínimo: observationId, vehicleId, routeExecutionId, latitude, longitude, occurredAt, accuracyMeters, altitudeMeters opcional, speedMetersPerSecond opcional, bearingDegrees opcional, source, deviceId, actorId, sequence, syncStatus y receivedAt cuando exista.

GPS Observation ≠ Vehicle Position ≠ Customer Tracking View.

- GPS Observation: hecho histórico capturado.
- Vehicle Position: proyección de la observación más reciente válida.
- Customer Tracking View: representación autorizada para un cliente y un envío.

## 4. Arquitectura conceptual

Mobile GPS Provider → GPS Capture Adapter → Local GPS Buffer → GPS Sync Queue → REST/OpenAPI → Tracking Ingestion → PostgreSQL/PostGIS → Position Projection → Authorized Tracking Query.

La aplicación móvil debe aislar adaptadores específicos de Android/iOS para ubicación foreground/background, permisos, restricciones energéticas y reanudación después de suspensión.

No se decide todavía si el transporte futuro será REST, WebSocket, MQTT u otro.

## 5. Ciclo de una observación

1. El sistema operativo entrega una ubicación.
2. El adaptador valida formato básico.
3. La aplicación registra identidad, tiempo y contexto.
4. La observación se persiste localmente.
5. Queda disponible para sincronización.
6. Si existe conectividad, se intenta transmitir.
7. El servidor valida autorización e idempotencia.
8. El servidor persiste la observación.
9. El servidor confirma el resultado.
10. El dispositivo marca la observación como sincronizada.
11. La proyección de posición se actualiza.
12. Las consultas autorizadas pueden obtener la posición.

La pérdida de la respuesta no debe generar una segunda observación lógica cuando el cliente reintente.

## 6. Captura vs transmisión

### Perfil A — frecuencia alta
- captura cada 5 s
- transmisión agrupada aproximadamente cada 10 s

### Perfil B — frecuencia media
- captura cada 10 s
- transmisión agrupada aproximadamente cada 20–30 s

### Perfil C — transmisión adaptativa

La captura mantiene continuidad local y la transmisión se adapta a conectividad, tamaño del buffer, antigüedad de la última posición confirmada, estado de ruta y disponibilidad energética.

Estos perfiles son experimentales. Ninguno constituye todavía la política productiva.

## 7. Offline-first

Durante ausencia de conectividad se debe continuar capturando, persistir localmente, no bloquear la ruta, no exigir intervención del trabajador, acumular observaciones y reanudar sincronización automáticamente.

El buffer debe sobrevivir pérdida de cobertura, suspensión, cierre y reinicio del teléfono.

Al recuperar conectividad: reautenticar si corresponde, enviar pendientes, utilizar idempotencia, reintentar errores recuperables, confirmar recepción, actualizar estado local y continuar con nuevas observaciones.

## 8. Gaps y continuidad

El PoC debe medir intervalo esperado, intervalo real, gaps mayores de 2× y 5× el intervalo objetivo, duración del mayor gap y porcentaje de observaciones dentro del intervalo esperado.

Cuando sea posible debe distinguir ausencia de conectividad, ausencia de fix GPS, aplicación suspendida, dispositivo apagado, batería/OS, error de captura y error de sincronización.

## 9. Exactitud

La exigencia de posición exacta se interpreta operacionalmente como coordenadas reales del dispositivo, no como precisión física ilimitada.

Cada observación conserva accuracy y timestamp. No se debe inventar precisión, redondear innecesariamente coordenadas, sustituir coordenadas por una dirección ni convertir una medición de baja calidad en una posición de alta confianza.

La política de aceptación de accuracy se decidirá después de las mediciones.

## 10. Background location

El PoC debe probar aplicación abierta, segundo plano, pantalla bloqueada, dispositivo en movimiento, recuperación después de suspensión, restricciones energéticas, permisos, Android e iOS.

La arquitectura de dominio no debe depender de APIs concretas del sistema operativo.

## 11. Autorización

La consulta de tracking debe aplicar autorización a nivel de objeto. El cliente puede consultar únicamente sus propios envíos y los eventos, estado y posición del vehículo relacionados con ellos cuando corresponda.

Nunca debe poder consultar otros clientes, envíos, manifiestos o trayectorias internas no autorizadas.

## 12. Seguridad y privacidad

El PoC debe verificar autenticación, autorización por objeto, revocación de sesión, protección de endpoints, auditoría de consultas sensibles y ausencia de coordenadas o fotografías sensibles en logs ordinarios.

No se fija todavía una política legal de retención de GPS. Esa decisión requiere investigación normativa específica.

## 13. Corrección espacial en campo

Captura de campo → nueva coordenada → PENDING_DE_VALIDACIÓN.

Debe conservarse ubicación anterior, propuesta, accuracy, timestamp, usuario, dispositivo, ruta/entrega relacionada, contexto y operación de sincronización.

La corrección no debe convertirse automáticamente en dato maestro.

## 14. Escenarios reproducibles

| ID | Escenario | Resultado esperado |
|---|---|---|
| S01 | Conectividad continua | trayectoria completa |
| S02 | Ruta completamente offline | captura local sin pérdida |
| S03 | Cobertura intermitente | buffer + sincronización automática |
| S04 | servidor recibe y respuesta se pierde | reintento idempotente |
| S05 | reinicio con buffer pendiente | recuperación sin pérdida |
| S06 | background location | continuidad dentro de límites medidos |
| S07 | restricciones de batería/OS | comportamiento medido |
| S08 | cliente consulta tracking | solo datos autorizados |
| S09 | corrección espacial | PENDING_DE_VALIDACIÓN |
| S10 | reconstrucción final | historia equivalente a eventos capturados |

## 15. Fault injection

El controlador debe poder provocar ausencia de red, red intermitente, latencia, timeout, HTTP 5xx, HTTP 401/403, pérdida de respuesta, duplicación de request, interrupción de transmisión, reinicio de aplicación, modificación concurrente del contexto de ruta y almacenamiento cercano al límite.

## 16. Métricas

### GPS
- observaciones/hora;
- intervalo medio, p50, p95 y máximo;
- accuracy y distribución;
- gaps;
- porcentaje de continuidad.

### Sincronización
- latencia captura→servidor;
- latencia servidor→cliente;
- observaciones/minuto;
- requests/minuto;
- tasa de éxito;
- retries;
- duplicados;
- observaciones pendientes.

### Dispositivo
- batería consumida por hora;
- almacenamiento local;
- crecimiento del buffer;
- CPU/memoria cuando sea relevante;
- comportamiento background.

### Red
- bytes enviados/recibidos;
- requests;
- ratio de compresión si se prueba;
- comportamiento con pérdida/latencia.

### Calidad
- observaciones perdidas;
- observaciones duplicadas;
- inconsistencias;
- capacidad de reconstrucción;
- tiempo de recuperación.

## 17. Dataset mínimo

El dataset reproducible debe contener 1 vehículo, 1 ejecución de ruta, 20 stops, 30 paquetes, varios paquetes compartiendo dirección, observaciones GPS durante toda la ejecución, periodos offline, periodos intermitentes, al menos una entrega, un intento fallido, una corrección espacial PENDING_DE_VALIDACIÓN y una consulta autorizada y una no autorizada.

Debe registrarse versión del PoC, commit, dataset/version ID, dispositivo, OS, Flutter/Dart, backend, PostgreSQL/PostGIS y condiciones de red.

## 18. Criterios de aceptación

El PoC será técnicamente válido si demuestra: 0 pérdidas de observaciones consideradas válidas; 0 duplicados lógicos después de reintentos; 0 sobrescrituras silenciosas de historia; recuperación después de reinicio; operación offline prolongada; sincronización automática; reconstrucción correcta de trayectoria; autorización de tracking por objeto; correcciones espaciales pendientes de validación; y medición reproducible de batería, datos, latencia, accuracy y continuidad.

## 19. Decisiones que NO se cierran

Permanecen abiertas la frecuencia definitiva de captura/transmisión, política adaptativa final, almacenamiento móvil, formato de outbox, REST vs streaming, mapas, geocoding, routing, background location definitivo, política de batería, retención legal de GPS, precisión mínima operacional e infraestructura productiva.

## 20. Próximo paso

Resultados → análisis comparativo → decisión tecnológica/política → ADR de GPS/Tracking → refinamiento OpenAPI → implementación.

No se adopta una tecnología de tracking por preferencia; se adopta únicamente si la evidencia del PoC satisface los requisitos operativos del Ecosistema.


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
