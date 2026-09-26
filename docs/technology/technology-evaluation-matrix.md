# Matriz objetiva de evaluación tecnológica v0.1.2

**Ecosistema:** SETA EXPRESO SURL  
**Issue:** #5  
**Relacionada con:** Technology Stack Baseline v0.2.0  
**Estado:** Vigente
**Tipo:** Marco de evaluación

---

## 1. Propósito

Esta matriz establece un método común para comparar alternativas tecnológicas del Ecosistema de forma objetiva, reproducible, auditable y trazable. La matriz no selecciona automáticamente una tecnología. Genera evidencia estructurada para una decisión técnica que deberá quedar registrada y, cuando corresponda, respaldada por un ADR.

## 2. Categorías evaluadas

1. Backend
2. Web
3. Mobile
4. DB
5. ORM / acceso a datos
6. Maps / Geocoding
7. Testing
8. Infraestructura
9. Observabilidad

## Política de versiones y compatibilidad

La evaluación distingue entre **última versión disponible** y **última versión estable compatible**. Para SETA EXPRESO se adopta la segunda.

Cada evaluación debe registrar versión exacta, fecha, estado de release, dependencias relevantes y compatibilidad con runtime, plataformas, CI/CD y componentes del stack. Una versión alpha, beta o RC no entra al baseline productivo sin ADR específico.

La compatibilidad se evalúa como propiedad del conjunto: candidato → dependencias → runtime/toolchain → plataforma → integración → CI/CD → producción.

## 3. Modelo de evaluación

### 3.1 Escala

| Puntuación | Significado |
|---:|---|
| 0 | No cumple / inexistente / bloqueador |
| 1 | Muy deficiente; riesgo alto |
| 2 | Cumplimiento parcial; limitaciones importantes |
| 3 | Cumple adecuadamente |
| 4 | Cumple muy bien; riesgo bajo |
| 5 | Cumple de forma sobresaliente y con evidencia sólida |

### 3.2 Fórmula

Puntuación ponderada = Σ (puntuación del criterio / 5 × peso). El resultado queda normalizado entre 0 y 100.

### 3.3 Evidencia

- E1 — Documentación oficial.
- E2 — Prueba reproducible: PoC, benchmark, test o experimento.
- E3 — Evidencia operacional verificable en el Ecosistema.
- E4 — Evidencia externa confiable.
- E5 — Inferencia técnica; debe marcarse explícitamente.

Las puntuaciones críticas no deben basarse únicamente en E5.

### 3.4 Regla de publicación de puntuaciones

Una celda de puntuación solo puede contener un valor numérico de 0 a 5 cuando exista evidencia trazable asociada. El registro mínimo es: **puntuación, criterio, candidato, fecha de evaluación, fuente/evidencia, nivel de evidencia, versión evaluada y confianza**.

Si la evidencia es insuficiente, el valor obligatorio es **No evaluado**, no una estimación. Una puntuación provisional sin evidencia no puede utilizarse para seleccionar una tecnología ni para cerrar una decisión crítica.

La confianza deberá expresarse como **Alta / Media / Baja**, con una justificación breve. La fecha corresponde a la evaluación realizada, no a la fecha de publicación de la fuente.

## 4. Criterios eliminatorios

Antes de calcular la puntuación se verifican requisitos obligatorios. Una alternativa queda No viable si incumple un requisito crítico.

Ejemplos: incompatibilidad con el entorno requerido; licencia incompatible; imposibilidad de ejecutar una función crítica; servicio externo no utilizable bajo las condiciones operativas requeridas; incompatibilidad con PostgreSQL/PostGIS cuando sean obligatorios; imposibilidad de soportar Web, Android o iOS cuando corresponda; riesgo de seguridad crítico sin mitigación razonable.

Un criterio eliminatorio no se compensa con una puntuación alta en otros criterios.

## 5. Criterios generales

