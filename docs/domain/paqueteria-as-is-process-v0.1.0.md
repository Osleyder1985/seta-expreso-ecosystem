# Proceso AS-IS de Paquetería — Seta Expreso S.U.R.L.

**Versión:** 0.1.0  
**Estado:** Fuente de verdad provisional del proceso operativo actual narrado por la empresa  
**Issue:** #46  
**Fecha:** 2026-09-25

## 1. Propósito y alcance

Este documento consolida el proceso AS-IS de Paquetería descrito por Seta Expreso S.U.R.L. hasta el cierre económico y archivo del manifiesto.

Su objetivo es preservar la realidad operacional antes de diseñar el proceso TO-BE, requisitos, casos de uso, modelo de dominio, base de datos, APIs, aplicaciones móviles/web o automatizaciones.

### Convenciones de clasificación

- 🟢 **Hecho operacional:** práctica actualmente descrita por SETA.
- 🔵 **Documento/dato:** información o evidencia utilizada/generada.
- 🟡 **Regla externa / aspecto normativo:** requiere verificación contra fuente oficial antes de convertirse en regla del software.
- 🟣 **Regla interna/contractual:** regla de operación o contrato de SETA; no debe tratarse como obligación legal universal.
- ⚪ **Decisión de diseño:** todavía no implementada; requiere análisis posterior.

Cuando la empresa utiliza un término operativo cuya denominación jurídica/oficial no ha sido verificada, se conserva el término como lenguaje AS-IS y se marca como pendiente.

---

## 2. Resumen ejecutivo del flujo

El proceso narrado actualmente sigue, de forma resumida, esta cadena:

1. Contratación con agencias extranjeras.
2. Contratación/relación operativa con AeroVaradero.
3. Recepción del manifiesto de la agencia en Excel.
4. Procesamiento y geocodificación actual mediante Optimal Route.
5. Verificación telefónica y rectificación de direcciones.
6. Aviso de salida internacional del envío.
7. Consulta del arribo mediante AeroVaradero/AWB.
8. Proceso aduanero.
9. Determinación de estado de cada bulto por AeroVaradero.
10. Facturación/puesta a disposición de bultos recuperables por SETA.
11. Recogida física en AeroVaradero y verificación bulto por bulto.
12. Recepción en almacén SETA.
13. Clasificación física por provincia.
14. Planificación manual de rutas.
15. Asignación de ruta a tripulación.
16. Ejecución de entregas.
17. Evidencia de entrega o registro de no entrega.
18. Retorno y reprogramación de bultos no entregados.
19. Cierre de todos los bultos con estado operativo válido.
20. Facturación del servicio a la agencia.
21. Pago de la factura por la agencia.
22. Archivo definitivo del manifiesto y sus bultos.

El flujo económico relacionado con los importes aduanales se ejecuta en paralelo: SETA registra/recupera los importes determinados para los bultos facturados por AeroVaradero, paga el total correspondiente a AeroVaradero y posteriormente cobra los importes aplicables a los clientes según el modelo comercial vigente.

---

## 3. Contratación y origen de la operación

### 3.1 Agencias extranjeras

🟢 SETA mantiene contratos con agencias de paquetería de:

- Panamá
- México
- Estados Unidos
- Canadá
- República Dominicana
- España

🟣 Los contratos contemplan, entre otros aspectos, precio del servicio, condiciones de pago y reclamaciones.

🟣 Tarifa actualmente descrita para el servicio de entrega:

- Ciudad de La Habana: **USD 0.90/kg**
- Fuera de Ciudad de La Habana: **USD 1.10/kg**

Estas tarifas son datos contractuales/AS-IS. No deben hard-codearse como tarifas universales.

### 3.2 AeroVaradero

🟢 SETA tiene contrato con AeroVaradero S.A. en Cuba.

🟢 Según la descripción operacional de SETA, AeroVaradero recibe la carga internacional y posteriormente entrega a SETA los bultos que corresponden a distribución nacional por SETA.

🟡 La naturaleza jurídica exacta de cada actor, el alcance de sus responsabilidades y la terminología oficial deben verificarse posteriormente mediante Aduana, AeroVaradero y Gaceta Oficial.

---

## 4. Recepción del manifiesto de la agencia

### 4.1 Entrada

🔵 La agencia envía normalmente el manifiesto en formato Excel mediante WhatsApp.

