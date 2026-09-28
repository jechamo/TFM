# Informe de descubrimiento del TFM

> Autor: **Jorge Chamorro** · Fecha de corte: **26/09/2026** · Método: inspección directa de código, configuración, historia Git, documentación de cada repositorio, auditorías, vídeos y temario. Sin credenciales de producción ni escrituras en ningún producto.

## 1. Conclusión

El TFM no es "varias apps hechas con IA". Es un **sistema de ingeniería de software asistido por agentes** —Spec Driven Development + TDD, 20 agentes, 27 skills, hooks y una CLI determinista— que **se ha usado de verdad** sobre tres productos con perfiles distintos:

| Producto | Qué demuestra | Relación con el sistema | Evidencia principal |
|---|---|---|---|
| **RRSS Studio (LeadView)** | Nacer con el método: de requisitos a una app local con IA multimedia | *Greenfield*: primer commit = especificación; 18 requisitos; kit SDD 0.9.1 instalado; 2 specs; E2E sin red | `docs/01-requisitos.md`, `.sdd/installed.json`, specs 001–002 |
| **ChaFit** | Evolucionar un producto en producción con usuarios, pagos y apps nativas | *Brownfield*: 7 specs con TDD sobre producción, migraciones con respaldo y *rollback*, despliegue por Supabase MCP | `docs/specs/001…007`, ADR-0002, bitácora |
| **ICG Vault** | Escala funcional (63 funcionalidades) y auditoría multiagente | *Brownfield*: 81 de 97 PR desde ramas de agentes; auditoría integral con los agentes del sistema | historia Git, auditoría 23/09 |

La entrega previa del repositorio TFM (septiembre) describía otra plantilla (`Estructura_inicial`, 13 roles, CLI en Python) y firmaba como "Jesús Chamorro". **Se sustituye por completo**: el núcleo real es `Estructura_inicial_claude` v0.9.1 y el autor es Jorge Chamorro.

## 2. Fuentes inspeccionadas

| Sistema | Ubicación | Revisión | Visibilidad | Nota |
|---|---|---|---|---|
| Sistema SDD/TDD | `Proyectos/Estructura_inicial_claude` | `d4a16d3` (v0.9.1) = `origin/main` | Público | 59 commits, tags v0.3.0…v0.9.1, Pages activo |
| RRSS Studio | `Claude-cowork/RRSS` (**prioritaria**) | `f6510e0` = `origin/main` | Público | Cambios locales solo en bitácoras de sesión |
| ChaFit | `Proyectos/Github/chafit360` | `d18493d` (release 35) = `origin/main` | **Privado** | Copia con SDD en `Copias para SDD/chafit360` (rama `audit/seguridad-calidad-ui`) |
| ICG Vault | `Proyectos/Github/icgbolt` | `610d99d` (v71); `origin/main` en `81ae5d2` (v72) | **Privado** | Delta de 3 commits sin cambios de arquitectura; copia con SDD en `Copias para SDD/icgbolt` |
| Auditorías | `TFM_ASTRA/Auditorias` | 23/09/2026 | Privadas | Solo se publican resúmenes saneados |
| Vídeos | `TFM/media/final` | 26/09/2026 | Locales | 7 vídeos finales + montaje combinado |
| Temario | `TFM_ASTRA/temario Master.txt` | — | — | 11 bloques, ~70 asignaturas |

## 3. El sistema SDD/TDD (núcleo)

Comprobado ejecutando sus propios controles el 26/09/2026:

- `node scripts/check-sdd.mjs` → **17 specs · 114 tareas cerradas · 20 agentes · 27 skills**, salida 0.
- `node scripts/skills-sync.mjs --check` → manifiesto y política de skills correctos.
- `npm test` → **375 comprobaciones en verde**: 183 de hooks, 61 de circuito, 38 de auditoría de traza, 25 de contexto, 26 de resumen de gates, 42 de gates de release, más el autotest de sintaxis.

