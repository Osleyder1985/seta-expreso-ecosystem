# Adapters de proveedores

Todos los adapters implementan el mismo contrato conceptual:

```ts
forward(input) -> ProviderResult
```

Los adapters solo traducen entre la API externa y el modelo común. No deciden `ACCEPTED`, `REVIEW` o `REJECTED`; esa responsabilidad pertenece al validador SETA.

Variables de entorno esperadas:

- `GEOAPIFY_API_KEY`
- `LOCATIONIQ_API_KEY`

Nominatim público no requiere API key, pero sí un User-Agent identificable y respeto estricto de su política de uso. El adapter no debe paralelizar llamadas contra el servidor público.

Las URLs se pueden sobrescribir mediante variables de entorno para pruebas controladas:

- `GEOAPIFY_BASE_URL`
- `LOCATIONIQ_BASE_URL`
- `NOMINATIM_BASE_URL`

No se almacenan secretos en repositorio.
