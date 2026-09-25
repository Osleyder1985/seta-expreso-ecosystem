# Benchmark mundial de logística y adopción para Paquetería — v0.1.0

**Estado:** propuesta de referencia para diseño TO-BE  
**Issue:** #48  
**Alcance:** Z Express / SETA EXPRESO — Servicio de Paquetería  
**Fecha:** 2026-09-25

## 1. Propósito

Este documento conserva los aprendizajes útiles obtenidos del benchmark de operadores logísticos internacionales y plataformas empresariales de logística, transporte, forwarding, warehouse, customs, parcel/shipping y supply chain.

Su objetivo no es copiar a ningún proveedor. El objetivo es identificar patrones de negocio, información, operación y software que hayan demostrado utilidad a escala industrial y decidir cuáles son apropiados para Z Express.

Regla de ingeniería:

> Adoptar el patrón cuando resuelva una necesidad real de SETA, reduzca riesgo o aumente trazabilidad; no adoptarlo únicamente porque exista en un producto líder.

La normativa cubana y los procedimientos oficiales continúan siendo la autoridad para obligaciones legales. Las prácticas de empresas privadas son referencias de diseño, no fuentes jurídicas.

## 2. Referencias de benchmark

### Operadores logísticos
- DHL / DHL Global Forwarding
- FedEx
- UPS / UPS Supply Chain Solutions
- DSV
- Kuehne+Nagel
- DB Schenker
- Expeditors
- C.H. Robinson

### Plataformas de software
- CargoWise / WiseTech Global
- Oracle Transportation Management
- SAP Transportation Management / Supply Chain
- Microsoft Dynamics 365 Supply Chain Management
- Infor Nexus
- Blue Yonder Transportation Management
- Descartes
- project44
- FourKites
- plataformas especializadas de parcel/shipping

Estas referencias cubren distintos segmentos; no se consideran un ranking único ni homogéneo.

## 3. Patrones comunes observados

### 3.1. El envío no es un único objeto
Los sistemas maduros separan, al menos conceptualmente:

Customer → Order/Booking → Shipment → Transport Documents → Master/House → Physical Units → Custody → Transport → Customs/Compliance → Distribution → Delivery → Financial Settlement

Esto refuerza para SETA la separación:

Master AWB/transport document → House → Physical Bulto

y evita modelar todo como Manifest → Package.

### 3.2. Los estados se dividen por dimensiones
Los sistemas logísticos registran hitos y eventos específicos de documentación, transporte, custodia, aduana, distribución y entrega.

Para Z Express se mantiene la decisión ya adoptada de no crear un único PackageStatus universal.

### 3.3. Eventos y milestones son información operacional de primera clase
Un evento debe poder expresar, cuando aplique:
- objeto afectado;
- tipo de evento;
- actor;
- fecha/hora;
- zona horaria;
- ubicación;
- motivo;
- resultado;
- evidencia/documento;
- origen del evento;
- relación con un proceso.

Los estados actuales deben poder derivarse o auditarse a partir del historial.

### 3.4. Exception Management
Las plataformas maduras no se limitan a mostrar estados; detectan situaciones que requieren intervención:
- discrepancias;
- retrasos;
- documentación incompleta;
- retenciones;
- dirección problemática;
- capacidad insuficiente;
- incumplimiento de ventana;
- entrega fallida;
- devolución;
- coste anómalo;
- facturación pendiente;
- conciliación pendiente.

Z Express debe tener un concepto transversal de Exception/Incidence.

### 3.5. Workflow
Patrón:

Evento → Regla → Acción

Ejemplo futuro:

WarehouseReceived + CustomsReleased → ReadyForDistribution

El workflow debe ser configurable y auditable, no una colección de condiciones dispersas por el código.

### 3.6. Visibility / Control Tower
Los operadores y plataformas empresariales convergen hacia una vista operacional que permite observar:
- qué está en tránsito;
- qué está retenido;
- qué llegó;
- qué está en custodia;
- qué está listo;
- qué está planificado;
- qué está en ruta;
- qué entregas fallaron;
- qué requiere intervención;
- qué está pendiente económicamente.

Z Express debe evolucionar hacia un Centro de Control Operacional.

