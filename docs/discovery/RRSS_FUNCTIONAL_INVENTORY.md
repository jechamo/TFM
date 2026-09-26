# RRSS Studio (LeadView) · Inventario funcional

> Inspección de código: 26/09/2026 · **Fuente prioritaria: copia local** `Claude-cowork/RRSS` (prevalece sobre GitHub) · commit local = `main` remoto = `f6510e0` · repositorio público [`jechamo/rrss-automation-app`](https://github.com/jechamo/rrss-automation-app).
> En la interfaz el producto se llama **LeadView**; en el repositorio, RRSS Studio. Autor: Jorge Chamorro.

## Cómo se ha construido

Recorrido de las 7 páginas de `src/app`, los 52 ficheros `route.ts` de la API interna, los 36 componentes de `src/components`, los 16 módulos de `src/core`, el esquema Prisma (11 modelos) y los requisitos `REQ-001…018` de `docs/01-requisitos.md`. La copia local tiene cambios sin confirmar (bitácoras de sesión y `agent-audit.jsonl`); no afectan a la funcionalidad.

**Criterio de recuento** (común a los tres productos): *funcionalidad* = capacidad que un actor puede usar, con entrada, resultado y punto de entrada en el código; *módulo* = área funcional según la navegación del producto.

**Resultado: 11 módulos · 38 funcionalidades.**

RRSS Studio es una **aplicación local** (`127.0.0.1:3000`), no un servicio desplegado. Por eso el estado `PRODUCCIÓN` no aplica y se usa: `ACTIVA` (implementada, en `main` y usable en la app local; se indica el minuto del vídeo `rrss-4min` si aparece) · `PARCIAL` · `EXPERIMENTAL` · `PENDIENTE DE VERIFICAR` (necesita cuenta o créditos de un proveedor que no se han consumido).

Actores: **O** operador (creador de contenido o equipo de producto) · **D** desarrollador/evaluador.

## Inventario

| ID · Módulo | Funcionalidad | Descripción | Actor | Frontend | Backend | Datos | IA | Integraciones | Mobile | Evidencia | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| RS-01 · Proyectos y panel | Panel de proyectos y piezas | Carruseles de proyectos analizados y de piezas recientes | O | `DashboardHub`, `ProjectsCarousel`, `DashboardPiecesCarousel` | `api/projects` | `Project`, `ContentPiece` | — | — | Web adaptable | `src/app/page.tsx`; vídeo 0:24 | ACTIVA |
| RS-02 · Proyectos y panel | Alta de proyecto | URL de la app, logo, contexto y fuente de código: carpeta local, GitHub público/privado o ninguna | O | `app/proyecto/nuevo` | `api/projects` (POST) | `Project` | — | GitHub (opcional) | — | `src/app/api/projects/route.ts`; vídeo 0:36 | ACTIVA |
| RS-03 · Proyectos y panel | Relanzar, editar y borrar | Volver a ejecutar el análisis o eliminar un proyecto con sus datos | O | `app/proyecto/[id]` | `api/projects/[id]`, `…/rerun` | `Project`, `Run` | — | — | — | `src/app/api/projects/[id]/rerun/route.ts` | ACTIVA |
| RS-04 · Proyectos y panel | Identidad de marca | Subir logo y usarlo en los cierres de los vídeos | O | editor de proyecto | `…/logo`, `media/brand-outro.ts` | `Project.logoPath` | — | — | Salida vídeo | `src/app/api/projects/[id]/logo/route.ts` | ACTIVA |
| RS-05 · Análisis de producto | Pipeline de análisis visual | Grafo de nodos que se iluminan en vivo (SSE) con logs y reintento por nodo | O | `PipelineGraph` (React Flow) | `pipeline/engine.ts`, `bus.ts`, `api/runs/[id]/stream` | `Run` | — | — | — | `src/core/pipeline/req001.ts`; vídeo 0:48 | ACTIVA |
| RS-06 · Análisis de producto | Rastreo de la web | Descarga el HTML de la app objetivo y extrae contenido y navegación | O | — | `core/crawler` | artefactos del run | — | App web objetivo | — | `src/core/crawler/index.ts` | ACTIVA |
| RS-07 · Análisis de producto | Lectura del código fuente | Clona (`git clone --depth 1`) o lee la carpeta y resume estructura y rutas | O | — | `core/repo` | resumen temporal | — | Git / GitHub | — | `src/core/repo/index.ts:216` | ACTIVA |
| RS-08 · Análisis de producto | Mapa funcional de la app | Árbol de hasta tres niveles con ruta, condiciones y evidencias de dónde sale en el código | O | `NavigationMapPanel` | `core/navigation/generate.ts` | `NavigationMap` | Claude | Web + código | Detecta menús móviles | `src/core/navigation/generate.ts`; vídeo 0:54 | ACTIVA |
| RS-09 · Análisis de producto | Verificación de rutas con navegador | Recorre el mapa con Playwright y marca rutas verificadas; soporta login de la app | O | `NavigationMapPanel` | `…/navigation/verify`, `media/auth-session.ts` | estado del mapa | — | Playwright/Chromium | Emulación móvil | `src/app/api/projects/[id]/navigation/verify/route.ts`; vídeo 1:00 | ACTIVA |
| RS-10 · Análisis de producto | Dossier de negocio | Propuesta de valor, público, funcionalidades y llamadas a la acción; editable y aprobable | O | `DossierEditor` | `core/dossier/generate.ts` | `Dossier` | Claude | — | — | `src/app/api/dossier/[projectId]/route.ts`; vídeo 1:06 | ACTIVA |
| RS-11 · Competencia | Descubrir competidores | Propone competidores o acepta los indicados y los rastrea | O | `CompetenciaPanel` | `pipeline/req002.ts`, `competencia/discover.ts` | `Competencia` | Claude | Webs de competidores | — | `src/core/competencia/discover.ts`; vídeo 1:18 | ACTIVA |
| RS-12 · Competencia | Comparativa editable | Puntuación, pros, contras y diferenciación frente a cada competidor; ampliar sin duplicar | O | `CompetenciaEditor`, `EntityLogo` | `competencia/generate.ts` | `Competencia` | Claude | Clearbit / favicons de Google (logos) | — | `src/components/EntityLogo.tsx:60`; vídeo 1:24 | ACTIVA |
| RS-13 · Leads | Clientes potenciales reales | Perfiles objetivo y negocios públicos localizados con búsqueda web, sobre mapa | O | `LeadsPanel`, `MiniMap` | `leads/research.ts`, `leads/discover.ts` | `Leads` | Claude + WebSearch/WebFetch | Web pública; Google Maps (embed) | — | `src/core/leads/discover.ts:69`; vídeo 1:30 | ACTIVA |
| RS-14 · Leads | Estrategia de captación | Motivo de encaje, guion de visita y correo para cada lead | O | `LeadsEditor` | `leads/strategy.ts` | `Leads` | Claude | — | — | `src/core/leads/strategy.ts`; vídeo 1:42 | ACTIVA |
| RS-15 · Leads | Recalibrar puntuaciones | Recalcula la puntuación de los leads con reglas deterministas | O | `ScoreBar` | `…/recalibrate`, `leads/calibration.ts` | `Leads` | — (reglas) | — | — | `src/core/leads/calibration.ts` (+ test) | ACTIVA |
| RS-16 · Virales | Descubrir virales del nicho | YouTube, TikTok e Instagram del último periodo mediante IA, Scrape Creators o modo híbrido | O | `ViralesPanel` | `pipeline/req004.ts`, `virales/discover.ts` | `Virales` | Claude | Scrape Creators (opcional) | Formatos verticales | `src/core/virales/scrape-creators.ts`; vídeo 1:48 | ACTIVA |
| RS-17 · Virales | Métricas y contexto del autor | Ratio de viralidad verificado o estimado con historial del autor; caché y límite de créditos | O | `ViralesEditor` | `virales/scrape-creators-cache.ts` | `Virales` | — | Scrape Creators | — | `src/core/virales/scrape-creators-contracts.ts` (+ test) | ACTIVA |
| RS-18 · Virales | Patrones transferibles | Gancho, estructura y detonante de cada viral aplicado al proyecto | O | `ViralesEditor` | `virales/analyze.ts` | `Virales` | Claude | — | — | `src/core/virales/analyze.ts`; vídeo 1:54 | ACTIVA |
| RS-19 · Producción de contenido | Clonar el formato de un viral | Guion original, escaleta, copy y hashtags a partir de un patrón | O | `GenerateContentModal` | `pipeline/req005.ts`, `content/guion.ts` | `ContentPiece` (origen viral) | Claude; Gemini opcional | — | Vertical 9:16 | `src/core/content/guion.ts`; vídeo 2:00 | ACTIVA |
| RS-20 · Producción de contenido | Demo de la propia app | Propone funcionalidades a enseñar y el guion de la demo | O | `DemoContentModal` | `content/demo.ts`, `…/functions` | `ContentPiece` (origen propio) | Claude | Código/URL objetivo | Plan móvil emulado | `src/core/content/demo.ts`; vídeo 2:06 | ACTIVA |
| RS-21 · Producción de contenido | Grabación automática de la demo | Inicia sesión, navega los pasos declarados y graba la pantalla sola; alternativa de subida manual | O | `DemoContentModal` | `media/recorder.ts`, `…/demo/dryrun` | grabación | — | Playwright/Chromium | Emulación iPhone | `src/core/pipeline/req006.ts`; vídeo 2:30 | ACTIVA |
| RS-22 · Producción de contenido | Plan audiovisual y coste | Segundos de grabación real frente a IA, cortes, voz y coste estimado antes de gastar | O | `VisualPlanCard`, `MediaProviderConfigurator` | `media/planning.ts`, `media/pricing.ts` | plan de la pieza | Claude (plan) | Catálogos fal/HeyGen/ElevenLabs | 9:16 | `src/core/media/pricing.ts`; vídeo 2:12–2:24 | ACTIVA |
| RS-23 · Producción de contenido | Revisión de prompts antes de fal.ai | Muestra y permite editar cada prompt visual antes de autorizar el gasto | O | `FalPromptReviewPanel` | `…/content/plan` | plan | — | fal.ai | — | `src/components/FalPromptReviewPanel.tsx`; vídeo 2:24 | ACTIVA |
| RS-24 · Producción de contenido | Vídeo generado con IA | Cortes de vídeo con 9 modelos (Seedance, Kling, Veo 3.1, Luma) en cola y *polling* | O | configurador | `media/fal.ts` | assets de la pieza | fal.ai | fal.ai | Vertical | `src/core/media/contracts.ts` | PENDIENTE DE VERIFICAR (créditos) |
| RS-25 · Producción de contenido | Presentador con avatar | Voces y *looks*, foto propia como avatar y vídeo del presentador | O | configurador HeyGen | `media/heygen.ts` | assets | HeyGen | HeyGen | 9:16 | `src/core/media/heygen.ts` | PENDIENTE DE VERIFICAR (créditos) |
| RS-26 · Producción de contenido | Locución | Texto a voz con la voz elegida (`eleven_multilingual_v2`) | O | selector de voz | `media/elevenlabs.ts` | `locucion.mp3` | ElevenLabs | ElevenLabs | — | `src/core/media/elevenlabs.ts:45` | PENDIENTE DE VERIFICAR (créditos) |
| RS-27 · Producción de contenido | Montaje final y remontaje | Une grabación, IA, voz y subtítulos con FFmpeg; remonta sin regenerar medios | O | `PieceCarousel` | `media/assemble.ts`, `pipeline/req006-refresh.ts` | vídeo final | — | FFmpeg/ffprobe | 9:16 | `src/core/media/assemble.ts`; vídeo 2:30 | ACTIVA |
| RS-28 · Bandeja y publicación | Bandeja de contenido | Lista, carrusel y detalle sincronizados; editar, previsualizar, descargar y borrar | O | `ContentTray`, `PieceCarousel` | `api/content/*`, `content/selection.ts` | `ContentPiece` | — | — | Web adaptable | `src/components/ContentTray.test.tsx`; spec 001 | ACTIVA |
| RS-29 · Bandeja y publicación | Publicación asistida | Descarga el vídeo, copia el texto y abre la página de subida de cada red; el humano publica | O | `PublishModal` | `content/publish.ts` | `publishedTo/At` | Copy generado antes | YouTube, TikTok, Instagram (web) | — | `src/core/content/publish.ts:18` | ACTIVA |
| RS-30 · Estudio multimedia | Mediateca | Subir, listar, renombrar y borrar audio y vídeo por proyecto | O | `MediaStudio` | `…/media`, `media/library.ts` | `MediaAsset` | — | ffprobe | — | `src/app/api/projects/[id]/media/route.ts` | ACTIVA |
| RS-31 · Estudio multimedia | Grabación REC/STOP | Grabar la pantalla desde el navegador y guardarla como recurso | O | `SelfRecordModal` | ingesta de medios | `MediaAsset` | — | API de captura del navegador | — | `src/components/SelfRecordModal.tsx` | ACTIVA |
| RS-32 · Estudio multimedia | Editor MIX con línea de tiempo | Componer recursos, locución y subtítulos; borrador y render final | O | `MixStudioPanel` | `media/mix.ts`, `…/mixes` | `MixComposition` | — | FFmpeg | Vertical | `src/core/media/mix-contracts.ts`; vídeo 2:42 | ACTIVA |
| RS-33 · Laboratorio de clips | Ingesta y selección de momentos | Vídeo local o enlace de YouTube; selección con IA o con JSON editorial | O | `ClipLab` (`/clips`) | `clips/processor.ts`, `clips/analyze.ts` | jobs JSON en disco | Gemini (modo IA) | yt-dlp, Gemini | Cortes 9:16 | `src/app/api/clips/route.ts`; vídeo 3:00 | ACTIVA |
| RS-34 · Laboratorio de clips | Subtítulos y render vertical | Prioriza subtítulos editoriales, luego CC de YouTube y por último Whisper local | O | `ClipLab` | `clips/render.ts`, `clips/local-transcription.ts` | cortes | Whisper local; Gemini opcional | FFmpeg, whisper.cpp, yt-dlp | 9:16 subtitulado | `src/core/clips/local-transcription.ts:12`; vídeo 2:54 | ACTIVA |
| RS-35 · Laboratorio de clips | Reanudar, reintentar y limpiar | Reanuda trabajos pendientes, regenera un corte y borra derivados | O | `ClipLab` | `…/resume`, `…/retry`, `…/regenerate` | estado por corte | — | — | — | `src/core/clips/storage.ts` | ACTIVA |
| RS-36 · Ajustes y secretos | Motor de IA, proveedores y herramientas | Elegir motor y modelo; guardar y probar claves; detectar FFmpeg, yt-dlp, Chromium y Whisper | O | `app/ajustes` | `core/connectors`, `api/system/tools`, `core/settings.ts` | `ConnectorState`, Vault | Claude CLI operativo · Agent SDK sin implementar | Todos los proveedores | — | `src/core/ai/claude-agent-sdk.ts`; vídeo 3:06–3:24 | PARCIAL (motor Agent SDK es un marcador) |
| RS-37 · Ajustes y secretos | Credenciales cifradas | Claves de proveedores y login de la app objetivo en un Vault AES-256-GCM; la API nunca devuelve el valor | O | Ajustes, formulario de proyecto | `core/secrets/vault.ts`, `…/login` | `vault.enc` + `.vaultkey` | — | — | — | `src/core/secrets/vault.ts` (+ test) | ACTIVA |
| RS-38 · Operación y calidad | Instalador guiado, E2E offline y guía | `preparar.bat` con diagnóstico y consentimientos; E2E con proveedores simulados y red bloqueada; guía integrada | O/D | consola, `app/guia` | `scripts/install-local.mjs`, `runtime/egress-policy.ts`, `testing/mock-providers.ts` | entorno aislado `.e2e-runtime/` | Motor simulado | — (sin red) | — | specs 001 y 002; `e2e/full-flows.spec.ts` | ACTIVA |

## Resumen por módulo

| Módulo | Funcionalidades | Mostradas en vídeo | Invocan IA |
|---|---:|---:|---:|
| Proyectos y panel | 4 | 2 | 0 |
| Análisis de producto | 6 | 4 | 2 |
| Competencia | 2 | 2 | 2 |
| Leads | 3 | 2 | 2 |
| Virales | 3 | 2 | 2 |
| Producción de contenido | 9 | 6 | 6 |
| Bandeja y publicación | 2 | 0 | 0 |
| Estudio multimedia | 3 | 1 | 0 |
| Laboratorio de clips | 3 | 2 | 2 |
| Ajustes y secretos | 2 | 1 | 1 |
| Operación y calidad | 1 | 0 | 0 |
| **Total** | **38** | **22** | **17** |

RRSS Studio es el producto con más IA por funcionalidad: 17 de 38 invocan un modelo (Claude mediante la CLI, Gemini, fal.ai, HeyGen, ElevenLabs o Whisper local).

## Alcance real (para la defensa)

- **No publica automáticamente** en redes: prepara la pieza y abre la página de subida; publica la persona.
- **No es una app móvil**: produce vídeo vertical y emula un navegador móvil para grabar demos.
- El motor **Agent SDK** aparece en Ajustes (y en la narración del vídeo, 3:12), pero en el código es un marcador que devuelve "no implementado". El motor operativo es **Claude Code CLI** con la sesión local del operador.
- Las generaciones de pago (fal.ai, HeyGen, ElevenLabs, Scrape Creators) se verifican en E2E con proveedores simulados; no se han consumido créditos para este inventario.

Relacionado: [inventario de arquitectura](RRSS_ARCHITECTURE_INVENTORY.md) · [integraciones](RRSS_INTEGRATIONS.md) · [mapa funcional](../case-studies/rrss-functional-map.md) · [caso de estudio](../case-studies/rrss.md).
