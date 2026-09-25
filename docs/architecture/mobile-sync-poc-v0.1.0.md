# PoC de sincronización móvil offline-first — v0.1.0

**Estado:** Propuesto  
**Issue:** #58  
**Dependencias:** PR #55, PR #57

## 1. Objetivo

Validar experimentalmente que una aplicación móvil puede ejecutar una jornada operativa completa sin conectividad y sincronizar posteriormente sus hechos con el backend sin pérdida, duplicación ni destrucción de historial.

La PoC no selecciona todavía la tecnología definitiva de almacenamiento local.

## 2. Hipótesis

H1. Una jornada previamente precargada puede ejecutarse durante varias horas sin conectividad.

H2. Las mutaciones locales pueden persistirse de forma durable.

H3. La idempotencia evita duplicados cuando se pierde la respuesta del servidor.

H4. La sincronización incremental permite recuperar cambios sin descargar todo el universo operativo.

H5. Los conflictos pueden detectarse sin aplicar sobrescritura silenciosa.

H6. La evidencia puede conservarse localmente y cargarse después de forma reanudable.

H7. El sistema puede recuperarse de cierre/reinicio sin perder operaciones pendientes.

## 3. Arquitectura de la PoC

Componentes mínimos:

1. Mobile PoC
   - Presentation
   - Local Domain Store
   - Outbox
   - Sync Engine
   - Evidence Store
   - Connectivity Simulator
   - GPS Simulator

2. Backend PoC
   - REST API
   - Authentication stub/controlada
   - Sync endpoints
   - Idempotency store
   - Version/concurrency control
   - Audit log
   - Evidence upload endpoint

3. Database
   - PostgreSQL
   - entidades operacionales mínimas
   - versiones
   - operaciones recibidas
   - auditoría

4. Test Controller
   - activa/desactiva conectividad;
   - introduce latencia;
   - corta requests;
   - duplica requests;
   - provoca respuestas perdidas;
   - modifica recursos en servidor;
   - reinicia componentes.

## 4. Alcance funcional mínimo

### Jornada

- usuario;
- vehículo;
- ruta;
- paradas;
- paquetes;
- ventana operacional.

### Ejecución

- iniciar jornada;
- consultar parada;
- marcar ENTREGADO;
- marcar NO ENTREGADO;
- registrar intento;
- registrar incidencia;
- capturar evidencia;
- registrar posición GPS;
- proponer corrección geoespacial.

### Sincronización

- precarga;
- operación offline;
- persistencia;
- outbox;
- push;
- pull;
- cursor;
- reintento;
- idempotencia;
- conflicto;
- confirmación.

## 5. Dataset de prueba

Crear una jornada sintética reproducible:

- 1 usuario operativo;
- 1 vehículo;
- 1 ruta;
- 20 paradas;
- 30 paquetes;
- 5 direcciones compartidas;
- 3 paquetes con evidencia;
- 2 entregas fallidas;
- 1 incidencia;
- 1 corrección geoespacial;
- observaciones GPS durante la jornada.

Debe existir un identificador de dataset/version para repetir exactamente los experimentos.

## 6. Escenarios de prueba

### S01 — Jornada completamente offline

1. Precargar jornada.
2. Cortar conectividad.
3. Ejecutar ruta.
4. Registrar entregas, intentos, incidencias y evidencia.
5. Reiniciar aplicación.
6. Continuar trabajando.
7. Restaurar conectividad.
8. Sincronizar.
9. Verificar servidor.

**Aceptación:** ningún hecho válido desaparece.

### S02 — Pérdida durante push

1. Crear operación offline.
2. Restaurar conexión.
3. Servidor recibe operación.
4. Simulador elimina respuesta.
5. Cliente reintenta.
6. Servidor reconoce idempotencia.

**Aceptación:** una sola operación efectiva.

### S03 — Duplicación de request

Enviar exactamente la misma operación varias veces.

**Aceptación:** un solo efecto de negocio.

### S04 — Reinicio con cola pendiente

1. Crear múltiples operaciones.
2. Apagar/reiniciar aplicación antes de sincronizar.
3. Recuperar cola.
4. Sincronizar.

**Aceptación:** todas las operaciones siguen disponibles.

### S05 — Conflicto de versión

1. Descargar paquete versión N.
2. Modificarlo en servidor a N+1.
3. Modificarlo offline desde móvil.
4. Sincronizar.

**Aceptación:** conflicto explícito; ninguna sobrescritura silenciosa.

### S06 — Ruta reasignada

1. Precargar ruta.
2. Desconectar móvil.
3. Reasignar ruta en servidor.
4. Intentar sincronizar operaciones del móvil.

**Aceptación:** conflicto/invalidación controlada y auditable.

### S07 — Evidencia interrumpida

1. Capturar fotografía.
2. Iniciar carga.
3. Interrumpir conexión.
4. Reanudar.
5. Completar carga.

