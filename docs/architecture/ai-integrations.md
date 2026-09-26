# La IA en el TFM: dos planos

## 1. IA para construir software (plano de ingeniería)

El sistema SDD/TDD no llama a ningún modelo por sí mismo: **gobierna** a los agentes del entorno del desarrollador (Claude Code, Copilot, Cursor, Codex, Gemini CLI, Antigravity), que usan los modelos de su proveedor. Lo que aporta es contexto estructurado, roles con permisos, procedimientos y verificación fuera del modelo. En las auditorías del 23/09 cada especialista trabajó con un modelo de un proveedor distinto (Anthropic, OpenAI y Google) y el orquestador contrastó sus hallazgos antes de darlos por buenos.

## 2. IA dentro de los productos (plano de producto)

| | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|
| Funcionalidades con IA | **17 / 38** | **12 / 62** | **4 / 63** |
| Proveedores | Anthropic (vía CLI) · Gemini · fal.ai · HeyGen · ElevenLabs · whisper.cpp local | OpenAI | OpenAI |
| Modalidades | texto, búsqueda web, vídeo (comprensión y generación), avatar, voz, transcripción | texto, visión, imagen, edición de imagen, voz a texto, asistente | imagen, edición de imagen, texto |
| Dónde se invoca | proceso local (subproceso o HTTPS) | Edge Functions | Edge Functions |
| Modelo configurable | motor y alias en Ajustes; modelo de fal por pieza | por función desde el panel (`ai_model_config`) | por petición del admin |
| Salida validada | JSON por dominio | JSON Schema estricto (rutinas) | JSON normalizado (quiz, encuestas) |
| Control de coste | plan y coste estimado antes de generar + aprobación humana | cupos por cliente, cupo diario del asistente, simulador de costes | cobro en rupias, acciones de admin |
| Intervención humana | aprueba prompts y gasto; revisa dossier y leads | acepta la estimación de la foto al plato; consentimiento de datos a IA | revisa y publica quiz/encuestas |

## Modelos configurados en código (26/09/2026)

| Producto | Uso | Identificador |
|---|---|---|
| RRSS | comprensión de vídeo | `gemini-3.6-flash` (sustituible por variable) |
| RRSS | vídeo | Seedance 1.0 Pro Fast (defecto), Seedance 2.0, Kling 2.5/3.0, Veo 3.1, Luma Ray 2 |
| RRSS | voz | `eleven_multilingual_v2` |
| RRSS | transcripción | whisper.cpp 1.9.1 · `ggml-small` |
| ChaFit | texto y visión | `gpt-5.6-luna` por defecto; `gpt-4o-mini` en ficha, antes/después y foto al plato por defecto |
| ChaFit | imagen | `gpt-image-2.5-sunburst` / `gpt-image-2.5-flare` |
| ChaFit | voz a texto | `whisper-1` |
| ChaFit | asistente | Assistants API (modelo definido en el Assistant) |
| ICG Vault | imagen | `gpt-image-2.5-sunburst` (calidad) / `gpt-image-2.5-flare` (rápido), con cambio automático entre ambos |
| ICG Vault | texto | `gpt-4o-mini` por defecto; opción familia `gpt-5` |

Son los valores escritos en el código en la fecha de inspección; no se ha consumido cuota para comprobar su disponibilidad.

## Flujos de IA representativos

| Producto | Flujo | Diagrama |
|---|---|---|
| RRSS | del guion al vídeo vertical | [secuencia](../../architecture/exported/svg/rrss-seq-content.svg) |
| ChaFit | generar una rutina con IA | [secuencia](../../architecture/exported/svg/chafit-seq-routine.svg) |
| ICG Vault | crear un guardián con IA | [secuencia](../../architecture/exported/svg/icgvault-seq-guardian.svg) |

Inventarios completos con los 14 campos por uso: [RRSS](../discovery/RRSS_INTEGRATIONS.md#inventario-de-ia) · [ChaFit](../discovery/CHAFIT_INTEGRATIONS.md#inventario-de-ia) · [ICG Vault](../discovery/ICGVAULT_INTEGRATIONS.md#inventario-de-ia).
