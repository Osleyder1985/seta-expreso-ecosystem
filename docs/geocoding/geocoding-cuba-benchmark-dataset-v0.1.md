# Dataset de benchmark de geocodificación de Cuba — v0.1.0

**Estado:** corpus sintético controlado; no es todavía el corpus operativo de manifiestos.  
**Issue:** #157  
**Protocolo:** `docs/geocoding/geocoding-cuba-benchmark-protocol.md`

## Propósito

Este dataset permite validar desde ahora el **schema, parser, normalizador, ejecución del runner, cálculo de métricas y validación territorial**, sin fingir que disponemos de direcciones reales de manifiestos que todavía no han sido incorporadas al repositorio.

### Composición inicial

- 24 casos.
- 4 municipios/asentamientos de Camagüey con controles geográficos.
- Casos específicos de La Habana.
- Cobertura adicional de Matanzas, Ciego de Ávila, Granma, Santiago de Cuba, Sancti Spíritus, Villa Clara, Las Tunas, Holguín, Mayabeque y Cienfuegos.
- Variantes sin tildes, nombres ambiguos, localidades rurales y desambiguación por municipio/provincia.
- Los casos con coordenadas de GeoNames son **controles territoriales**, no referencias de precisión de inmueble.
- Los códigos municipales no se congelan cuando todavía requieren cruce con la fuente primaria ONEI.

## Regla de interpretación

Este corpus **no puede utilizarse para concluir qué proveedor geocodifica mejor direcciones cubanas a nivel de calle/inmueble**. Para esa decisión será necesario añadir el corpus anonimizado derivado de manifiestos reales y casos de control con coordenadas verificadas independientemente.

## Fuentes

La estructura territorial debe seguir ONEI como fuente primaria. Las coordenadas de control incluidas aquí proceden de consultas públicas de GeoNames y se conservan como evidencia auxiliar, no como sustituto de ONEI.

## Próximo paso

Añadir el corpus operativo anonimizado, manteniendo este corpus sintético como suite de regresión estable.
