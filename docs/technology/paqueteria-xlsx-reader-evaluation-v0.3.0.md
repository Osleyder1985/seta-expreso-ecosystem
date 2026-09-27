# Evaluación comparativa de lectores XLSX de Paquetería

**Estado:** evaluación técnica; parser productivo NO seleccionado  
**Issue rector:** #228  
**Fecha:** 2026-09-27

## 1. Criterio

SETA no selecciona un parser por popularidad, antigüedad o actividad del paquete. El candidato debe producir el `ImportSnapshot` requerido por `WorkbookReaderPort`, preservar provenance suficiente para auditoría y soportar los fixtures F01–F20 bajo límites reproducibles.

## 2. Comparación preliminar

| Candidato | Estado | Evidencia actual | Riesgo/brecha |
|---|---|---|---|
| ExcelJS 4.4.0 | Bloqueado experimental | Adapter PoC ejecuta con Node 24; soporta estructura, fórmulas, formatos y estados de hoja | Consumo de recursos en `Workbook.xlsx.load()`; deuda de dependencias; CI reportó vulnerabilidades |
| read-excel-file 9.3.10 | Candidato | Proyecto activo, MIT, Node >=18; API para múltiples hojas y filas | API documentada entrega principalmente valores tabulares; requiere adapter y pruebas para provenance, fórmulas/cache, visibilidad, formatos y referencias |
| SheetJS CE | Candidato | Amplia superficie XLSX y opciones de parsing | Requiere evaluación de versión/distribución, supply chain, metadata estructural y seguridad |
| Forks de SheetJS/ExcelJS | Candidatos condicionados | Existen forks con actividad reciente o mitigaciones | Supply chain, procedencia, mantenimiento y compatibilidad deben evaluarse individualmente |

## 3. Hallazgo clave

La arquitectura actual es correcta: el parser concreto no forma parte del dominio.

`WorkbookReaderPort -> ImportSnapshot`

permite probar candidatos sin modificar mapping, validación, reconciliación, geocodificación, promoción ni persistencia operacional.

## 4. Próxima prueba objetiva

El siguiente experimento debe implementar un adapter mínimo de read-excel-file detrás del mismo puerto y ejecutar exactamente los mismos fixtures.

Debe registrar: sheets y orden; filas y clasificación; valores/tipos; fechas; fórmulas y resultado disponible; formatos; hidden/veryHidden; merged cells; errores; referencia de celda y provenance; límites de tamaño/filas/celdas; memoria y tiempo; árbol de dependencias; y reproducibilidad del lockfile.

Un candidato que no pueda satisfacer un requisito queda marcado como GAP, no compensado mediante inferencias silenciosas.

## 5. Regla de decisión

No se elegirá parser productivo hasta completar F01–F20, evidencia de seguridad/supply chain, prueba con evidencia real anonimizada, benchmark reproducible y ADR.

**Resultado actual: PARCIAL — contrato y fixtures vigentes; comparación en curso; parser productivo pendiente.**
