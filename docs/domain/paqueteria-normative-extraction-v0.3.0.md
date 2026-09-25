# Extracción normativa adicional de Paquetería — Anexo Único y consecuencias de dominio

**Versión:** 0.3.0  
**Issue:** #41  
**PR relacionado:** #42  
**Estado:** evidencia adicional verificada; no sustituye la revisión jurídica del PDF oficial.

## 1. Fuente

La Gaceta Oficial No. 7 Ordinaria de 2026, publicada el 21/01/2026, contiene el Decreto-Ley 108 “De Aduanas” (GOC-2026-107-O7), el Decreto 134 (GOC-2026-108-O7) y las Resoluciones 529, 531, 532, 533 y 534, entre otras.

## 2. Definiciones del Anexo Único relevantes

### 2.1 Conocimiento de Embarque Aéreo / Air Way Bill

El Anexo Único define el Conocimiento de Embarque Aéreo “Air Way Bill” como el documento que acredita la recepción por el porteador o su agente de las mercancías para embarque o embarcadas a bordo de una aeronave; también establece que constituye factura de flete y no es documento negociable.

**Consecuencia:** TransportDocument debe ser un concepto documental independiente de CargoUnit/Bulto. Para el tráfico aéreo, AirWayBill es un tipo de documento de transporte; no es sinónimo de bulto.

### 2.2 Guía Aérea

El Anexo establece expresamente: Guía Aérea = Conocimiento de Embarque Aéreo.

**Consecuencia D01:** para la vía aérea, Guía Aérea y AWB representan el mismo concepto documental. El modelo puede usar un concepto general TransportDocument con tipo AIR_WAYBILL.

### 2.3 Manifiesto de Envíos

El Anexo define el Manifiesto de Envíos como el documento presentado por el operador a la Aduana que contiene la individualización de cada conocimiento de embarque de mercancías transportadas en un buque o aeronave y mediante el cual son presentadas al control de la Aduana.

**Consecuencia:** el manifiesto es un documento de agrupación/control que referencia documentos de transporte; no es equivalente al AWB ni al bulto.

### 2.4 Manifiesto de Carga

El Anexo define el Manifiesto de Carga como el documento elaborado por el capitán/agente del buque o comandante/representante de la aeronave, presentado a la Aduana y al operador portuario/aeroportuario, que contiene el detalle completo por cada conocimiento de embarque de las cargas a bordo destinadas a descarga.

**Consecuencia:** para el flujo aéreo debe distinguirse CargoManifest de AirWayBill y conservar su relación.

### 2.5 Mercancías no manifestadas

El Anexo define como mercancías no manifestadas aquellas descargadas de un buque o aeronave sin haber sido incluidas en el manifiesto o documento donde debían declararse.

**Consecuencia:** “no manifestada” es una condición de control/recepción y no un estado logístico normal de paquete.

### 2.6 Faltantes a la descarga

Son las mercancías declaradas en el manifiesto que no fueron descargadas.

**Consecuencia:** la recepción debe conservar cantidades documentadas y cantidades realmente recibidas.

### 2.7 Depósito temporal

Es un lugar o instalación autorizado por la Aduana para almacenar determinadas mercancías bajo las condiciones previstas por la normativa.

**Consecuencia:** StorageLocation/TemporaryDeposit pertenece a la cadena de custodia y almacenamiento; no debe reutilizar Address del destinatario.

### 2.8 Desaduanamiento

Es el proceso mediante el cual la autoridad aduanera verifica el cumplimiento de la normativa y permite disponer de las mercancías, que desde ese momento se consideran legalmente nacionalizadas.

**Consecuencia:** el estado aduanero debe ser independiente del estado de distribución o entrega de SETA.

### 2.9 Formalización de mercancías

Es el proceso en el que Aduana y declarante cumplen las formalidades para presentar, aceptar y otorgar el levante o colocar las mercancías bajo otro régimen.

**Consecuencia:** SETA puede registrar referencias/resultados externos, pero no debe simular la actuación de Aduana.

