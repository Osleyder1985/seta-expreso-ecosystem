# UC-PQ-01 — Importar manifiesto de Paquetería v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base:** `4ed6073a34fa2a5e065af0661f69dc720546a613`  
**RF:** RF-PQ-001  
**Capacidades:** CAP-PQ-01, CAP-PQ-02  
**Reglas:** RN-PQ-001, RN-PQ-002, RN-PQ-003  
**Pruebas:** AT-PQ-001, AT-PQ-002, AT-PQ-003

## 1. Objetivo

Permitir que un operador incorpore al Ecosistema un manifiesto recibido en formato Excel, preservando íntegramente la fuente original, registrando su procedencia y ejecutando una validación estructural y semántica sin destruir ni sobrescribir los datos declarados.

La importación es un proceso de **ingesta + validación + clasificación**, no una simple carga de filas en tablas operacionales.

## 2. Actores

### Actor principal
**Operador autorizado de Paquetería.**

### Actores/sistemas secundarios
- Sistema SETA EXPRESO.
- Repositorio de archivos/evidencias.
- Motor de validación.
- Catálogos maestros.
- Servicio de normalización de direcciones, cuando corresponda.
- Servicio de geocodificación, cuando corresponda.
- Fuente externa del manifiesto (agencia/transitario/AeroVaradero según flujo real).

La importación no debe atribuir al sistema una autoridad que corresponda a una entidad externa.

## 3. Precondiciones

1. El operador está autenticado.
2. El operador posee permiso para importar manifiestos.
3. El archivo está disponible para el sistema.
4. El formato admitido está identificado.
5. El sistema puede almacenar el archivo fuente y sus metadatos.
6. Los catálogos requeridos por la validación están disponibles o el sistema puede marcar la validación como incompleta.

## 4. Disparador

El operador selecciona **Importar manifiesto** y proporciona un archivo Excel.

## 5. Entradas

Como mínimo:

- archivo fuente;
- nombre del archivo;
- tipo/extensión;
- tamaño;
- usuario/actor;
- fecha y hora de recepción;
- contexto de origen cuando esté disponible.

El sistema debe derivar:

- hash criptográfico del archivo;
- identificador único de importación;
- versión del proceso/importador;
- hojas detectadas;
- estructura encontrada;
- conteo de filas/columnas;
- resultado de validación.

## 6. Flujo normal

### Fase A — Recepción

1. El operador inicia una importación.
2. El sistema autentica y autoriza la operación.
3. El sistema recibe el archivo.
4. Calcula su hash.
5. Persiste el archivo original de forma inmutable respecto al proceso normal.
6. Crea un registro de importación con estado inicial.

### Fase B — Inspección

7. El sistema identifica el formato.
8. Abre el libro sin modificarlo.
9. Identifica hojas.
10. Detecta encabezados y estructura.
11. Determina las filas candidatas.
12. Registra metadatos de origen de cada dato relevante: hoja, fila y columna cuando estén disponibles.

### Fase C — Validación

13. Ejecuta validaciones sintácticas.
14. Ejecuta validaciones estructurales.
15. Ejecuta validaciones de obligatoriedad.
16. Ejecuta validaciones de tipos/formato.
17. Ejecuta validaciones de consistencia.
18. Ejecuta validaciones contra catálogos conocidos.
19. Identifica duplicados y posibles conflictos.
20. Clasifica cada resultado como válido, advertencia o error.

### Fase D — Conciliación inicial

21. El sistema identifica registros potencialmente utilizables.
22. Mantiene separados los valores declarados de cualquier valor interpretado/normalizado.
23. Genera un resumen de resultados.
24. Registra discrepancias.
25. Si existen errores bloqueantes, no crea silenciosamente datos operacionales como si estuvieran validados.

### Fase E — Resultado

26. El sistema genera el resultado de importación.
27. Asocia errores y advertencias con su ubicación en el archivo.
28. Registra auditoría.
29. Emite el evento `ManifestRegistered`.
30. Si el proceso de validación termina correctamente, emite `ManifestValidated`.
31. El operador puede consultar el detalle y continuar con la conciliación o siguiente etapa.

