# Backend benchmark runner

Este directorio contiene el protocolo y herramientas para ejecutar el benchmark comparativo de los PoC.

## Entorno objetivo

La ejecución de referencia debe hacerse en el equipo de desarrollo Windows 11 Pro documentado para el proyecto. No se deben comparar resultados obtenidos en máquinas diferentes.

> GitHub Actions puede validar la compilación y las pruebas en Linux, pero sus mediciones de rendimiento no deben mezclarse con las mediciones del equipo Windows de referencia.

## Requisitos

- Docker Desktop funcionando.
- Node.js LTS.
- PowerShell.
- PostgreSQL se ejecuta dentro de los Compose de cada PoC.
- Puertos libres 3000 y 8081.

## Ejecución

Desde PowerShell:

```powershell
cd poc/backend/benchmark
.\run-benchmark.ps1
```

Parámetros:

```powershell
.\run-benchmark.ps1 -Requests 1000 -Concurrency 20 -Runs 5 -WarmupRequests 20
```

Valores por defecto:

- 200 solicitudes por implementación y corrida.
- Concurrencia 10.
- 5 corridas.
- 20 solicitudes de calentamiento por implementación y corrida.
- El build se realiza una vez por implementación.
- Los servicios permanecen activos durante todas las corridas.
- Los datos HTTP de cada corrida se guardan en `results.jsonl`.

## Diseño de las corridas

Para reducir sesgos por orden de ejecución:

- En corridas impares se ejecuta primero NestJS y después ASP.NET Core.
- En corridas pares se ejecuta primero ASP.NET Core y después NestJS.
- Cada implementación se mide por separado; no se ejecutan ambas cargas HTTP simultáneamente.
- El calentamiento no se incluye en las métricas de latencia ni throughput.
- Ambas implementaciones permanecen levantadas durante todo el conjunto de corridas.
- Cada implementación utiliza su propia instancia PostgreSQL definida por su Compose.

## Mediciones

El runner registra:

- build_ms;
- startup_ms;
- memory_mb;
- cpu_pct;
- image_size_mb;
- throughput_rps;
- p50_ms;
- p95_ms;
- error_rate;
- requests;
- concurrency;
- warmup_requests.

`memory_mb` y `cpu_pct` son **instantáneas del contenedor tomadas después de cada corrida**, no promedios de CPU durante toda la carga. No deben interpretarse como consumo medio sostenido.

Los resultados se conservan como JSONL para permitir análisis posterior sin perder los datos brutos.

## Reglas

- Ejecutar varias corridas y conservar cada resultado bruto.
- No cambiar la configuración de un backend para favorecerlo.
- Registrar cualquier desviación.
- No convertir estos resultados en una decisión automática.
- La evaluación final debe integrar evidencia experimental, documental, operativa y de mantenibilidad.
- Si una medición es atípica, no eliminarla silenciosamente: documentar el motivo y conservar el dato.
