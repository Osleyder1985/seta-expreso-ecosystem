# Extracción normativa del Servicio de Paquetería — v0.2.0

**Issue:** #41
**Estado:** evidencia inicial verificada; extracción pendiente de completar

## 1. Fuentes y normas verificadas

La Gaceta Oficial No. 7 Ordinaria de 2026, de 21/01/2026, identifica en su sumario: GOC-2026-107-O7 Decreto-Ley 108 de Aduanas; GOC-2026-108-O7 Decreto 134, Reglamento del Decreto-Ley 108; GOC-2026-109-O7 Resolución 529/2025; GOC-2026-111-O7 Resolución 531/2025 sobre depósito temporal; GOC-2026-112-O7 Resolución 532/2025 sobre regímenes aduaneros; GOC-2026-113-O7 Resolución 533/2025 sobre desaduanamiento; y GOC-2026-114-O7 Resolución 534/2025 sobre abandono.

## 2. Decreto-Ley 108 — evidencia de dominio

El Artículo 1 establece que el Decreto-Ley regula la organización y funcionamiento de la Aduana respecto de regímenes aduaneros, desaduanamiento de mercancías y medios de transporte, envíos, viajeros y equipajes. El Artículo 2 alcanza a personas naturales y jurídicas que intervienen en esas operaciones. El Artículo 6 establece que los términos usados en el Decreto-Ley se entienden según el Anexo Único de definiciones. El Artículo 13 incluye control aduanero antes, durante y después del desaduanamiento. El Artículo 14 faculta al jefe de la Aduana para establecer formas, condiciones, términos y plazos de controles y formalidades y para requerir información digital adelantada o en tiempo real.

**Impacto:** SETA debe separar las actuaciones aduaneras de sus propios estados logísticos y de entrega. Las definiciones del Anexo Único tienen prioridad sobre definiciones inventadas por el modelo de dominio.

## 3. Manifiesto y documentos de transporte

La normativa distingue manifiesto de carga y conocimiento de embarque. Para la vía aérea, el Artículo 68 exige información adelantada del manifiesto de carga aéreo y del conocimiento de embarque aéreo en formato electrónico. Los Artículos 72–76 contemplan eliminación/cancelación del manifiesto, cambios, bajas, adiciones y desgloses del conocimiento de embarque aéreo.

La metodología de la Declaración de Mercancías utiliza número de manifiesto, Bill of Lading/Air Way Bill, cantidad de bultos, peso, localización y otros datos. La casilla correspondiente al Bill of Lading/Guía Aérea registra el número del conocimiento de embarque o Air Way Bill; para determinadas operaciones postales se utiliza el número del bulto postal internacional. La cantidad total de bultos debe corresponder con la información declarada.

**Conclusión provisional D01–D04:** debemos mantener separadas, al menos conceptualmente, las capas Manifest, Transport Document y Cargo Unit/Bulto. Todavía no existe evidencia suficiente para afirmar que House, Bulto y Package sean sinónimos.

## 4. Recepción aeroportuaria

El Artículo 134 establece que el operador clasifica las cargas recibidas por manifiesto y números de conocimiento de embarque aéreo. El Artículo 135 exige documentar irregularidades de recepción, incluyendo faltantes, sobrantes y mercancías no manifestadas. El Artículo 138 contempla anotaciones de faltantes totales/parciales, sobrantes y cargas no manifestadas.

**Impacto:** la recepción debe conservar resultado y evidencia; no debe reducirse a un simple cambio de estado.

## 5. Depósito temporal

La Resolución 531/2025 regula el depósito temporal. Su Anexo I exige, entre otros datos, número de manifiesto, número de conocimiento de embarque, fecha de entrada, cantidad de bultos, descripción, origen/destino y ubicación dentro del depósito.

**Impacto:** Storage Location es conceptualmente diferente de la Address del destinatario. No debemos reutilizar Address como ubicación física de almacenamiento.

## 6. Desaduanamiento

La Resolución 533/2025 regula las formalidades para el desaduanamiento y el disfrute de regímenes aduaneros. Su metodología utiliza referencias al manifiesto, Bill of Lading/Guía Aérea, bultos, peso, localización y actuación de Aduana.

**Impacto:** SETA debe poder conservar referencias documentales y eventos aduaneros recibidos, sin simular funciones propias de la Aduana salvo que exista una integración formal.

## 7. Abandono, devolución y entrega fallida

La normativa distingue situaciones de no entrega al destinatario, devolución al remitente y abandono legal. Entre las causas contempladas aparecen información incorrecta para localizar al destinatario, destinatario no localizado, rechazo de la carga por el destinatario y otras circunstancias.

**Impacto D10–D12:** Delivery Attempt Failed no debe convertirse automáticamente en abandono. El flujo debe permitir reintento, devolución u otra disposición y, cuando jurídicamente corresponda, un resultado de abandono.

## 8. Decisiones provisionales

**D01 — 🟡 parcialmente resuelto:** Manifest → Transport Document → Cargo Unit es una estructura conceptual válida provisionalmente. Master/House y su cardinalidad quedan pendientes.

**D02 — 🟡 abierto:** Bulto tiene significado documental/operativo; no se demuestra equivalencia con House o Package.

**D03 — 🟡 parcialmente resuelto:** un documento de transporte puede amparar una cantidad de bultos; falta cerrar la estructura completa del servicio de SETA.

**D04 — 🟡 parcialmente resuelto:** documentación de transporte y unidades/bultos deben mantenerse separadas.

**D05 — 🟡 abierto:** remitente, destinatario y receptor no deben colapsarse sin evidencia operacional.

**D11 — 🟡 parcialmente resuelto:** separar estados aduaneros, documentales, logísticos, almacenamiento, distribución y entrega.

## 9. Regla arquitectónica

Las actuaciones de Aduana, operadores aeroportuarios y otros actores externos deben representarse en SETA mediante documentos, identificadores externos, eventos, evidencias, estados externos o integraciones explícitas. No deben convertirse automáticamente en comandos o entidades internas de SETA.

## 10. Próxima extracción

1. Extraer el Anexo Único de definiciones del Decreto-Ley 108.
2. Revisar Decreto 134, especialmente control, depósito, regímenes y desaduanamiento.
3. Extraer Resoluciones 529, 531, 532, 533 y 534 artículo por artículo.
4. Obtener evidencia operativa específica de AeroVaradero.
5. Confrontar las fuentes con documentos reales del flujo de SETA.
6. Actualizar D01–D12.
7. Cerrar el modelo conceptual antes del esquema físico PostgreSQL.

## Fuentes

- https://www.gacetaoficial.gob.cu/es/busqueda-avanzada
- https://www.aduana.gob.cu/
- https://www.aduana.gob.cu/documentos
- https://www.aerovaradero.com.cu/
