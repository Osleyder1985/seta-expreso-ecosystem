# Paquetería XLSX — matriz de conformidad F01–F20 v0.1.0

**Estado:** En validación técnica  
**Issue rector:** #228  
**Reproducción:** #238  
**Fecha:** 2026-09-27

## 1. Propósito

Esta matriz convierte en especificación ejecutable la cobertura F01–F20 recuperada de los trabajos históricos #149/#150.

La matriz es **provider-neutral**. Un lector sólo puede considerarse funcionalmente conforme cuando su adapter produce un `ImportSnapshot` equivalente y conserva las invariantes requeridas.

No se selecciona ningún parser mediante esta matriz.

## 2. Casos

| ID | Caso | Invariante mínima |
|---|---|---|
| F01 | Manifest mínimo válido | snapshot estructural equivalente |
| F02 | House textual | rawValue + provenance |
| F03 | múltiples PhysicalUnit | no fusionar unidades |
| F04 | dirección compartida | conservar observaciones independientes |
| F05 | múltiples teléfonos | conservar todos los valores |
| F06 | coordenadas válidas | preservar valor numérico/precisión |
| F07 | coordenadas no resolubles | no eliminar Address |
| F08 | hoja Aduana | preservar hoja y orden |
| F09 | CONSOLIDADO | preservar hoja y orden |
| F10 | fórmulas | fórmula + resultado cacheado + formato requerido |
| F11 | discrepancia de totales | valores fuente intactos |
| F12 | alias de header | mapping explícito/versionado |
| F13 | header ambiguo | BLOCKED/AMBIGUOUS; sin inferencia silenciosa |
| F14 | campo crítico ausente | finding bloqueante |
| F15 | columna adicional | no pérdida silenciosa |
| F16 | TOTAL/SUBTOTAL | clasificación estable |
| F17 | valores numéricos problemáticos | rawValue/provenance conservados |
| F18 | identidad ambigua | no inferir identidad |
| F19 | reimport idéntico | salida equivalente/determinista |
| F20 | mismo contenido + perfil distinto | versión del mapping afecta la interpretación |

## 3. Estado reproducido actualmente en main

| Caso | Estado | Evidencia actual |
|---|---|---|
| F01 | 🟡 PARCIAL | fixture estructural |
| F02 | 🟡 PARCIAL | House textual en fixture |
| F03 | 🔴 PENDIENTE | requiere fixture de cardinalidad |
| F04 | 🟡 PARCIAL | dirección repetida conservada |
| F05 | 🔴 PENDIENTE | requiere fixture |
| F06 | 🔴 PENDIENTE | requiere fixture |
| F07 | 🔴 PENDIENTE | requiere fixture |
| F08 | 🟡 PARCIAL | hojas múltiples/visibilidad |
| F09 | 🟡 PARCIAL | estructura multi-sheet |
| F10 | 🟡 PARCIAL | fórmula/cache/formato en fixture |
| F11 | 🔴 PENDIENTE | requiere reconciliación |
| F12 | 🔴 PENDIENTE | mapping fuera del reader |
| F13 | 🔴 PENDIENTE | inspección de headers |
| F14 | 🔴 PENDIENTE | validación de campos críticos |
| F15 | 🔴 PENDIENTE | pérdida de columnas debe medirse |
| F16 | 🟡 PARCIAL | TOTAL/SUBTOTAL probado |
| F17 | 🔴 PENDIENTE | casos numéricos anómalos |
| F18 | 🔴 PENDIENTE | reconciliación de identidad |
| F19 | 🔴 PENDIENTE | determinismo/reimport |
| F20 | 🔴 PENDIENTE | versionado de MappingProfile |

**Regla:** PARCIAL no significa PASS. Sólo identifica que existe evidencia actual de una parte del requisito.

## 4. Dimensiones transversales

Cada ejecución completa deberá registrar:

- provenance por celda;
- rawValue y displayedValue cuando existan;
- tipo detectado;
- fórmula y resultado cacheado;
- formato numérico;
- visibilidad de hojas;
- filas HEADER/DATA/EMPTY/TOTAL/SUBTOTAL;
- cell address;
- cantidad de celdas leídas;
- errores del adapter;
- pérdida de datos;
- fingerprint/hash estructural;
- duración;
- memoria pico;
- comportamiento ante límites.

## 5. Evidencia histórica recuperada

Los PR #149/#150 contienen una especificación F01–F20 y un harness comparativo histórico que reportó ejecuciones de ExcelJS 4.4.0, SheetJS CE 0.20.3 y read-excel-file 9.3.10.

Esa evidencia se considera **histórica hasta ser reproducida sobre main**. No se importan sus conclusiones ni sus puntuaciones como decisión actual.

En particular, cualquier afirmación histórica de que un candidato satisface F01–F20 debe volver a comprobarse con:

1. el contrato actual `WorkbookReaderPort`;
2. los fixtures actuales;
3. las versiones/artifacts actualmente fijados;
4. CI actual;
5. los controles de supply chain vigentes.

## 6. Criterio de decisión

No existe una puntuación agregada ni un ranking.

La decisión tecnológica debe registrar:

- requisitos satisfechos;
- requisitos no satisfechos;
- información perdida;
- coste/complexidad del adapter;
- riesgos de seguridad;
- consumo de recursos;
- reproducibilidad del artefacto;
- dependencia y supply chain;
- reversibilidad de la decisión.

Un candidato puede ser funcionalmente compatible y aun así quedar bloqueado para producción por seguridad, recursos o supply chain.

## 7. Próximo incremento

El siguiente PR de #238 debe convertir F03/F05/F06/F07/F11/F13/F14/F15/F17/F18/F19/F20 en fixtures y pruebas ejecutables, sin conectar todavía ningún lector al flujo productivo.

Después se podrá reutilizar el mismo conjunto contra ExcelJS, read-excel-file y SheetJS.
