# Evaluación tecnológica preliminar — ExcelJS 4.4.0

**Fecha:** 2026-09-25  
**Estado:** En validación  
**Ámbito:** adapter XLSX del Bounded Context Paquetería

## 1. Conclusión provisional

ExcelJS **4.4.0 es la versión oficial actual del proyecto upstream**, pero no debe considerarse todavía una dependencia tecnológica adoptada de forma definitiva para producción.

El repositorio upstream mantiene 4.4.0 como versión del paquete y declara licencia MIT. La evaluación actual detecta deuda relevante de dependencias transitivas y avisos de seguridad/mantenimiento reportados durante 2025–2026.

Fuentes:
- https://github.com/exceljs/exceljs/blob/master/package.json
- https://github.com/exceljs/exceljs/issues/3055
- https://github.com/exceljs/exceljs/issues/3053
- https://github.com/exceljs/exceljs/issues/3077
- https://github.com/exceljs/exceljs/issues/3043

## 2. Hallazgos

### 2.1 Versión upstream

El upstream sigue declarando `version: 4.4.0`. No se adopta un fork como sustituto automático.

### 2.2 Dependencias transitivas

Existen reportes upstream sobre:
- `uuid` 8.x;
- `tmp` 0.2.x;
- cadenas antiguas relacionadas con `archiver`, `glob`, `inflight`, `fstream`;
- avisos de seguridad y mantenimiento con Node 24/npm 11.

Estos hallazgos **no equivalen por sí solos a una vulnerabilidad explotable en nuestro flujo**, pero sí constituyen deuda de supply chain que debe quedar documentada y verificarse mediante el árbol real de dependencias una vez generado el lockfile.

### 2.3 Riesgo adicional del parser

Existe un reporte de 2026 sobre consumo descontrolado de recursos mediante `Workbook.xlsx.load()` en archivos XLSX especialmente construidos. Esto es particularmente relevante porque nuestro adapter actual utiliza `workbook.xlsx.load(buffer)`.

Por tanto, si el sistema acepta archivos externos, el pipeline deberá incorporar límites de tamaño, controles de expansión/recursos y validaciones previas apropiadas antes de considerar el lector listo para producción.

## 3. Decisión sobre PR #144

La elección de ExcelJS 4.4.0 permanece **provisional y encapsulada detrás de WorkbookReaderPort**.

No se debe propagar ExcelJS fuera del adapter.

Esto permite sustituir la biblioteca sin modificar:
- modelo intermedio;
- reglas de validación;
- mapping profiles;
- contratos de importación;
- aplicación/domain services.

## 4. Alternativas

Se deben evaluar al menos:

1. ExcelJS oficial 4.4.0.
2. Forks mantenidos de ExcelJS, únicamente como alternativas técnicas y no como equivalentes oficiales.
3. Librerías XLSX alternativas con licencia compatible, mantenimiento activo y capacidad suficiente para lectura estructural.

La comparación debe usar fixtures comunes y medir:
- lectura;
- fórmulas y cached results;
- merged cells;
- hidden/veryHidden sheets;
- dates/numbers;
- error cells;
- large workbooks;
- memory;
- tiempo;
- compatibilidad Node 24;
- seguridad;
- licencia;
- mantenimiento;
- capacidad de streaming.

## 5. Gate antes de adopción

No se autoriza una decisión definitiva hasta disponer de:

- `package-lock.json` reproducible;
- árbol de dependencias real;
- `npm audit`/scanner de seguridad revisado;
- pruebas con fixtures F01–F20;
- evaluación de límites de recursos;
- prueba con manifiestos reales anonimizados;
- comparación contra alternativas;
- decisión registrada mediante ADR.

## 6. Resultado

**ExcelJS 4.4.0: técnicamente viable para continuar el PoC, pero NO adoptado definitivamente.**

La arquitectura actual de aislamiento es adecuada para mantener reversible esta decisión.
