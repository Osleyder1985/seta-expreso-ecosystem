# Arquitectura técnica de gestión de evidencias POD — v0.1.0

## 1. Propósito

Definir el diseño técnico inicial para capturar, sincronizar, almacenar, proteger, consultar y auditar evidencias de Proof of Delivery (POD) del módulo de Paquetería.

Este documento implementa las decisiones de gobernanza documentadas en `paqueteria-pod-evidence-governance-v0.1.0.md`, pero **no fija un período legal de retención**. La retención permanece parametrizable hasta completar la investigación normativa y contractual.

## 2. Principios

- **Evidencia ≠ estado de entrega.** Una foto o firma demuestra/soporta un hecho; no cambia por sí sola el estado del dominio.
- **Evidence ≠ Delivery.** Una entrega puede tener varias evidencias.
- **DeliveryAttempt ≠ Delivery.** Cada intento conserva su propia evidencia.
- **Originalidad e inmutabilidad lógica.** No se reemplaza silenciosamente una evidencia ya registrada.
- **Offline-first.** La captura debe funcionar sin conectividad.
- **Idempotencia.** Reintentar no debe crear duplicados.
- **Integridad verificable.** El contenido debe poder comprobarse mediante hash.
- **Autorización por objeto.** Ver un POD depende de identidad, rol y relación autorizada con el envío.
- **Retención por política.** No se codifica una duración legal fija.
- **Auditabilidad.** Captura, sincronización, acceso y cambios de estado relevantes deben quedar trazables.
- **Separación de responsabilidades.** El dominio no depende de un proveedor concreto de almacenamiento.

## 3. Tipos de evidencia

Tipos iniciales:

| Tipo | Uso | Regla |
|---|---|---|
| RECIPIENT_ID_PHOTO | Foto del documento de identidad del receptor | Obligatoria para entrega exitosa según regla de negocio SETA |
| PACKAGE_CONDITION_PHOTO | Estado/integridad del bulto | Según operación/incidente |
| RECIPIENT_SIGNATURE | Firma del receptor | Permitida cuando corresponda |
| INCIDENT_PHOTO | Evidencia de incidente | Según incidente |
| OTHER | Evidencia adicional autorizada | Requiere clasificación explícita |

La obligatoriedad concreta por escenario se mantiene en la capa de reglas de negocio, no en el almacenamiento.

## 4. Modelo lógico

### Evidence

- evidenceId
- evidenceType
- aggregateType
- aggregateId
- deliveryAttemptId (cuando aplique)
- deliveryId (cuando aplique)
- physicalBultoId (cuando aplique)
- capturedAt
- uploadedAt
- capturedBy
- deviceId
- source
- mimeType
- size
- contentHash
- storageReference
- status
- retentionPolicyId
- legalHold
- createdAt
- updatedAt

### Invariantes

1. `evidenceId` es único.
2. `contentHash` identifica el contenido recibido y permite verificar integridad.
3. Una evidencia confirmada no puede ser sobrescrita en sitio.
4. Una corrección genera nueva evidencia o una operación explícitamente auditable.
5. La eliminación física depende de política de retención y legal hold.
6. Los metadatos de trazabilidad no se pierden al retirar el contenido conforme a una política válida.

## 5. Ciclo de vida

`LOCAL_CAPTURED → SYNC_PENDING → UPLOADING → SERVER_STORED → VERIFIED → AVAILABLE`

Estados de excepción:

- `UPLOAD_RETRYABLE`: fallo temporal; permanece disponible para reintento.
- `UPLOAD_REJECTED`: rechazo definitivo por autorización, formato, integridad u otra validación.
- `QUARANTINED`: contenido retenido para validación técnica/seguridad.
- `LEGAL_HOLD`: no permite eliminación por retención ordinaria.
- `RETENTION_ELIGIBLE`: puede entrar en proceso de eliminación según política.
- `DELETED_CONTENT`: contenido eliminado conforme a política; se conserva el registro mínimo de auditoría permitido.

El dispositivo puede usar estados locales adicionales; estos no deben confundirse con los estados server-side.

## 6. Flujo offline-first

