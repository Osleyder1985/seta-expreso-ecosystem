# Security Assurance en CI

**Versión:** 0.1.0  
**Estado:** Vigente como política de assurance para el estado actual del repositorio  
**Fecha:** 2026-09-25  
**Issue:** #82

## 1. Objetivo

Establecer controles de seguridad automatizados y verificables proporcionales a la fase actual.

La política diferencia controles **obligatorios ahora**, controles **condicionales** y controles que quedan para cuando aparezca código productivo de un tipo concreto.

## 2. Controles obligatorios actuales

| ID | Control | Ejecutor | Ámbito | Resultado requerido |
|---|---|---|---|---|
| SEC-01 | Secret scanning | GitHub Actions + Gitleaks | Todo el repositorio | PASS |
| SEC-02 | Dependency review | GitHub Actions Dependency Review | PRs | PASS cuando existen dependencias modificadas |
| SEC-03 | Permisos mínimos del workflow | Revisión de workflows | .github/workflows | PASS |
| SEC-04 | Configuración reproducible | Workflow versionado en Git | CI | PASS |

## 3. Controles condicionales

| ID | Control | Activación |
|---|---|---|
| SEC-05 | SAST/CodeQL | Cuando exista código fuente compatible |
| SEC-06 | Análisis de contenedores | Cuando existan imágenes productivas |
| SEC-07 | Detección de vulnerabilidades de runtime | Cuando exista despliegue ejecutable |
| SEC-08 | DAST/API security testing | Cuando exista API desplegable |
| SEC-09 | Mobile security checks | Cuando existan aplicaciones Android/iOS |
| SEC-10 | SBOM/provenance | Cuando el proceso de build produzca artefactos distribuibles |

Un control condicional no se marca PASS antes de que su ámbito exista; se marca N/A con la razón correspondiente.

## 4. Secret scanning

Gitleaks se ejecuta sobre el historial disponible en CI y debe fallar ante secretos detectados.

No se deben almacenar secretos reales en el repositorio, issues, artefactos o logs.

Los falsos positivos deben resolverse mediante configuración mínima y documentada. Un secreto real nunca debe solucionarse simplemente ignorando el hallazgo.

## 5. Dependency review

Dependency Review se ejecuta en Pull Requests contra `main`.

Debe bloquear vulnerabilidades introducidas con severidad crítica. El umbral podrá elevarse cuando el riesgo del producto lo requiera.

La revisión de dependencias no sustituye la gestión continua de vulnerabilidades.

## 6. Permisos

Los workflows deben utilizar el principio de mínimo privilegio.

Por defecto:

```yaml
permissions:
  contents: read
```

Un permiso adicional debe aparecer solo en el workflow que lo necesite y quedar justificado.

No se deben utilizar PAT personales ni secretos adicionales cuando `GITHUB_TOKEN` sea suficiente.

## 7. Excepciones

Una excepción requiere:

- control afectado;
- motivo;
- riesgo;
- mitigación;
- responsable;
- Issue;
- fecha/condición de expiración.

No se permite convertir una excepción temporal en una exclusión silenciosa.

## 8. Criterio de bloqueo

Un control obligatorio aplicable que falla bloquea la integración.

Un control no aplicable se registra como N/A.

Un control pendiente de implementación no puede declararse PASS.

## 9. Evolución

Cuando aparezca código productivo se activarán SEC-05 y los controles de seguridad específicos del componente mediante una Issue/PR.

La política se revisará cuando cambien:

- superficie de ataque;
- tipos de artefactos;
- dependencias;
- arquitectura de despliegue;
- datos procesados;
- requisitos legales/regulatorios;
- capacidades de CI.

## 10. Evidencia

La evidencia primaria será:

**workflow → job → step → resultado → commit/PR**

Los resultados de seguridad deben permanecer vinculados al commit evaluado.

## 11. Referencias

- GitHub Dependency Review Action.
- Gitleaks Action.
- Architecture Baseline, sección de seguridad.
- Quality Gates Policy v0.1.0.
- Issue #82.

## 12. Criterio de cierre

Issue #82 se considera resuelta para la fase actual cuando los controles obligatorios SEC-01 a SEC-04 estén definidos en política y ejecutados mediante workflow versionado, con evidencia de ejecución exitosa en un commit/PR posterior a su integración.

**No se declara assurance completo del producto:** el alcance es el assurance automatizado disponible para el estado actual del repositorio.
