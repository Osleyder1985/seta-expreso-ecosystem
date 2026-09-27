# Evaluación tecnológica del lector XLSX de Paquetería

**Estado:** evaluación técnica; no adoptado para producción  
**Issue rector:** #228  
**Fecha:** 2026-09-27

## 1. Decisión provisional

ExcelJS 4.4.0 permanece como candidato histórico/PoC, no como dependencia productiva.

El contrato vigente del Ecosistema es `WorkbookReaderPort`. El parser concreto debe permanecer aislado detrás de ese puerto.

## 2. Evidencia actual

El paquete oficial `exceljs` publica actualmente 4.4.0 bajo MIT. La versión lleva tiempo sin una nueva publicación oficial. La documentación del paquete confirma soporte para fórmulas, tipos de valores, formatos y lectura XLSX.

La investigación de seguridad de agosto de 2026 reporta un problema de consumo no controlado de recursos en `Workbook.xlsx.load()` para versiones <= 4.4.0, sin parche upstream publicado en el advisory consultado. Esto es directamente relevante porque el PoC histórico utilizaba `workbook.xlsx.load(buffer)`.

Existe además un issue upstream abierto sobre dependencias transitivas vulnerables, incluyendo `uuid` y `tmp`.

**Conclusión:** no se autoriza la recepción de archivos XLSX no confiables mediante ExcelJS 4.4.0 sin una barrera explícita de recursos/aislamiento o sin sustituir el parser.

## 3. Requisitos de comparación

Todos los candidatos deben probarse con los mismos fixtures y bajo Node 24:

- headers exactos y aliases;
- filas DATA/TOTAL/SUBTOTAL/EMPTY;
- fórmulas y resultado cacheado;
- fechas y números;
- formatos numéricos;
- hojas ocultas y muy ocultas;
- merged cells;
- celdas de error;
- provenance;
- workbooks grandes;
- memoria y tiempo;
- límites de recursos;
- licencia;
- árbol de dependencias;
- reproducibilidad mediante lockfile;
- mantenimiento;
- compatibilidad con la arquitectura de `WorkbookReaderPort`.

## 4. Candidatos

### ExcelJS 4.4.0

Ventajas: API madura, TypeScript, amplio soporte estructural y alineación con el PoC histórico.

Riesgos: versión oficial 4.4.0 sin parche upstream para el problema de consumo de recursos identificado; deuda de dependencias transitivas.

Estado: **CANDIDATO BLOQUEADO PARA PRODUCCIÓN** hasta mitigación/evaluación.

### Forks mantenidos

Existen forks públicos que actualizan dependencias o incorporan mitigaciones. No se consideran equivalentes al upstream: requieren evaluación independiente de mantenimiento, licencia, procedencia, compatibilidad API y supply chain.

Estado: **CANDIDATOS DE COMPARACIÓN**.

### Alternativas XLSX

SheetJS Community Edition y `read-excel-file` pueden evaluarse como alternativas, pero no se seleccionarán por disponibilidad de API. Deben demostrar que conservan los metadatos estructurales exigidos por el modelo intermedio.

Estado: **CANDIDATOS DE COMPARACIÓN**.

## 5. Gate de adopción

No se aprobará ningún parser como dependencia productiva hasta disponer de:

1. lockfile reproducible;
2. árbol de dependencias revisado;
3. análisis de seguridad;
4. fixtures F01–F20;
5. pruebas de límites de recursos;
6. comparación reproducible;
7. prueba con evidencia real anonimizada;
8. decisión ADR;
9. adapter aislado detrás de `WorkbookReaderPort`;
10. CI verificando las propiedades críticas.

## 6. Consecuencia arquitectónica

El contrato no debe contener tipos de ExcelJS ni de otro proveedor.

La aplicación recibirá un `ImportSnapshot` independiente de la biblioteca. Así, cambiar de ExcelJS a otro parser no obliga a modificar mapping, validación, reconciliación, geocodificación ni promoción operacional.

**Resultado: PARCIAL — contrato vigente; parser productivo pendiente.**
