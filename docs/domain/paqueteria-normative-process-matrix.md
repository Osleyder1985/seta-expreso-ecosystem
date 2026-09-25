# Matriz normativa y de proceso del Servicio de Paquetería

**Versión:** 0.1.0  
**Estado:** Base de trazabilidad; evidencia pendiente de profundización artículo por artículo  
**Issue:** #38

## 1. Objetivo

Relacionar cada regla que pueda afectar al Servicio de Paquetería con su fuente oficial, vigencia, actor, proceso y futuro elemento de software.

Esta versión **no cierra todavía D01–D12**. Su función es impedir que una hipótesis de dominio sea confundida con una obligación normativa.

## 2. Fuentes rectoras

| ID | Fuente | Uso |
|---|---|---|
| SRC-001 | Aduana General de la República — https://www.aduana.gob.cu/ | Normativa y procedimientos aduaneros institucionales |
| SRC-002 | Aduana — https://www.aduana.gob.cu/documentos | Repositorio institucional de normas/documentos |
| SRC-003 | AeroVaradero — https://www.aerovaradero.com.cu/ | Operación aeroportuaria/carga en su ámbito |
| SRC-004 | Gaceta Oficial — https://www.gacetaoficial.gob.cu/es | Publicación oficial y vigencia de normas |
| SRC-005 | Gaceta Oficial, búsqueda avanzada — https://www.gacetaoficial.gob.cu/es/busqueda-avanzada | Verificación por identificador, año, tipo, estado, emisor y texto |

La Gaceta Oficial declara que es responsable de la publicidad normativa de la República de Cuba. Su búsqueda avanzada permite consultar por tipo de edición, número, año, tipo de norma, estado, organismo emisor, palabras clave, texto e identificador. 

## 3. Registro de evidencia actual

| ID | Fuente/norma | Tema | Estado de evidencia | Impacto preliminar |
|---|---|---|---|---|
| N-001 | Decreto-Ley 108, GOC-2026-107-O7 | Aduanas; envíos; desaduanamiento; operadores; derogaciones | 🟡 Identificada; requiere extracción artículo por artículo | Separar control aduanero de operación SETA |
| N-002 | Decreto 134, GOC-2026-108-O7 | Reglamento del Decreto-Ley 108 | 🟡 Identificada; requiere extracción artículo por artículo | Formalizar flujo aduanero externo |
| N-003 | Resolución 529/2025, GOC-2026-109-O7 | Control aduanero de mercancías | 🟡 Identificada; requiere extracción artículo por artículo | Trazabilidad y conservación documental |
| N-004 | Resolución 531/2025, GOC-2026-111-O7 | Depósito temporal | 🟡 Identificada; requiere extracción artículo por artículo | Movimientos y relación documental |
| N-005 | Resolución 532/2025, GOC-2026-112-O7 | Regímenes aduaneros | 🟡 Identificada; requiere extracción artículo por artículo | Separar régimen aduanero de estado operativo |
| N-006 | Resolución 533/2025, GOC-2026-113-O7 | Desaduanamiento | 🟡 Identificada; requiere extracción artículo por artículo | Hito de liberación verificable |
| N-007 | Resolución 534/2025, GOC-2026-114-O7 | Abandono | 🟡 Identificada; requiere extracción artículo por artículo | Resultado diferenciado de incidencia/entrega fallida |
| N-008 | AeroVaradero | Recepción y operación de carga | 🔴 No verificada | No implementar regla todavía |
| N-009 | Normas complementarias de Aduana | Envíos, bultos, documentos, restricciones, operadores | 🟡 En investigación | Puede afectar D01–D06 y estados |

## 4. Matriz proceso → evidencia → software

