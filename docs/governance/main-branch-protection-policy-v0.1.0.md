# Política de protección de main v0.1.0

**Estado:** Vigente como política de configuración requerida

## Objetivo

Impedir integración directa en `main` sin revisión y sin los Quality Gates aplicables.

## Configuración requerida en GitHub

La rama `main` debe tener una regla/ruleset que:

1. Requiera Pull Request antes de integrar.
2. Requiera al menos una aprobación cuando exista un segundo revisor disponible; si el repositorio opera con un único propietario, mantener la revisión como control documental hasta disponer de segundo revisor.
3. Impida force-push y eliminación de la rama.
4. Requiera que el branch esté actualizado antes de integrar cuando GitHub lo soporte sin invalidar el flujo experimental.
5. Requiera los checks CI que estén definidos como obligatorios por la política de Quality Gates y existan efectivamente en el repositorio.
6. No marque como obligatorio un check inexistente o inestable.
7. Mantenga bypass administrativo restringido al mínimo necesario y auditado.

## Estado de aplicación

La política está documentada, pero su activación efectiva depende de permisos administrativos de GitHub sobre el repositorio. La ausencia de acceso administrativo no se considera evidencia de que la protección esté activa.

## Evidencia

La evidencia de cumplimiento debe ser una lectura exitosa de la protección/ruleset de `main` y una prueba controlada de que un push directo o PR sin los checks requeridos no puede integrarse.

## Regla de cierre

La Issue de protección no debe cerrarse por la existencia de este documento. Solo se cierra después de verificar la configuración efectiva en GitHub.
