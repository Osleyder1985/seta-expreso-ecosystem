# Validación y métricas

La validación de SETA se ejecuta después del adapter.

## Principio

HTTP 200 no significa dirección correcta.

La evaluación considera:

1. existencia de coordenadas;
2. país;
3. provincia;
4. municipio;
5. asentamiento/localidad cuando esté disponible;
6. nivel de precisión devuelto;
7. confianza del proveedor;
8. distancia al control espacial cuando exista.

La validación produce:

- `ACCEPTED`: resultado suficientemente consistente para uso automático;
- `REVIEW`: resultado plausible pero requiere revisión;
- `REJECTED`: resultado ausente o territorialmente incompatible.

Los umbrales iniciales son de PoC y **no constituyen todavía reglas operativas definitivas**.

Las métricas agregadas incluyen tasa de resultado, tasa utilizable, errores, rate limiting, timeouts, aceptación/revisión/rechazo y p50/p95 de latencia.