1. El usuario captura la evidencia.
2. La aplicación genera `evidenceId` y un identificador de operación único.
3. El archivo se guarda de forma durable en almacenamiento local protegido.
4. Se crea la operación en el Outbox.
5. La evidencia queda vinculada a la operación de entrega/intento.
6. Al existir conectividad, se envían primero los metadatos necesarios y después el contenido, respetando dependencias.
7. El servidor autentica y autoriza.
8. El servidor recibe/verifica el contenido y calcula/compara el hash.
9. Se confirma la operación de forma idempotente.
10. El cliente marca la evidencia como sincronizada.
11. El archivo local puede eliminarse únicamente cuando la política local y la confirmación segura lo permitan.

### Reanudación

Una carga interrumpida debe poder reanudarse sin obligar a recapturar la fotografía. La implementación concreta de multipart/resumable upload se deja como decisión de PoC.

## 7. Almacenamiento

La arquitectura utiliza una interfaz conceptual:

`EvidenceStorage`

Operaciones mínimas:

- `createUpload`
- `uploadPart` (si aplica)
- `completeUpload`
- `verify`
- `getMetadata`
- `openAuthorizedRead`
- `deleteContent`

El dominio no conoce S3, Azure Blob, MinIO, filesystem u otro proveedor. La selección tecnológica se realizará mediante PoC considerando costo, disponibilidad, recuperación, seguridad, operación y compatibilidad con el entorno real de SETA.

## 8. Integridad y seguridad

### Integridad

- Hash criptográfico del contenido.
- Verificación servidor-side.
- Identificador único por evidencia.
- No sobrescritura silenciosa.
- Asociación con operación y actor.
- Registro de fecha/hora de captura y recepción.

### Seguridad

- TLS para transporte.
- Cifrado en reposo cuando lo soporte el almacenamiento elegido.
- Acceso mínimo necesario.
- Autorización por objeto.
- Separación entre metadata y contenido cuando sea conveniente.
- No incluir fotografías de documentos de identidad en logs ordinarios.
- No exponer referencias internas de almacenamiento directamente al cliente.

La protección de datos personales y los controles específicos deben alinearse con la normativa aplicable y con las decisiones de gobernanza de PR #61.

## 9. Autorización

Antes de entregar una evidencia, el backend debe evaluar:

1. identidad autenticada;
2. estado de la cuenta;
3. rol/permisos;
4. relación con el objeto solicitado;
5. alcance de cliente/agencia;
6. estado de la evidencia;
7. restricciones de retención/legal hold;
8. auditoría requerida.

Ejemplo conceptual:

`Customer → own shipment → own package/delivery → authorized evidence`

Nunca se debe autorizar una evidencia únicamente porque el usuario conoce un `evidenceId`.

## 10. Auditoría

Eventos mínimos candidatos:

- `EVIDENCE_CAPTURED`
- `EVIDENCE_UPLOAD_STARTED`
- `EVIDENCE_UPLOAD_COMPLETED`
- `EVIDENCE_VERIFIED`
- `EVIDENCE_REJECTED`
- `EVIDENCE_ACCESSED`
- `EVIDENCE_DOWNLOAD_REQUESTED`
- `EVIDENCE_RETENTION_POLICY_APPLIED`
- `EVIDENCE_LEGAL_HOLD_SET`
- `EVIDENCE_LEGAL_HOLD_RELEASED`
- `EVIDENCE_CONTENT_DELETED`

La auditoría debe registrar actor, timestamp, objeto, resultado y contexto técnico necesario, evitando almacenar contenido sensible dentro del evento.

## 11. Retención

La arquitectura debe soportar:

- política identificada por `retentionPolicyId`;
- fecha de elegibilidad calculada por política;
- legal hold;
- suspensión de eliminación mientras exista hold;
- eliminación lógica/física según política;
- trazabilidad de la acción.

**No se establece una duración legal fija en este documento.**

Las políticas futuras podrán distinguir, como mínimo:

- operacional;
- contractual;
- fiscal/contable;
- aduanera;
- probatoria;
- legal hold.

## 12. Contrato HTTP candidato

### Crear metadatos de evidencia

`POST /api/v1/evidence`

Request conceptual:

```json
{
  "evidenceId": "uuid",
  "evidenceType": "RECIPIENT_ID_PHOTO",
  "aggregateType": "DELIVERY",
  "aggregateId": "uuid",
  "deliveryAttemptId": "uuid",
  "occurredAt": "2026-09-25T12:00:00Z",
  "mimeType": "image/jpeg",
  "size": 245678,
  "contentHash": "sha256:..."
}
```

Response: metadata + estado de carga + instrucciones temporales de carga, sin exponer credenciales permanentes.

### Inicializar carga

`POST /api/v1/evidence/{evidenceId}/upload`