🟢 Suele recibirse aproximadamente **72 horas o algo más** antes del despacho de la carga desde origen.

🟢 El destino de la operación descrita es Cuba.

### 4.2 Procesamiento actual

🟢 SETA no utiliza actualmente un sistema propio para este flujo.

🟢 El Excel se procesa manualmente y se carga en **Optimal Route**.

🟣 Optimal Route debe eliminarse del proceso futuro de SETA por su coste/licenciamiento y porque no satisface la necesidad de una plataforma propia.

### 4.3 Estructura observada

En el manifiesto real analizado anteriormente se observaron campos como:

- Agente transitario
- Fecha
- País de origen
- Consignatario
- Cantidad House
- Total de sacas
- Master AWB
- Total de personas
- House
- Naturaleza y cantidad
- Peso (kg)
- Bultos (cantidad)
- Sender
- Passport
- Recipient
- CI
- Teléfono
- Dirección del destinatario
- Cobrado/no cobrado en origen
- Unidad de destino

El archivo real observado correspondía al Master AWB **649-31382945** y contenía 127 House, 127 sacas, 83 personas y 2123.23 kg. El hecho de que las filas observadas tuvieran un bulto por House no debe interpretarse como una equivalencia universal entre House y bulto físico.

---

## 5. House y bulto físico

🟢 La operación real confirma que un House puede contener **1, 2, 3 o N bultos físicos**.

Por tanto, el concepto operacional es:

**Master AWB / documento de transporte → House → Bulto físico**

con una relación:

**House 1:N Bulto físico**

🔵 El número del bulto físico es relevante durante recepción, almacén, ruta, entrega y conciliación.

⚪ No se debe modelar House como sinónimo de bulto físico.

---

## 6. Direcciones, geocodificación y validación

### 6.1 Geocodificación actual

🟢 Optimal Route intenta geocodificar las direcciones del manifiesto.

🟢 Algunas direcciones son encontradas y otras no.

### 6.2 Rectificación

🟢 Después de la geocodificación, SETA contacta telefónicamente al destinatario utilizando el teléfono incluido en el manifiesto.

🟢 Se verifica si la dirección declarada es correcta.

🟢 SETA puede actualizar manualmente la ubicación encontrada o localizar/corregir las direcciones que no fueron geocodificadas.

### 6.3 Regla conceptual

🟢 **Geocodificar no equivale a validar la dirección.**

⚪ Para el futuro sistema deberán mantenerse, como mínimo conceptualmente:

**Dirección original declarada → dirección interpretada/rectificada → dirección operacional → coordenadas**

La dirección original no debe perderse.

---

## 7. Transporte internacional y arribo — flujo aéreo descrito

🟢 La operación descrita actualmente corresponde principalmente a carga aérea.

🟢 La agencia comunica a SETA cuando la carga ha sido enviada desde origen.

⚪ En el futuro, este hecho deberá representarse como un evento de transporte internacional, preservando fecha, fuente y evidencia.

🟢 SETA consulta actualmente el sitio de AeroVaradero para comprobar el arribo de la carga, utilizando un identificador relacionado con el AWB/manifestación.

⚪ La automatización futura de esta consulta dependerá de la existencia y condiciones reales de una página/API/integración disponible. No se debe asumir que existe una API pública sin verificarla.

🟡 La secuencia jurídica/aduanera exacta posterior al arribo debe verificarse con fuentes oficiales.

---

## 8. Estados operacionales de AeroVaradero descritos por SETA

Después del arribo y del proceso aduanero, SETA ha descrito los siguientes estados/resultados para bultos:

### FACTURADO

🟢 AeroVaradero genera factura para el bulto cuando puede ser entregado a SETA para distribución.

🟢 Para SETA, **FACTURADO** significa operacionalmente que el bulto está disponible para ser recogido y posteriormente distribuido.

### PRESENCIAL

🟢 SETA ha descrito dos causas:

- PRESENCIAL — canal rojo.
- PRESENCIAL — rotura.

🟢 En estos casos, según el proceso descrito, SETA no recibe el bulto para su distribución; AeroVaradero gestiona la atención con el cliente.

🟡 El significado jurídico/oficial y la terminología exacta de estos estados requieren verificación externa.

### FALTANTE DE ORIGEN

🟢 El bulto declarado por la agencia no llegó a Cuba desde origen.

🟢 Para SETA, este resultado es terminal respecto a su participación en la entrega.

