# Mapa maestro de requisitos de Paquetería — v0.1.0

**Estado:** En validación  
**Fecha:** 2026-09-25  
**Base de corte:** `42a8759a7c3061078bd9e3dade4d9a13db650db0`  
**Ámbito:** Bounded Context Paquetería

## 1. Propósito
Primera matriz maestra de trazabilidad para conectar necesidad operacional, proceso, capacidad, requisito, caso de uso, regla, evento, prueba y futura API/UI. No autoriza todavía migraciones PostgreSQL/PostGIS ni constituye aprobación definitiva de requisitos.

## 2. Cadena de trazabilidad
**Necesidad → Proceso → Capacidad → Requisito → Caso de uso → Regla → Evento → Prueba → futura API/UI → evidencia**

Los elementos no demostrados permanecen abiertos.

## 3. Capacidades

| ID | Capacidad | Resultado |
|---|---|---|
| CAP-PQ-01 | Ingesta documental | Manifiesto trazable |
| CAP-PQ-02 | Validación/conciliación | Datos aceptados o discrepancias |
| CAP-PQ-03 | Expedición | Master AWB/TransportDocument/House |
| CAP-PQ-04 | Unidades físicas | Bultos identificados |
| CAP-PQ-05 | Personas/contactos | Sender/Recipient/Receiver |
| CAP-PQ-06 | Direcciones | Original/interpretada/normalizada/validada |
| CAP-PQ-07 | Geolocalización | Coordenadas versionadas |
| CAP-PQ-08 | Recepción/custodia | Existencia, ubicación y movimientos |
| CAP-PQ-09 | Situación aduanera | Resultados externos registrados |
| CAP-PQ-10 | Elegibilidad | Disponible/bloqueado con razones |
| CAP-PQ-11 | Planificación | Rutas, paradas, recursos y restricciones |
| CAP-PQ-12 | Ejecución | Tiempos, ubicación e incidencias |
| CAP-PQ-13 | Entrega | Intentos y resultados |
| CAP-PQ-14 | POD | Evidencias de entrega |
| CAP-PQ-15 | Reintentos/devoluciones | Continuidad sin pérdida histórica |
| CAP-PQ-16 | Incidencias | Registro y resolución |
| CAP-PQ-17 | Facturación operacional | Datos de servicio para Economía |
| CAP-PQ-18 | Trazabilidad/auditoría | Reconstrucción histórica |

## 4. Matriz RF → UC → RN → EV → AT

| RF | Requisito | UC | RN | EV | AT |
|---|---|---|---|---|---|
| RF-PQ-001 | Importar manifiesto conservando fuente | UC-PQ-01 | RN-001 | ManifestRegistered | AT-001 |
| RF-PQ-002 | Validar estructura/contenido | UC-PQ-02 | RN-002 | ManifestValidated | AT-002 |
| RF-PQ-003 | Registrar discrepancias sin destruir origen | UC-PQ-03 | RN-003 | DiscrepancyDetected | AT-003 |
| RF-PQ-004 | Separar documento, House y PhysicalUnit | UC-PQ-04 | RN-004 | HouseRegistered | AT-004 |
| RF-PQ-005 | Gestionar personas/roles | UC-PQ-05 | RN-005 | PersonAssociated | AT-005 |
| RF-PQ-006 | Conservar dirección original/normalizada | UC-PQ-06 | RN-006 | AddressNormalized | AT-006 |
| RF-PQ-007 | Versionar geolocalizaciones | UC-PQ-07 | RN-007 | GeolocationObtained | AT-007 |
| RF-PQ-008 | Gestionar recepción/custodia/movimientos | UC-PQ-08 | RN-008 | CustodyMovementRecorded | AT-008 |
| RF-PQ-009 | Registrar información aduanera relevante | UC-PQ-09 | RN-009 | CustomsResultRecorded | AT-009 |
| RF-PQ-010 | Determinar elegibilidad y razones de bloqueo | UC-PQ-10 | RN-010 | DistributionEligibilityEvaluated | AT-010 |
| RF-PQ-011 | Crear y ejecutar rutas | UC-PQ-11/12 | RN-011..014 | RoutePlanned/Started | AT-011/012 |
| RF-PQ-012 | Registrar múltiples intentos | UC-PQ-13 | RN-015 | DeliveryAttempted | AT-013 |
| RF-PQ-013 | Registrar POD | UC-PQ-14 | RN-016 | PODRecorded | AT-014 |
| RF-PQ-014 | Gestionar devoluciones | UC-PQ-15 | RN-017 | ReturnInitiated/Completed | AT-015 |
| RF-PQ-015 | Registrar incidencias | UC-PQ-16 | RN-018 | IncidentRegistered | AT-016 |
| RF-PQ-016 | Mantener trazabilidad completa | UC-PQ-17 | RN-019 | TraceabilityRecorded | AT-017 |
| RF-PQ-017 | Autorizar por rol/permiso/ámbito/estado | UC transversal | RN-020 | AuthorizedOperation | AT-018 |
| RF-PQ-018 | Mantener historial de transiciones | UC transversal | RN-021 | StatusTransitionRecorded | AT-019 |
| RF-PQ-019 | Auditar operaciones críticas | UC transversal | RN-022 | AuditRecorded | AT-020 |
| RF-PQ-020 | Soportar House↔Delivery múltiple sin imponer agrupación | UC-PQ-13 | RN-023 | DeliveryHouseAssociated | AT-021 |

