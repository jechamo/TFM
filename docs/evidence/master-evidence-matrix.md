# Matriz de evidencias del máster

> Trazabilidad **temario → concepto → implementación → proyecto → evidencia**. Fuente del temario: programa oficial (11 bloques). Estado: **APLICADO** (hay evidencia verificable), **PARCIAL** (aplicado con límites que se indican) o **NO APLICADO** (no forma parte de este TFM).

## Ingeniería de software y arquitectura

| Competencia | Sistema / proyecto | Aplicación | Evidencia | Resultado |
|---|---|---|---|---|
| Ciclo de vida del software | Sistema SDD | intake → spec → plan → tasks → implement → verify → ship, con operación (`/respond-incident`, `/observability`) | `AGENTS.md`, `docs/sdd/OPERATING-MODEL.md` | APLICADO |
| Análisis de requisitos | Sistema SDD · RRSS · ChaFit | requisitos EARS, criterios Gherkin, MoSCoW, casos de uso, gate de producto | `docs/01-requisitos.md` (RRSS), `docs/specs/*/spec.md` (ChaFit) | APLICADO |
| **Spec Driven Development** | los cuatro | el núcleo del TFM | 17 specs del sistema, 18 REQ + 2 specs RRSS, 7 specs ChaFit | APLICADO |
| Buenas prácticas y principios de diseño | Sistema SDD | `refactor-specialist` (SOLID, DRY, KISS, YAGNI), `check-smells.mjs` | `.sdd/smells.json`, `scripts/check-smells.mjs` | APLICADO |
| Clean Architecture | RRSS | monolito modular con fronteras hexagonales pragmáticas (puertos para IA y conectores; pipelines aún acoplados a Prisma) | ADR de RRSS, `src/core/ai/engine.ts` | PARCIAL |
| ADR y deuda técnica | Sistema · ChaFit · RRSS | ADR MADR (`/adr`), bitácora de decisiones, deuda aceptada a sabiendas | `docs/architecture/adr/`, `docs/bitacora/DECISIONS.md` | APLICADO |
| Paradigmas (POO, funcional, asincronía) | RRSS · ChaFit | interfaces `AiEngine`/`Connector`, funciones puras con test, trabajos asíncronos con `job_id`, SSE, colas | `src/core/content/selection.ts` (+ test), `EdgeRuntime.waitUntil` | APLICADO |

## Calidad

| Competencia | Sistema / proyecto | Aplicación | Evidencia | Resultado |
|---|---|---|---|---|
| Testing unitario, integración y E2E | los cuatro | 375 comprobaciones (SDD) · 71 + 138 + 9 E2E (RRSS) · 109 + 100 (ChaFit) | ejecuciones del 26/09/2026 | APLICADO |
| TDD | Sistema · ChaFit · RRSS | RED demostrado → GREEN → REFACTOR con salida pegada | `evidence.md` de las specs | APLICADO |
| Playwright | RRSS · ChaFit | E2E sin red; verificación de rutas y grabación automática de demos | `e2e/full-flows.spec.ts`, `src/core/media/recorder.ts` | APLICADO |
| Code smells, refactor | Sistema | detector de *smells* como gate | `scripts/check-smells.mjs` | APLICADO |
| Métricas y cobertura | Sistema | trinquete de cobertura con V8 (el umbral solo sube; hoy 48,3 %) en lugar de un 80 % fijo | `.sdd/coverage.json`, `scripts/check-coverage.mjs` | PARCIAL |
| Hooks y gates en CI | los cuatro | pre-commit/pre-push, `sdd-gates.yml`, `quality-gates.yml` | `.sdd/githooks/`, `.github/workflows/` | APLICADO |
| Observabilidad con Sentry | ChaFit | errores saneados, Replay enmascarado con consentimiento, *source maps* | `src/sentry.ts`, spec 003, ADR-0002 | APLICADO |
| Seguridad, ENV, OWASP, JWT, validación | Sistema · ChaFit · RRSS | contrato JWT/OWASP en el circuito (spec 007), zod, secretos fuera de `.env`, Vault | CHANGELOG 0.6.0, `src/core/secrets/vault.ts` | APLICADO |
| Documentación con IA (Docs as Code) | Sistema · este TFM | `/docs-sync`, contrato documental, arquitectura como código | `.sdd/docs.json`, `architecture/` | APLICADO |
| Usabilidad y accesibilidad | Sistema · auditorías | usabilidad exigible (spec 009), WCAG 2.2 AA como suelo, auditoría UI | spec 009, auditorías 23/09 | APLICADO |
| Patrones de orquestación de agentes | Sistema | supervisor + secuencial + evaluador separado; paralelismo solo en lectura | `docs/agents/CATALOG.md` | APLICADO |
| Code review con IA | Sistema · auditorías | `code-reviewer` de solo lectura con informe parseable | auditorías 23/09 | APLICADO |
| Calidad en tiempos agénticos | Sistema | verificación por encima de generación; traza `observed` vs `declared` | `scripts/lib/trace-audit.mjs` | APLICADO |
| Ojos para los agentes | RRSS · este TFM | navegador automatizado que verifica rutas; capturas y revisión visual de diagramas con Chromium | `navigation/verify`, `architecture/tools/export-png.cjs` | APLICADO |

## IA y flujo de desarrollo con agentes

