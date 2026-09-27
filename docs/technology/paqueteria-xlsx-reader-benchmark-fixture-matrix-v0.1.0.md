# XLSX reader benchmark fixture matrix v0.1.0

**Estado:** En validación
**Fecha:** 2026-09-25

## Objetivo

Comparar ExcelJS y alternativas candidatas para la ingesta XLSX de Paquetería mediante el mismo modelo ImportSnapshot y el mismo contrato de adapter.

## Fixture families

| ID | Caso | Propiedad evaluada | Resultado mínimo |
|---|---|---|---|
| F01 | Manifest mínimo válido | lectura básica | snapshot equivalente |
| F02 | House textual | texto | rawValue + provenance |
| F03 | múltiples PhysicalUnit | cardinalidad | no fusionar unidades |
| F04 | dirección compartida | identidad | permitir compartir Address |
| F05 | múltiples teléfonos | colección | conservar todos |
| F06 | coordenadas válidas | números | precisión preservada |
| F07 | coordenadas no resolubles | ausencia | no eliminar Address |
| F08 | hoja Aduana | multi-sheet | hoja preservada |
| F09 | CONSOLIDADO | multi-sheet | hoja preservada |
| F10 | fórmulas | formula/cached result | ambos preservados |
| F11 | discrepancia de totales | reconciliación | valores fuente intactos |
| F12 | alias de header | mapping | mapping explícito |
| F13 | header ambiguo | seguridad | BLOCKED/AMBIGUOUS |
| F14 | campo crítico ausente | validación | finding bloqueante |
| F15 | columna adicional | evolución | no pérdida silenciosa |
| F16 | filas TOTAL/SUBTOTAL | clasificación | clasificación estable |
| F17 | valores numéricos problemáticos | parsing | rawValue conservado |
| F18 | identidad ambigua | conciliación | no inferir |
| F19 | reimport idéntico | determinismo | salida equivalente |
| F20 | mismo contenido/perfil diferente | versionado | profile version afecta mapping |

## Dimensiones

1. Fidelidad estructural: workbook/sheet/row/cell, visibilidad, headers y filas especiales.
2. Fidelidad de valores: raw/displayed/type, fechas, números y errores.
3. Fórmulas: fórmula, resultado cacheado y formato.
4. Provenance: sheet, row, column, cell address y raw value.
5. Determinismo: hash de entrada, fingerprint estructural y salida canónica.
6. Robustez: archivos grandes, filas vacías, headers desplazados, merged cells y hojas ocultas.
7. Recursos: tiempo, memoria pico y comportamiento bajo límites.
8. Supply chain: versión, lockfile, dependencias, vulnerabilidades y licencia.

## Métricas

Por fixture:
- read_duration_ms
- peak_memory_mb
- snapshot_hash
- structural_fingerprint
- cells_read
- formula_cells
- merged_ranges
- hidden_sheets
- findings
- data_loss_count
- adapter_errors

## Regla de equivalencia

Una biblioteca no es equivalente sólo porque devuelva los valores de las celdas. Debe alimentar nuestro adapter sin perder información requerida por el modelo intermedio.

## Gate

La biblioteca candidata al baseline deberá satisfacer los requisitos críticos F01–F20 o documentar excepciones aceptadas, conservar provenance, preservar fórmulas/resultados requeridos, pasar revisión de recursos y supply chain, quedar fijada por lockfile y permanecer aislada detrás de WorkbookReaderPort.

No se asignará una puntuación global arbitraria. La decisión se expresará mediante requisitos satisfechos, riesgos, evidencia, coste de adaptación y reversibilidad.
