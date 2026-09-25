# Backend benchmark runner

Este runner ejecuta el benchmark controlado de NestJS vs ASP.NET Core y **captura automáticamente el entorno**, evitando depender de una lista manual de comandos.

## Uso en Windows

Desde la raíz del repositorio:

`.pocenchmarkun-benchmark.ps1`

Parámetros:

- `-Repetitions 5`
- `-RequestsPerOperation 200`
- `-Concurrency 16`
- `-WarmupRequests 100`

El modo normal exige `poc/backend/nestjs/package-lock.json`. Esto es intencional: sin lockfile no existe reproducibilidad suficiente para declarar válido el benchmark.

Para una ejecución **diagnóstica no reproducible** puede utilizarse:

`.pocenchmarkun-benchmark.ps1 -AllowUnlockedDependencies`

Ese modo no debe utilizarse para cerrar el benchmark ni para tomar la decisión tecnológica.

## Evidencia generada

En `artifacts/benchmark/<timestamp>/`:

- `environment.json`: OS, CPU, RAM, GPU, Docker, Compose, Node, npm, .NET y commit.
- `nestjs.json` / `aspnet-core.json`: build, readiness, contenedores, mediciones y muestras de recursos.
- `results.json`: paquete consolidado.
- `status.json`: estado de ejecución.

Los resultados de rendimiento **no se inventan** y el runner no asigna ganador. El informe posterior debe interpretar los datos junto con B01–B12.
