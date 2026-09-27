# Contrato de autorización contextual — v0.1.0

**Issue:** #221  
**Estado:** baseline ejecutable; no declara BOLA/IDOR resuelto.

## Decisión
La autorización evalúa actor + action + organizational scope + object + ownership/context + object state.

## Fail-closed
Si ownership/contexto no puede determinarse, la política no concede acceso.

## Archivado
Las mutaciones/cancelación/delete/archive directas sobre un recurso archivado se deniegan independientemente del rol.

## Roles
`admin` permite la operación según esta baseline de infraestructura, pero no sustituye el futuro organizational scope/ownership.
`operator` obtiene acceso contextual cuando el recurso pertenece al subject del actor.

## Límite
Esto todavía no demuestra ausencia de BOLA/IDOR en APIs de Paquetería ni persistencia de decisiones en AuditRecord. Es el contrato previo a esa integración.

## Gate de #221
1. recursos reales;
2. ownership/scope por recurso;
3. enforcement;
4. persistencia de decisiones;
5. pruebas BOLA/IDOR;
6. sincronización ASVS/MASVS y threat model.