| ID | Proceso | Actor principal | Regla/evidencia requerida | Estado | Impacto software |
|---|---|---|---|---|---|
| P-001 | Recepción documental | Operador / entidad externa | Identificar documento de origen y datos obligatorios | 🟡 | Importación + trazabilidad |
| P-002 | Manifestación | Operador / entidad externa | Confirmar semántica de manifiesto y relación documental | 🟡 | D01 |
| P-003 | Identificación de envío | Operador | Confirmar AWB/guía/House/bulto | 🟡 | D01–D04 |
| P-004 | Control aduanero | Aduana / sujeto obligado | Reglas y estados jurídicos aplicables | 🟡 | Estado aduanero separado |
| P-005 | Desaduanamiento | Aduana / operador | Condiciones de liberación | 🟡 | Evento verificable |
| P-006 | Entrega al operador | Entidad externa / SETA | Documento y condición de transferencia | 🟡 | Evento de recepción |
| P-007 | Almacenamiento/clasificación | SETA / tercero | Ubicación y control de unidades | 🟡 | Inventario operativo |
| P-008 | Planificación de distribución | SETA | Reglas internas | 🟣 | Ruta/Parada |
| P-009 | Transporte nacional | SETA | Reglas internas + documentación aplicable | 🟣 | Ejecución de ruta |
| P-010 | Intento de entrega | SETA | Reglas internas y evidencia mínima | 🟣 | Delivery/Attempt |
| P-011 | Entrega | SETA | Resultado y POD | 🟣 | Cierre de entrega |
| P-012 | Incidencia | SETA / terceros | Catálogo y consecuencias | 🟣 | Incidents + state transitions |
| P-013 | Devolución/reembarque | SETA / autoridad/tercero | Diferenciar jurídicamente cada resultado | 🟡 | Flujo alternativo |
| P-014 | Abandono | Autoridad / sujeto según corresponda | Aplicabilidad y efectos | 🟢 Identificado; detalles pendientes | Estado jurídico separado |
| P-015 | Cierre documental | SETA / sujeto obligado | Retención aplicable | 🟡 | Audit trail + documentos |

## 5. Reglas de modelado que ya se pueden adoptar

### R-001 — Separación de estados

No mezclar en una misma enumeración:

- estado aduanero;
- estado documental;
- estado logístico;
- estado de distribución;
- estado de entrega.

### R-002 — Trazabilidad

Los documentos y eventos relevantes deben conservar:

- fuente;
- fecha/hora;
- actor;
- identificador;
- relación con la unidad afectada;
- evidencia cuando corresponda.

### R-003 — Historial

Los cambios relevantes de estado no deben destruir el estado anterior.

### R-004 — Resultados alternativos

Entrega fallida, devolución, reembarque y abandono no se consideran automáticamente sinónimos.

### R-005 — Evidencia normativa

Una regla legal implementada debe poder trazarse a una fuente normativa identificable y a su versión/vigencia.

### R-006 — Frontera externa

Las actuaciones de Aduana, AeroVaradero u otros operadores externos no se modelarán como comandos internos de SETA EXPRESO salvo que exista una integración o representación explícita.

## 6. Decisiones D01–D12 y evidencia necesaria

| Decisión | Evidencia mínima para cerrarla |
|---|---|
| D01 | Documento real que muestre jerarquía Master/Guía/House/Manifiesto |
| D02 | Terminología de fuente oficial + documentos operativos reales |
| D03 | Documento de transporte/manifestación real |
| D04 | Evidencia de unidad documental vs unidad física |
| D05 | Casos reales de remitente, destinatario y receptor |
| D06 | Modelo comercial de la empresa |
| D07 | Casos reales de direcciones compartidas |
| D08 | Casos reales de consolidación de entregas |
| D09 | Regla operacional real de cierre múltiple |
| D10 | Política real de reintentos y resultados |
| D11 | Evidencia normativa + estados operativos reales |
| D12 | Requisitos de cierre, POD y reglas legales aplicables |

## 7. Criterio de cierre

Una fila normativa podrá pasar de 🟡 a 🟢 solamente cuando exista:

1. fuente oficial identificada;
2. referencia exacta a artículo/sección o documento;
3. texto/evidencia verificable;
4. vigencia comprobada;
5. actor afectado;
6. regla explícita;
7. impacto de proceso;
8. impacto de dominio;
9. decisión de implementación o descarte.

## 8. Próxima extracción

La siguiente iteración debe convertir N-001…N-007 en fichas artículo por artículo y, paralelamente, localizar en las fuentes oficiales la documentación específica de envíos y operación de carga que permita resolver D01–D06.

No se debe crear todavía el modelo físico de PostgreSQL.