### 3.7. Buy / Sell / Cost / Revenue
La logística empresarial separa:
- ingreso por cliente/agencia;
- coste de proveedor;
- coste operativo;
- liquidación;
- cuentas por cobrar;
- cuentas por pagar;
- conciliación;
- margen/rentabilidad.

Esto encaja con el flujo real de SETA:
Agencia → SETA (ingreso)
SETA → AeroVaradero/proveedores (coste)

sin asumir que un reintento sea siempre facturable al cliente.

### 3.8. Warehouse como dominio real
Los sistemas WMS maduros distinguen:
- recepción;
- verificación;
- ubicación;
- movimientos;
- almacenamiento;
- picking/preparación;
- clasificación;
- despacho;
- escaneo;
- discrepancias;
- trazabilidad.

En SETA, el almacén no debe ser solamente un atributo del bulto.

### 3.9. Transporte como planificación + ejecución
Una ruta no es solamente una lista de paquetes.

Debe poder representar:
- origen;
- destino;
- paradas;
- secuencia;
- vehículo;
- tripulación;
- capacidad;
- ventanas;
- tiempos de servicio;
- distancia;
- restricciones;
- ejecución;
- desviaciones;
- replanificación;
- cierre.

### 3.10. Delivery Attempt != Delivery
Debe conservarse el historial de intentos.

Cada intento debe registrar, cuando aplique:
- fecha/hora;
- lugar;
- actor;
- resultado;
- motivo;
- evidencia;
- observaciones;
- siguiente acción.

Un fallo no debe borrar el intento anterior.

### 3.11. POD como conjunto de evidencias
El proof-of-delivery no debe ser un único campo booleano.

Debe poder contener:
- firma;
- identificación del receptor;
- fotografía del bulto;
- fotografía de etiqueta;
- otras evidencias;
- timestamp;
- ubicación;
- operador;
- integridad de la evidencia.

El mínimo definitivo continúa sujeto a B-03 y a las reglas contractuales/normativas aplicables.

### 3.12. Document Management
Los documentos deben ser objetos trazables:
- tipo;
- número;
- versión;
- emisor;
- fecha;
- objeto relacionado;
- archivo;
- hash/integridad cuando proceda;
- estado;
- auditoría.

No se debe depender de archivos sueltos sin relación con la operación.

### 3.13. API / Integration-first
Los sistemas líderes conectan clientes, carriers, almacenes, autoridades, mapas, tracking y sistemas financieros.

Z Express debe aislar proveedores externos mediante adaptadores:

External System → Integration Adapter → Z Express Core

Nunca debe acoplar el dominio a una única API de geocodificación, routing, tracking o proveedor logístico.

### 3.14. Mobile operations
La aplicación móvil operacional debe ser una herramienta de ejecución, no solamente una versión reducida del web:
- ruta;
- mapa;
- paquetes;
- escaneo;
- entrega;
- fotografías;
- firma;
- incidencias;
- ubicación;
- sincronización;
- operación con conectividad intermitente.

## 4. Actores de referencia

### Externos
| Actor | Responsabilidad de referencia |
|---|---|
| Agency / Transitario | Origina carga, manifiesto y relación comercial |
| Shipper / Sender | Remite mercancía |
| Consignee / Recipient | Recibe mercancía |
| Freight Forwarder | Organiza transporte internacional |
| Airline | Transporte aéreo |
| Shipping Line | Transporte marítimo |
| Airport | Infraestructura aeroportuaria |
| Port | Infraestructura marítima |
| Customs | Control aduanero |
| Customs Broker | Gestión aduanera cuando corresponda |
| Warehouse Operator | Custodia/operación de almacén |
| Carrier | Transporte |
| Last-mile Operator | Distribución final |
| Insurance Provider | Cobertura de riesgo |
| Bank/Payment Provider | Pagos |
| Map/Geocoding Provider | Geocodificación |
| Routing Provider | Cálculo de rutas |
| Tracking Provider | Seguimiento |
| Government/Regulatory Agency | Regulación y controles |

