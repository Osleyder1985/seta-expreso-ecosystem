# Baseline de Arquitectura del Ecosistema

**Versión:** 0.1.0  
**Estado:** Propuesto para revisión  
**Issue:** #1  
**Fecha:** 2026-09-24

## 1. Propósito

Este documento establece el baseline arquitectónico inicial del Ecosistema SETA EXPRESO SURL.

El baseline define las decisiones estructurales que pueden establecerse con la información disponible actualmente. No pretende cerrar anticipadamente decisiones que dependen del descubrimiento del negocio, los requisitos detallados, las restricciones operativas o las pruebas técnicas.

La arquitectura evolucionará mediante decisiones explícitas y trazables.

## 2. Alcance

El ecosistema contempla:

- una aplicación Web;
- una aplicación Android;
- una aplicación iOS;
- un backend central que expone las capacidades del ecosistema;
- persistencia de datos;
- integraciones externas;
- capacidades transversales de seguridad, auditoría y observabilidad.

## 3. Principios arquitectónicos

1. **Requisitos antes que tecnología.** Una tecnología no se incorpora por tendencia, sino por una necesidad demostrable.
2. **Simplicidad primero.** Se evita introducir complejidad distribuida sin una justificación concreta.
3. **Separación de responsabilidades.** El dominio no debe depender directamente de infraestructura o proveedores externos.
4. **Evolución controlada.** Las decisiones importantes deben ser reversibles cuando sea razonable y deben quedar documentadas.
5. **API como frontera de integración.** Las aplicaciones cliente no acceden directamente a la base de datos.
6. **Seguridad transversal.** Identidad, autorización, protección de datos, auditoría y controles de seguridad se consideran desde el diseño.
7. **Observabilidad desde el inicio.** El sistema debe poder diagnosticarse y medirse.
8. **Trazabilidad.** Las decisiones arquitectónicas deben relacionarse con requisitos, Issues, implementación, pruebas y Pull Requests.
9. **Coste y capacidad operativa.** Las soluciones deben ser compatibles con las restricciones económicas y operativas reales del proyecto.
10. **No sobrediseño.** Microservicios, serverless, Kubernetes, brokers externos, múltiples bases de datos y otras capacidades distribuidas requieren una decisión específica.

## 4. Arquitectura de alto nivel

```text
                    SETA EXPRESO ECOSYSTEM

       +-------------+-------------+-------------+
       |             |             |             |
       v             v             v             v
    Web App      Android App     iOS App     Integraciones
       |             |             |             |
       +-------------+-------------+-------------+
                         |
                         v
                    API / Backend
                         |
              +----------+----------+
              |                     |
              v                     v
       Módulos de negocio      Capacidades
       del dominio            transversales
              |                     |
              +----------+----------+
                         |
                         v
                 Persistencia
                         |
                         v
               Base de datos

        Infraestructura externa:
        - Geocodificación / mapas
        - Notificaciones
        - Otros sistemas, cuando sean necesarios
```

El diagrama es conceptual. No prescribe todavía una tecnología concreta para cada componente.

## 5. Estilo de backend inicial

### 5.1 Modular Monolith

El backend partirá conceptualmente de un **Modular Monolith**.

Los módulos estarán separados por responsabilidades y límites de dominio, aunque inicialmente se ejecuten como una sola aplicación.

La elección evita introducir desde el inicio los costes operativos y de integración propios de una arquitectura distribuida.

### 5.2 Preparación para evolución

La modularidad debe permitir que un módulo pueda convertirse en un servicio independiente en el futuro si aparecen razones objetivas, por ejemplo:

- requisitos de escalabilidad claramente diferentes;
- necesidad de despliegue independiente;
- aislamiento operacional;
- límites organizativos o de seguridad;
- dependencia externa que requiera un ciclo de operación separado;
- necesidad demostrada mediante métricas o incidentes.

La extracción no será automática ni obligatoria.

## 6. Separación Clean / Hexagonal

El backend seguirá una separación conceptual entre:

- **Domain:** reglas y conceptos del negocio.
- **Application:** casos de uso y orquestación.
- **Infrastructure:** persistencia, proveedores externos, transporte HTTP y otros adaptadores.

Las dependencias deben apuntar hacia el núcleo de negocio.

Los proveedores externos se integrarán mediante puertos/contratos definidos por la aplicación o el dominio cuando corresponda.

## 7. API y aplicaciones cliente

Web, Android e iOS consumirán las capacidades del backend mediante APIs.

Ninguna aplicación cliente deberá depender directamente de:

- tablas de la base de datos;
- credenciales de base de datos;
- implementaciones internas de persistencia;
- proveedores externos que deban estar protegidos por el backend.

La API será una frontera de seguridad, validación, autorización y evolución de contratos.

## 8. Persistencia

Se adopta inicialmente una **base de datos relacional** como estrategia de persistencia principal.

Todavía no se congela:

- producto concreto;
- esquema definitivo;
- estrategia de particionamiento;
- número final de bases de datos;
- uso concreto de capacidades geoespaciales.