## 5. Reglas de negocio

- **RN-001:** conservar archivo, hash, hoja, fila, columna y valores originales.
- **RN-002:** validar sin pérdida silenciosa.
- **RN-003:** discrepancia = valor declarado + observado + diferencia + tipo + actor + tiempo + evidencia cuando exista.
- **RN-004:** House ≠ PhysicalUnit.
- **RN-005:** no fusionar personas únicamente por nombre.
- **RN-006:** normalizar/rectificar sin sobrescribir la dirección original.
- **RN-007:** geocodificación desacoplada; fallo de geocoding no destruye la dirección.
- **RN-008:** toda custodia/movimiento debe ser trazable.
- **RN-009:** SETA registra resultados externos; no se atribuyen funciones de autoridad aduanera.
- **RN-010:** elegibilidad debe explicar razones de bloqueo/disponibilidad.
- **RN-011:** planificación considera tiempo, distancia, servicio, descanso y recursos.
- **RN-012:** máximo operacional documentado: 700 km por ruta; no es límite legal universal.
- **RN-013:** ventana operacional de entrega documentada: 07:00–20:00; salida puede ser anterior.
- **RN-014:** vehículo y persona no pueden tener asignaciones de rutas temporalmente superpuestas.
- **RN-015:** cada intento es independiente e histórico.
- **RN-016:** POD soporta varios tipos de evidencia; mínimos obligatorios siguen abiertos B-03/D12.
- **RN-017:** DeliveryFailed ≠ abandono; puede producir reintento o devolución.
- **RN-018:** incidencia conserva ciclo, actor, tiempo, severidad, resolución y evidencia cuando corresponda.
- **RN-019:** estado actual no sustituye historial.
- **RN-020:** operaciones sensibles requieren autorización contextual.
- **RN-021:** estados se mantienen por dimensiones independientes.
- **RN-022:** operaciones críticas conservan actor, timestamp, objeto, operación, valores anterior/nuevo cuando aplique, motivo, referencia y resultado.
- **RN-023:** se permite agrupación técnica de House en Delivery, pero no se impone política operacional mientras D09 esté abierto.

## 6. Casos de uso

| ID | Caso de uso | Actor | Resultado |
|---|---|---|---|
| UC-PQ-01 | Importar manifiesto | Operador | Manifest registrado |
| UC-PQ-02 | Validar importación | Sistema/Operador | Validación |
| UC-PQ-03 | Conciliar discrepancias | Operador | Discrepancias |
| UC-PQ-04 | Registrar expedición | Sistema/Operador | House/unidades |
| UC-PQ-05 | Asociar personas | Operador | Roles |
| UC-PQ-06 | Normalizar/validar dirección | Operador/Sistema | Dirección versionada |
| UC-PQ-07 | Geocodificar | Sistema/Operador | Resultado versionado |
| UC-PQ-08 | Recepción/custodia | Almacenero | Historial físico |
| UC-PQ-09 | Registrar resultado aduanero | Operador autorizado | Resultado externo |
| UC-PQ-10 | Evaluar elegibilidad | Sistema/Operador | Ready/Blocked |
| UC-PQ-11 | Crear/planificar ruta | Planificador | Route/Stops |
| UC-PQ-12 | Ejecutar ruta | Tripulación | Ejecución |
| UC-PQ-13 | Registrar intento/entrega | Tripulación | Attempt/resultado |
| UC-PQ-14 | Registrar POD | Tripulación | Evidencia |
| UC-PQ-15 | Reintentar/devolver | Autorizado | Nuevo intento/devolución |
| UC-PQ-16 | Gestionar incidencia | Autorizado | Resolución |
| UC-PQ-17 | Consultar trazabilidad | Autorizado | Cadena histórica |

