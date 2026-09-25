# PoC — POD Evidence Storage Runner

Este runner ejecuta de forma reproducible la primera fase del PoC definido en #64/PR #65.

## Objetivo

Medir una implementación local de almacenamiento de evidencias basada en filesystem bajo un contrato abstracto, sin acoplar el dominio al proveedor físico.

La implementación sirve como **baseline experimental**, no como decisión de producción.

## Ejecución

Requiere Python 3.11+ y no necesita dependencias externas:

```text
python poc/pod-evidence-storage/runner.py
```

También puede ejecutarse en CI.

## Pruebas

- T01 — escritura e integridad SHA-256.
- T02 — lectura autorizada.
- T03 — acceso no autorizado.
- T04 — carga interrumpida y reanudación.
- T05 — respuesta perdida/idempotencia simulada.
- T06 — recuperación después de reinicio.
- T07 — corrupción/hash mismatch.
- T08 — backup/restore.

## Dataset

Los datos son sintéticos. Se generan evidencias deterministas de 1, 5, 10 y 20 MiB.

No se utilizan documentos reales de clientes.

## Salidas

El runner genera:

- `results.json`: resultados estructurados y métricas;
- `artifacts/`: almacenamiento temporal y backup usado por el ensayo.

Las salidas generadas no deben versionarse.

## Siguiente fase

Después de validar la baseline filesystem, se incorporará una implementación S3-compatible real al mismo contrato y se repetirá exactamente el mismo protocolo experimental.

No se selecciona todavía ningún proveedor ni período legal de retención.
