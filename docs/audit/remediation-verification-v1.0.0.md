**Estado:** Vigente

# Registro de verificación de remediaciones v1.0.0

**Fecha:** 2026-09-25  
**Baseline:** main después de la integración de la remediación de auditoría.

## Hallazgos verificados

### AUD-105 — Actions fijadas
Todos los usos de Actions de terceros existentes en los workflows del baseline están fijados a commit SHA completo.

### AUD-107 — Versión TypeScript
El README del PoC NestJS declara TypeScript 5.9.3, coincidente con package.json.

### AUD-109 — Aplicabilidad normativa
El catálogo normativo fue ampliado y existe una matriz explícita de aplicabilidad por estándar, ámbito, evidencia y estado.

## Limitaciones no cerradas en este registro

- AUD-102: el cierre histórico requiere una actualización adicional del documento original.
- AUD-106: falta un package-lock.json generado y comprometido; las imágenes de benchmark relevantes ya fueron fijadas donde fue posible.
- AUD-108: main continúa sin branch protection efectiva.
- AUD-110: existe documentación de entrada, CODEOWNERS y SECURITY, pero falta una puerta README raíz.
- AUD-111: la normalización de estados documentales no está completa en todos los artefactos.
- Issue #10: benchmark real pendiente de ejecución sobre el hardware de referencia.

Este documento no declara certificación ISO ni conformidad legal.


**Fase/nota:** Las etiquetas históricas de fase o baseline no constituyen estados formales; el campo `Estado` se rige exclusivamente por la taxonomía de gobernanza.