| Competencia | Sistema / proyecto | Aplicación | Evidencia | Resultado |
|---|---|---|---|---|
| IA en el proceso de desarrollo | los cuatro | agentes de Claude Code y Codex; 81 de 97 PR de ICG Vault desde ramas de agentes | historia Git | APLICADO |
| Desarrollo en la era de los agentes | Sistema | anatomía de agentes, riesgos y límites (autocertificación) | `docs/TFM/MEMORIA.md` del sistema | APLICADO |
| Contexto, AGENTS.md, Skills, MCP, *agent harness* | Sistema | router `AGENTS.md`, 27 skills estándar, MCP opt-in con política, hooks y permisos | `.agents/skills/`, `.mcp.json`, `docs/security/MCP-SECURITY.md` | APLICADO |
| APIs de IA (OpenAI, Anthropic, ElevenLabs, Replicate…) | productos | OpenAI (ChaFit, ICG), Anthropic vía CLI, Gemini, fal.ai, HeyGen, ElevenLabs (RRSS) | [inventario de IA](../architecture/ai-integrations.md) | APLICADO |
| ElevenLabs (optativo) | RRSS | locución `eleven_multilingual_v2` | `src/core/media/elevenlabs.ts` | APLICADO |
| Prompting y multimodalidad | productos | visión (fotos), imagen y edición, voz a texto (Whisper), vídeo (Gemini) | funciones de ChaFit, `gemini.ts` | APLICADO |
| IA generativa | productos | generación de rutinas, dietas, imágenes, vídeo y guiones | inventarios | APLICADO |
| Modelos de IA locales | RRSS | transcripción con whisper.cpp en local | `local-transcription.ts` | PARCIAL (solo transcripción) |
| AI frameworks (RAG, LangChain, LlamaIndex) | — | no se usan: los productos no necesitan recuperación semántica | — | NO APLICADO |
| IA responsable | ChaFit | consentimiento explícito antes de enviar datos a IA, aviso de uso de IA, auditoría de privacidad | `AIDataConsentDialog`, `AIDisclosureBanner` | APLICADO |
| LLMOps | ChaFit · RRSS | configuración de modelos por función, cupos, simulador y estimador de costes | `ai_model_config`, `pricing.ts` | PARCIAL (sin telemetría de coste real) |
| Multi-Agents | Sistema | 20 agentes con delegación limitada | catálogo | APLICADO (sin Google ADK) |

## Herramientas

| Competencia | Aplicación | Resultado |
|---|---|---|
| VS Code + Copilot, otros IDEs | adaptadores para Copilot/VS Code, Cursor, Antigravity | APLICADO |
| Copilot en GitHub | agentes en `.github/agents`, Dependabot | APLICADO |
| Codex | agentes nativos `.codex/agents` (spec 001 del sistema) | APLICADO |
| Claude | Claude Code como host principal; Claude Code CLI como motor de RRSS | APLICADO |
| MVP con IA (v0, Lovable) | ChaFit e ICG Vault nacieron en Lovable y se profesionalizaron con el sistema | APLICADO |
| Automatización n8n | webhook de altas de ChaFit hacia n8n | APLICADO |
| Diseño visual asistido por IA | `design-sync` (Figma/Stitch opt-in) en el sistema | PARCIAL |
| OpenCode, Warp, CodeRabbit, OpenClaw, Hermes | no forman parte de este trabajo | NO APLICADO |

## Infraestructura, cloud y seguridad

| Competencia | Sistema / proyecto | Aplicación | Evidencia | Resultado |
|---|---|---|---|---|
| DevOps y CI/CD | todos | GitHub Actions (gates, Pages, instalación en Windows 11), Vercel Preview → Producción | workflows | APLICADO |
| Cloud computing | ChaFit · ICG Vault | Vercel + Supabase (BaaS, serverless, Postgres gestionado) | vistas de despliegue | APLICADO |
| Bases de datos | productos | Postgres con RLS, funciones SQL, colas y cron; SQLite con Prisma | inventarios | APLICADO |
| Contenerización (Docker) | — | no se usa | — | NO APLICADO |
| Desarrollo seguro y metodologías | Sistema | impacto de seguridad obligatorio por spec; auditor sin escritura; controles no ejecutados declarados | `AGENTS.md` regla 12 | APLICADO |
| OWASP Top 10 Web, API y GenAI/LLM | auditorías | hallazgos clasificados por OWASP Web 2025, API 2023 y LLM 2025 | [auditorías](../audits/audit-methodology.md) | APLICADO |
| Codificación segura | RRSS · Sistema | Vault con escritura atómica, guardas de escritura y comandos, escaneo de secretos, SSRF (spec 016) | `guard-write.mjs`, `scan-secrets.mjs` | APLICADO |
| IA en el desarrollo seguro | auditorías | `security-auditor` + contraste del orquestador con la base real | informes 23/09 | APLICADO |

## Desarrollo potenciado por IA

| Competencia | Proyecto | Resultado |
|---|---|---|
| Proyecto front | los tres productos | APLICADO |
| Proyecto back | Edge Functions, SQL, Next.js | APLICADO |
| Proyecto mobile | ChaFit e ICG Vault publicadas en App Store y Google Play | APLICADO |
| Proyecto IA | los tres productos | APLICADO |
| Práctica: SDD, contexto, memoria, skills, subagentes | Sistema SDD | APLICADO |

**Resumen:** 54 competencias revisadas · 46 aplicadas · 5 parciales · 3 no aplicadas (declaradas).