### Internos de Z Express
- Dirección/Gerencia
- Comercial
- Coordinación de agencias
- Operador documental
- Operador de manifiestos
- Operador de recepción
- Almacén
- Planificador de rutas
- Despachador
- Conductor
- Segundo miembro de tripulación / rol operativo pendiente de denominación oficial
- Operador de entregas
- Facturación
- Cuentas por cobrar
- Cuentas por pagar
- Conciliación
- Auditoría
- Administración del sistema

Los roles de software deben ser configurables y no confundirse con nombres definitivos de puestos laborales.

## 5. Procesos de referencia

### P01 — Commercial / Booking
Customer/Agency → Quote/Rate → Booking → Shipment

### P02 — Origin / Documentation
Cargo → Documentation → Consolidation → Transport

### P03 — International Transport
Departure → Transit → Milestones → Arrival

### P04 — Customs / Compliance
Declaration → Control → Inspection/Hold → Result → Release

SETA registra los actos/resultados externos que le correspondan; no se asume autoridad aduanera.

### P05 — Destination / Handover
Arrival → External Handover → Physical Verification → SETA Custody

### P06 — Warehouse
Receipt → Verification → Location → Classification → Preparation → Dispatch

### P07 — Transportation Planning
Eligible Cargo → Capacity → Constraints → Route → Stops → Dispatch

### P08 — Last Mile
Route → Stop → Delivery Attempt → POD / Failure → Return/Reattempt

### P09 — Reverse Logistics
Failed Delivery → Return → Warehouse → Reprogramming → Reattempt

### P10 — Financial
Cost → Revenue → Billing → Collection → Supplier Payment → Reconciliation → Profitability

### P11 — Control / Analytics
Operational Events → KPIs → Exceptions → Analysis → Decision Support → Optimization

## 6. Comparación con el AS-IS de SETA

| Capacidad | Situación AS-IS | Tratamiento TO-BE |
|---|---|---|
| Agency/Transitario | Existe | Adoptar |
| Master AWB | Existe | Adoptar |
| House | Existe | Adoptar |
| Physical Bulto | Existe | Adoptar explícitamente |
| Manifest | Existe | Mantener como documento/operación, no como sustituto universal de Shipment |
| Address | Existe | Normalizar como objeto de dominio |
| Geocoding | Existe mediante proveedor actual | Abstracción de proveedor |
| Address validation | Se realiza por llamada | Convertir en proceso trazable |
| Customs visibility | Existe operacionalmente | Modelar visibilidad sin asumir autoridad |
| External handover | Existe | Evento + reconciliación |
| Warehouse receipt | Existe | Dominio propio |
| Provincial classification | Existe | Parametrizar catálogo |
| Route planning | Manual/Optimal Route | Motor desacoplado y sustituible |
| Open/closed route | Existe | Regla de planificación |
| 700 km max | Existe | Restricción configurable de negocio |
| Delivery window | 07:00–20:00 | Parámetro de planificación |
| Service time | 5–10 min; 5 min/bulto en mismo destino | Parámetros, no constantes de código |
| Rest | 60 min acumulables | Restricción de planificación |
| Mobile route | Existe como necesidad | Mobile operational workflow |
| Printed route document | Existe | Documento generado desde misma orden de ruta |
| POD | Existe | Evidencia estructurada |
| Failed delivery | Existe | Attempt + Exception + Return |
| Reattempt | Existe | Workflow |
| AeroVaradero cost | Existe | Cost event / payable source |
| Agency billing | Existe | Billing |
| Payment → Archive | Existe | Financial closure |
| Profitability | Necesidad futura | Adoptar como capacidad futura |
| Control Tower | No existe | Adoptar progresivamente |
| Dynamic replanning | No existe | Capacidad futura |
| Workflow engine | Manual/disperso | Adoptar progresivamente |
| Exception management | Parcial | Adoptar |
| Event/milestone history | Parcial | Adoptar |
| Integration adapters | Necesidad | Adoptar |
| AI decision support | Futuro | Preparar datos; no automatizar decisiones críticas todavía |

## 7. Capacidades que se ADOPTAN

### A01 — Shipment / operación logística como agregado de alto nivel
Debe existir un concepto que permita relacionar documentos, carga, transporte, eventos, custodia, distribución y finanzas sin hacer que Manifest sea el contenedor universal.

