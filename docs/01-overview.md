# 1 · Visión general

> **Del máster a producción: ingeniería de software dirigida por especificaciones con agentes de IA, aplicada a tres productos reales.**
> Trabajo de Fin de Máster · Jorge Chamorro · 2026

![Del máster a producción](../architecture/exported/svg/tfm-overview.svg)

## En una frase

He diseñado y construido un **sistema de ingeniería de software asistido por agentes** —Spec Driven Development + TDD, 20 agentes especializados, 27 skills, hooks y una CLI determinista con seis puntos de aprobación humana— y lo he usado para **crear, evolucionar y auditar** tres productos reales: RRSS Studio, ChaFit e ICG Vault.

## Las cuatro piezas

| Pieza | Qué es | Estado | Enlaces |
|---|---|---|---|
| **Sistema SDD/TDD** | Kit instalable (`npx`) que gobierna a los agentes de Claude Code, Copilot, Cursor, Codex, Gemini CLI y Antigravity | v0.9.1 · 17 specs propias · 375 comprobaciones en verde | [repositorio](https://github.com/jechamo/Estructura_inicial_claude) · [web](https://jechamo.github.io/Estructura_inicial_claude/) |
| **RRSS Studio (LeadView)** | App local que analiza un producto web y produce inteligencia de mercado y vídeo para redes con IA | 38 funcionalidades · 17 con IA | [repositorio](https://github.com/jechamo/rrss-automation-app) |
| **ChaFit** | Plataforma de fitness para clientes, entrenadores y gimnasios, con rutinas y dietas generadas por IA | 62 funcionalidades · web + iOS + Android | [chafit.es](https://chafit.es) |
| **ICG Vault** | Red social gamificada para votar cine, series y videojuegos, con economía RPG y juegos | 63 funcionalidades · web + iOS + Android | [icgvault.es](https://icgvault.es) |

## Qué hace distinto a este trabajo

- **No se autocertifica.** La verificación la ejecutan hooks y scripts fuera del modelo; un "pasa" sin ejecución no cuenta como resultado.
- **Se ha aplicado a software con usuarios.** ChaFit e ICG Vault están publicados en web, App Store y Google Play; la spec 001 de ChaFit reparó 317 filas de producción con TDD, respaldo y *rollback*.
- **Tres tipos de aplicación.** *Greenfield* (RRSS), *brownfield* con specs (ChaFit) y *brownfield* con auditoría y PR de agentes (ICG Vault).
- **Todo está enlazado a su evidencia.** Inventarios con fichero y línea, arquitectura como código, diagramas regenerables.

## Cómo leer esta documentación

| Si quieres… | Lee |
|---|---|
| Entender el problema y el objetivo | [02 · Problema y objetivos](02-problem-and-goals.md) |
| Ver la arquitectura del conjunto | [03 · Arquitectura global](03-global-architecture.md) |
| Entender el método | [04 · SDD](04-sdd-methodology.md) · [05 · TDD y calidad](05-tdd-quality.md) · [06 · Sistema de agentes](06-agentic-system.md) · [07 · Flujo de trabajo](07-development-workflow.md) |
| Ver cada producto por dentro | [RRSS](case-studies/rrss.md) · [ChaFit](case-studies/chafit.md) · [ICG Vault](case-studies/icgvault.md) · [Comparativa](case-studies/project-comparison.md) |
| Revisar arquitectura e integraciones | [architecture/](architecture/) · [inventarios](discovery/) |
| Comprobar la relación con el máster | [Matriz de evidencias](evidence/master-evidence-matrix.md) |
| Evaluar seguridad y auditorías | [Seguridad](security/security.md) · [Auditorías](audits/audit-methodology.md) |
| Instalar, probar o ver las demos | [Instalación](delivery/installation.md) · [Guía de demo](delivery/demo-guide.md) |
