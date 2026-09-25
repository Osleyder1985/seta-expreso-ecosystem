# Taxonomía de estados documentales y decisiones

**Versión:** 0.1.0  
**Estado:** Vigente como convención de gobernanza  
**Fecha:** 2026-09-25  
**Issue:** #78

## Propósito

Establecer una taxonomía única para expresar el estado de documentos, decisiones arquitectónicas y elementos del baseline. La taxonomía describe madurez/gobernanza; no sustituye la aprobación del propietario ni convierte una propuesta en decisión aprobada.

## Estados

| Estado | Significado | ¿Es decisión vigente? |
|---|---|---|
| **Propuesto** | Existe una propuesta explícita pendiente de revisión/decisión. | No |
| **Adoptado provisionalmente** | Se permite utilizar como baseline de trabajo, pero requiere validación o puede cambiar. | Parcial/provisional |
| **Vigente** | Decisión aceptada para el baseline actual y aplicable hasta que sea sustituida. | Sí |
| **En validación** | Existe evidencia o PoC en curso para determinar si una propuesta/provisional puede elevarse. | No definitiva |
| **Sustituido** | Fue vigente/provisional y ha sido reemplazado por una decisión posterior. | No |
| **Retirado** | Se abandona sin reemplazo vigente. | No |

## Reglas

1. El estado se refiere al artefacto o decisión, no a la calidad de una persona o equipo.
2. Una Issue o PR cerrada no implica que el contenido haya sido aprobado; solo indica que el trabajo de esa Issue/PR terminó.
3. Un PoC genera evidencia, pero no convierte automáticamente una hipótesis en decisión vigente.
4. Una decisión que afecte arquitectura o restricciones empresariales debe mantener trazabilidad a Issue, ADR y evidencia cuando corresponda.
5. Los estados de tecnología pueden diferir de los estados de arquitectura: por ejemplo, una tecnología puede estar **Adoptada provisionalmente** mientras la arquitectura permanece **Propuesta**.
6. **Vigente** no significa irreversible. Una decisión vigente puede ser sustituida mediante nueva evidencia y una nueva decisión trazable.
7. Cuando un documento contenga elementos con diferente madurez, el documento puede estar vigente como referencia mientras sus elementos internos conservan estados propios.

## Aplicación al baseline actual

- Architecture Baseline v0.1.0: **Propuesto**.
- ADR-0001 Modular Monolith: **Propuesto**.
- Technology Stack Baseline v0.1.0: **Vigente como catálogo de baseline**, manteniendo dentro de su matriz los estados particulares de cada tecnología.
- Esta convención de estados: **Vigente**.

La elevación de Architecture Baseline o ADR-0001 a **Vigente** requiere revisión/decisión del propietario; esta convención no la realiza unilateralmente.

## Transiciones

`Propuesto → En validación → Adoptado provisionalmente → Vigente`

También:

`Vigente → Sustituido`

o

`Vigente → Retirado`

Las transiciones deben dejar evidencia de qué motivó el cambio.

## Regla de documentación

Todo documento nuevo que represente una decisión o baseline debe indicar explícitamente: estado, versión, fecha, Issue relacionada y, cuando corresponda, ADR/evidencia.
