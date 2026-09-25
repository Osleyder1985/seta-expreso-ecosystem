# PoC de almacenamiento de evidencias POD — v0.1.0

## 1. Propósito

Evaluar de forma reproducible alternativas de almacenamiento para fotografías y otros archivos POD, manteniendo el dominio independiente del proveedor.

Este PoC no decide la retención legal ni sustituye la arquitectura de gestión de evidencias.

## 2. Preguntas que debe responder

1. ¿Puede almacenarse una evidencia de forma durable?
2. ¿Puede verificarse su integridad mediante SHA-256?
3. ¿Puede reanudarse una carga interrumpida?
4. ¿Qué latencia presenta la carga y lectura?
5. ¿Qué ocurre ante reinicio del servidor?
6. ¿Cómo se realiza backup/restore?
7. ¿Cómo se restringe el acceso?
8. ¿Cuál es el consumo de CPU/RAM/disco?
9. ¿Qué complejidad operacional introduce?
10. ¿Puede migrarse la evidencia a otra implementación sin modificar el dominio?

## 3. Alternativas

### A — Filesystem gestionado

Archivos almacenados en un directorio controlado por la aplicación.

Ventajas a comprobar:
- mínima infraestructura;
- implementación sencilla;
- coste de licencia cero.

Riesgos a comprobar:
- backup;
- concurrencia;
- distribución futura;
- recuperación ante corrupción;
- gestión de grandes volúmenes.

### B — Object storage compatible con S3

Servicio autoalojado compatible con API S3.

Ventajas a comprobar:
- semántica de objetos;
- multipart/resumable upload;
- separación aplicación/archivo;
- migrabilidad.

Riesgos a comprobar:
- RAM/CPU;
- operación;
- backup;
- complejidad;
- mantenimiento adicional.

### C — Alternativa de objeto integrada

Se podrá incorporar una tercera implementación únicamente si el entorno del PoC proporciona una opción técnicamente relevante y gratuita.

No se añadirá una tecnología solamente para aumentar el número de candidatos.

## 4. Arquitectura del PoC

Evidence API
→ EvidenceStorage interface
→ implementación A/B/C
→ almacenamiento físico

PostgreSQL conserva metadata y estado; el contenido binario permanece detrás de la abstracción de almacenamiento.

El PoC debe demostrar que cambiar la implementación no requiere modificar las entidades de dominio.

## 5. Dataset

Casos mínimos:

| Caso | Tamaño |
|---|---:|
| Foto pequeña | 1 MB |
| Foto típica | 5 MB |
| Foto grande | 10 MB |
| Evidencia grande | 20 MB |

Escenario operativo:
- 30 paquetes;
- 20 paradas;
- 30 evidencias principales;
- 10 evidencias adicionales;
- cargas concurrentes controladas;
- repetición de pruebas para reducir ruido.

El dataset no contiene documentos reales de clientes.

## 6. Pruebas

### T01 — Escritura

- generar archivo;
- calcular SHA-256;
- almacenar;
- recuperar;
- recalcular SHA-256;
- comparar.

Éxito: hash idéntico.

### T02 — Lectura autorizada

- solicitar contenido con identidad autorizada;
- recuperar archivo;
- verificar contenido.

Éxito: contenido correcto y acceso auditado.

### T03 — Acceso no autorizado

Intentar acceder a evidencia de otro alcance.

Éxito: rechazo.

### T04 — Carga interrumpida

- iniciar carga;
- interrumpir red/proceso;
- reanudar;
- completar.

Éxito: no se requiere recaptura y el hash final coincide.

### T05 — Respuesta perdida

Simular aceptación del servidor seguida de pérdida de respuesta.

Éxito: reintento idempotente no genera una segunda evidencia.

### T06 — Reinicio

Reiniciar el servicio durante una operación pendiente.

Éxito: estado recuperable y operación reanudable.

### T07 — Corrupción

Modificar deliberadamente un archivo después de calcular su hash.

Éxito: detección de mismatch.

### T08 — Backup/restore

- crear dataset;
- ejecutar backup;
- destruir copia de prueba;
- restaurar;
- verificar metadata y hashes.

Éxito: recuperación verificable.

## 7. Métricas

### Rendimiento
- tiempo de upload;
- tiempo de download;
- throughput MB/s;
- p50/p95/p99 cuando el volumen permita medición significativa;
- operaciones por segundo.

### Recursos
- CPU;
- RAM;
- disco;
- espacio adicional;
- número de archivos/objetos.

### Resiliencia
- porcentaje de cargas recuperadas;
- tiempo de recuperación;
- operaciones duplicadas;
- pérdida de contenido;
- hash mismatch.

### Operación
- pasos de instalación;
- pasos de backup;
- pasos de restore;
- complejidad de actualización;
- dificultad de migración.

## 8. Condiciones de prueba

Las alternativas deben ejecutarse bajo condiciones comparables.

Registrar:
- hardware;
- sistema operativo;
- versión de software;
- configuración;
- tamaño de dataset;
- concurrencia;
- tipo de conexión;
- número de repeticiones;
- resultados y desviaciones.

No se deben comparar resultados obtenidos bajo configuraciones radicalmente diferentes.

## 9. Seguridad

El PoC debe validar como mínimo:
- autenticación en la API;
- autorización por evidencia;
- no exposición directa del path físico;
- hashes;
- TLS cuando corresponda al entorno;
- ausencia de datos reales;
- logs sin contenido de documentos de identidad.

El cifrado específico de disco/objeto y gestión de claves se evaluará como criterio separado.

## 10. Backup

El PoC debe distinguir:
- backup de metadata PostgreSQL;
- backup de contenido;
- consistencia entre metadata y contenido;
- restauración conjunta;
- detección de objetos huérfanos.

Un backup que restaura PostgreSQL pero pierde los archivos no se considera recuperación completa.

## 11. Migrabilidad

Crear una operación conceptual:

Storage A → Export → Storage B → Verify

El dominio debe conservar los mismos evidenceId y hashes.

La migración se considera correcta cuando:
- todas las evidencias están presentes;
- hashes coinciden;
- metadata permanece consistente;
- referencias se actualizan de forma auditable.

## 12. Criterios de decisión

No utilizar una puntuación arbitraria como sustituto de evidencia.

La decisión posterior deberá considerar:
1. criterios eliminatorios;
2. seguridad;
3. integridad;
4. recuperación;
5. coste;
6. operación;
7. rendimiento;
8. simplicidad;
9. migrabilidad;
10. compatibilidad con el ecosistema.

Un fallo de seguridad, pérdida de datos o imposibilidad de recuperación puede descartar una alternativa independientemente de su rendimiento.

## 13. Qué NO se decide en este PoC

- período legal de retención;
- proveedor comercial obligatorio;
- arquitectura de microservicios;
- Kubernetes;
- CDN;
- event streaming;
- blockchain;
- IA;
- distribución multi-región.

Estas decisiones no son necesarias para demostrar el almacenamiento POD inicial.

## 14. Resultado esperado

El PoC debe producir:
- resultados reproducibles;
- matriz comparativa;
- limitaciones observadas;
- evidencia de pruebas;
- decisión técnica propuesta;
- ADR posterior;
- actualización del Technology Stack Baseline si corresponde.

## 15. Criterio de salida

El PoC termina cuando cada alternativa seleccionada haya ejecutado T01–T08 o se documente explícitamente por qué una prueba no aplica.

**Estado:** Propuesto

**Fase/nota:** El estado anterior, si existía, se conserva como descripción histórica de fase; el campo `Estado` usa exclusivamente la taxonomía formal de gobernanza.
