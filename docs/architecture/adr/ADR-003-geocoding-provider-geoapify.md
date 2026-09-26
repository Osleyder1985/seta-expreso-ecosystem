# ADR-003 — Proveedor inicial de geocodificación para Cuba

**Estado:** Aprobado
**Fecha:** 2026-09-26
**Decisión:** Geoapify como proveedor externo primario inicial
**Fallback previsto:** Nominatim autogestionado sobre extracto OSM de Cuba
**Alternativa externa no seleccionada:** LocationIQ
**Ecosistema:** SETA EXPRESO SURL

## 1. Contexto

SETA EXPRESO necesita convertir direcciones de manifiestos a coordenadas para validación territorial, visualización cartográfica y planificación de rutas.

Las direcciones cubanas presentan particularidades que obligan a conservar el texto original y combinar geocodificación con un catálogo territorial propio: provincia, municipio, asentamiento/localidad, variantes y referencias locales.

La integración se mantiene detrás de un contrato `GeocodingProvider`; ningún proveedor queda acoplado al dominio.

## 2. Candidatos

Se evaluaron conceptualmente:

- Geoapify.
- LocationIQ.
- Nominatim público.
- Nominatim autogestionado.

La campaña experimental Cuba v0.1 fue definida en Issue #157 / PR #158. No se dispone de resultados comparables ejecutados contra el corpus cubano desde el entorno de trabajo actual. Por tanto, esta decisión **no afirma que Geoapify haya demostrado mayor exactitud geográfica en Cuba**.

## 3. Evidencia utilizada

### Geoapify

Geoapify soporta geocodificación forward y reverse, entrada libre o estructurada, filtros por país y parámetros de sesgo espacial. Su documentación expone resultados con coordenadas, dirección estructurada y coeficientes de confianza. También ofrece herramientas para validación y almacenamiento de resultados. La documentación indica además que el servicio trabaja mundialmente y permite restringir las búsquedas por país.

El plan gratuito proporciona una cuota suficiente para el volumen inicial estimado del Ecosistema y contempla uso comercial bajo sus condiciones y atribución.

### LocationIQ

LocationIQ proporciona geocodificación forward/reverse y datos de calidad de coincidencia. Sin embargo, su propia documentación identifica un conjunto concreto de países con precisión house/rooftop y afirma que para el resto del mundo se espera precisión a nivel de calle.

Cuba no aparece en el conjunto publicado de países con house-level accuracy. Por ello no se considera adecuado convertir LocationIQ en proveedor primario cuando el proceso de entrega necesita distinguir, siempre que sea posible, una ubicación concreta dentro de una calle.

### Nominatim público

Nominatim es técnicamente capaz de geocodificar datos OSM, pero el servicio público de Nominatim no debe convertirse en dependencia operativa periódica del Ecosistema debido a sus restricciones de uso.

### Nominatim autogestionado

El PoC autogestionado queda preparado para importar un extracto OSM de Cuba y ejecutar Nominatim localmente. Es una alternativa técnicamente viable y especialmente valiosa como fallback/control independiente, pero introduce operación, actualización de datos, consumo de recursos y dependencia de la cobertura real de OSM.

## 4. Decisión

Se adopta:

**Geoapify como proveedor externo primario inicial de geocodificación.**

La selección se basa en la combinación de:

1. API de forward y reverse geocoding.
2. Entrada free-form y estructurada.
3. Restricción explícita por país.
4. Información de confianza y componentes estructurados que permiten que SETA aplique sus propios quality gates.
5. Capacidad de validar resultados y conservarlos localmente.
6. Cuota gratuita suficiente para el volumen operativo inicial previsto.
7. Uso comercial compatible con el objetivo económico del proyecto bajo las condiciones de su plan gratuito.
8. Menor carga operacional que mantener un geocoder propio como primera dependencia.
9. Integración limpia mediante `GeocodingProvider`, permitiendo sustitución sin modificar dominio ni modelo principal.