| Pregunta | Respuesta (con evidencia) |
|---|---|
| ¿Qué problema resuelve? | Agentes que se autocertifican, arquitectura reelegida en cada cambio y bitácoras sin evidencia (`docs/TFM/MEMORIA.md` §2.1) |
| ¿Cómo se diseña? | Router operativo (`AGENTS.md`), perfiles de agente con territorio, skills con procedimientos, hooks y CLI deterministas, expediente durable por spec |
| ¿Qué agentes hay? | 20 en tres niveles: orquestación (1), fases (8), especialistas (12, `ux-designer` en ambos) — `docs/agents/CATALOG.md` |
| ¿Quién delega? | Solo `orchestrator`, `planner` e `implementer`; profundidad máxima 2; auditores sin escritura |
| ¿Cómo fluye una tarea? | specify → clarify → design → plan → tasks → implement (RED/GREEN/REFACTOR) → verify → ship, con 6 gates humanos |
| ¿Cómo se reduce el error? | La verificación vive fuera del modelo: `guard-write`/`guard-bash`, `run --fast/--slow`, `trace-audit` contra la base exacta, escaneo de secretos, a11y y cobertura |
| ¿Cómo se conserva el contexto? | En el repositorio: specs, ADR, bitácora, `execution-log.jsonl` append-only; `context --phase` recorta la política por fase |
| ¿Cómo interviene el humano? | Aprueba producto, arquitectura (greenfield), spec, diseño, plan y entrega; el nivel del circuito lo decide la ruta del cambio, no el agente |
| ¿Dónde se ejecuta? | Claude Code, Copilot/VS Code, Cursor, Codex, Gemini CLI y Antigravity |

## 4. Productos: hallazgos clave

### RRSS Studio (LeadView)
- Monolito modular local (Next.js 15 en `127.0.0.1`), SQLite con Prisma, Vault AES-256-GCM, 52 *Route Handlers*, SSE.
- **11 módulos · 38 funcionalidades · 17 con IA · 11 integraciones externas** ([inventario](RRSS_FUNCTIONAL_INVENTORY.md)).
- IA de texto por **Claude Code CLI** con la sesión del operador; multimedia con Gemini, fal.ai (9 modelos), HeyGen, ElevenLabs y whisper.cpp local.
- CI en Windows 11: gates SDD, instalación limpia real y E2E con proveedores simulados.

### ChaFit
- SPA React + Capacitor 8 (web/PWA, iOS, Android) sobre Supabase; 28 Edge Functions; 47 tablas; `pgmq` + `pg_cron` para miniaturas.
- **13 módulos · 62 funcionalidades · 12 con IA · 9 integraciones externas** ([inventario](CHAFIT_FUNCTIONAL_INVENTORY.md)).
- Cuatro roles (cliente, entrenador, gimnasio, superusuario), Stripe, Mapbox, Sentry con consentimiento, HealthKit/Health Connect.
- 7 specs SDD con evidencia RED/GREEN, incluida una migración sobre datos reales (317 filas inválidas → 437/437 correctas).

### ICG Vault
- Misma plataforma que ChaFit pero con la lógica de negocio en SQL (175 RPC) y 35 Edge Functions; 5 tareas programadas.
- **13 módulos · 63 funcionalidades · 4 con IA · 12 integraciones externas** ([inventario](ICGVAULT_FUNCTIONAL_INVENTORY.md)).
- Catálogo externo (TMDB, IGDB, HowLongToBeat, Metacritic, 11 RSS), economía RPG, juegos diarios y competitivos (Arena, ICG Duelo, Inmortales en piloto).
- Producción con uso real (la auditoría midió, por ejemplo, 17 402 reseñas y 1 134 avatares en Storage).

## 5. Auditorías (23/09/2026)

| Producto | Crítica | Deseable | Mínima | Total | Método |
|---|---:|---:|---:|---:|---|
| ChaFit | 15 | 32 | 6 | 53 | `orchestrator` + `database-expert` (solo MCP de lectura) + `security-auditor` + 2 × `code-reviewer` |
| ICG Vault | 16 | 19 | 13 | 48 | `orchestrator` + `security-auditor` + `code-reviewer` + `ux-designer` + consultas MCP de solo lectura |

Ambas concluyen lo mismo: **la app funciona, pero la capa de datos necesita endurecerse** (permisos y políticas), con correcciones baratas y reversibles. Se publican solo resúmenes por categoría (ver `docs/audits/`).

## 6. Vídeos