## 7. Estados de la importación

Los siguientes son **estados candidatos**, no todavía un catálogo definitivo:

- RECEIVED
- INSPECTING
- VALIDATING
- VALID
- VALID_WITH_WARNINGS
- INVALID
- REQUIRES_RECONCILIATION
- ACCEPTED_FOR_PROCESSING
- REJECTED
- FAILED

No debe confundirse el estado de la importación con el estado operacional del manifiesto.

## 8. Flujos alternativos

### FA-01 — Archivo no soportado
El sistema rechaza el archivo y registra motivo.

### FA-02 — Archivo corrupto
El archivo original se conserva si fue recibido correctamente y el resultado queda FAILED/INVALID según clasificación definitiva.

### FA-03 — Hoja esperada ausente
La importación continúa hasta donde sea posible y registra error estructural.

### FA-04 — Columnas desconocidas
No se descartan automáticamente. Se registran y quedan sujetas a la política de compatibilidad del importador.

### FA-05 — Campos obligatorios ausentes
La fila se clasifica con error; no se inventan valores.

### FA-06 — Dirección no interpretable
Se conserva la dirección declarada y se marca para rectificación/validación posterior.

### FA-07 — Geocodificación fallida
No convierte el fallo de geocodificación en pérdida del registro. El estado de geocodificación queda separado.

### FA-08 — Duplicado
El sistema detecta posible duplicidad y la clasifica; no elimina automáticamente un registro histórico.

### FA-09 — Reimportación del mismo archivo
El hash permite detectar una fuente idéntica. La política definitiva de reimportación debe decidir si se rechaza, se crea una nueva ejecución o se reutiliza una importación previa.

### FA-10 — Error parcial
Una fila defectuosa no debe ocultar el resultado de las filas restantes. La estrategia definitiva de atomicidad por lote queda pendiente de DEC-PQ-006.

## 9. Errores

Cada error de validación debería contener, como mínimo:

- código estable;
- severidad;
- mensaje técnico;
- mensaje operacional;
- importación;
- hoja;
- fila;
- columna;
- campo;
- valor declarado cuando sea seguro registrarlo;
- regla violada;
- fecha/hora.

Ejemplos de códigos candidatos:

- PQ-IMP-FMT-001
- PQ-IMP-STR-001
- PQ-IMP-REQ-001
- PQ-IMP-TYPE-001
- PQ-IMP-CAT-001
- PQ-IMP-DUP-001
- PQ-IMP-ADDR-001

Los códigos son provisionales y deben consolidarse en un catálogo de errores.

## 10. Integridad y preservación

La importación debe mantener tres conceptos separados:

**Valor declarado**  
→ exactamente lo recibido.

**Valor interpretado/rectificado**  
→ transformación explicable realizada por el sistema o un operador.

**Valor operacional**  
→ dato aprobado para uso operativo.

Nunca debe sobrescribirse silenciosamente el primer nivel con los otros.

## 11. Idempotencia y reintento

La operación debe disponer de un identificador de operación/idempotencia.

Se debe poder distinguir:

- misma solicitud repetida;
- mismo archivo enviado nuevamente;
- nuevo archivo con contenido diferente;
- reintento técnico después de un fallo.

La política exacta de idempotencia de la API queda para el diseño transversal de comandos.

## 12. Seguridad

Debe verificarse:

- autenticación;
- autorización;
- tamaño máximo;
- tipo/formato permitido;
- contenido potencialmente peligroso;
- almacenamiento seguro;
- control de acceso al archivo;
- auditoría;
- protección de datos personales;
- prevención de procesamiento de contenido no autorizado.

No se deben registrar indiscriminadamente datos sensibles en logs.

## 13. Auditoría

Registrar como mínimo:

- actor;
- operación;
- timestamp;
- identificador de importación;
- hash;
- resultado;
- cantidad de filas;
- cantidad válida;
- cantidad con advertencias;
- cantidad con errores;
- versión del importador;
- correlación de ejecución.

La auditoría no debe depender exclusivamente de los logs de aplicación.

## 14. Eventos candidatos

### ManifestRegistered
Indica que la fuente fue recibida y registrada.

### ManifestValidated
Indica que terminó la validación.

### ManifestDiscrepancyDetected
Indica que se identificó una discrepancia relevante.

Los eventos no implican todavía mensajería distribuida ni broker externo.

## 15. Datos que NO deben derivarse automáticamente

La importación no debe inventar:

- coordenadas;
- provincia;
- municipio;
- estado aduanero;
- elegibilidad de distribución;
- POD;
- resultado de entrega;
- identidad de una persona por coincidencia aproximada;
- relaciones documentales no demostradas.

Esos datos requieren reglas y/o procesos específicos.

## 16. Criterios de aceptación

### AT-PQ-001
Dado un Excel válido, cuando se importa, entonces el sistema conserva el archivo fuente, hash y trazabilidad de origen.

### AT-PQ-002
Dado un Excel estructuralmente inválido, cuando se importa, entonces el sistema informa los errores sin destruir el archivo fuente.

### AT-PQ-003
Dada una discrepancia, cuando se detecta, entonces se conservan valores declarado/observado y su trazabilidad.

### AT-PQ-004
Dada una dirección no geocodificable, cuando termina la importación, entonces el registro permanece disponible con geocodificación pendiente/fallida y la dirección declarada intacta.

### AT-PQ-005
Dado el mismo archivo importado dos veces, el sistema puede identificar la identidad del contenido mediante hash.

### AT-PQ-006
Dado un error en una fila, las demás filas no se convierten silenciosamente en inválidas.

### AT-PQ-007
Dada una operación sin autorización, el sistema rechaza la importación y registra el intento conforme a la política de seguridad.

### AT-PQ-008
Finalizada una importación, un usuario autorizado puede consultar resumen, errores, advertencias y trazabilidad.

## 17. Métricas operacionales candidatas

No se fijan umbrales todavía.

Se propone medir:

- tiempo de recepción;
- tiempo de inspección;
- tiempo de validación;
- tiempo total;
- filas procesadas/segundo;
- porcentaje válido;
- porcentaje con advertencias;
- porcentaje con errores;
- duplicados detectados;
- direcciones pendientes de validación;
- fallos técnicos;
- reintentos.

Los objetivos cuantitativos deberán surgir de datos reales y NFR.

## 18. Dependencias

- lector XLSX compatible;
- almacenamiento de fuente;
- catálogo de datos;
- motor de validación;
- auditoría;
- autenticación/autorización;
- eventualmente normalizador/geocoder.

El proveedor concreto del lector XLSX y de geocodificación no queda fijado por este caso de uso.

## 19. Decisiones pendientes relacionadas

- DEC-PQ-001: jerarquía documental.
- DEC-PQ-006: modificación/cancelación y atomicidad.
- DEC-PQ-007: jerarquía Master AWB/Guide/House.
- DEC-PQ-009: catálogos territoriales.
- DEC-PQ-005: criterios de liberación a distribución.

## 20. Trazabilidad

`RF-PQ-001 → CAP-PQ-01 → UC-PQ-01 → RN-PQ-001..003 → EV-PQ-001/002/003 → AT-PQ-001..008`

## 21. Fuera de alcance

Este caso de uso no define todavía:

- API REST concreta;
- tablas PostgreSQL;
- PostGIS;
- proveedor de geocoding;
- algoritmo de routing;
- UI definitiva;
- microservicio separado;
- broker;
- arquitectura de despliegue.

## 22. Estado

**En validación.**

Este caso de uso es suficientemente detallado para iniciar el diseño del flujo de importación y sus pruebas, pero las decisiones marcadas como pendientes deben cerrarse antes de congelar contratos físicos definitivos.