| Código | Criterio | Qué se evalúa |
|---|---|---|
| G01 | Adecuación funcional | Capacidad para cubrir requisitos |
| G02 | Calidad técnica | Madurez y calidad |
| G03 | Mantenibilidad | Facilidad de evolucionar y corregir |
| G04 | Seguridad | Capacidades y riesgos |
| G05 | Rendimiento | Comportamiento bajo carga prevista |
| G06 | Fiabilidad | Resistencia a errores y fallos |
| G07 | Interoperabilidad | Integración |
| G08 | Ecosistema | Librerías, herramientas y soporte |
| G09 | Documentación | Calidad y disponibilidad |
| G10 | Licencia/costo | Costo total y restricciones |
| G11 | Complejidad operacional | Esfuerzo de operación |
| G12 | Sustituibilidad | Facilidad de reemplazo |

No todas las categorías deben utilizar todos los criterios ni los mismos pesos.

## 6. Backend

| Código | Criterio | Peso |
|---|---|---:|
| B01 | Adecuación a modular monolith/Clean/Hexagonal | 15% |
| B02 | Capacidad API REST/OpenAPI | 10% |
| B03 | Testabilidad | 10% |
| B04 | Seguridad | 10% |
| B05 | Rendimiento | 10% |
| B06 | Mantenibilidad | 10% |
| B07 | Ecosistema | 10% |
| B08 | Documentación/madurez | 5% |
| B09 | Productividad | 5% |
| B10 | Operación/despliegue | 5% |
| B11 | Costo/licencia | 5% |
| B12 | Evolución futura | 5% |
| **Total** | | **100%** |

Candidatos iniciales: NestJS + TypeScript y ASP.NET Core. Otras alternativas solo si aparecen requisitos que las justifiquen.

Para NestJS y ASP.NET Core se utilizarán también los PoC existentes del repositorio. Benchmark mínimo recomendado: startup, health check, CRUD, validación, PostgreSQL, transacción, manejo de errores, pruebas, OpenAPI, build y Docker.

## 7. Web

| Código | Criterio | Peso |
|---|---|---:|
| W01 | Adecuación funcional | 15% |
| W02 | UX/UI y componentes | 10% |
| W03 | Rendimiento web | 10% |
| W04 | Testabilidad | 10% |
| W05 | Mantenibilidad | 10% |
| W06 | TypeScript/integración API | 10% |
| W07 | Ecosistema | 10% |
| W08 | Accesibilidad | 5% |
| W09 | Seguridad | 5% |
| W10 | Build/deployment | 5% |
| W11 | Costo/licencia | 5% |
| W12 | Evolución | 5% |
| **Total** | | **100%** |

Candidato inicial: React + TypeScript + Vite.

## 8. Mobile

| Código | Criterio | Peso |
|---|---|---:|
| M01 | Cobertura Android+iOS | 15% |
| M02 | Acceso a APIs nativas | 10% |
| M03 | Rendimiento | 10% |
| M04 | UX/UI | 10% |
| M05 | Testabilidad | 10% |
| M06 | Mantenibilidad | 10% |
| M07 | Integración backend | 10% |
| M08 | Offline/conectividad limitada | 5% |
| M09 | Seguridad | 5% |
| M10 | Ecosistema | 5% |
| M11 | Costo/licencia | 5% |
| M12 | Evolución | 5% |
| **Total** | | **100%** |

Candidatos: Flutter, Kotlin + Jetpack Compose, Swift + SwiftUI. La solución multiplataforma no recibe automáticamente una puntuación superior por ese único motivo.

## 9. DB

| Código | Criterio | Peso |
|---|---|---:|
| D01 | Adecuación al dominio | 15% |
| D02 | Integridad/transacciones | 15% |
| D03 | PostgreSQL/PostGIS | 15% |
| D04 | Rendimiento | 10% |
| D05 | Fiabilidad | 10% |
| D06 | Backup/recovery | 10% |
| D07 | Seguridad | 5% |
| D08 | Herramientas/ecosistema | 5% |
| D09 | Operación | 5% |
| D10 | Costo/licencia | 5% |
| **Total** | | **100%** |

Baseline: PostgreSQL + PostGIS. La matriz se utilizará para reconsiderar esta decisión solo si aparece una necesidad real.

## 10. ORM / acceso a datos

