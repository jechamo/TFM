# 5 · TDD y calidad

## TDD como contrato de implementación

Cada tarea sigue **RED → GREEN → REFACTOR** y hay que *enseñar* el rojo: la salida real del test fallando se pega en la evidencia antes de escribir el código mínimo. "Pasa" sin ejecución no es un resultado; "no ejecutado" sí lo es, con su riesgo y siguiente paso.

Ejemplo real (ChaFit, spec 001, 09/08/2026):

| Hora | Tarea | Comando | Resultado |
|---|---|---|---|
| 18:25 | T-001-01 | `deno test …/workout-plan.test.ts` | **RED**: 0 passed, 4 failed |
| 18:27 | T-001-01 | idem | **GREEN**: 4 passed |
| 18:34 | T-001-03 | aserción de filas por MCP | **RED**: 317 filas con ≠ 9 celdas |
| 18:41 | T-001-03 | migración + segunda ejecución + *rollback* | **GREEN**: 0 filas inválidas, idempotente |
| 18:50 | T-001-04 | Deno test/check + despliegue por MCP | **GREEN**: 7 tests; funciones v22 y v6 activas |

Fuente: `chafit360/docs/specs/001-workout-table-contract/evidence.md`.

## Gates deterministas

| Momento | Comando | Qué ejecuta |
|---|---|---|
| Antes de commit | `node scripts/sdd-project.mjs run --fast` | checks rápidos declarados en `.sdd/checks.json` (estructura SDD, lint, tests, build, *smells*) |
| Antes de push | `run --slow` | + escaneo de secretos, cobertura, accesibilidad, E2E |
| Cierre editorial | `run --release` | reutiliza evidencia lenta vigente (sello HMAC local) y reejecuta lo barato |
| CI | `sdd-gates.yml` | gates rápidos y lentos + `check-sdd --trace-audit --strict --base <base exacta>` |

Los checks de cada aplicación se **declaran** tras `/onboard` o `/sdd-init` (`detect` + `configure --accept-detected`): el sistema no presupone npm, Python ni ningún stack.

## Calidad medida en cada repositorio

| | Sistema SDD | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|---|
| Tests | 375 comprobaciones (hooks, circuito, traza, contexto, gates, release) | 71 Vitest (12 ficheros) + 138 contratos Node + 9 E2E Playwright | 109 contratos Node + 100 Deno + 3 specs Playwright | **ninguno** (hallazgo crítico de la auditoría) |
| Ejecutados en esta revisión (26/09/2026) | **sí**: `npm test`, `check-sdd`, `skills-sync` → verde | **sí**: `npm test` → 71 + 138 en verde (E2E: evidencia de la spec 002, 9/9) | **sí**: `test:unit:node` 109/109 y `test:unit:deno` 100/100 (E2E no: escriben datos) | — |
| CI | quality-gates + sdd-gates + pages | sdd-gates en Windows 11 (instalación limpia + E2E simulado) | workflow SDD local sin versionar | sin CI |
| Contratos en la frontera de IA | — | JSON de la CLI | JSON Schema estricto, rechazo de truncado | normalización de JSON |

## Pruebas sin red ni créditos (RRSS)

La spec 002 de RRSS define un perfil `RRSS_E2E_MODE=mock` que crea SQLite, Vault, cachés y *build* aislados, sustituye Claude, Gemini, fal.ai, HeyGen, ElevenLabs, Scrape Creators, GitHub y yt-dlp por *fakes*, y **bloquea cualquier conexión que no sea loopback** tanto en el navegador como en el servidor (`src/core/runtime/egress-policy.ts`). Así las pruebas son reproducibles en CI sin gastar créditos.

## Lo que el sistema no puede garantizar

- En un host sin eventos de subagente, la traza degrada a `declared-direct`: se documenta, no se oculta.
- Los checks solo cubren lo declarado; un proyecto sin tests (ICG Vault) necesita primero una red de caracterización, como recomienda su auditoría.