## 7. Requisitos no funcionales iniciales

| ID | Requisito | Verificación |
|---|---|---|
| NFR-PQ-001 | Trazabilidad | Operación crítica identificable |
| NFR-PQ-002 | Integridad | No pérdida de origen |
| NFR-PQ-003 | Seguridad | Autorización contextual |
| NFR-PQ-004 | Auditabilidad | Historial protegido |
| NFR-PQ-005 | Operación | Soporte de escenarios definidos, incluidos offline cuando corresponda |
| NFR-PQ-006 | Sincronización | operationId/idempotencyKey/causalidad según contrato transversal |
| NFR-PQ-007 | Observabilidad | Diagnóstico de errores/operaciones |
| NFR-PQ-008 | Interoperabilidad | Adaptadores/contratos externos |
| NFR-PQ-009 | Evolución | Cambio de proveedor sin cambiar reglas de dominio |
| NFR-PQ-010 | Rendimiento | Metas derivadas de casos y mediciones |
| NFR-PQ-011 | Privacidad | Tratamiento conforme obligaciones aplicables |
| NFR-PQ-012 | Recuperación | Estrategia verificable para datos/evidencias críticas |

## 8. Pruebas de aceptación iniciales

1. **AT-001:** Excel válido conserva archivo, hash y valores originales.
2. **AT-002:** importación inválida produce errores sin destruir fuente.
3. **AT-003:** discrepancias de House/peso quedan registradas.
4. **AT-004:** una House puede tener varias PhysicalUnit.
5. **AT-005:** personas/direcciones compartidas no obligan a duplicación conceptual.
6. **AT-006:** rectificación conserva dirección declarada.
7. **AT-007:** nueva geocodificación conserva histórico.
8. **AT-008:** movimiento de almacén deja historial.
9. **AT-009:** resultado aduanero externo no atribuye autoridad a SETA.
10. **AT-010:** House bloqueado muestra razón.
11. **AT-011:** planificador no supera restricción de distancia configurada.
12. **AT-012:** vehículo/persona no admite rutas superpuestas.
13. **AT-013:** segundo intento no modifica el primero.
14. **AT-014:** entrega conserva evidencias y metadatos.
15. **AT-015:** fallo permite reintento o devolución sin convertirse en abandono.
16. **AT-016:** incidencia conserva historial.
17. **AT-017:** consulta autorizada reconstruye la cadena completa.
18. **AT-018:** operación sensible sin autorización es rechazada y auditada.
19. **AT-019:** transición incompatible es rechazada.
20. **AT-020:** operación crítica genera auditoría.
21. **AT-021:** Delivery puede asociar múltiples House sin duplicar su identidad.

## 9. Dependencias externas
- EXT-PQ-001 Agencia/transitario.
- EXT-PQ-002 AeroVaradero.
- EXT-PQ-003 Autoridad aduanera.
- EXT-PQ-004 Geocodificador.
- EXT-PQ-005 Mapas/routing.
- EXT-PQ-006 Comunicación con destinatarios.

## 10. Decisiones pendientes

| ID | Decisión | Impacto |
|---|---|---|
| DEC-PQ-001 | House ↔ guía hija | Jerarquía documental |
| DEC-PQ-002 | Política House→Delivery | Agrupación |
| DEC-PQ-003 | POD mínimo | Cierre de entrega |
| DEC-PQ-004 | UnitDestination | Clasificación |
| DEC-PQ-005 | Liberación a distribución | Elegibilidad |
| DEC-PQ-006 | Modificación/cancelación | Integridad |
| DEC-PQ-007 | Jerarquía Master AWB/Guide/House | Persistencia/API |
| DEC-PQ-008 | Facturación económica/fiscal | Economía |
| DEC-PQ-009 | Catálogos territoriales | Direcciones |
| DEC-PQ-010 | Routing | Planificación |
| DEC-PQ-011 | Recursos/turnos | Planificación |
| DEC-PQ-012 | Flujo marítimo | Extensión del dominio |

## 11. Criterio de diseño lógico
No congelar PostgreSQL/PostGIS hasta cerrar o delimitar formalmente B-01…B-06, D09/D12, jerarquía documental, permisos críticos y restricciones normativas.

## 12. Trazabilidad
**AS-IS → alcance → modelo de dominio → especificación funcional → esta matriz → casos de uso → aceptación → diseño lógico → API → Web/Android/iOS → pruebas → evidencia.**

## 13. Estado
**En validación.** Complementa los artefactos existentes y no convierte los elementos abiertos en requisitos definitivos.