| Código | Criterio | Peso |
|---|---|---:|
| O01 | Compatibilidad PostgreSQL | 15% |
| O02 | Compatibilidad PostGIS/SQL | 15% |
| O03 | Type safety | 10% |
| O04 | Migraciones | 10% |
| O05 | Testabilidad | 10% |
| O06 | Rendimiento | 10% |
| O07 | Consultas complejas | 10% |
| O08 | Mantenibilidad | 5% |
| O09 | Ecosistema/documentación | 5% |
| O10 | Costo/licencia | 5% |
| **Total** | | **100%** |

Candidatos: Prisma, TypeORM, SQL controlado / driver PostgreSQL y alternativas justificadas. Criterio crítico: ninguna abstracción puede impedir utilizar correctamente las capacidades necesarias de PostgreSQL/PostGIS.

## 11. Maps / Geocoding

Se separan Map rendering, Tile/map source, Geocoding, Reverse geocoding, Routing y Spatial persistence. No es obligatorio que pertenezcan al mismo proveedor.

### 11.1 Map rendering / provider

| Código | Criterio | Peso |
|---|---|---:|
| MP01 | Cobertura | 15% |
| MP02 | Disponibilidad | 10% |
| MP03 | Rendimiento | 10% |
| MP04 | Calidad cartográfica | 10% |
| MP05 | Integración Web | 10% |
| MP06 | Integración Mobile | 10% |
| MP07 | Licencia/uso | 10% |
| MP08 | Costo | 10% |
| MP09 | Sustituibilidad | 5% |
| MP10 | Operación | 5% |
| **Total** | | **100%** |

### 11.2 Geocoding

| Código | Criterio | Peso |
|---|---|---:|
| GC01 | Precisión | 20% |
| GC02 | Cobertura en Cuba | 15% |
| GC03 | Normalización de direcciones | 10% |
| GC04 | Capacidad batch | 10% |
| GC05 | Límites de uso | 10% |
| GC06 | Latencia | 5% |
| GC07 | Disponibilidad | 10% |
| GC08 | Costo | 10% |
| GC09 | Términos/licencia | 5% |
| GC10 | Sustituibilidad | 5% |
| **Total** | | **100%** |

La calidad de geocodificación deberá probarse con direcciones reales anonimizadas o datos representativos. No se seleccionará un proveedor únicamente por reputación general.

## 12. Testing

| Código | Criterio | Peso |
|---|---|---:|
| T01 | Cobertura de tipos de prueba | 15% |
| T02 | Facilidad de automatización | 15% |
| T03 | Integración CI | 10% |
| T04 | Velocidad | 10% |
| T05 | Diagnóstico de fallos | 10% |
| T06 | Mantenibilidad | 10% |
| T07 | Compatibilidad tecnológica | 10% |
| T08 | E2E | 5% |
| T09 | Paralelización | 5% |
| T10 | Documentación/ecosistema | 5% |
| T11 | Costo/licencia | 5% |
| **Total** | | **100%** |

## 13. Infraestructura

| Código | Criterio | Peso |
|---|---|---:|
| I01 | Adecuación a cargas previstas | 15% |
| I02 | Disponibilidad | 10% |
| I03 | Seguridad | 15% |
| I04 | Backup/recovery | 10% |
| I05 | Automatización | 10% |
| I06 | Observabilidad | 5% |
| I07 | Escalabilidad | 10% |
| I08 | Complejidad operacional | 10% |
| I09 | Costo total | 10% |
| I10 | Portabilidad | 5% |
| **Total** | | **100%** |

No se establece todavía un proveedor de infraestructura como decisión irreversible. Podrán evaluarse VPS/servidor dedicado, infraestructura administrada, cloud, despliegue local o combinaciones, según las condiciones reales de operación.

## 14. Observabilidad

| Código | Criterio | Peso |
|---|---|---:|
| OB01 | Logs | 15% |
| OB02 | Métricas | 15% |
| OB03 | Tracing | 15% |
| OB04 | Alertas | 10% |
| OB05 | Correlación de solicitudes | 10% |
| OB06 | Integración OpenTelemetry | 10% |
| OB07 | Retención | 5% |
| OB08 | Seguridad/privacidad | 5% |
| OB09 | Costo | 10% |
| OB10 | Complejidad operacional | 5% |
| **Total** | | **100%** |

## 15. Evaluación económica

