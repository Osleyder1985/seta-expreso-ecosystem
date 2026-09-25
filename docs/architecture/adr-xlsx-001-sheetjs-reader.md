# ADR-XLSX-001 — Reader XLSX para la importación de Paquetería

- **Estado:** Propuesto — pendiente de certificación de producción
- **Fecha:** 2026-09-25
- **Alcance:** pipeline de importación XLSX de Paquetería
- **Decisión candidata:** SheetJS CE 0.20.3 como reader primario, encapsulado detrás de `WorkbookReaderPort`

## Contexto

El importador de Paquetería debe recibir libros XLSX reales, preservar estructura y procedencia, detectar encabezados que no necesariamente están en la fila 1, conservar información de celdas y permitir validación/reconciliación antes de promover datos al dominio.

La evidencia real disponible muestra libros con 1–8 hojas, 12–23 columnas, filas de metadatos antes del encabezado, rangos combinados y hasta 1.829 fórmulas. El manifiesto operacional analizado de forma privada contiene 134 filas, 12 columnas, 128 filas de datos, 70 direcciones únicas y 34 grupos de direcciones repetidas.

## Evidencia experimental

El benchmark reproducible usa Node.js 24.21.0, 20 fixtures funcionales y tres fixtures de estrés, con seis ejecuciones aisladas por reader.

En Run #64:

- 59 contratos PASS, 1 FAIL y 0 ERROR.
- La única falla es F10 con read-excel-file 9.3.10: el adapter no preserva simultáneamente expresión de fórmula, resultado cacheado y formato numérico.
- ExcelJS 4.4.0 y SheetJS CE 0.20.3 satisfacen F01–F20.
- Los fixtures malformados obtienen 9/9 rechazos esperados.
- Las mediciones de tiempo y memoria son evidencia auxiliar; no se convierten en una puntuación global.

## Decisión

Se propone adoptar **SheetJS CE 0.20.3** como implementación primaria de `WorkbookReaderPort`, manteniendo el reader aislado de dominio e infraestructura mediante un adapter.

La dependencia debe permanecer fijada al artefacto oficial:

`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`

La instalación debe ser reproducible y, antes de producción, debe registrarse el hash efectivo del artefacto en la evidencia de supply chain.

## Razones

1. Cumple los contratos funcionales F01–F20 del benchmark vigente.
2. Su modelo permite conservar información de workbook/sheet/range/celda requerida por el pipeline.
3. Evita adoptar ExcelJS 4.4.0 como parser primario para uploads no confiables mientras exista el advisory de consumo descontrolado de recursos.
4. Evita acoplar el dominio a una API de biblioteca concreta.
5. Mantiene abierta la sustitución futura del reader sin rediseñar el modelo canónico.

## Decisiones descartadas

### ExcelJS 4.4.0

No se adopta como parser primario de uploads. El advisory GHSA-7cvf-3r55-r39q afecta versiones <=4.4.0 y describe expansión sin límites de entradas ZIP durante `Workbook.xlsx.load()`. Cualquier uso futuro requiere aislamiento y límites de recursos explícitos, además de una reevaluación de seguridad.

### read-excel-file 9.3.10

No se adopta como reader estructural primario porque el contrato F10 falla y su modelo orientado a valores no satisface por sí solo las necesidades actuales de preservación de estructura/provenance.

### ExcelJS Hardened 5.0.0

No se adopta en este momento porque no existe una instalación reproducible verificable en la rama actual. La referencia histórica se conserva únicamente como evidencia previa.

## Arquitectura obligatoria

```
XLSX upload
    ↓
Container / resource gate
    ↓
SheetJS CE 0.20.3
    ↓
XlsxWorkbookReaderAdapter
    ↓
WorkbookModel
    ├─ WorksheetModel
    ├─ RowModel
    └─ CellModel
    ↓
ManifestImportAdapter
    ↓
ImportResult / reconciliation
    ↓
Domain
```

El dominio no debe importar `xlsx` directamente.

## Controles compensatorios

La selección del reader no elimina la necesidad de defensa en profundidad:

- validar firma/container antes del parser;
- limitar tamaño del upload;
- limitar memoria y CPU del proceso de parsing;
- limitar número de hojas, filas, columnas y XML/ZIP expandido;
- ejecutar parsing en proceso aislado cuando el límite de riesgo lo justifique;
- establecer timeout duro;
- registrar versión y hash del artefacto;
- no persistir PII en artefactos de benchmark;
- preservar provenance por hoja/fila/celda;
- rechazar ambigüedades críticas en vez de inferir datos.

## Gate específico de direcciones

La geocodificación no debe ejecutarse por fila de paquete. Debe operar sobre la dirección normalizada/deduplicada y conservar la relación paquete → dirección.

En el manifiesto real analizado: 128 paquetes → 70 direcciones únicas. Por tanto, el diseño inicial puede reducir las consultas de geocodificación a un máximo de 70 para ese libro, sin perder las 128 relaciones operacionales.

## Gates pendientes antes de declarar adopción definitiva

1. Ejecutar el probe privado del manifiesto real con los readers reproducibles y comparar fidelidad estructural.
2. Confirmar el lockfile y el hash del artefacto SheetJS en una ejecución CI reproducible.
3. Resolver SEC-02 habilitando Dependency Graph del repositorio y repetir Dependency Review.
4. Implementar y probar los límites de recursos del parser.
5. Registrar el resultado final de estos gates y cambiar este ADR a **Aceptado** únicamente si no aparece una incompatibilidad crítica.

## Consecuencia

La decisión arquitectónica queda preparada para implementación, pero **no debe interpretarse como certificación final de producción** hasta cerrar los gates anteriores.
