# Decisión de dependencia XLSX del primer lector — v0.1.0

**Estado:** En validación

## Decisión provisional

El primer adapter de lectura XLSX utiliza **ExcelJS 4.4.0**, detrás de `WorkbookReaderPort`.

La dependencia está deliberadamente aislada en Infrastructure/adapter. El dominio y el modelo intermedio no importan ExcelJS.

## Motivos

- soporte de lectura XLSX desde Node.js;
- tipos TypeScript incluidos;
- lectura de valores, fórmulas y formatos;
- licencia MIT;
- permite reemplazar el proveedor sin cambiar el contrato interno.

## Reproducibilidad

El repositorio todavía tiene pendiente el bloqueo de reproducibilidad de dependencias registrado en #106: el PoC NestJS no contiene `package-lock.json`.

Por ello, este PR **no declara cerrada** la reproducibilidad de la dependencia.

Antes de considerar este adapter apto para benchmark/CI como baseline se debe:

1. ejecutar `npm install --package-lock-only` con Node 24.21.0/npm 11.19.0;
2. revisar el árbol de dependencias;
3. ejecutar pruebas;
4. incorporar el lockfile;
5. evaluar vulnerabilidades y licencias;
6. fijar el resultado en el benchmark environment.

## Alcance

Este adapter solo inspecciona y transforma XLSX a `ImportSnapshot`. No:

- persiste entidades;
- valida reglas de negocio;
- geocodifica;
- modifica archivos;
- decide aceptación operacional.

## Riesgos pendientes

- comportamiento ante workbooks grandes;
- merged cells complejas;
- fórmulas cuyo resultado no esté calculado;
- macros/XLSM;
- fechas y formatos regionales;
- celdas de error;
- hojas ocultas;
- límites de memoria.

Cada riesgo se cubrirá con fixtures antes de adoptar la dependencia como decisión tecnológica definitiva.
