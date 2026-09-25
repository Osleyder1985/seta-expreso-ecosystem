# Comparación experimental de almacenamiento de evidencias POD — v0.1.0

## Estado
**Estado:** evidencia experimental consolidada.  
**Issue:** #70  
**Comparación:** PR #69  
**Commit validado:** `9b3575d3ef10ebb0c12341d2d5ec35ff79d9059e`

Este documento consolida resultados observados. No constituye una selección de proveedor de producción.

## Alternativas ejecutadas

| Alternativa | Implementación experimental | Resultado CI |
|---|---|---|
| Filesystem | almacenamiento local controlado por la aplicación | PASS |
| S3-compatible | CloudServer S3-compatible en contenedor CI | PASS |

CloudServer se utilizó para validar el contrato técnico y los comportamientos de almacenamiento de objetos. **No queda seleccionado como proveedor de producción.**

## Condiciones

Dataset sintético determinista: 1, 5, 10 y 20 MiB. No se utilizaron documentos reales de clientes.

Ambos runners ejecutaron T01–T08 sobre los mismos tamaños. T04 se considera explícitamente no aplicable cuando una restricción del protocolo impide una carga multipart válida.

## Resultado funcional

| Prueba | Filesystem | S3-compatible |
|---|---|---|
| T01 escritura + verificación | PASS | PASS |
| T02 lectura autorizada | PASS | PASS |
| T03 acceso no autorizado | PASS | PASS |
| T04 interrupción/reanudación | PASS en todos los tamaños | N/A en 1 MiB; PASS en 5/10/20 MiB |
| T05 idempotencia | PASS | PASS |
| T06 recuperación tras reinicio del cliente | PASS | PASS |
| T07 detección de corrupción | PASS | PASS |
| T08 backup/restore | PASS | PASS |

### T04 S3-compatible

El runner utiliza partes de 5 MiB para respetar la restricción de tamaño mínimo de las partes multipart.

- 1 MiB: **no aplicable** como multipart.
- 5 MiB: 1 parte; se verifica continuidad del upload ID después de recrear el cliente.
- 10 MiB: 2 partes.
- 20 MiB: 4 partes.

## Métricas observadas

T01 mide el tiempo de escritura; la lectura posterior se verifica pero no forma parte del tiempo medido.

| Tamaño | Filesystem | S3-compatible |
|---:|---:|---:|
| 1 MiB | 0.000767 s | 0.047676 s |
| 5 MiB | 0.003288 s | 0.054002 s |
| 10 MiB | 0.006453 s | 0.097401 s |
| 20 MiB | 0.013497 s | 0.148310 s |

**Interpretación:** son observaciones de una ejecución de CI, no benchmarks estadísticamente suficientes para declarar una ventaja de producción. Filesystem escribe directamente sobre el sistema de archivos del runner; S3-compatible incluye HTTP, firma, procesamiento del servidor y almacenamiento detrás de una API de objetos. No deben convertirse en un ranking.

### Backup experimental

| Tamaño | Filesystem | S3-compatible |
|---:|---:|---:|
| 1 MiB | 2,879 B | 2,855 B |
| 5 MiB | 15,748 B | 13,035 B |
| 10 MiB | 41,360 B | 25,756 B |
| 20 MiB | 92,400 B | 51,178 B |

El tamaño del archivo de backup depende de la estructura del ensayo y de la compresión; no representa overhead de producción.

## Integridad

Los cuatro tamaños produjeron SHA-256 consistentes entre implementaciones:

- 1 MiB: `b85d19dcbd43f028fd8a78a9c0120b7bceccf1a83f5b6b8647876feb759d9830`
- 5 MiB: `5282b57ae3a1f4f54543a8cffca7deca20083ba924e18d9b44f11ca42c3a4d63`
- 10 MiB: `5546435e93b1dfd5405bd7cca0e70c8a6ae90c41fb2924d4ffa2f663eaf8c159`
- 20 MiB: `b7dd3865874956cf79234ef5e5783e8d74d225c0177469c7f87d33b2ebd81dab`

La prueba de corrupción detectó el cambio deliberado en ambas implementaciones.

## Seguridad y autorización

El PoC demuestra rechazo de un actor no autorizado, acceso de actores simulados autorizados, verificación de hash al leer, detección de contenido alterado e inmutabilidad lógica para una misma identidad de evidencia.

**Limitación:** la autorización S3-compatible es simulada en la frontera de la aplicación. No equivale al modelo final de IAM/policies del almacenamiento físico.

## Recuperación

T06 demostró recuperación después de recrear el cliente. T04 S3-compatible demostró continuidad de un multipart upload después de recrear el cliente cuando el tamaño permite multipart. T08 demostró backup/restore del contenido experimental.

**Pendiente:** recuperación coordinada de metadata PostgreSQL + contenido + referencias + detección de objetos huérfanos.

## Observaciones operacionales

CloudServer inició y completó las pruebas S3 correctamente. Durante el arranque aparecieron advertencias relacionadas con el módulo opcional `ioctl` y con sincronización de actualizaciones de directorios; el servicio continuó operativo y las pruebas terminaron correctamente.

Por ello CloudServer debe tratarse aquí como **implementación de prueba**, no como decisión de producción.

## Qué queda demostrado

1. El contrato de almacenamiento funciona con filesystem.
2. El mismo contrato funciona contra una API S3-compatible.
3. Integridad, autorización de aplicación, idempotencia, corrupción, recuperación y backup/restore pueden probarse sin acoplar el dominio.
4. `EvidenceStorage` sigue siendo técnicamente válido.

## Qué NO queda demostrado

Todavía no se demuestra rendimiento representativo de producción, concurrencia real, consumo comparable de CPU/RAM, durabilidad ante fallo físico, recuperación conjunta PostgreSQL + objetos, cifrado/gestión de claves de producción, retención legal, borrado por política, content scanning, alta disponibilidad, proveedor definitivo ni TCO.

## Decisión técnica inmediata

La evidencia no justifica seleccionar todavía un proveedor físico.

Se mantiene:

`Domain → EvidenceStorage → Physical Storage`

El dominio seguirá sin conocer filesystem, S3, CloudServer, MinIO u otro proveedor.

La siguiente fase deberá cubrir benchmark repetido, concurrencia, recuperación conjunta, backup/restore, seguridad física, operación, coste y migración A → B preservando `evidenceId` y hashes.
