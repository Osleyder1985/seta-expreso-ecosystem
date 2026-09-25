# ADR-002 — Mantener abstracción de almacenamiento POD y diferir proveedor físico

- **Estado:** ACEPTADO PROVISIONALMENTE
- **Fecha:** 2026-09-25
- **Issue:** #70
- **Relacionado:** #63, #64, #66, #68, #69

## Contexto

Las evidencias POD requieren captura offline, sincronización, integridad, autorización, auditoría, retención controlada y recuperación.

El PoC ejecutó filesystem y S3-compatible mediante CloudServer en CI. Ambas implementaciones completaron las pruebas T01–T08 aplicables con éxito.

## Decisión

Se mantiene la arquitectura:

`Domain → EvidenceStorage → Physical Storage`

El dominio y los casos de uso no dependerán de un proveedor concreto.

No se selecciona todavía filesystem, CloudServer, MinIO ni otro producto como almacenamiento de producción.

## Justificación

La evidencia valida el desacoplamiento y la viabilidad funcional del contrato, pero no es suficiente para una decisión de producción.

Los tiempos T01 corresponden a una única ejecución de CI y no constituyen un benchmark estadístico. Tampoco se ha validado la recuperación conjunta PostgreSQL + contenido.

Seguridad física, cifrado, gestión de claves, concurrencia, operación, mantenimiento y coste requieren pruebas adicionales.

## Consecuencias positivas

- evita lock-in prematuro;
- mantiene el dominio independiente;
- permite cambiar filesystem por object storage sin rediseñar entidades;
- facilita PoC y migración;
- preserva compatibilidad con offline-first;
- evita introducir infraestructura distribuida prematuramente.

## Consecuencias negativas

- existe una capa de abstracción adicional;
- la selección física queda pendiente;
- detalles específicos del almacenamiento deben permanecer fuera del dominio;
- se requiere una fase operacional adicional.

## Alternativas no seleccionadas

### Filesystem como definitivo
Pendiente de validar recuperación, crecimiento, backup, concurrencia y operación de largo plazo.

### S3-compatible como definitivo
Pendiente de validar recuperación conjunta, operación, seguridad física, coste y mantenimiento.

### CloudServer como definitivo
No se justifica: fue únicamente la implementación experimental S3-compatible.

### Proveedor cloud comercial
No se justifica en esta fase por la restricción de presupuesto cero y porque el objetivo actual es validar la arquitectura.

## Criterios para cerrar la decisión física

- benchmark repetido;
- concurrencia;
- backup/restore conjunto;
- recuperación ante fallo;
- integridad;
- autorización;
- cifrado;
- migración;
- coste;
- complejidad operativa;
- compatibilidad con PostgreSQL y aplicaciones móviles.

## Estado

**Arquitectura:** cerrada provisionalmente.  
**Proveedor físico:** abierto.  
**Retención legal:** abierta.  
**Política de eliminación:** abierta.  
**Alta disponibilidad:** abierta.