### 2.10 Operador de depósito temporal

Es la persona jurídica autorizada que administra y opera un depósito temporal.

**Consecuencia:** debe distinguirse el actor externo que custodia mercancías del operador logístico que ejecuta distribución/entrega.

### 2.11 Operador de comercio exterior

La definición incluye, entre otros, importadores, exportadores, transportistas, transitarias, operadores postales, agencias de aduana, concesionarios de depósitos y otros actores que intervienen en operaciones aduaneras.

**Consecuencia:** ExternalActor debe poder representar actores externos sin convertirlos automáticamente en usuarios internos de SETA.

### 2.12 Rectificación

Es la modificación o cambio autorizado por Aduana sobre datos incorrectos en declaraciones, manifiestos, documentos de transporte y otros elementos con incidencia en la gestión aduanera.

**Consecuencia:** SETA debe conservar trazabilidad de cambios documentales externos y no sobrescribir silenciosamente el dato original.

### 2.13 Abandono legal y voluntario

El Anexo distingue abandono legal y abandono voluntario. El primero es una actuación de la autoridad aduanera a favor del Estado cuando no se declaran o retiran las mercancías dentro de los plazos establecidos; el segundo es la manifestación expresa de quien legalmente puede disponer de ellas, sujeta a aceptación de Aduana.

**Consecuencia D10–D12:** intento fallido, devolución y abandono son disposiciones distintas. El abandono requiere el acto/procedimiento aduanero correspondiente.

## 3. Evidencia adicional sobre recepción aeroportuaria

El Decreto 134 establece que el operador clasifica las cargas recibidas por manifiesto y números de conocimiento de embarque aéreo y que las irregularidades de recepción se documentan.

Se contemplan, entre otras situaciones:

- faltante total a la descarga;
- faltante parcial;
- sobrante;
- carga no manifestada.

**Impacto:**

ExpectedCargo ≠ ReceivedCargo

La recepción debe poder registrar documento de transporte, cantidad/bultos declarados, cantidad recibida, diferencia, tipo de discrepancia, reporte/evidencia, fecha/hora y actor externo.

No debe resolverse mediante un simple booleano received.

## 4. Consecuencia para D01–D12

| Decisión | Estado | Resultado actual |
|---|---|---|
| D01 | 🟢 parcialmente resuelta | Manifest y TransportDocument separados. En vía aérea, Guía Aérea y AWB son el mismo concepto documental. |
| D02 | 🟡 abierta | Bulto/CargoUnit no se puede declarar sin evidencia como sinónimo universal de House o Package. |
| D03 | 🟡 abierta | La cardinalidad exacta de TransportDocument → CargoUnit requiere confirmar el flujo real de SETA. |
| D04 | 🟡 abierta | Debe distinguirse unidad documental de transporte, bulto y eventual unidad física interna. |
| D05 | 🟡 abierta | Remitente, consignatario/destinatario y receptor de entrega siguen siendo roles que deben validarse. |
| D06 | 🟡 abierta | Cliente no se deriva automáticamente de los conceptos aduaneros. |
| D07 | 🟡 propuesta | Address puede reutilizarse, conservando dirección original y contexto documental. |
| D08 | 🟢 provisional | Una parada puede agrupar operaciones de entrega; falta validación operacional. |
| D09 | 🟡 abierta | Una entrega múltiple requiere confirmar el procedimiento real. |
| D10 | 🟢 parcialmente resuelta | Fallo de entrega, devolución y abandono son disposiciones diferentes. |
| D11 | 🟢 parcialmente resuelta | Deben existir estados separados para dimensiones aduanera, documental, recepción, almacenamiento, distribución y entrega. |
| D12 | 🟡 abierta | Los datos mínimos para cierre exitoso siguen dependiendo del procedimiento real de SETA. |

## 5. Implicación arquitectónica

No se debe crear una entidad única Package que represente simultáneamente manifiesto, AWB/Guía, bulto, mercancía, dirección, ubicación de almacenamiento y entrega.