**Importante:** esta decisión es de adecuación arquitectónica y operacional; no constituye una afirmación de superioridad de exactitud de Geoapify sobre Cuba.

## 5. Política de aceptación del resultado

SETA EXPRESO **no aceptará automáticamente cualquier HTTP 200**.

Un resultado deberá pasar por:

1. validación de país;
2. validación contra provincia/municipio/asentamiento del catálogo territorial;
3. evaluación del nivel de precisión devuelto;
4. evaluación de confidence/quality;
5. detección de resultados ambiguos o incompatibles;
6. revisión manual cuando el resultado no alcance el nivel mínimo requerido.

Estados mínimos:

- **ACCEPTED:** resultado consistente y con precisión suficiente.
- **REVIEW:** resultado plausible pero insuficiente para aceptación automática.
- **REJECTED:** resultado inexistente, incompatible o de baja confianza.

## 6. Persistencia y caché

Se conservarán:

- dirección original;
- dirección normalizada;
- proveedor;
- versión/configuración del proveedor cuando esté disponible;
- consulta enviada;
- resultado bruto necesario para auditoría;
- latitud/longitud;
- nivel de precisión;
- confidence/quality;
- estado de validación;
- fecha de consulta;
- versión del catálogo territorial utilizado.

Los resultados exitosos deberán almacenarse en caché persistente para evitar consultas repetidas.

## 7. Fallback

Se mantiene **Nominatim autogestionado** como candidato de fallback técnico y de evaluación independiente.

El fallback no se activará ciegamente: también deberá aplicar los mismos validadores territoriales y quality gates.

El Nominatim público no será dependencia operacional de producción.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Calidad insuficiente en determinadas localidades cubanas | catálogo territorial + confidence + revisión + fallback |
| Datos OSM incompletos | validación territorial y Nominatim autogestionado como segunda fuente |
| Cambio de proveedor/condiciones | adapter `GeocodingProvider` |
| Rate limiting | caché persistente + rate limiter + backoff |
| Falsos positivos | no aceptar únicamente por HTTP 200 |
| Dependencia externa | persistencia local y fallback |
| Atribución/licencia | implementar requisitos de atribución antes de producción |

## 9. Condición de revisión

La decisión deberá revisarse cuando exista evidencia real del corpus Cuba v0.1 o cuando:

- Geoapify presente una tasa de rechazo/falso positivo material;
- la precisión territorial resulte insuficiente;
- cambien las condiciones del plan gratuito;
- el volumen exceda sostenidamente la cuota;
- Nominatim autogestionado demuestre mejor adecuación operacional;
- aparezca un proveedor con evidencia cubana significativamente mejor;
- cambien las necesidades de routing/geocodificación del Ecosistema.

## 10. Consecuencias

### Positivas

- Se puede continuar la implementación sin bloquear el proyecto.
- El proveedor permanece aislado.
- La aplicación conserva control sobre la validación.
- Los resultados quedan almacenados localmente.
- Se mantiene una ruta de sustitución y fallback.

### Negativas

- La calidad específica de Cuba todavía debe validarse empíricamente.
- Existe dependencia inicial de un servicio externo.
- Deben cumplirse cuotas, atribución y condiciones del plan.
- La existencia de confidence no garantiza que la coordenada sea correcta en todos los casos.

## 11. Trazabilidad

- Issue #157 — PoC de estrategia de geocodificación para Cuba.
- PR #158 — protocolo de benchmark Cuba.
- Issue #159 — PoC Nominatim autogestionado.
- PR #161 — scaffold Nominatim autogestionado.
- PR #162 — intento de ejecución observable; cerrado sin merge y sin evidencia experimental.
- ONEI — fuente primaria para validación territorial.

## 12. Estado

**Aprobado para implementación inicial.**

La decisión no cierra la investigación de calidad cubana. Cierra únicamente la selección del **proveedor primario inicial** para permitir avanzar con la arquitectura y la implementación.

**Fin del ADR.**
