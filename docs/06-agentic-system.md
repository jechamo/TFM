# 6 · Sistema de agentes

## Tres niveles, veinte agentes

![20 agentes: quién delega y quién solo audita](../architecture/exported/svg/sdd-agents.svg)

| Nivel | Agentes | Qué hacen |
|---|---|---|
| 0 · Orquestación | `orchestrator` | Clasifica la petición y enruta a la fase; **no escribe** |
| 1 · Fases | `spec-analyst`, `ux-designer`, `architect`, `planner`, `implementer`, `code-reviewer`, `release-manager`, `research-analyst` | Llevan el circuito de una fase a otra y conocen su sucesor natural |
| 2 · Especialistas | `backend-expert`, `frontend-expert`, `database-expert`, `api-designer`, `test-engineer`, `security-auditor`, `refactor-specialist`, `performance-optimizer`, `devops-expert`, `docs-writer`, `bitacora-keeper` (+ `ux-designer`) | Hacen su trabajo y **devuelven el control**; nunca encadenan |

### Reglas que impiden los atajos

- **Solo tres delegan**: `orchestrator` (a las fases), `planner` (consulta a api-designer, database-expert, ux-designer, research-analyst, architect) e `implementer` (backend, frontend, database, test, refactor, api). Los otros 17 no tienen la herramienta.
- **Profundidad máxima: dos saltos** (`orchestrator` → fase → especialista).
- **Quien juzga no escribe**: `orchestrator`, `code-reviewer`, `security-auditor` y `research-analyst` son de solo lectura.
- **Territorios**: `.sdd/territories.json` asigna rutas a agentes y `guard-write.mjs` bloquea escrituras fuera de territorio.

## Skills: el procedimiento escrito

27 skills en el estándar abierto *Agent Skills* (`.agents/skills/*/SKILL.md`): 14 del circuito (`sdd-start`, `sdd-intake`, `sdd-init`, `sdd-specify`, `sdd-clarify`, `sdd-design`, `sdd-plan`, `sdd-tasks`, `sdd-implement`, `sdd-verify`, `sdd-ship`, `sdd-light`, `sdd-status`, `sdd-refresh`) y 13 de dominio y operación (`middle`, `front`, `bbdd`, `tdd`, `security-scan`, `docs-sync`, `design-sync`, `adr`, `bitacora`, `observability`, `respond-incident`, `onboard`, `skill-creator`). Cada una tiene puertas de entrada, pasos, llamadas a la CLI y lista de comprobación.

## Hooks: verificación fuera del modelo

| Hook | Evento | Decisión |
|---|---|---|
| `session-context.mjs` | SessionStart | inyecta arquitectura, spec activa, tareas y decisiones |
| `sdd-router.mjs` | UserPromptSubmit | sugiere la fase correcta (sin decidir) |
| `guard-write.mjs` | PreToolUse (escritura) | `deny` secretos, lockfiles, logs de ejecución; `ask` agentes, skills, hooks, constitución |
| `guard-bash.mjs` | PreToolUse (terminal) | `deny` destructivos; `ask` push, commit, IaC, publicación |
| `format-and-lint.mjs` | PostToolUse | formatea y linta el fichero tocado |
| `subagent-log.mjs` | SubagentStart/Stop | escribe `execution-log.jsonl` (append-only, protegido) |
| `session-log.mjs` | Stop | registra la sesión en la bitácora mensual |

Un mismo código Node normaliza los formatos de Claude Code, Copilot, Cursor, Antigravity y Codex.

## Trazabilidad con niveles de confianza

| Nivel | Significa |
|---|---|
| `observed` | un hook vio el inicio y el fin del subagente |
| `observed-write` | un hook vio a ese agente escribir ese fichero |
| `declared-corroborated` | declarado en los *trailers* del commit y contrastado con `--trace-audit` |
| `declared-direct` | el agente activo lo hizo sin delegar |
| `unverified` | solo con motivo explícito |

## Portabilidad honesta

| Host | Delegación | Hooks | Adaptador |
|---|---|---|---|
| Claude Code | subagentes nativos | sí | `.claude/agents`, `.claude/settings.json` |
| GitHub Copilot / VS Code | picker de agentes | sí | `.github/agents`, `.github/hooks` |
| Cursor | referencia al perfil | sí | `.cursor/agents`, `.cursor/hooks.json` |
| Codex | rol por nombre | sí (un `ask` se convierte en `deny`) | `.codex/agents/*.toml` |
| Gemini CLI | perfil | — | `.gemini/agents` |
| Antigravity | workflows | sí | `.agents/workflows` |

La matriz verificada/inferida está en `docs/integrations/IDE-COMPATIBILITY.md` del sistema. Preferir un hueco declarado a una afirmación cómoda forma parte del diseño.

## Relación con los patrones del máster

- **Supervisor/orquestador** (orchestrator) y **secuencial** (circuito de fases).
- **Evaluador separado** del generador (code-reviewer y security-auditor de solo lectura).
- **Paralelismo controlado**: análisis de solo lectura en paralelo; escritura en paralelo solo con tareas `[P]` de ficheros disjuntos.
- **Agent harness completo**: `AGENTS.md` + skills + herramientas (CLI, MCP opt-in) + permisos + validación.