**Decisión:** adoptar conceptualmente; diseño exacto queda sujeto al cierre de D01–D04.

### A02 — Master → House → Physical Unit
**Decisión:** adoptar y reforzar.

Una House puede contener 1..N bultos físicos.

### A03 — Event/Milestone History
**Decisión:** adoptar.

Todo cambio operacional relevante debe ser auditable.

### A04 — Exception Management
**Decisión:** adoptar como capacidad transversal.

### A05 — Warehouse/Custody como capacidad separada
**Decisión:** adoptar.

### A06 — Route Planning vs Route Execution
**Decisión:** adoptar.

La planificación genera una versión/plan; la ejecución registra lo que realmente ocurrió.

### A07 — Delivery Attempt histórico
**Decisión:** adoptar.

### A08 — POD compuesto
**Decisión:** adoptar conceptualmente; mínimo obligatorio queda pendiente.

### A09 — Workflow
**Decisión:** adoptar de forma gradual, comenzando con reglas explícitas y auditables.

### A10 — Buy/Sell/Cost/Revenue
**Decisión:** adoptar como modelo financiero-operacional.

### A11 — Rate Cards versionadas
**Decisión:** adoptar.

### A12 — Documentos trazables
**Decisión:** adoptar.

### A13 — Integration Adapter Layer
**Decisión:** adoptar.

### A14 — Mobile operational execution
**Decisión:** adoptar.

### A15 — Control Tower / Operational Dashboard
**Decisión:** adoptar progresivamente.

### A16 — Analytics/KPI
**Decisión:** adoptar.

### A17 — AI-ready data architecture
**Decisión:** adoptar como preparación, no como automatización prematura.

## 8. Capacidades que quedan como FUTURAS

No se incorporan al MVP por defecto:
- optimización global multimodal;
- freight procurement complejo;
- carrier marketplace;
- dynamic rating avanzado;
- predictive ETA de nivel global;
- network optimization;
- machine learning para demanda;
- AI autónoma para decisiones de alto impacto;
- EDI masivo con múltiples carriers;
- multiempresa/multinacional;
- settlement financiero complejo de nivel enterprise;
- gestión de contenedores marítimos completa.

Estas capacidades pueden incorporarse si una necesidad real de SETA las justifica.

## 9. Capacidades que NO se adoptan como requisitos automáticos

No se adopta automáticamente:
- microservicios por imitación de plataformas enterprise;
- Kubernetes;
- serverless;
- event streaming distribuido;
- múltiples bases de datos;
- blockchain;
- un TMS externo como dependencia obligatoria;
- un WMS externo como dependencia obligatoria;
- un único proveedor de mapas;
- un único proveedor de geocoding;
- una única plataforma de tracking;
- IA que tome decisiones irreversibles sin supervisión.

Estas decisiones continúan sujetas al Plan Maestro de Ingeniería y a evidencia del proyecto.

## 10. Nuevas invariantes de diseño derivadas del benchmark

1. Manifest no equivale a Shipment.
2. House no equivale a Physical Bulto.
3. Documento no equivale a evento.
4. Estado actual no sustituye historial.
5. Custodia no equivale a dirección de entrega.
6. Plan de ruta no equivale a ejecución de ruta.
7. Delivery no equivale a Attempt.
8. Failure no equivale a terminal closure.
9. Cost no equivale a Revenue.
10. Billing no equivale a Payment.
11. Geocoding no equivale a Address Validation.
12. External provider no debe dominar el modelo de dominio.
13. Customs visibility no convierte a SETA en autoridad aduanera.
14. Archivo final no significa eliminación de evidencia histórica.
15. Toda excepción relevante debe poder ser investigada retrospectivamente.

## 11. Impacto sobre el modelo conceptual existente

El benchmark no invalida el modelo conceptual existente.

Lo refuerza y agrega capacidades:

Manifest → Guide/AWB → House → Physical Bulto

se mantiene.

Debe añadirse progresivamente una capa transversal:

Shipment / Operation → Events → Exceptions → Documents → Financial Links

y separar claramente:

Custody / Warehouse

de

Distribution / Route

y de

Delivery / Attempt / POD.