| Fichero | Duración | Producto | Contenido |
|---|---:|---|---|
| `sdd/sdd.mp4` | 4:39 | Sistema SDD | Instalación en 3 pasos, actualización, circuito, niveles y gates, 20 agentes, 27 skills, garantías, entornos, preguntas |
| `rrss-4min` / `rrss-1min` | 3:59 / 1:10 | RRSS Studio | Análisis, competencia, leads, virales, creación de contenido, laboratorio de clips, motor de IA, prueba sobre la propia plantilla del TFM |
| `chafit-4min` / `chafit-1min` | 3:44 / 1:07 | ChaFit | Cliente (entrenar, progreso, fichas, "tu máquina"), dieta y foto al plato, entrenador, gimnasio |
| `icg-vault-4min` / `icg-vault-1min` | 4:07 / 1:11 | ICG Vault | Fichas y voto, poder de voto, cofres, juegos, comunidad, multiplataforma |
| `tfm-completo` (generado) | 17:09 | Todo | SDD + los tres productos de ~4 min, con capítulos y subtítulos |
| `tfm-resumen` (generado) | 8:47 | Todo | SDD + los tres productos de ~1 min |

Todos 1920×1080, H.264/AAC, **narración sintética**, solo en local.

## 7. Discrepancias detectadas y cómo se tratan

| Discrepancia | Evidencia | Tratamiento |
|---|---|---|
| El README anterior del TFM firmaba "Jesús Chamorro" y describía `Estructura_inicial` (13 roles, Python) | `README.md` previo | Reescrito con el sistema real (v0.9.1) y el autor correcto |
| El vídeo de RRSS dice "Claude Code o el Agent SDK" (3:12) | `claude-agent-sdk.ts`: marcador que devuelve "no implementado" | Se documenta el Agent SDK como `PARCIAL`; [acción del autor](../../TFM_DELIVERY_STATUS.md) para retocar la narración si lo desea |
| El diseño de RRSS preveía Vault con passphrase/DPAPI | `vault.ts` usa clave aleatoria local | Se documenta el AS-IS |
| Migraciones de ICG Vault: 135 en producción, 136 en el repositorio | auditoría 23/09 | Se refleja en la vista de despliegue |
| ChaFit: arnés SDD instalado sin versionar | `git ls-files` solo incluye `docs/` | Se distingue expediente versionado (7 specs, 2 ADR) de arnés local |

## 8. Riesgos para la entrega

1. **Repositorios privados** (ChaFit, ICG Vault): el tribunal necesitará acceso de lectura.
2. **Credenciales demo**: publicarlas en un README público mientras las críticas de control de acceso sigan abiertas expone datos de usuarios reales. Recomendación: entregarlas solo en el formulario privado hasta cerrar las críticas. *Actualización 28/09/2026: el autor decidió publicarlas en la slide 2 y el README con condiciones; ver [seguridad](../security/security.md#credenciales-demo-criterio).*
3. **Vídeo con narración sintética**: las bases piden un vídeo en el que el autor explique el proyecto; conviene confirmarlo con el tutor o grabar una introducción con voz propia.
4. **Vídeos solo en local**: hay que publicarlos (GitHub Release + reproductor en Pages, o YouTube) para que los enlaces funcionen.

Todos estos puntos están como `ACCIÓN REQUERIDA DEL AUTOR` en [`TFM_DELIVERY_STATUS.md`](../../TFM_DELIVERY_STATUS.md).

## 9. Criterio de recuento (común)

- **Funcionalidad:** capacidad que un actor puede usar, con entrada, resultado y punto de entrada en el código. No se cuentan botones ni variantes visuales.
- **Módulo:** área funcional según la navegación del producto.
- **Integración externa:** servicio de terceros al que el sistema se conecta en tiempo de ejecución (API, SDK, OAuth, webhook, plugin del SO), por proveedor. Las tiendas de apps son distribución y se cuentan aparte; las herramientas locales sin red también.

| | Módulos | Funcionalidades | Con IA | Integraciones externas |
|---|---:|---:|---:|---:|
| RRSS Studio | 11 | 38 | 17 | 11 (+5 herramientas locales) |
| ChaFit | 13 | 62 | 12 | 9 (+ App Store / Google Play) |
| ICG Vault | 13 | 63 | 4 | 12 (+ App Store / Google Play) |
| **Total** | **37** | **163** | **33** | — |
