# Backend benchmark runner

Este directorio contiene el protocolo y herramientas para ejecutar el benchmark comparativo de los PoC.

## Baselines vigentes

- **NestJS 12.1.0 + Node.js 24.21.0 LTS**.
- **ASP.NET Core + .NET 10 LTS**.
- PostgreSQL/PostGIS: versión exacta registrada en cada ejecución.
- Docker: versión exacta registrada en cada ejecución.

Node.js 26.10.0 es actualmente una versión **Current**; por tanto, no forma parte del baseline LTS del experimento.

## Entorno objetivo

La ejecución de referencia debe hacerse en el equipo de desarrollo Windows 11 Pro documentado para el proyecto. No se deben comparar resultados obtenidos en máquinas diferentes.

GitHub Actions puede ejecutar la validación CI en Linux; esos resultados sirven para verificar corrección y reproducibilidad, pero no deben mezclarse con las mediciones de rendimiento del equipo Windows de referencia.

## Requisitos

- Docker Desktop funcionando.
- Node.js 24.21.0.
- .NET 10 SDK.
- PostgreSQL se ejecuta dentro de los Compose de cada PoC.
- Puertos libres 3000 y 8081.

## Ejecución

Desde PowerShell:

```powershell
cd poc/backend/benchmark
.\run-benchmark.ps1 -Requests 1000 -Concurrency 20 -Runs 5 -WarmupRequests 20
```

El runner:

1. construye ambas imágenes;
2. registra metadatos del entorno;
3. inicia ambos servicios;
4. espera los health checks;
5. ejecuta warm-up;
6. ejecuta solicitudes equivalentes contra `GET /packages`;
7. alterna el orden de los candidatos entre corridas;
8. mide throughput, p50, p95 y tasa de error;
9. registra snapshots de memoria/CPU;
10. conserva resultados brutos en `results.jsonl`;
11. detiene y elimina los servicios.

## Artefactos

- `run-metadata.json`: entorno y parámetros de ejecución.
- `results.jsonl`: mediciones brutas.
- `benchmark-report-template.md`: plantilla del informe final.

Las métricas de memoria y CPU son snapshots posteriores a la carga del contenedor, no promedios de consumo durante toda la carga.

## Reglas

- Ejecutar varias corridas y conservar cada resultado bruto.
- No cambiar la configuración de un backend para favorecerlo.
- Registrar cualquier desviación.
- No convertir estos resultados en una decisión automática.
- La evaluación final debe integrar evidencia experimental, documental, operativa y de mantenibilidad.
- No mezclar resultados del PoC .NET 8 anterior con el experimento .NET 10.