**Aceptación:** archivo íntegro y una sola evidencia asociada.

### S08 — Cursor interrumpido

1. Descargar cambios.
2. Interrumpir después de una página/lote.
3. Reanudar usando checkpoint.
4. Continuar.

**Aceptación:** ni pérdida ni duplicación de cambios.

### S09 — Usuario revocado

1. Usuario prepara operaciones offline.
2. Servidor revoca permisos.
3. Usuario recupera conexión.
4. Intenta sincronizar.

**Aceptación:** servidor revalida autorización; no se acepta una operación no autorizada sólo por haber sido creada offline.

### S10 — Corrección geoespacial

1. Capturar nueva coordenada offline.
2. Sincronizar.
3. Verificar estado PENDING_DE_VALIDACIÓN.
4. Validar posteriormente.

**Aceptación:** la ubicación maestra no se sustituye silenciosamente.

## 7. Inyección de fallos

La PoC debe permitir controlar:

- ausencia total de red;
- red intermitente;
- latencia;
- timeout;
- HTTP 5xx;
- HTTP 401/403;
- respuesta perdida;
- conexión cortada durante upload;
- duplicación de request;
- cierre de aplicación;
- reinicio;
- modificación concurrente;
- cursor inválido;
- almacenamiento local próximo al límite.

## 8. Métricas

### Sincronización

- operaciones/minuto;
- tiempo total;
- latencia por lote;
- latencia por operación;
- porcentaje de éxito;
- reintentos;
- conflictos;
- operaciones pendientes.

### Evidencia

- tamaño;
- tiempo de upload;
- throughput;
- reintentos;
- fallos;
- tiempo hasta confirmación.

### Local

- almacenamiento utilizado;
- crecimiento de outbox;
- crecimiento de evidencia;
- tiempo de recuperación.

### Red

- bytes enviados;
- bytes recibidos;
- número de requests;
- efecto de compresión.

### Robustez

- operaciones perdidas;
- operaciones duplicadas;
- inconsistencias;
- recuperación después de reinicio.

## 9. Criterios de aceptación

La PoC será técnicamente satisfactoria si:

- 0 operaciones válidas perdidas;
- 0 duplicados efectivos por reintento;
- 0 sobrescrituras silenciosas en conflictos críticos;
- 100% de operaciones confirmadas son reconstruibles desde auditoría;
- evidencia interrumpida puede reanudarse;
- reinicio no destruye la cola;
- pull incremental puede reanudarse;
- autorización server-side se aplica al reconectar;
- corrección geoespacial conserva estado pendiente;
- las métricas permiten decidir la siguiente implementación.

Los umbrales de rendimiento y consumo se establecerán después de medir; no se inventan antes del experimento.

## 10. Comparación de almacenamiento local

La PoC debe mantener separada la interfaz del almacenamiento local para poder comparar candidatos.

Criterios:

- transacciones;
- integridad;
- consultas;
- migraciones;
- concurrencia;
- rendimiento;
- tamaño;
- recuperación;
- cifrado;
- compatibilidad Android/iOS;
- soporte Flutter;
- mantenimiento;
- coste/licencia;
- documentación;
- experiencia offline;
- facilidad de pruebas.

No declarar ganador antes de ejecutar la comparación.

## 11. Evidencia de resultados

Cada ejecución debe guardar:

- versión de la PoC;
- commit;
- dataset;
- dispositivo/emulador;
- sistema operativo;
- versión Flutter/Dart cuando corresponda;
- backend version;
- PostgreSQL version;
- condiciones de red;
- escenarios ejecutados;
- resultados;
- métricas;
- errores;
- logs técnicos sin datos sensibles;
- decisión derivada.

## 12. Reproducibilidad

Cada experimento debe poder repetirse con:

**dataset + configuración + commit + escenario + condiciones**

Los resultados deben almacenarse como artefacto de ingeniería y no sólo como comentario informal.

## 13. Límites

Esta PoC no pretende validar todavía:

- producción;
- escalado masivo;
- despliegue multi-región;
- microservicios;
- Kubernetes;
- mensajería distribuida;
- frecuencia definitiva de GPS;
- política legal de retención;
- cifrado definitivo de producción;
- elección definitiva del proveedor de mapas;
- algoritmo definitivo de resolución de conflictos.

## 14. Salidas

La PoC debe producir posteriormente:

1. Informe de resultados.
2. Decisión de almacenamiento local.
3. Contrato OpenAPI refinado.
4. Política de sincronización.
5. Catálogo de errores.
6. Casos de prueba automatizados.
7. ADR de decisiones técnicas que queden cerradas.
8. Lista de riesgos y decisiones pendientes.

## 15. Regla de decisión

Una tecnología o estrategia sólo se incorpora al baseline cuando:

**hipótesis → experimento → medición → evidencia → análisis → decisión → ADR → implementación**

No se seleccionará una tecnología simplemente por popularidad o familiaridad.