El modelo físico PostgreSQL/PostGIS sigue bloqueado por los puntos D01–D12/B-01…B-06 que aún requieren cierre.

## 12. Impacto sobre arquitectura

La arquitectura baseline continúa siendo válida:
- modular monolith inicialmente;
- Clean/Hexagonal;
- REST/OpenAPI;
- PostgreSQL/PostGIS;
- adapters para proveedores externos;
- eventos internos cuando aporten valor;
- seguridad/auditoría/observabilidad.

El benchmark no justifica microservicios.

Sí justifica reforzar:
- módulo de Integration;
- Event/Activity history;
- Workflow;
- Exception management;
- Document management;
- Warehouse/Custody;
- Transportation;
- Delivery/POD;
- Financial links;
- Operational analytics.

## 13. Criterio de adopción para futuras capacidades

Toda nueva capacidad identificada en un benchmark deberá pasar por:

Necesidad SETA → Problema → Beneficio → Complejidad → Coste → Riesgo → Evidencia → Decisión → ADR/Requirement → Implementación → Prueba

No se incorporará una capacidad solamente por ser utilizada por una empresa grande.

## 14. Fuentes de referencia

- DHL Global Forwarding: https://www.dhl.com/es-es/home/global-forwarding.html
- DHL myDHLi: https://www.dhl.com/us-en/home/global-forwarding/mydhli/explore-mydhli.html
- FedEx Customs Clearance: https://www.fedex.com/en-us/shipping/international/customs-clearance.html
- UPS Supply Chain Solutions: https://www.ups.com/us/en/supplychain/freight
- CargoWise Forwarding: https://www.cargowise.com/solutions/cargowise-forwarding/
- CargoWise Customs: https://www.cargowise.com/solutions/cargowise-customs/
- CargoWise Warehouse: https://www.cargowise.com/solutions/cargowise-warehouse/
- CargoWise Accounting: https://www.cargowise.com/solutions/cargowise-enterprise/accounting/
- Oracle Transportation Management: https://docs.oracle.com/en/cloud/saas/transportation/
- Infor Nexus Transportation Management: https://www.infor.com/solutions/scm/infor-nexus/transportation-management
- Blue Yonder Transportation Management: https://blueyonder.com/solutions/transportation-management
- SAP Supply Chain: https://www.sap.com/products/erp/supply-chain.html
- Microsoft Dynamics 365 Supply Chain Management: https://www.microsoft.com/en-us/dynamics-365/products/supply-chain-management

Estas fuentes respaldan patrones de producto/operación; no constituyen fuentes jurídicas para SETA.

## 15. Próximo paso

Este benchmark debe alimentar un artefacto posterior:

Paquetería TO-BE — modelo operativo objetivo de Z Express

Ese artefacto deberá transformar los patrones adoptados en:
- procesos TO-BE;
- actores;
- capacidades;
- reglas;
- requisitos;
- casos de uso;
- eventos;
- excepciones;
- datos;
- integraciones;
- KPIs;
- roadmap.

No debe comenzar directamente por tablas SQL.


## 16. Restricción de recursos para Route Planning

El benchmark se adapta al AS-IS de SETA con una regla explícita de **asignación temporal no solapada**.

### Vehículo
- Un vehículo no puede ejecutar dos rutas simultáneas.
- Puede ejecutar una segunda ruta en el mismo día únicamente después de completar la primera y quedar disponible.
- La segunda asignación debe respetar ventanas, descanso, distancia, capacidad y tiempo operativo.
- La regla es temporal, no simplemente “una ruta por día”.

### Tripulación
- El chofer y el segundo miembro de tripulación pueden estar asignados juntos al mismo vehículo y a la misma ruta.
- Cada integrante queda ocupado durante el intervalo de su asignación.
- Ningún integrante puede estar asignado a dos rutas con intervalos superpuestos.
- Una segunda ruta para la misma tripulación es válida después de completar la primera y confirmar disponibilidad.

### Invariante
**Vehicle + overlapping time interval → máximo 1 Route Assignment**

**Crew Member + overlapping time interval → máximo 1 Route Assignment**

Por tanto, el planificador debe tratar vehículo y personas como recursos temporales con disponibilidad, no como simples atributos de la ruta.