La separación conceptual mínima respaldada por la evidencia es:

Manifest → TransportDocument (AirWayBill/Guía Aérea) → Cargo/CargoUnit/Bulto → Reception → Customs/External Customs Events → Storage → Distribution → Delivery Attempt → Delivery → Evidence

Las entidades y agregados concretos se decidirán después de confrontar esta estructura con datos reales de manifiestos y con la operación de AeroVaradero.

## 6. Próximo paso

1. Completar la extracción artículo por artículo del Decreto 134.
2. Completar Resoluciones 529, 531, 532, 533 y 534.
3. Obtener evidencia operativa de AeroVaradero.
4. Construir matriz norma → actor → entrada → actividad → salida → evidencia → impacto en SETA.
5. Confrontar con un manifiesto real anonimizado.
6. Cerrar D01–D12.
7. Definir agregados DDD y máquinas de estado.
8. Solo entonces pasar al modelo lógico y físico.

## 7. Fuentes

- https://www.gacetaoficial.gob.cu/es/
- https://www.gacetaoficial.gob.cu/es/busqueda-avanzada
- https://www.aduana.gob.cu/
- https://www.aduana.gob.cu/documentos
- https://www.aerovaradero.com.cu/

**Nota:** el texto legal debe verificarse contra la publicación oficial/PDF oficial antes de convertirlo en una regla jurídica ejecutable por software.


## 8. Extracción de las resoluciones complementarias — evidencia consolidada

### 8.1 Resolución 529/2025 — Control aduanero a las mercancías

La Resolución 529 establece normas para el control aduanero a las mercancías. Su objeto comprende los niveles de control y las acciones que se ejecutan antes, durante y después del desaduanamiento. También establece obligaciones de conservación documental para sujetos sometidos al control aduanero, incluyendo documentación relacionada con movimientos, almacenamiento y destino de las mercancías, así como información en medios electrónicos.

**Impacto SETA:**
- el control aduanero debe modelarse como una dimensión externa al ciclo logístico interno;
- la trazabilidad documental debe ser persistente;
- movimientos, almacenamiento y destino pueden requerir evidencia histórica;
- SETA no debe sustituir la decisión de Aduana.

### 8.2 Resolución 531/2025 — Depósito temporal

La Resolución 531 regula la solicitud, otorgamiento, cancelación o revocación de la autorización para habilitar y operar un depósito temporal, así como la permanencia de mercancías y las operaciones que se realizan en él. También prevé documentación digital o impresa según corresponda.

En los datos asociados al depósito aparecen mercancías retenidas, mercancías declaradas en abandono, número de resolución de abandono, documento de entrada/salida, datos del vehículo y transportista, y observaciones.

**Impacto SETA:**
- `TemporaryDeposit` es un contexto de custodia, no una dirección de entrega;
- una mercancía puede estar retenida o declarada en abandono sin que eso sea equivalente a `DeliveryFailed`;
- la entrada/salida del depósito debe conservar documento, fecha/hora y actor;
- el sistema necesita distinguir `StorageMovement` de `DeliveryMovement`.

### 8.3 Resolución 532/2025 — Regímenes aduaneros

La Resolución 532 establece obligaciones, requisitos y formalidades para la autorización del régimen aduanero aplicable a mercancías bajo control de Aduana. También establece que la documentación de solicitudes y autorizaciones puede presentarse o emitirse en formato digital o impreso, y prevé la transmisión digital cuando las condiciones lo permitan.

**Impacto SETA:**
- el régimen aduanero es un dato contextual que no debe confundirse con el estado operativo de distribución;
- una mercancía puede cambiar de régimen sin que eso implique automáticamente una transición de entrega;
- deben conservarse referencias a autorizaciones/documentos externos cuando afecten la trazabilidad de SETA;
- el modelo debe soportar información documental digital y sus referencias.

### 8.4 Resolución 533/2025 — Desaduanamiento