El costo no se reducirá al precio de licencia.

TCO = licencia + infraestructura + operación + mantenimiento + capacitación + migración + dependencia externa.

Una tecnología gratuita que requiera considerablemente más operación deberá reflejar ese costo en la evaluación.

## 16. Riesgo

Cada alternativa deberá registrar como mínimo: seguridad, lock-in, obsolescencia, complejidad, disponibilidad, migración y dependencia externa, con niveles Bajo / Medio / Alto / Crítico.

Un riesgo crítico deberá tener una mitigación documentada o impedir la adopción.

## 17. Evidencia mínima requerida

- Nivel A — Documental: documentación oficial + análisis técnico.
- Nivel B — PoC: PoC reproducible sobre el entorno del Ecosistema.
- Nivel C — Benchmark: PoC con mediciones cuantitativas.
- Nivel D — Integración: prueba integrada con componentes reales.
- Nivel E — Producción: evidencia operacional real.

No todas las decisiones necesitan Nivel E. El nivel requerido depende del impacto y riesgo.

## 18. Regla de decisión

La puntuación no debe utilizarse como ranking automático.

La decisión debe registrar alternativas, criterios, pesos, puntuaciones, evidencia, riesgos, bloqueadores, resultado cuantitativo, análisis cualitativo, decisión, justificación y ADR cuando corresponda.

## 19. Umbrales orientativos

| Resultado | Interpretación |
|---:|---|
| 85–100 | Evidencia muy favorable |
| 70–84 | Adecuado; revisar riesgos |
| 55–69 | Requiere análisis adicional |
| <55 | Evidencia insuficiente/desfavorable |

Estos umbrales son criterios de calidad, no una selección automática. Una alternativa con puntuación alta puede ser descartada por un criterio eliminatorio.

## 20. Registro de evaluación

| Criterio | Peso | Candidato A | Fecha A | Evidencia A | Nivel A | Confianza A | Candidato B | Fecha B | Evidencia B | Nivel B | Confianza B |
|---|---:|---|---|---|---|---|---|---|---|---|---|
| Adecuación | 15% | No evaluado | YYYY-MM-DD | E1/E2/... | A/B/C/D/E | Alta/Media/Baja | No evaluado | YYYY-MM-DD | E1/E2/... | A/B/C/D/E | Alta/Media/Baja |
| Seguridad | 10% | No evaluado | YYYY-MM-DD | E1/E2/... | A/B/C/D/E | Alta/Media/Baja | No evaluado | YYYY-MM-DD | E1/E2/... | A/B/C/D/E | Alta/Media/Baja |
| Rendimiento | 10% | No evaluado | YYYY-MM-DD | E2/E3 | A/B/C/D/E | Alta/Media/Baja | No evaluado | YYYY-MM-DD | E2/E3 | A/B/C/D/E | Alta/Media/Baja |
| ... | ... | ... | ... | ... | ... |

## 21. Trazabilidad

Cada evaluación deberá relacionarse con:

Issue → PoC/Benchmark → resultados → evaluación → decisión → ADR → Stack Baseline → PR

Una decisión crítica no puede considerarse respaldada si alguno de sus valores numéricos carece de evidencia identificable. Los valores **No evaluado** son estados explícitos de ausencia de evidencia y deben permanecer así hasta que exista una evaluación reproducible.

## 22. Regla específica para SETA EXPRESO

Las decisiones tecnológicas deberán evaluarse contra necesidades reales del Ecosistema, incluyendo cuando corresponda: gestión de manifiestos, importación de Excel, gestión de House/paquetes, direcciones, geocodificación, mapas, entregas, rutas, clientes, aplicaciones móviles, operación con conectividad limitada, auditoría, seguridad y crecimiento progresivo.

Los datos reales o representativos del negocio deberán utilizarse en los PoC cuando sea necesario.

## 23. Estado

Esta matriz establece el método oficial de evaluación, pero no sustituye las decisiones tecnológicas individuales.

Las decisiones concretas deberán ejecutarse como trabajos independientes y quedar documentadas mediante Issue/ADR/PR según su impacto.

**Fin de la Matriz objetiva de evaluación tecnológica v0.1.2.**