# Backend benchmark runner

Este directorio contiene el protocolo y herramientas para ejecutar el benchmark comparativo de los PoC.

## Entorno objetivo

La ejecución de referencia debe hacerse en el equipo de desarrollo Windows 11 Pro documentado para el proyecto. No se deben comparar resultados obtenidos en máquinas diferentes.

> Nota: GitHub Actions puede ejecutar la validación CI en Linux; esos resultados sirven para verificar reproducibilidad y corrección, pero **no deben mezclarse** con las mediciones de rendimiento del equipo Windows de referencia.

## Requisitos

- Docker Desktop funcionando.
- Node.js LTS.
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
.\run-benchmark.ps1 -Requests 1000 -Concurrency 20
```

El script:
1. construye ambas imágenes;
2. inicia ambos servicios;
3. espera los health checks;
4. ejecuta solicitudes equivalentes contra `GET /packages`;
5. calcula throughput, p50, p95 y tasa de error;
6. registra una instantánea de memoria/CPU de los contenedores;
7. detiene y elimina los servicios.

Los tiempos de build se muestran por separado. Los resultados HTTP se guardan en `results.jsonl`.

## Reglas

- Ejecutar varias corridas y conservar cada resultado bruto.
- No cambiar la configuración de un backend para favorecerlo.
- Registrar cualquier desviación.
- No convertir estos resultados en una decisión automática.
- La evaluación final debe integrar evidencia experimental, documental, operativa y de mantenibilidad.