🟡 Debe verificarse posteriormente qué evidencia oficial respalda el estado y cuál es su tratamiento jurídico/operacional.

---

## 9. Estado del manifiesto durante la fase AeroVaradero

🟢 El manifiesto tiene estado propio y no simplemente el estado de sus bultos.

🟢 Durante el proceso aduanero el manifiesto permanece en **PROCESO ADUANERO** aunque los bultos individuales puedan avanzar a estados distintos.

🟢 Cuando todos los bultos del manifiesto alcanzan uno de los resultados válidos de esta fase:

- FACTURADO
- PRESENCIAL
- FALTANTE DE ORIGEN

el manifiesto pasa a:

**LISTO PARA DESPACHO**

🟢 AeroVaradero comunica a SETA que la carga está lista para ser recogida.

🟣 Para SETA, LISTO PARA DESPACHO significa que se puede organizar la recogida de los bultos físicamente disponibles.

---

## 10. Recogida física en AeroVaradero

🟢 SETA llega a los almacenes de AeroVaradero con los camiones.

🟢 AeroVaradero entrega los bultos físicamente uno por uno.

🔵 Cada bulto entregado físicamente viene asociado a su factura.

🟢 SETA verifica cada etiqueta contra el número correspondiente en el manifiesto de la agencia.

🟢 Los bultos recibidos se organizan por provincia para su transporte.

🟢 Una vez terminada la entrega física a SETA, AeroVaradero genera su propio manifiesto desde su sistema.

### 10.1 Dos fuentes de manifiesto

🔵 Existe una diferencia fundamental entre:

1. **Manifiesto de la agencia:** declaración/origen de la operación.
2. **Manifiesto de AeroVaradero:** relación de bultos físicamente entregados a SETA.

⚪ El futuro sistema debe conservar ambas evidencias y no sobrescribir una con otra.

---

## 11. Recepción en almacén SETA

🟢 Después de la recogida, SETA transporta la carga a su almacén.

🟢 La descarga se realiza bulto por bulto.

🟢 El almacenero recibe físicamente cada bulto.

🟢 El almacenero verifica el número identificador de cada bulto durante la recepción.

Esto constituye una segunda recepción física distinta de la recepción/entrega efectuada por AeroVaradero.

---

## 12. Clasificación por provincia

🟢 Una vez recibidos los bultos, el almacén los clasifica físicamente por provincia de destino.

Ejemplos mencionados:

- La Habana
- Pinar del Río
- Guantánamo
- Camagüey
- Sancti Spíritus
- otras provincias

🟢 Los bultos se colocan físicamente en grupos/pilas separados por provincia.

⚪ La ubicación física exacta dentro del almacén y el catálogo formal de zonas/ubicaciones deberán definirse posteriormente.

---

## 13. Planificación actual de rutas

🟢 Actualmente SETA utiliza Optimal Route para la planificación.

🟢 La planificación es manual y basada en experiencia del operador.

🟢 Normalmente se genera una ruta para un día.

🟢 El operador selecciona:

- punto de partida;
- punto de llegada;
- bultos que estima posible entregar durante la jornada.

🟢 Si existe capacidad sobrante, pueden añadirse bultos.

🟢 Si durante la operación se determina que no se podrán entregar todos, los bultos pendientes se retiran de la ruta y se planifican para otro día.

### 13.1 Zonificación

🟢 En Ciudad de La Habana SETA divide operacionalmente los destinos en zonas geográficas basadas en concentración/proximidad de paquetes, por ejemplo una zona hacia un lado de la ciudad y otra hacia el otro.

🟢 Una zona puede requerir varios días.

🟢 La división no debe interpretarse como división administrativa oficial de municipios/provincias.

### 13.2 Ejemplos de rutas cerradas

🟢 Ciudad de La Habana puede operar como:

**Base → zona de entregas → Base**

durante uno o varios días.

🟢 Otro ejemplo:

**Base en La Habana → Pinar del Río → entregas → Artemisa → entregas → Base en La Habana**

Esto demuestra que una ruta puede atravesar varias provincias.

### 13.3 Ruta abierta y ruta cerrada

🟢 Existen dos tipos operacionales:

- **Ruta abierta:** punto inicial y punto final diferentes.
- **Ruta cerrada:** punto inicial y punto final iguales.

⚪ Estos conceptos deberán formalizarse posteriormente en el diseño.

