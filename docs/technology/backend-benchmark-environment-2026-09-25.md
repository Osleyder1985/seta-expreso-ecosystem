# Entorno de referencia del benchmark backend

**Versión:** 0.1.0  
**Estado:** Vigente  
**Fecha de captura:** 2026-09-25  
**Propósito:** preservar en GitHub el entorno Windows de referencia utilizado para el benchmark NestJS vs ASP.NET Core.

## 1. Plataforma

- Sistema operativo: Windows 11 Pro
- CPU: Intel Core i7-13700H, 13th Gen, 2.40 GHz
- Memoria RAM: 16 GB
- GPU: NVIDIA GeForce RTX 4080 Laptop GPU, 12 GB
- GPU: no relevante para el benchmark backend inicial.

## 2. Herramientas verificadas

Los siguientes valores fueron proporcionados por el propietario del entorno el 2026-09-25 y quedan registrados como baseline de esta ejecución:

| Herramienta | Versión |
|---|---|
| Docker Engine | 29.7.2 (build a7dcaa6) |
| Docker Compose | v5.5.0 |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| .NET SDK | 10.0.400 |

## 3. Compatibilidad con el protocolo

El entorno satisface las versiones principales previstas por el protocolo vigente:

- Node.js 24.21.0 LTS.
- NestJS 12.1.0 en el PoC.
- .NET 10 LTS.
- Docker/Compose disponibles para la ejecución containerizada.

Las versiones de PostgreSQL, runtime ASP.NET Core, imágenes Docker y sus digests deberán quedar registradas por el runner durante la ejecución del benchmark. No se consideran inventadas ni inferidas a partir de esta captura.

## 4. Regla de trazabilidad

Esta captura constituye la referencia documental del entorno al momento de su registro. El runner del benchmark debe volver a capturar automáticamente el entorno en cada ejecución y asociarlo al commit evaluado.

Si una ejecución posterior utiliza una versión diferente, esa ejecución debe conservar su propio registro de entorno y no sobrescribir históricamente esta evidencia.

## 5. Evidencia

Fuente primaria de los valores de herramientas: salida de comandos de versión proporcionada por el propietario del entorno el 2026-09-25.

No se presentan aquí resultados de rendimiento. Este documento solamente fija la identificación del entorno.

**Fin del registro.**