La Resolución 533 regula la forma, condiciones, términos y plazos de las formalidades aduaneras para el desaduanamiento y el disfrute de los regímenes aduaneros. Su alcance incluye mercancías procedentes de o con destino al extranjero y considera las distintas vías de transporte.

Los modelos de declaración contemplan información de solicitud y actuación de Aduana, incluyendo fecha/hora de registro, fecha/hora de liquidación, cuño y datos asociados al pago cuando correspondan.

**Impacto SETA:**
- `CustomsClearance` debe ser independiente de `Delivery`;
- SETA puede almacenar referencias y resultados del proceso aduanero;
- una entrega no debe marcarse como jurídicamente liberada por una decisión interna de SETA;
- los timestamps externos deben conservarse como evidencia.

### 8.5 Resolución 534/2025 — Abandono

La Resolución 534 regula específicamente el abandono legal y voluntario de mercancías, bienes y valores a favor del Estado. El jefe de la aduana de control es la autoridad facultada para declarar el abandono legal o aceptar el abandono voluntario, con posibilidad de delegación para la aceptación del abandono voluntario.

La propia norma establece causales y plazos para el abandono legal.

**Impacto SETA:**
- `Abandonment` debe ser un proceso/resultado aduanero explícito;
- no puede generarse automáticamente por una entrega fallida;
- debe conservarse el número de resolución y la autoridad cuando la información esté disponible;
- la máquina de estados debe impedir la transición directa `DeliveryFailed → Abandoned` sin el evento/decisión aduanera correspondiente.

## 9. Nueva matriz de impacto

| Fuente | Dominio afectado | Regla de diseño |
|---|---|---|
| DL 108 | Control aduanero | Aduana es actor/autoridad externa al dominio operativo de SETA |
| Decreto 134 | Recepción y operaciones | Deben conservarse discrepancias y documentos relevantes |
| Res. 529 | Control | Control aduanero independiente del ciclo de entrega |
| Res. 531 | Almacenamiento | Depósito temporal y movimientos de custodia independientes de Address/Delivery |
| Res. 532 | Régimen | Régimen aduanero independiente del estado logístico |
| Res. 533 | Desaduanamiento | CustomsClearance independiente de Delivery |
| Res. 534 | Abandono | Abandonment requiere actuación aduanera explícita |

## 10. Decisiones DDD actualizadas

### D01 — Manifest / TransportDocument

**Estado: 🟢 suficientemente respaldado para diseño conceptual.**

Manifest y TransportDocument son conceptos distintos. Para vía aérea, AirWayBill/Guía Aérea representa el documento de transporte aéreo.

### D02 — House / Bulto / Package

**Estado: 🟡 abierto.**

La normativa revisada permite afirmar que “bulto” y documento de transporte no son equivalentes, pero todavía no permite definir que `House`, `Bulto` y `Package` sean exactamente el mismo concepto en la operación concreta de SETA.

### D03–D04 — Cardinalidad y unidad física

**Estado: 🟡 abierto.**

La relación documental → carga/bulto y la posible existencia de unidades físicas internas deben confrontarse con el manifiesto real utilizado por SETA.

### D10 — Intento fallido / devolución / abandono

**Estado: 🟢 suficientemente respaldado para separar conceptos.**

Debe existir una separación explícita entre:
- intento de entrega;
- entrega fallida;
- devolución/reingreso;
- abandono aduanero.

### D11 — Estados

**Estado: 🟢 arquitectura conceptual definida; detalle pendiente.**

Se requiere separar al menos:
- estado documental;
- estado de recepción;
- estado de custodia/almacenamiento;
- estado aduanero;
- estado de distribución;
- estado de entrega.

No deben existir como un único `status` universal.

## 11. Restricción de implementación

**No crear todavía tablas `packages`, `manifests`, `deliveries` definitivas ni migraciones PostgreSQL derivadas únicamente de estos documentos.**

La próxima decisión técnica debe producir primero un **modelo de dominio validado** y una **máquina de estados explícita**, antes del modelo relacional.
