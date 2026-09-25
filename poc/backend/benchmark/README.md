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

## Perfiles de ejecución

### Perfil nativo Windows

Es el perfil utilizado cuando no se dispone de conectividad suficiente para descargar imágenes Docker. Requiere:

- Windows 11 Pro del equipo de referencia.
- Node.js 24.21.0.
- .NET 10 SDK.
- PostgreSQL/PostGIS accesible mediante DATABASE_URL.
- Puertos libres 3000 y 8081.
- Dependencias npm ya instaladas para el PoC NestJS.

Desde PowerShell:

```powershell
$env:DATABASE_URL="postgresql://usuario:password@localhost:5433/base"
cd poc/backend/benchmark
.\run-benchmark-native.ps1 -Requests 1000 -Concurrency 20 -Runs 5 -WarmupRequests 20
```

El runner nativo construye ambos PoC fuera de contenedores, inicia un solo candidato a la vez, espera `/health`, restablece la tabla `packages` antes de cada medición y guarda resultados por operación en `native-results-<operation>.jsonl`. El entorno queda registrado en `native-run-metadata-<operation>.json`.

El parámetro `-Operation` admite `create`, `list`, `get`, `update` y `delete`. Para `get`, `update` y `delete`, el runner siembra registros deterministas fuera de la ventana medida. Para `delete`, se reservan registros adicionales para el warm-up para evitar que el warm-up consuma los IDs de la medición. Cada operación debe ejecutarse como un perfil independiente; no se deben mezclar sus resultados.

Las métricas de proceso nativas no deben compararse directamente con las métricas de snapshots de contenedor del perfil Docker.

### Perfil Docker

Requiere Docker Desktop, Node.js 24.21.0, .NET 10 SDK y PostgreSQL ejecutado por los Compose de cada PoC.

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