---

## 14. Restricciones temporales de las rutas

### 14.1 Ventana de entrega

🟣 Horario operacional deseado para realizar entregas:

**07:00–20:00**

🟢 El vehículo puede salir antes de las 07:00 para llegar a una provincia distante y comenzar allí las entregas a las 07:00.

🟢 En operaciones de larga distancia, la salida puede ser aproximadamente a las 04:00 o 05:00, según la distancia.

🟢 La jornada completa, incluyendo traslados y entregas, puede extenderse aproximadamente desde las 04:00/05:00 hasta las 23:00.

### 14.2 Tiempo de servicio

🟣 Tiempo de referencia para una entrega individual:

**5–10 minutos por paquete.**

🟣 Cuando varios paquetes se entregan en la misma dirección/cliente, la regla operacional actualmente definida es:

**5 minutos por paquete.**

Ejemplo:

5 paquetes en la misma dirección = 25 minutos.

⚪ El comportamiento exacto de tiempos adicionales por documentación, estacionamiento u otras actividades debe determinarse posteriormente.

### 14.3 Descanso

🟣 La jornada debe contemplar **60 minutos acumulados de descanso**.

🟢 El descanso puede ser:

- una hora continua; o
- varios períodos fraccionados, por ejemplo 10, 15 o 20 minutos.

🟢 Durante los períodos de descanso no se programan entregas.

---

## 15. Restricciones de distancia

🟣 **Máximo de 700 km por ruta.**

El límite incluye el recorrido completo de la ruta:

- traslado de salida;
- desplazamientos entre entregas;
- desplazamientos dentro de las zonas;
- entregas como parte del recorrido;
- regreso cuando corresponda;
- demás desplazamientos que formen parte de la ruta.

Regla:

**Distancia total de la ruta ≤ 700 km**

🟢 Los 700 km constituyen un máximo, no un objetivo.

🟢 SETA opera desde Camagüey, en el centro del país, y utiliza este límite como restricción operacional hacia el este y oeste.

⚪ La forma exacta de obtener el kilometraje deberá definirse posteriormente (motor de routing, red vial, odómetro/evidencia, etc.).

---

## 16. Velocidades de referencia

🟣 Referencias operacionales proporcionadas:

- aproximadamente **30 km/h** en ciudades;
- aproximadamente **60–100 km/h** en desplazamientos por carretera;
- hasta aproximadamente **100 km/h** en autopistas, según la referencia operacional proporcionada.

🟡 Estos valores no deben interpretarse automáticamente como límites legales de velocidad.

⚪ Para planificación futura se deberá diferenciar entre velocidad operacional estimada y límite legal de la vía.

---

## 17. Documentación y tripulación

🟢 Una vez creada una ruta, SETA genera documentación para la tripulación del camión.

La tripulación está compuesta actualmente por:

- 🚚 **Chofer:** conduce el vehículo.
- 👤 **Segundo integrante responsable de la carga y de la ejecución operacional de las entregas**, denominado actualmente por el usuario como conductor/comercial.

🟡 La denominación oficial de este segundo actor debe verificarse posteriormente en la documentación normativa aplicable.

### 17.1 Dos soportes de la ruta

La tripulación recibe:

1. 📱 aplicación móvil con la ruta y orden de entregas;
2. 📄 documento impreso con el mismo orden.

La aplicación identifica el primer paquete, segundo, tercero, etc.

---

## 18. Entrega al destinatario

Cuando la tripulación llega al domicilio del destinatario:

### Evidencia de identidad

🟢 Se toma una fotografía del documento/carné de identidad del destinatario sobre/relacionado con la etiqueta del bulto, de manera que pueda asociarse la identidad con el número del bulto.

### Evidencia de integridad física

🟢 Se toman fotografías del bulto, incluyendo sus esquinas, para demostrar su estado físico/integridad al momento de la entrega.

### Firma

🟢 Se obtiene la firma del destinatario.

### Cierre

🟢 El bulto se marca en la aplicación como **ENTREGADO**.

Estas evidencias constituyen el conjunto AS-IS de evidencia de entrega descrito por SETA. El conjunto definitivo de prueba de entrega (POD) queda abierto a especificación posterior.

---

## 19. Entrega no realizada

🟢 Si el destinatario no está en su domicilio y no dejó una persona responsable/autorizada para recibir:

1. el bulto no se entrega;
2. se registra como **NO ENTREGADO**;
3. el bulto regresa al almacén;
4. queda pendiente de nueva planificación;
5. se coordina una nueva entrega posteriormente con la agencia y/o el cliente.

🟢 El intento fallido debe conservarse históricamente.

⚪ El modelo futuro debe permitir múltiples intentos de entrega para un mismo bulto.

---

## 20. Costos adicionales por reintento

🟢 Un intento de entrega fallido puede generar un costo adicional para SETA por el desplazamiento y operación necesarios para una nueva entrega.

🟣 El sistema deberá poder calcular/determinar ese costo adicional.

🟣 La imputación económica puede depender de las condiciones comerciales y de la causa del reintento.

Posibles responsables descritos:

- cliente/destinatario;
- agencia;
- otro responsable según las condiciones aplicables.

⚪ No se debe asumir todavía que el costo siempre corresponde al cliente.

---

## 21. Importes aduanales y relación con AeroVaradero

🟢 Cuando el bulto está facturado en AeroVaradero, SETA necesita obtener el importe determinado en relación con Aduana que aparece en la información de AeroVaradero.

🟢 Según el proceso descrito, SETA paga a AeroVaradero el total correspondiente a los importes de los bultos del manifiesto.

Conceptualmente:

**Importe bulto 1 + importe bulto 2 + ... + importe bulto N = total pagado a AeroVaradero**

🟢 Posteriormente SETA cobra a cada cliente el importe correspondiente al bulto que recibe, conforme al modelo comercial vigente.

⚠️ Este documento conserva el concepto como **importe aduanal según la terminología operacional de SETA**. No establece todavía su denominación jurídica, naturaleza tributaria, documento fuente ni responsable legal de determinación. Todo ello deberá verificarse contra fuentes oficiales antes de convertirlo en una regla normativa del sistema.

---

## 22. Condición de facturación del servicio a la agencia

🟢 Cuando **todos los bultos del manifiesto** tienen un estado válido de cierre operacional:

- ENTREGADO
- PRESENCIAL
- FALTANTE DE ORIGEN

el manifiesto queda en condiciones de generar la factura por el servicio prestado a la agencia.

### 22.1 Bultos cobrables

🟢 Los bultos **ENTREGADOS** forman parte del cálculo del servicio de distribución de SETA.

La factura debe reflejar, según la descripción actual:

- bultos entregados;
- kilogramos totales;
- kilogramos correspondientes a Ciudad de La Habana;
- kilogramos correspondientes a fuera de Ciudad de La Habana;
- tarifa aplicable;
- importe;
- total en USD.

### 22.2 Bultos informativos no cobrables

🟢 Los bultos:

- PRESENCIAL;
- FALTANTE DE ORIGEN

se relacionan/informan en la factura, pero no generan cobro por servicio de entrega de SETA porque SETA no realizó esa entrega.

Por tanto, la factura tiene simultáneamente:

**parte cobrable + relación informativa de bultos no cobrables.**

---

## 23. Pago de la agencia y archivo

🟢 Una vez que la agencia paga la factura:

1. el manifiesto;
2. todos sus bultos;

pasan al estado:

**ARCHIVADO**

🟢 ARCHIVADO representa el cierre final del ciclo operativo/económico del manifiesto.

🟢 Una vez archivado, el manifiesto y sus bultos no deben modificarse en la operación normal.

🟢 Después de archivados deben quedar disponibles para **consulta**.

⚪ Si en el futuro existiera una corrección excepcional legal/contable, deberá analizarse como mecanismo de ajuste/auditoría sin alterar silenciosamente la historia archivada.

---

## 24. Principios de trazabilidad derivados del AS-IS

El proceso narrado exige conservar como mínimo conceptualmente:

### Fuentes externas

- manifiesto original de la agencia;
- comunicaciones de salida;
- datos/consulta de arribo;
- información de AeroVaradero;
- manifiesto de bultos entregados físicamente por AeroVaradero;
- facturas/importe de AeroVaradero;
- evidencia de determinación del importe aduanal.

### Evidencia operacional SETA

- verificación/rectificación de dirección;
- recepción física;
- clasificación de almacén;
- ruta planificada;
- cambios de ruta;
- asignación a tripulación;
- entrega;
- fotos;
- identificación;
- firma;
- no entrega;
- retorno a almacén;
- reprogramaciones;
- costos adicionales;
- factura a agencia;
- pago recibido;
- cierre/archivo.

