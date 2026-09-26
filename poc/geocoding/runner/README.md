# Runner común del benchmark de geocodificación

El runner es deliberadamente independiente de cualquier proveedor. Su responsabilidad es:

1. cargar casos JSONL;
2. validar el esquema mínimo;
3. ejecutar un adapter mediante el contrato común;
4. registrar latencia y errores;
5. conservar el resultado normalizado;
6. comparar componentes territoriales con el expected;
7. calcular métricas comparables;
8. producir JSONL de resultados y un resumen.

## Contrato

Cada adapter debe implementar:

```ts
interface GeocodingProvider {
  forward(input: {
    raw: string;
    structured?: Record<string, string | null>;
  }): Promise<ProviderResult>;
}
```

El runner no conoce URLs, tokens ni detalles propietarios del proveedor.

## Estados de validación

- `ACCEPTED`: resultado territorialmente coherente y suficiente para el nivel de precisión requerido.
- `REVIEW`: resultado plausible pero insuficiente para automatización.
- `REJECTED`: resultado incorrecto, contradictorio o sin resolución útil.

## Regla

HTTP 200 no implica éxito de geocodificación. La métrica primaria de utilidad es el resultado validado por SETA, no la mera disponibilidad HTTP.

## Separación de credenciales

Los tokens se suministran exclusivamente mediante variables de entorno o mecanismo seguro equivalente. Nunca se almacenan en dataset, fixtures, código ni resultados publicados.

## Fases

### Fase A — offline

Puede ejecutarse sin credenciales para validar dataset, parser, schema y cálculo de métricas.

### Fase B — proveedor

Se ejecuta un adapter por proveedor con el mismo corpus y los mismos parámetros comparables.

### Fase C — comparación

Se agregan resultados sin mezclar escalas propietarias de confidence.

### Fase D — decisión

La selección se documenta fuera del runner mediante informe y ADR, si corresponde.

## Estructura prevista

```text
poc/geocoding/
  runner/
    README.md
    run-geocoding-benchmark.mjs
    result-schema.json
  adapters/
    geoapify/
    locationiq/
    nominatim/
  fixtures/
    cuba/
```

La implementación de adapters queda separada para impedir vendor lock-in.


## Manifiesto de trazabilidad

Cada ejecución del runner puede producir un manifiesto JSON mediante el tercer argumento:

```text
node run-geocoding-benchmark.mjs <dataset.jsonl> <results.jsonl> <manifest.json>
```

El manifiesto registra, sin secretos:

- versión del protocolo, dataset y adapter;
- SHA-256 del dataset de entrada y de los resultados;
- `run_id`, inicio y fin;
- solicitudes intentadas;
- cache hits/misses;
- configuración de rate limit;
- User-Agent;
- versión de Node, plataforma y arquitectura;
- configuración saneada con secretos reemplazados por `[REDACTED]`.

La instrumentación de cache es un **contrato de métricas**, no una afirmación de que exista todavía cache persistente. El adapter/runner que implemente cache debe incrementar esos contadores.

El manifiesto no contiene API keys, tokens, contraseñas ni headers de autorización.

## Reporte con provenance

El generador acepta opcionalmente el manifiesto como tercer argumento:

```text
node generate-comparison-report.mjs <evaluated.jsonl> <report.json> <manifest.json>
```

Esto permite reconstruir qué dataset, versión de adapter, runtime y configuración produjo un resultado sin depender del entorno de ejecución original.
