# Gobernanza de Evidencias POD — Investigación normativa v0.1.0

**Issue:** #61  
**Estado:** Investigación preliminar  
**Clasificación:** normativa + arquitectura

## 1. Objetivo

Determinar qué obligaciones legales y operativas deben gobernar las evidencias de entrega (Proof of Delivery, POD), incluyendo la fotografía del documento de identidad del destinatario que SETA ha definido como evidencia obligatoria de entrega.

La investigación debe separar cuatro categorías:

- 🟢 obligación legal;
- 🔵 procedimiento oficial;
- 🟣 regla operativa SETA;
- ⚪ decisión de diseño del software.

No se fija un plazo de retención sin evidencia normativa suficiente.

## 2. Fuentes prioritarias

1. Gaceta Oficial de la República de Cuba.
2. Aduana General de la República.
3. AeroVaradero.

La Gaceta Oficial es la fuente primaria para normas jurídicas. La Ley 149/2022, de Protección de Datos Personales, fue publicada en la Gaceta Oficial No. 90 Ordinaria de 25 de agosto de 2022 como GOC-2022-832-O90. En el mismo número aparece la Resolución 58/2022 del Ministerio de Comunicaciones, relativa a la seguridad y protección de datos personales en soporte electrónico. La búsqueda pública confirmó estas referencias, pero el PDF oficial de Gaceta no pudo recuperarse automáticamente durante esta investigación por timeout; por ello no se debe tratar esta nota como sustituto del documento oficial. [E1][E2]

## 3. Hallazgo normativo confirmado

La Ley 149/2022 regula la protección de datos personales contenidos en registros, ficheros, archivos, bases de datos y otros medios técnicos, físicos o digitales, de carácter público o privado. Define responsabilidades sobre la finalidad, contenido y uso del tratamiento. [E1]

El principio de **limitación de recogida** exige que la recogida y almacenamiento de información que pueda identificar a una persona se limite a lo relevante y estrictamente necesario para una finalidad concreta, lícita y explícita, conservándose solo por el tiempo preciso de acuerdo con esa finalidad. [E1]

Esto es directamente relevante para una fotografía del documento de identidad del destinatario: el sistema no puede justificar una retención indefinida simplemente porque técnicamente pueda almacenarla.

## 4. Consecuencia para SETA

La fotografía del documento de identidad debe tratarse como **evidencia sensible de entrega asociada a datos personales**, no como una imagen ordinaria.

Hasta completar la investigación específica de retención, el diseño debe asumir:

- finalidad explícita y trazable;
- acceso restringido por autorización;
- almacenamiento protegido;
- registro de quién accede;
- integridad de la evidencia;
- asociación inequívoca con entrega/intento/paquete;
- conservación limitada a la finalidad y plazo que resulte jurídicamente aplicable;
- eliminación o anonimización solamente cuando sea legalmente procedente y no exista obligación de conservación;
- posibilidad de auditoría sobre ciclo de vida.

## 5. Evidencia POD mínima ya establecida por negocio

SETA ha establecido como requisito operativo que una entrega exitosa incluya una fotografía del documento de identidad del destinatario asociada al número/etiqueta del paquete.

Esta regla es **🟣 regla operativa SETA**, no se presenta como obligación legal cubana hasta encontrar una norma que la establezca.

La evidencia podrá ser consultada por:

- administradores autorizados;
- personal autorizado de la agencia correspondiente;
- cliente respecto de sus propios envíos.

La autorización debe aplicarse a nivel de objeto y no mediante una regla genérica de "usuario autenticado".

## 6. Arquitectura provisional de Evidence Management

La evidencia debe modelarse como entidad de primer nivel:

`Evidence`

con relación contextual hacia:

`Shipment/House/PhysicalBulto → DeliveryAttempt → Delivery → Evidence`

Cada evidencia debe conservar, como mínimo:

- evidenceId;
- evidenceType;
- aggregateType;
- aggregateId;
- capturedAt;
- uploadedAt;
- capturedBy;
- deviceId;
- source;
- contentHash;
- mimeType;
- size;
- storageReference;
- status;
- retentionPolicyId cuando exista;
- legalHold cuando corresponda;
- audit metadata.

La fotografía no debe quedar almacenada permanentemente en el teléfono como fuente de verdad. El dispositivo móvil es almacenamiento temporal offline; después de una sincronización confirmada, la evidencia pasa al almacenamiento controlado por el Ecosistema según la política aprobada.

## 7. Integridad

El sistema debe poder demostrar que la evidencia presentada corresponde a la evidencia capturada.

Por ello se recomienda como decisión de diseño provisional:

- identificador único;
- hash del contenido;
- metadatos de captura;
- vínculo a la operación que generó la evidencia;
- historial de estados;
- auditoría de accesos y cambios administrativos;
- prohibición de reemplazo silencioso del archivo.

