# Política de Quality Gates del repositorio

**Versión:** 0.1.0  
**Estado:** Vigente como política de CI para el repositorio actual  
**Fecha:** 2026-09-25  
**Issue:** #83

## 1. Propósito

Definir qué validaciones son obligatorias, cuáles son específicas por tipo de artefacto y cuándo se ejecutan. La política evita un pipeline monolítico: un gate específico se activa únicamente cuando el Pull Request modifica el ámbito que dicho gate protege.

Esta política no declara que un control esté implementado si todavía no existe un workflow ejecutable para él.

## 2. Clasificación

- **Global (G):** aplica a todo PR.
- **Específico (S):** aplica solo cuando el PR afecta su ámbito.
- **Informativo (I):** puede ejecutarse para aportar evidencia, pero no bloquea integración.
- **Obligatorio (O):** debe pasar para integrar, salvo excepción explícita y trazable.

## 3. Gaps actuales del repositorio

En esta fase el repositorio contiene principalmente documentación, arquitectura, gobernanza y PoCs. No se presume la existencia de Web/Mobile productivos ni de un backend productivo en el árbol actual.

Por ello, la política distingue **definición del gate** de **disponibilidad de su ejecutor**. Un gate futuro no puede considerarse satisfecho por documentación.

## 4. Matriz de gates

| ID | Ámbito | Gate | Tipo | Obligatorio | Activación |
|---|---|---|---|---|---|
| G-01 | Todo PR | Validación de cambios/estructura Git | Global | O | Siempre |
| G-02 | Todo PR | Validación de formato de artefactos gobernados | Global | O | Siempre que exista validador aplicable |
| G-03 | Todo PR | Detección de secretos | Global | O | Siempre |
| G-04 | Todo PR | Dependencias/vulnerabilidades | Global | O | Si existen manifiestos de dependencias |
| G-05 | Documentación | Validación Markdown/enlaces | S | O | `docs/**`, `*.md` |
| G-06 | Arquitectura | Consistencia de AD/ADR/baseline | S | O | `docs/architecture/**` |
| G-07 | Gobernanza | Consistencia de Issues/estado/artefactos | S | O | `docs/governance/**` |
| G-08 | Backend | Compilación, unit/integration tests y análisis | S | O | Código/backend detectado |
| G-09 | Web | Build, tests y análisis | S | O | Código Web detectado |
| G-10 | Android | Build, tests y análisis | S | O | Proyecto Android detectado |
| G-11 | iOS | Build, tests y análisis | S | O | Proyecto iOS detectado |
| G-12 | PoC/benchmark | Ejecución reproducible + artefacto | S | O | `poc/**`, benchmarks |
| G-13 | Workflows | Validación YAML/políticas CI | S | O | `.github/workflows/**` |
| G-14 | Seguridad | Assurance complementario | Global/S | O | Según Issue #82 y ámbito |
| G-15 | Calidad avanzada | Métricas/coverage/performance | S | I inicialmente | Cuando exista herramienta y objetivo definido |

## 5. Reglas de activación

### 5.1 Documentación

Si un PR modifica Markdown, se activa G-05. No se exige una herramienta concreta hasta que se haya elegido y versionado el validador.

### 5.2 Arquitectura

Si modifica `docs/architecture/**`, se activa G-06. Como mínimo se deben comprobar:

- referencias a documentos existentes;
- estado/versionado coherente;
- ADR/Issue trazable;
- ausencia de elevación implícita de decisiones;
- consistencia con la taxonomía de estados.

### 5.3 Gobernanza

Si modifica `docs/governance/**`, se activa G-07. Debe conservarse la distinción entre política, evidencia y decisión.

### 5.4 Código

Cuando aparezcan Web, Android, iOS o backend productivos, cada PR de código activará su gate específico. El gate debe ejecutar la herramienta real del proyecto, no un comando inventado.

### 5.5 PoC/benchmark

Un PoC modificado debe poder reproducirse con entradas conocidas y producir evidencia verificable. Los resultados no se convierten automáticamente en decisiones de arquitectura.

### 5.6 Workflows

Un cambio en `.github/workflows/**` activa validación sintáctica y revisión de permisos/secretos. Los workflows no deben ampliar permisos sin justificación.

## 6. Política de obligatoriedad

Un gate marcado O debe tener:

1. ejecutor automatizado o política explícita de excepción;
2. condición de activación determinista;
3. resultado PASS/FAIL o estado claramente N/A;
4. evidencia de ejecución;
5. responsable/Issue cuando esté pendiente de implementación.

**N/A no equivale a PASS:** significa que el ámbito no está presente o que el ejecutor todavía no aplica, y debe ser distinguible en la evidencia.

## 7. Excepciones

Una excepción a un gate obligatorio debe registrar:

- gate afectado;
- motivo;
- riesgo;
- alcance;
- responsable;
- fecha de expiración o condición de revisión;
- Issue asociada.

Una excepción no debe convertirse silenciosamente en una exclusión permanente.

## 8. Matriz de decisión para cualquier PR

1. Identificar archivos modificados.
2. Clasificarlos por ámbito.
3. Activar todos los gates Globales.
4. Activar cada gate Específico cuyo ámbito esté afectado.
5. Ejecutar únicamente los ejecutores disponibles y aplicables.
6. Marcar como FAIL cualquier gate obligatorio aplicable que no pueda ejecutarse y no tenga excepción válida.
7. Registrar evidencia.
8. Permitir integración solo cuando todos los gates obligatorios aplicables estén PASS o tengan excepción válida.

## 9. Evolución

Cuando aparezca una nueva tecnología o tipo de artefacto:

**nuevo ámbito → definir gate → definir activación → definir ejecutor → probar → activar como obligatorio cuando exista evidencia suficiente**

No se agregan gates obligatorios únicamente por anticipación tecnológica.

## 10. Criterio de cierre de #83

La Issue queda resuelta cuando esta política está integrada en `main` y permite determinar de manera reproducible, para un PR cualquiera, qué gates son Globales, cuáles son Específicos, cuándo se activan y cuáles bloquean integración.

## 11. Referencias

- Architecture Baseline: `docs/architecture/architecture-baseline.md`
- Document State Taxonomy: `docs/governance/document-state-taxonomy-v0.1.0.md`
- Security Assurance: Issue #82
- Technology Evaluation: Issue #81
