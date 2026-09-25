# Impacto de evidencia real sobre el modelo de Paquetería — v0.1.0

**Estado:** En validación  
**Base:** evidencia de ocho manifiestos y del libro operativo de ingresos/gastos aportados el 2026-09-25.

## 1. Cambios confirmados

La evidencia real confirma que el diseño debe soportar:

- Master AWB como identificador externo textual.
- House como identificador externo textual; no debe ser entero obligatorio.
- Un House puede contener múltiples bultos/unidades físicas.
- Una misma dirección puede aparecer en múltiples Houses.
- Una persona puede aparecer en múltiples Houses.
- Una celda puede contener múltiples teléfonos.
- La dirección declarada debe conservarse aunque sea normalizada o geocodificada.
- Coordenadas válidas, ausentes y no resueltas.
- Hojas derivadas o auxiliares además de la hoja principal del manifiesto.
- Fórmulas y valores calculados.
- Reconciliación de totales documentales contra registros extraídos.

## 2. Evidencia cuantitativa

| AWB | Houses | Sacas | Bultos extraídos | Personas | Peso kg | Direcciones distintas |
|---|---:|---:|---:|---:|---:|---:|
| 649-31382864 | 63 | 63 | 63 | 48 | 1096.68 | 48 |
| 649-31382875 | 101 | 101 | 107 | 65 | 1658.09 | 60 |
| 649-31382886 | 155 | 155 | 155 | 136 | 2092.32 | 113 |
| 649-31382890 | 77 | 80 | 80 | 55 | 1396.62 | 44 |
| 649-31382901 | 107 | 107 | 107 | 71 | 1594.09 | 67 |
| 649-31382912 | 164 | 164 | 164 | 130 | 2298.45 | 122 |
| 649-31382923 | 145 | 145 | 145 | 105 | 2296.02 | 93 |
| 649-31382934 | 136 | 136 | 136 | 99 | 2298.22 | 96 |

Los casos 649-31382875 y 649-31382890 demuestran que Houses y bultos/sacas no son equivalentes.

## 3. Modelo intermedio requerido

Antes del modelo canónico se necesita una representación neutral:

```
ImportSnapshot
 ├─ SourceDocument
 ├─ Workbook
 │   └─ Sheet
 │       └─ Row
 │           └─ Cell
 ├─ DocumentMetadata
 ├─ MappingProfileRef
 └─ ExtractedRecord
     ├─ RawFieldValue
     ├─ InterpretedFieldValue
     ├─ Transformation
     ├─ ProvenanceRef
     └─ ValidationRef
```

Este modelo no es el esquema de base de datos.

## 4. Provenance mínimo

Un valor transformado debe poder remontarse a su origen mediante:

- documento y hash;
- workbook y worksheet;
- fila y columna;
- dirección de celda;
- encabezado original;
- valor original;
- fórmula cuando exista;
- perfil de mapping y versión;
- transformación y versión;
- ejecución de validación;
- actor cuando exista corrección manual.

Esto permite explicar de dónde salió cualquier dato operacional.

## 5. Reglas reforzadas

**REAL-001 — House textual:** conservar el valor fuente completo.

**REAL-002 — House/PhysicalUnit:** cantidad de bultos puede ser mayor que uno; mantener relación 1:N.

**REAL-003 — Teléfonos:** soportar múltiples valores y conservar el texto original.

**REAL-004 — Dirección:** transformación no destructiva.

**REAL-005 — Geocodificación:** ausencia o fallo de coordenadas no destruye el registro.

**REAL-006 — Hojas derivadas:** Aduana, Consolidado y auxiliares se tratan como fuentes relacionadas, no como sustitución silenciosa de la fuente principal.

**REAL-007 — Fórmulas:** distinguir fórmula, resultado calculado y valor introducido.

**REAL-008 — Totales:** comparar Houses, sacas, personas y peso declarados con los extraídos y producir findings trazables.

## 6. Reconciliación

El pipeline debe calcular al menos:

- Houses declarados/extraídos;
- sacas declaradas/bultos extraídos;
- personas declaradas/referencias extraídas;
- peso declarado/peso extraído;
- direcciones distintas;
- diferencias y tipo de discrepancia.

La comparación no debe reducirse a un booleano.

## 7. Impacto del libro económico

La evidencia económica demuestra capacidades adicionales:

- registro diario;
- cuentas y monedas;
- conciliación por guía;
- gastos;
- combustible;
- personal;
- hospedaje;
- kilómetros;
- costos territoriales;
- utilidad;
- caja.

Estas capacidades deben evolucionar como módulos/dominios relacionados, sin convertir las hojas Excel directamente en entidades de dominio.

## 8. Modelo económico provisional

Se recomienda separar:

**Operación** → guía/viaje/ruta/entrega

**Movimiento financiero** → ingreso/gasto/transferencia

**Cuenta** → código + descripción + moneda

**Costo de viaje** → combustible + personal + hospedaje + otros

**Rentabilidad** → ingresos atribuibles - costos atribuibles

**Caja** → movimiento monetario + saldo

Las fórmulas Excel deberán convertirse posteriormente en reglas documentadas y pruebas reproducibles.

## 9. Fixtures necesarios

Los fixtures sintéticos deben cubrir:

1. House numérico.
2. House textual.
3. House con un bulto.
4. House con múltiples bultos.
5. Varias Houses en una dirección.
6. Múltiples teléfonos.
7. Coordenadas válidas.
8. Coordenadas ausentes/no resueltas.
9. Hoja auxiliar.
10. Fórmulas.
11. Diferencia entre Houses y sacas.
12. Diferencia de peso.
13. Encabezado modificado.
14. Columna adicional.
15. Columna obligatoria ausente.

## 10. Próximo vertical técnico

El siguiente vertical de implementación queda definido como:

**preservación → inspección → mapping → extracción → reconciliación → validación → findings → modelo canónico candidato.**

La geocodificación, aceptación operacional y persistencia definitiva se conectarán mediante puertos, evitando acoplamiento prematuro a un proveedor o esquema físico.

## 11. Decisiones todavía abiertas

- semántica exacta de cobrado/no cobrado;
- autoridad y significado de datos de hojas auxiliares;
- granularidad de naturaleza/cantidad;
- identidad de personas;
- significado de estados por hoja;
- reglas definitivas de coordenadas;
- relación formal entre guía, Master AWB y viaje;
- dominio financiero y permisos;
- retención y acceso de datos personales.

Estas decisiones deben resolverse con evidencia operativa o normativa, no mediante suposiciones.