### Regla de preservación

Los datos declarados originalmente no deben ser destruidos cuando posteriormente son corregidos o verificados.

Ejemplo:

**Dirección declarada ≠ dirección rectificada**

y:

**Manifiesto de agencia ≠ manifiesto de AeroVaradero**

Ambos deben conservarse porque representan hechos diferentes.

---

## 25. Distinciones que no deben perderse en el diseño futuro

### House ≠ Bulto físico

Un House puede contener 1..N bultos.

### Manifiesto ≠ Bulto

El manifiesto tiene ciclo propio y el bulto tiene ciclo propio.

### Estado de manifiesto ≠ estado de bulto

Un manifiesto puede estar en PROCESO ADUANERO mientras sus bultos tienen resultados diferentes.

### Recepción AeroVaradero ≠ recepción almacén SETA

Son dos controles físicos distintos.

### Geocodificación ≠ validación de dirección

Una coordenada encontrada automáticamente no demuestra que la dirección sea correcta.

### Ruta ≠ Provincia

Una ruta puede cubrir varias provincias.

### Ruta ≠ Jornada

Una zona/provincia puede requerir varias jornadas.

### Entrega ≠ intento de entrega

Un bulto puede tener múltiples intentos.

### No entregado ≠ terminado

Un bulto no entregado puede volver al almacén y ser reprogramado.

### Fin de distribución ≠ cierre económico

El manifiesto se archiva después de completar el ciclo de facturación y recibir el pago de la agencia.

### ARCHIVADO ≠ eliminado

Archivado significa conservación histórica y consulta, no borrado.

---

## 26. Modelo AS-IS condensado

**Agencia**
→ manifiesto Excel  
→ verificación/geocodificación  
→ aviso de salida  
→ arribo  
→ proceso aduanero  
→ estados AeroVaradero  
→ recogida SETA  
→ almacén  
→ clasificación  
→ planificación  
→ ruta  
→ entrega/no entrega  
→ reprogramación si aplica  
→ todos los bultos en estado de cierre  
→ factura agencia  
→ pago  
→ **ARCHIVADO**

En paralelo:

**Bultos facturados AeroVaradero**
→ importes asociados  
→ pago agregado SETA a AeroVaradero  
→ recuperación/cobro por bulto según modelo comercial.

---

## 27. Pendientes que NO deben reinterpretarse como hechos

Los siguientes puntos quedan deliberadamente abiertos:

1. Denominación oficial del segundo integrante de la tripulación.
2. Significado jurídico/operacional formal de PRESENCIAL, canal rojo y rotura.
3. Naturaleza jurídica exacta del importe aduanal y documentos que lo acreditan.
4. Procedimiento aduanero completo después del arribo.
5. Existencia, alcance y condiciones de una API oficial de AeroVaradero.
6. Identificador exacto utilizado para tracking aéreo.
7. Flujo marítimo, incluyendo Mariel, naviera, B/L, House B/L, contenedor, desconsolidación y recepción.
8. Reglas formales para responsabilidad de costos de reintento.
9. Reglas completas de facturación, impuestos, crédito y conciliación.
10. Catálogo oficial de provincias/unidades de destino.
11. Reglas formales para autorización de un tercero a recibir.
12. Reglas de modificación/cancelación de operaciones antes del archivo.
13. Mecanismo excepcional de corrección posterior al archivo.

Estos pendientes no invalidan el AS-IS ya capturado; simplemente evitan convertir información todavía no verificada en una falsa regla normativa.

---

## 28. Uso obligatorio de este documento en fases posteriores

Este documento deberá utilizarse como fuente de entrada para:

- descubrimiento y análisis del dominio;
- requisitos funcionales y no funcionales;
- casos de uso;
- actores y responsabilidades;
- estados y transiciones;
- eventos de dominio;
- modelo conceptual y lógico;
- trazabilidad;
- arquitectura;
- APIs;
- aplicaciones Web/Android/iOS;
- automatización;
- motor de planificación de rutas;
- controles y auditoría;
- facturación y conciliación;
- pruebas de aceptación.

**No se debe volver a solicitar al usuario la repetición de los hechos ya documentados aquí.** Si una fase posterior necesita una precisión que realmente no esté contenida en este documento, se debe señalar exactamente qué dato falta y por qué es necesario.
