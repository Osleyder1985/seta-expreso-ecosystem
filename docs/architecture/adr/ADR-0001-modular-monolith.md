# ADR-0001: Modular Monolith como punto de partida

**Estado:** Propuesto  
**Fecha:** 2026-09-24  
**Issue:** #1

## Contexto

El Ecosistema SETA EXPRESO SURL tendrá aplicaciones Web, Android e iOS y un backend central para soportar procesos empresariales.

En esta etapa todavía se está realizando descubrimiento y especificación del negocio. No existe evidencia suficiente para imponer una arquitectura distribuida como requisito general.

## Decisión

Adoptar inicialmente un **Modular Monolith** con separación Clean/Hexagonal y límites explícitos entre módulos.

Los módulos compartirán inicialmente el mismo proceso de ejecución y la estrategia de persistencia será centralizada, sin impedir una evolución futura.

## Razones

- Reduce complejidad operacional inicial.
- Facilita desarrollo y depuración.
- Permite mantener límites de dominio claros.
- Evita introducir infraestructura distribuida sin una necesidad demostrada.
- Permite evolucionar módulos posteriormente si la evidencia lo exige.

## Consecuencias

### Positivas

- Menor complejidad de despliegue inicial.
- Menor carga operacional.
- Transacciones y consistencia más sencillas cuando sean necesarias.
- Desarrollo más directo.

### Negativas / riesgos

- Los límites modulares deben cuidarse activamente.
- Un módulo podría terminar acoplándose indebidamente a otro.
- La extracción futura requerirá disciplina arquitectónica y posiblemente trabajo adicional.

## Condición de revisión

La decisión debe revisarse si aparecen requisitos que hagan necesaria la separación operacional, de escalabilidad, seguridad, despliegue o evolución de uno o más módulos.

## Alternativas no adoptadas inicialmente

- Microservicios.
- Serverless como arquitectura general.
- Kubernetes como plataforma base.
- Arquitectura distribuida con múltiples bases de datos.

Estas alternativas podrán evaluarse mediante ADR específicos cuando exista una necesidad demostrable.