Estas decisiones se resolverán mediante requisitos y decisiones técnicas posteriores.

No se adopta inicialmente el patrón de una base de datos independiente por módulo.

## 9. Geolocalización

La geolocalización se tratará como una capacidad desacoplada del proveedor.

Conceptualmente:

```text
Caso de uso
    |
    v
Geocoding Port
    |
    +---- Provider A
    |
    +---- Provider B
    |
    +---- Provider C
```

Esto permite evaluar proveedores según:

- coste;
- límites de uso;
- cobertura;
- calidad de resultados;
- latencia;
- condiciones de uso;
- capacidad de sustitución.

La lógica de negocio no debe depender de una API concreta de geocodificación.

## 10. Eventos

Se podrán utilizar eventos internos de dominio cuando ayuden a desacoplar módulos o implementar procesos secundarios.

No se adopta inicialmente un broker distribuido como requisito arquitectónico.

La incorporación de Kafka, RabbitMQ u otra infraestructura de mensajería deberá justificarse mediante una decisión arquitectónica independiente.

## 11. Seguridad

La seguridad será transversal a todo el ecosistema.

Como mínimo deberá contemplar, según corresponda al requisito:

- autenticación;
- autorización;
- gestión de roles y permisos;
- protección de credenciales y secretos;
- validación de entradas;
- protección de APIs;
- auditoría;
- trazabilidad de operaciones relevantes;
- protección de datos;
- gestión de sesiones/tokens;
- controles de acceso a información por contexto.

Los requisitos concretos se definirán durante la ingeniería de requisitos.

## 12. Auditoría y observabilidad

El ecosistema debe diseñarse para poder responder, según el proceso:

- quién realizó una operación;
- qué operación realizó;
- cuándo;
- sobre qué entidad;
- cuál fue el resultado;
- qué errores ocurrieron;
- qué componentes participaron.

La observabilidad deberá evolucionar junto con el sistema e incluir métricas, registros y trazas cuando aporten valor.

## 13. Módulos candidatos

Los siguientes son candidatos iniciales y **no constituyen todavía un modelo de dominio aprobado**:

- Identity & Access
- Organization
- Customers
- Cargo / Packages
- Manifests
- Addresses
- Geolocation
- Routes
- Deliveries
- Vehicles
- Drivers / Personnel
- Notifications
- Documents
- Billing
- Reporting
- Audit

Los límites definitivos dependerán del descubrimiento y modelado del negocio.

## 14. Paquetería: conceptos candidatos

Para el proceso de paquetería se han identificado provisionalmente:

- Manifest
- House / Package
- Sender
- Recipient
- Address
- Destination
- Delivery
- Tracking

### Decisión pendiente: House y Package

No se establece todavía que **House = Package**.

El archivo de manifiesto demuestra la existencia de registros identificados como House y de información de bultos, pero la equivalencia conceptual debe confirmarse con el proceso de negocio antes de convertirla en una regla del dominio.

## 15. IA

La inteligencia artificial no constituye una dependencia arquitectónica obligatoria del baseline.

Podrá incorporarse como capacidad evolutiva cuando exista un caso de uso definido y datos suficientes.

Ejemplos de capacidades que podrán evaluarse posteriormente:

- detección de anomalías;
- asistencia en validación de direcciones;
- clasificación de información;
- apoyo a planificación de rutas;
- estimación de tiempos;
- apoyo a decisiones operativas.

Cada caso deberá evaluarse por separado.

## 16. Microservicios y Serverless

No se adopta ninguna de estas estrategias como requisito inicial.

Su incorporación requerirá una decisión documentada que demuestre:

1. problema concreto;
2. alternativa más simple considerada;
3. beneficio esperado;
4. coste y complejidad;
5. impacto operacional;
6. impacto de seguridad;
7. estrategia de pruebas;
8. estrategia de observabilidad;
9. plan de evolución y reversibilidad cuando sea posible.

## 17. Kubernetes y otras plataformas distribuidas

No forman parte del baseline inicial.

Se evaluarán únicamente si una necesidad real justifica la carga operacional adicional.

## 18. Evolución arquitectónica

Toda modificación significativa del baseline deberá seguir:

**Necesidad → Issue → análisis → decisión/ADR → implementación → pruebas → Pull Request → revisión → integración → documentación**

Las decisiones importantes no deberán quedar únicamente en conversaciones informales.

## 19. Criterios de validación del baseline

Este baseline se considerará válido para continuar el descubrimiento cuando:

- exista una frontera clara entre clientes y backend;
- el backend tenga límites modulares;
- el dominio pueda evolucionar sin quedar acoplado a proveedores;
- las integraciones externas estén abstraídas cuando corresponda;
- seguridad, auditoría y observabilidad estén consideradas;
- las decisiones no justificadas permanezcan deliberadamente abiertas;
- exista trazabilidad mediante GitHub.

## 20. Estado

**Estado actual:** Propuesto para revisión.

Este documento no sustituye la ingeniería de requisitos ni el modelado detallado del negocio.

Las decisiones se actualizarán cuando la evidencia del proyecto permita aumentar el nivel de precisión.
