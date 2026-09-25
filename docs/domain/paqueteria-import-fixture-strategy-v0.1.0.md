# Estrategia de fixtures sintéticos para el importador de Paquetería — v0.1.0

**Estado:** En validación  
**Base:** evidencia real de manifiestos y del libro económico aportados al proyecto.

## 1. Objetivo
Crear fixtures que reproduzcan las variaciones estructurales observadas sin incorporar nombres, documentos, teléfonos, direcciones u otros datos personales reales al repositorio.

## 2. Principios
1. Estructura real, datos sintéticos.
2. Cada fixture tiene un propósito de prueba.
3. Resultado esperado determinista.
4. Fingerprint estable para fixtures críticos.
5. Sin datos personales reales.
6. Casos mínimos y regresiones.
7. Relación con requisito, regla o aceptación.

## 3. Familias

### F01 — Manifiesto mínimo válido
Una hoja Manifiesto, cabecera reconocible, un House, un bulto, dirección y peso válido. Resultado: extracción y validación aceptables.

### F02 — House textual
House con formato CACC-00000001. Verifica que el identificador no se convierta a entero.

### F03 — House con múltiples bultos
Un House con cantidad 3 o 7. Verifica House → PhysicalUnit 1:N.

### F04 — Dirección compartida
Tres Houses con la misma dirección declarada. Verifica que no se creen tres direcciones obligatoriamente.

### F05 — Múltiples teléfonos
Una celda contiene dos o tres teléfonos separados por /. Verifica Phone[] y conservación del rawValue.

### F06 — Coordenadas válidas
Latitud/longitud sintéticas dentro de Cuba. Verifica GeocodingResult y provenance.

### F07 — Coordenadas no resueltas
LATITUD/LONGITUD ausentes o equivalentes a #N/A. Resultado: finding/no-geocoded; no pérdida de Address.

### F08 — Hoja Aduana
Workbook con Manifiesto + Aduana. Verifica fuentes relacionadas y no sustitución silenciosa.

### F09 — Hoja CONSOLIDADO
Workbook con Manifiesto + CONSOLIDADO. Verifica tratamiento como artefacto derivado.

### F10 — Fórmulas
Celdas con fórmulas y resultados calculados. Verifica formula + formulaResult separados.

### F11 — Totales discrepantes
El documento declara N Houses o un peso distinto del extraído. Resultado: discrepancy/finding con diferencia cuantificada.

### F12 — Encabezado alterado
Alias autorizado de un campo. Resultado: mapping por alias cuando el profile lo autorice.

### F13 — Encabezado ambiguo
Dos columnas candidatas para el mismo campo crítico. Resultado: AMBIGUOUS/BLOCKED.

### F14 — Campo crítico ausente
Falta House o dirección cuando el profile lo define como crítico. Resultado: BLOCKED o REJECTED según regla.

### F15 — Columna adicional
Columna no conocida. No debe romper la importación; debe registrarse la información estructural.

### F16 — Filas de total
Hoja con filas DATA y TOTAL. La fila TOTAL no se interpreta como House.

### F17 — Valores numéricos problemáticos
Peso vacío, texto no numérico o separador decimal alternativo. Resultado: finding de tipo y no conversión silenciosa.

### F18 — Identidad ambigua
Dos personas sintéticas con claves insuficientes. Resultado: AMBIGUOUS/REQUIRES_RECONCILIATION.

### F19 — Reimportación idéntica
Mismo archivo y mismo profile. Resultado: operación idempotente.

### F20 — Mismo contenido, profile diferente
Mismo archivo con versión diferente del mapping profile. Resultado: nueva ejecución identificable; nunca mezclar silenciosamente resultados.

## 4. Fixture económico
Se requiere una familia separada para ingreso, gasto, combustible, kilómetros, costo por municipio, salario/viático, hospedaje, utilidad, caja, fórmula, parámetro configurable y override manual. Todos los datos serán sintéticos.

## 5. Formato
Dos niveles: archivos XLSX mínimos para probar estructura y fixtures JSON versionados para ImportSnapshot, MappingProfile, ExtractedRecord, Finding, Discrepancy y CanonicalCandidate.

## 6. Trazabilidad
Cada fixture declara fixtureId, propósito, requisitos, reglas, casos de uso, estado esperado, findings esperados y artefactos afectados.

| Fixture | Regla/objetivo | Resultado esperado |
|---|---|---|
| F03 | House/PhysicalUnit | PASS |
| F05 | teléfonos múltiples | PASS |
| F07 | fallo geocoding | FINDING no bloqueante |
| F11 | reconciliación | DISCREPANCY |
| F13 | mapping ambiguo | BLOCKED |
| F14 | campo crítico ausente | BLOCKED/REJECTED |
| F19 | idempotencia | mismo resultado lógico |

## 7. Datos sintéticos
Los valores serán claramente ficticios, por ejemplo PERSONA_PRUEBA_001, DOC-TEST-001 y DIRECCION_TEST_001. Los teléfonos y coordenadas deben seguir una estrategia de datos de prueba controlados. Nunca se reutilizarán valores personales de los manifiestos originales.

## 8. Criterios de calidad
Un fixture es aceptable cuando reproduce la estructura objetivo, tiene resultado determinista, no contiene PII real, tiene provenance suficiente, se relaciona con al menos una regla/requisito y explica por qué existe.

## 9. Evolución
Los fixtures válidos se conservan como regresión. Si cambia una regla, se actualiza explícitamente el expected outcome con trazabilidad a la decisión que produjo el cambio.

## 10. Próximo paso
Implementar F01–F07 y el contrato de ejecución de fixtures; después F08–F20 y el conjunto económico.