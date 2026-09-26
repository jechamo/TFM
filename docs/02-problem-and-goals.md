# 2 · Problema y objetivos

## El problema

Los agentes de IA escriben código deprisa. Sin método, esa velocidad produce fallos sistemáticos, y los he sufrido en mis propios productos:

| Fallo | Consecuencia | Cómo se vio en los productos |
|---|---|---|
| El mismo agente planifica, implementa y se da por bueno | Un "funciona" que nadie ha ejecutado | ChaFit e ICG Vault nacieron en un generador *low-code* (Lovable) y crecieron por iteraciones de chat |
| La arquitectura se decide en cada petición | Contratos implícitos que se rompen | ChaFit guardaba rutinas como HTML posicional: la IA devolvía 7 u 8 columnas y la app esperaba 9 (317 filas inválidas en producción) |
| No queda rastro de por qué se hizo algo | Deuda opaca, cambios irreversibles | Historial de migraciones de ICG Vault desalineado con producción |
| Seguridad y calidad "al final" | Vulnerabilidades en la capa de datos | Auditorías del 23/09: 15 y 16 hallazgos críticos, casi todos de permisos |
| Cada IDE con sus propias reglas | Conocimiento duplicado que diverge | Agentes y reglas repetidos por herramienta (spec 004 del sistema) |

## La hipótesis

> Si la especificación es la fuente de verdad, la implementación sigue TDD y la verificación la ejecutan scripts y hooks fuera del modelo, con personas aprobando los puntos de decisión, entonces los agentes pueden construir y evolucionar software real de forma trazable y segura.

## Objetivos

| # | Objetivo | Cómo se comprueba | Dónde |
|---|---|---|---|
| O1 | Diseñar un **modelo operativo** SDD + TDD para agentes, portable entre entornos | `AGENTS.md`, `OPERATING-MODEL.md`, 6 hosts soportados | [04 · SDD](04-sdd-methodology.md) |
| O2 | **Construirlo como herramienta instalable** con verificación determinista | Kit v0.9.1, `check-sdd`, 375 comprobaciones en verde | [06 · Agentes](06-agentic-system.md) |
| O3 | **Aplicarlo a un proyecto nuevo** | RRSS Studio: de 18 requisitos a una app con 38 funcionalidades | [Caso RRSS](case-studies/rrss.md) |
| O4 | **Aplicarlo a productos en producción** sin romperlos | ChaFit: 7 specs; ICG Vault: 81 PR de agentes | [Caso ChaFit](case-studies/chafit.md) · [Caso ICG Vault](case-studies/icgvault.md) |
| O5 | **Auditar** con el sistema lo ya construido | 2 auditorías integrales multiagente | [Auditorías](audits/audit-methodology.md) |
| O6 | **Documentar la arquitectura real** (AS-IS) con evidencia | Modelos, 56 vistas, inventarios con fichero y línea | [Arquitectura global](03-global-architecture.md) |
| O7 | Demostrar la **trazabilidad con el máster** | Matriz competencia → implementación → evidencia | [Matriz](evidence/master-evidence-matrix.md) |

## Alcance y no-alcance

- **Dentro:** el sistema de agentes, su aplicación a los tres productos, la arquitectura AS-IS de cada uno, sus integraciones y las auditorías.
- **Fuera:** reescribir los productos para el TFM (no se ha modificado su funcionalidad), certificar la seguridad de producción, medir productividad o negocio. Las cifras de este trabajo son de superficie y de verificación, no de rendimiento económico.
