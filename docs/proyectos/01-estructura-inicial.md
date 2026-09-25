# Estructura_inicial: plantilla SDD multiagente

**Repositorio:** [jechamo/Estructura_inicial](https://github.com/jechamo/Estructura_inicial) · **Versión de plantilla:** `2026.07.30.1`

## Qué es

Una plantilla para arrancar proyectos y funcionalidades con **Specification-Driven Development**,
arquitectura explícita, TDD, seguridad desde el diseño y agentes especializados. La fuente de verdad
vive en `.agents/`, y `tools/sdd.py sync` genera los adaptadores nativos de cada IDE.

## Qué problema resuelve

- Cada IDE con IA define agentes, skills, prompts y hooks en su propio formato. Mantener cuatro copias es inviable.
- Los agentes dicen que han terminado, pero **nada lo demuestra**.
- Se programa antes de entender el problema y se decide la arquitectura antes de conocer sus fuerzas.

## Piezas

| Pieza | Cantidad | Ejemplos |
|---|---:|---|
| Roles | 13 | orquestador, arquitecto, QA/TDD, seguridad, SRE, release |
| Skills | 15 | `sdd-project`, `sdd-feature`, `implement-with-tdd`, `model-threats`, `evolve-database`, `prepare-release`, `respond-to-incident` |
| Prompts `/` | 12 | `/discover-and-specify`, `/sdd-project`, `/sdd-feature`, `/debug-problem`, `/decide-architecture` |
| Reglas | 5 | núcleo, SDD, arquitectura, calidad/seguridad, datos/UI/operación |
| IDE soportados | 4 | Claude Code, Cursor, GitHub Copilot/VS Code, Google Antigravity |
| Pruebas | 36 | CLI, hooks y workflow de CI |

## CLI `tools/sdd.py`

| Comando | Para qué |
|---|---|
| `init --name` | Inicializa el proyecto |
| `feature "<nombre>"` | Crea `specs/NNN-*/` a partir de las plantillas |
| `adr "<título>" [--architecture]` | Crea un ADR en formato MADR |
| `clarify ask / resolve / list` | Registra preguntas y decisiones (`blocking`, `material`, `reversible`) |
| `task list` · `work start / complete / list / migrate-legacy` | Ejecución trazable con *handoffs* y bitácora |
| `feature-status` · `status` | Estado de funcionalidades |
| `sync [--check]` | Regenera o verifica los adaptadores |
| `check [--strict]` | Valida la estructura y la preparación de la release |

## Valor diferencial

- **Portabilidad**: una sola definición y cuatro IDE.
- **Trazabilidad verificable**: los eventos de subagente se observan con hooks, no se dan por buenos porque lo diga el chat.
- **Gobierno**: una pregunta material sin resolver bloquea la implementación.
- **Cero dependencias**: la CLI usa solo la biblioteca estándar de Python.
- **Honestidad del alcance**: no promete un catálogo universal de arquitecturas; incluye `sdd-refresh` para revisar el baseline cuando cambien los estándares.
