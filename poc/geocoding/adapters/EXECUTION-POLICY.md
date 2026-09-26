## Política de ejecución por proveedor

### Geoapify
El runner puede usar concurrencia controlada, respetando la cuota vigente de la cuenta utilizada. La comparación debe registrar requests consumidos.

### LocationIQ
El runner debe respetar el límite de la cuenta utilizada y registrar respuestas 429. No se debe asumir que una cuota gratuita garantiza calidad para Cuba.

### Nominatim público
El servidor público de OSMF **no se trata como un endpoint de benchmark de alta concurrencia**. Las ejecuciones deben ser secuenciales, con intervalo configurable y respetando su política de uso. Para una campaña grande o repetitiva, se debe evaluar una instancia propia antes de usar Nominatim como fuente operativa.

### Self-hosted
Los adapters mantienen la misma interfaz si posteriormente se despliega Nominatim/Photon propio. Esto permite comparar el motor sin cambiar el dominio SETA.

## Importante

El benchmark final debe ejecutar cada proveedor en campañas separadas o con controles equivalentes. No se mezclan latencias de proveedores ejecutados bajo políticas de concurrencia diferentes sin documentarlo.


## Telemetría obligatoria de campaña

Cada campaña debe conservar los contadores reales del adapter: requests intentados, cache hits/misses, 429 y errores. No se permite inferir requests consumidos a partir del número de casos cuando exista cache, reintentos o respuestas rate-limited.