Una corrección posterior debe crear una nueva versión o nueva evidencia relacionada, preservando la anterior según la política de conservación aplicable.

## 8. Offline-first

La evidencia capturada sin conexión debe:

1. quedar persistida localmente;
2. estar asociada a una operación única;
3. entrar en la cola durable de sincronización;
4. poder reintentarse;
5. evitar duplicación mediante idempotencia;
6. poder reanudar una carga interrumpida;
7. eliminarse del almacenamiento temporal solamente después de confirmación segura y conforme a la política local.

Una evidencia cuya carga no ha sido confirmada no puede considerarse archivada en servidor.

## 9. Acceso

La API de evidencia debe comprobar como mínimo:

- identidad del solicitante;
- rol/permisos;
- relación con el objeto de negocio;
- alcance del cliente/agencia;
- estado de la evidencia;
- posibles restricciones de conservación o legal hold.

No se debe permitir un endpoint genérico que exponga archivos por conocer su identificador.

## 10. Retención: estado actual

**NO CERRADO.**

La Ley 149/2022 aporta el principio de conservación limitada a la finalidad, pero esta investigación no ha identificado todavía una norma oficial específica que establezca un plazo concreto para la fotografía de identificación utilizada como POD en el contexto de paquetería de SETA.

Por tanto:

- ❌ no establecer todavía "1 año", "5 años", "10 años" ni cualquier otro plazo como requisito legal;
- ❌ no borrar automáticamente por una suposición;
- ❌ no conservar indefinidamente por conveniencia técnica;
- ✅ mantener una política parametrizable;
- ✅ documentar la fuente normativa que finalmente determine cada plazo;
- ✅ soportar legal hold;
- ✅ distinguir retención operacional, fiscal/contable, contractual, aduanera y probatoria si las normas aplicables las tratan separadamente.

## 11. Investigación pendiente

Debe verificarse específicamente:

1. normativa cubana de gestión documental y archivo aplicable a empresas privadas/Mipymes;
2. obligaciones fiscales/contables que puedan afectar documentos o evidencias de operaciones;
3. normativa aduanera aplicable a expedientes de paquetería;
4. requisitos de AeroVaradero para documentos/evidencias de entrega o recepción;
5. posibles obligaciones contractuales con las agencias;
6. tratamiento de documentos de identidad como datos personales y posibles categorías especiales;
7. reglas sobre transferencia o acceso de datos por agencias extranjeras;
8. destrucción segura y trazabilidad de eliminación;
9. incidentes de seguridad y notificación, si resultan aplicables;
10. requisitos de archivo electrónico y valor probatorio.

## 12. Matriz preliminar

| Tema | Estado | Clasificación |
|---|---|---|
| Protección de datos personales | Confirmado | 🟢 |
| Limitación de recogida | Confirmado | 🟢 |
| Conservación limitada a finalidad | Confirmado | 🟢 |
| Foto ID como POD obligatorio | Requisito SETA | 🟣 |
| Acceso del cliente a su POD | Requisito SETA | 🟣 |
| Acceso de agencia a sus envíos | Requisito SETA | 🟣 |
| Plazo concreto de POD | Pendiente | 🟡/🟢 |
| Legal hold | Decisión de diseño provisional | ⚪ |
| Hash de evidencia | Decisión de diseño provisional | ⚪ |
| Versionado | Decisión de diseño provisional | ⚪ |
| Almacenamiento servidor | Decisión de diseño provisional | ⚪ |
| Almacenamiento temporal móvil | Decisión de diseño provisional | ⚪ |

## 13. Referencias de investigación

**[E1]** Ley 149/2022, "De Protección de Datos Personales", GOC-2022-832-O90, publicada en Gaceta Oficial No. 90 Ordinaria, 25/08/2022. La fuente primaria es Gaceta Oficial; durante esta ejecución su PDF oficial no pudo ser recuperado automáticamente. El texto consultado coincide con la publicación identificada en el índice de la Gaceta. 

**[E2]** Resolución 58/2022, Ministerio de Comunicaciones, "Reglamento para la Seguridad y Protección de los Datos Personales en Soporte Electrónico", GOC-2022-833-O90, publicada en el mismo número de Gaceta. Requiere extracción/verificación del texto oficial antes de convertir sus controles concretos en requisitos.

## 14. Regla de ingeniería

Ninguna obligación jurídica se convierte directamente en código sin conservar la trazabilidad:

**Norma → artículo → interpretación documentada → requisito → diseño → implementación → prueba.**

Cuando la evidencia oficial sea insuficiente, el estado debe permanecer **PENDIENTE DE VERIFICACIÓN**, nunca transformarse en una regla inventada.