Devuelve una sesión de carga temporal.

### Completar carga

`POST /api/v1/evidence/{evidenceId}/upload/complete`

El servidor verifica integridad y cambia el estado correspondiente.

### Consultar evidencia

`GET /api/v1/evidence/{evidenceId}`

Devuelve metadata autorizada.

### Acceder al contenido

`GET /api/v1/evidence/{evidenceId}/content`

El backend autoriza el acceso y entrega el contenido mediante streaming o una referencia temporal controlada, según la implementación.

### Solicitar lista autorizada

`GET /api/v1/deliveries/{deliveryId}/evidence`

Devuelve únicamente evidencias visibles para el actor autenticado.

Los nombres y esquemas definitivos deberán entrar en OpenAPI cuando el contrato sea aprobado.

## 13. Relación con el protocolo de sincronización

La evidencia utiliza el mismo `operationId`/ `idempotencyKey` del protocolo offline cuando la captura forma parte de una operación sincronizable.

Dependencias:

`Attempt → Delivery → Evidence`

La evidencia no debe quedar huérfana de la operación que la produjo.

El servidor debe tratar una repetición de la misma operación como reintento, no como nueva evidencia.

## 14. Fallos y conflictos

### Reintentable

- timeout;
- pérdida de conexión;
- 5xx;
- carga interrumpida;
- respuesta perdida después de aceptación server-side.

### Rechazo

- usuario sin autorización;
- objeto inexistente/no visible;
- tipo no permitido;
- contenido inválido;
- hash inconsistente;
- sesión de carga expirada.

### Conflicto

Una evidencia vinculada a un hecho crítico no debe resolverse con last-write-wins. Si la operación depende de una versión base incompatible, se conserva la evidencia capturada y se genera una resolución explícita.

## 15. Observabilidad

Métricas candidatas:

- evidencias capturadas;
- evidencias pendientes;
- uploads/minuto;
- tiempo de carga;
- tamaño medio;
- tasa de reintento;
- tasa de rechazo;
- tasa de hash mismatch;
- tiempo de sincronización;
- evidencias huérfanas;
- cargas interrumpidas/reanudadas;
- accesos autorizados/denegados.

No registrar imágenes ni documentos de identidad en logs de aplicación.

## 16. Pruebas

### Funcionales

- captura ID del receptor;
- varias evidencias para una entrega;
- evidencia por intento fallido;
- consulta autorizada;
- rechazo no autorizado;
- hash correcto/incorrecto.

### Offline

- captura sin red;
- reinicio antes de sincronizar;
- reintento;
- respuesta perdida;
- duplicación de operación;
- carga interrumpida;
- reconexión parcial.

### Seguridad

- usuario de otra agencia;
- cliente de otro envío;
- URL/referencia manipulada;
- evidencia eliminada/no disponible;
- cuenta revocada;
- legal hold.

### Integridad

- contenido modificado después del hash;
- metadata inconsistente;
- evidencia duplicada;
- sobrescritura accidental.

## 17. Decisiones pendientes

- proveedor/implementación de almacenamiento;
- protocolo exacto de resumable upload;
- compresión/redimensionamiento de imágenes;
- límites de tamaño y formatos;
- antivirus/content scanning;
- cifrado específico y gestión de claves;
- estrategia de backup/restore;
- retención legal/contractual concreta;
- política de eliminación segura;
- OpenAPI definitiva;
- modelo físico PostgreSQL;
- PoC de rendimiento y costos.

## 18. Criterios de salida

Esta arquitectura puede pasar a PoC cuando:

- el modelo Evidence sea aceptado;
- el contrato de autorización sea definido;
- el almacenamiento tenga una abstracción implementable;
- el flujo offline/sync esté integrado con el protocolo existente;
- existan pruebas de integridad, reintento y recuperación;
- la retención siga explícitamente desacoplada de la implementación.

## 19. Relación con otros artefactos

- Gobernanza POD: `docs/domain/paqueteria-pod-evidence-governance-v0.1.0.md`
- Offline sync: `docs/architecture/mobile-offline-sync-architecture-v0.1.0.md`
- Sync protocol: `docs/architecture/mobile-sync-protocol-v0.1.0.md`
- GPS tracking: `docs/architecture/gps-tracking-poc-v0.1.0.md`
- Functional specification: `docs/domain/paqueteria-functional-specification-v0.1.0.md`

**Estado:** Propuesto


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
