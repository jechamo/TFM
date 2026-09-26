# RRSS Studio (LeadView) · Inventario de arquitectura (AS-IS)

> Copia local `Claude-cowork/RRSS` (prioritaria) = `main` remoto `f6510e0` · repositorio público `jechamo/rrss-automation-app` · inspección 26/09/2026.
> Tablas generadas desde [`architecture/model/rrss.json`](../../architecture/model/rrss.json).

## Forma de la arquitectura

RRSS Studio es un **monolito modular local**: un único proceso Node (Next.js 15) sirve la interfaz y 52 *Route Handlers*, y ejecuta en el mismo proceso los pipelines de análisis y producción. Persiste en **SQLite** (Prisma, 11 modelos) y en el sistema de ficheros (`data/`), y guarda las claves en un **Vault AES-256-GCM** con clave local. Escucha solo en `127.0.0.1`: es mono-usuario y no tiene cuentas.

La IA de texto no usa una API key: el servidor lanza **Claude Code CLI** como subproceso (`claude -p --output-format json --allowedTools …`) con la sesión del operador. Los medios usan adaptadores HTTPS (Gemini, fal.ai, HeyGen, ElevenLabs) y herramientas locales (FFmpeg, yt-dlp, Playwright, whisper.cpp). El progreso de cada pipeline llega a la interfaz por **Server-Sent Events** desde un bus de eventos en memoria.

![Contenedores de RRSS Studio](../../architecture/exported/svg/rrss-container.svg)

## Componentes

<!-- BEGIN:gen:rrss-components -->
| Componente | Tipo | Tecnología | Responsabilidad | Conecta con | Evidencia |
|---|---|---|---|---|---|
| **Operador** | Persona | creador de contenido o equipo de producto | Crea proyectos, revisa análisis, aprueba gastos y publica | → Interfaz web | `README.md (zonas de la aplicación)` |
| **Interfaz web** | Contenedor | React 19 · App Router · Tailwind 4 · React Flow · Zustand · React Query | Panel, proyectos, grafo de pipeline, editores, estudio, laboratorio de clips y ajustes | → Servidor Next.js · ← Operador | `src/app/page.tsx`; `src/components/PipelineGraph.tsx` |
| **Servidor Next.js** | Contenedor | Next.js 15 · 52 route.ts · REST + SSE · monolito modular | Route Handlers y todo el dominio en un proceso: pipelines, IA, medios, clips, Vault y conectores | → SQLite · → Vault cifrado · → Almacén de medios · → Claude Code CLI · → Playwright + Chromium · → FFmpeg · ffprobe · → yt-dlp · → whisper.cpp · → Google Gemini · → fal.ai · → HeyGen · → ElevenLabs · → Scrape Creators · → GitHub · → App web objetivo · ← Interfaz web | `package.json (next 15.5.23)`; `src/app/api/ (52 route.ts)`; `docs/architecture/adr/ (monolito modular local)` |
| **SQLite** | Contenedor | Prisma 6 · 11 modelos | Proyectos, runs, dossier, competencia, leads, virales, piezas, medios, MIX y estado de conectores | ← Servidor Next.js | `prisma/schema.prisma` |
| **Vault cifrado** | Contenedor | AES-256-GCM · clave local · lock | Claves de proveedores y credenciales de la app objetivo cifradas en reposo | ← Servidor Next.js | `src/core/secrets/vault.ts` |
| **Almacén de medios** | Contenedor | data/ · vídeos, logos, MIX, jobs de clips | Vídeos, audios, logos, composiciones MIX y trabajos del laboratorio de clips | ← Servidor Next.js | `src/core/media/storage.ts`; `src/core/clips/storage.ts` |
| **Claude Code CLI** | Herramienta local | claude -p · JSON · --allowedTools | Ejecuta las tareas de texto de IA con la sesión local de Claude Code | → Anthropic · Claude · ← Servidor Next.js | `src/core/ai/claude-cli.ts:135` |
| **Playwright + Chromium** | Herramienta local | login, rutas y grabación | Login, verificación de rutas y grabación automática de la app objetivo | ← Servidor Next.js | `src/core/media/recorder.ts`; `src/core/media/auth-session.ts` |
| **FFmpeg · ffprobe** | Herramienta local | montaje, subtítulos, MIX | Montaje, recortes, subtítulos, MIX y validación de medios | ← Servidor Next.js | `src/core/media/ffmpeg.ts`; `src/core/media/assemble.ts` |
| **yt-dlp** | Herramienta local | vídeo y subtítulos públicos | Descarga de vídeo y subtítulos públicos | → YouTube · TikTok · Instagram · ← Servidor Next.js | `src/core/media/ytdlp.ts` |
| **whisper.cpp** | Herramienta local | transcripción local (small) | Transcripción local sin coste de API | ← Servidor Next.js | `src/core/clips/local-transcription.ts:12` |
| **Anthropic · Claude** | Sistema externo | sesión del operador · WebSearch/WebFetch | Modelos Claude detrás de la CLI; búsqueda web para leads y virales | ← Claude Code CLI | `src/core/ai/claude-cli.ts`; `src/core/leads/discover.ts:69` |
| **Google Gemini** | Sistema externo | generateContent · comprensión de vídeo | Comprensión de vídeo para virales y laboratorio de clips | ← Servidor Next.js | `src/core/media/gemini.ts:17` |
| **fal.ai** | Sistema externo | cola de vídeo · 9 modelos | Generación de cortes de vídeo con modelos del catálogo | ← Servidor Next.js | `src/core/media/fal.ts`; `src/core/media/contracts.ts` |
| **HeyGen** | Sistema externo | API v3 · avatar y voz | Vídeo de presentador con avatar y voz | ← Servidor Next.js | `src/core/media/heygen.ts` |
| **ElevenLabs** | Sistema externo | TTS · eleven_multilingual_v2 | Locución a partir de texto | ← Servidor Next.js | `src/core/media/elevenlabs.ts:45` |
| **Scrape Creators** | Sistema externo | búsqueda y métricas de virales | Búsqueda estructurada de virales y métricas de autores | ← Servidor Next.js | `src/core/virales/scrape-creators.ts` |
| **GitHub** | Sistema externo | git clone · API de usuario | Clonado de repositorios para analizar código | ← Servidor Next.js | `src/core/repo/index.ts:216`; `src/core/connectors/index.ts:143` |
| **App web objetivo** | Sistema externo | la web que se analiza y graba | La web que se analiza, recorre y graba | ← Servidor Next.js | `src/core/crawler/index.ts`; `src/core/media/recorder.ts` |
| **YouTube · TikTok · Instagram** | Sistema externo | fuentes de vídeo · subida asistida | Fuente de vídeos de referencia y destino de la publicación asistida | ← yt-dlp | `src/core/media/ytdlp.ts`; `src/core/content/publish.ts:18` |
| **GitHub Actions** | Infraestructura / entrega | gates SDD · instalación limpia y E2E en Windows 11 | Gates SDD, instalación limpia y E2E simulado en Windows 11 |  | `.github/workflows/sdd-gates.yml` |
| **Autor + agentes SDD** | Infraestructura / entrega | Claude Code / Codex · kit SDD 0.9.1 | Desarrollo guiado por requisitos con agentes y el kit SDD |  | `.sdd/installed.json`; `docs/01-requisitos.md` |
| **Instalador guiado** | Contenedor | preparar.bat · check → prepare → start | Diagnóstico, preparación con consentimiento, build y arranque verificado |  | `scripts/install-local.mjs`; `scripts/prepare-guide.mjs` |
<!-- END:gen:rrss-components -->

## Integraciones con terceros

<!-- BEGIN:gen:rrss-integrations -->
| Integración | Proveedor | Función | Entrada | Salida | Evidencia |
|---|---|---|---|---|---|
| HTTPS · sesión del operador | **Anthropic · Claude** | Modelos Claude detrás de la CLI; búsqueda web para leads y virales | prompts de dossier, mapa, competencia, leads, virales y guiones | — | `src/core/ai/claude-cli.ts` |
| descarga | **YouTube · TikTok · Instagram** | Fuente de vídeos de referencia y destino de la publicación asistida | vídeo público y subtítulos | — | `src/core/clips/youtube-captions.ts` |
| HTTPS REST | **Google Gemini** | Comprensión de vídeo para virales y laboratorio de clips | vídeo o URL de YouTube + prompt | descripción o JSON de momentos | `src/core/media/gemini.ts:17` |
| HTTPS · cola + polling | **fal.ai** | Generación de cortes de vídeo con modelos del catálogo | prompt visual | corte de vídeo | `src/core/media/fal.ts` |
| HTTPS REST v3 + polling | **HeyGen** | Vídeo de presentador con avatar y voz | guion, voz, foto | vídeo de presentador | `src/core/media/heygen.ts` |
| HTTPS REST | **ElevenLabs** | Locución a partir de texto | texto + voz | MP3 | `src/core/media/elevenlabs.ts:45` |
| HTTPS REST | **Scrape Creators** | Búsqueda estructurada de virales y métricas de autores | consultas | vídeos y métricas públicas | `src/core/virales/scrape-creators.ts:30` |
| git clone --depth 1 · REST | **GitHub** | Clonado de repositorios para analizar código | código fuente para resumir | — | `src/core/repo/index.ts:216` |
| HTTP fetch (crawl) · Playwright | **App web objetivo** | La web que se analiza, recorre y graba | HTML, rutas, grabación de pantalla | — | `src/core/crawler/index.ts` |
<!-- END:gen:rrss-integrations -->

## Superficie medida

| Métrica | Valor | Método |
|---|---:|---|
| Páginas App Router | 7 | `find src/app -name page.tsx` |
| Ficheros de API (`route.ts`) | 52 | `git ls-files src/app/api` (3 son rutas de E2E) |
| Componentes | 36 | `ls src/components` (sin tests) |
| Módulos de dominio en `src/core` | 16 | `ls src/core` |
| Modelos Prisma | 11 | `^model` en `prisma/schema.prisma` |
| Ficheros de prueba | 25 en `src/` + 2 E2E | `*.test.*` y `e2e/*.spec.ts` |
| Requisitos SDD | 18 (REQ-001…018, sin 017) | `docs/01-requisitos.md` |
| Specs del kit SDD | 2 (001, 002) | `docs/specs/` |
| Historia | 79 commits · el primero, la especificación | `git log --reverse` |

## Decisiones de arquitectura verificadas

| Decisión | Dónde consta | Estado en el código |
|---|---|---|
| Un solo lenguaje (TypeScript) y un solo proceso | `docs/03-arquitectura.md` §1 | Cumplida |
| Motor de IA seleccionable CLI / Agent SDK | `docs/03-arquitectura.md` §4 | **Parcial**: CLI operativo; Agent SDK es un marcador que devuelve "no implementado" |
| Secretos cifrados, nunca en `.env` | `docs/03-arquitectura.md` §7 | Cumplida con **clave aleatoria local** (`data/.vaultkey`), no con passphrase/DPAPI como proponía el diseño |
| Progreso en vivo por SSE y reintento por nodo | §6 | Cumplida |
| Publicación asistida, sin API de redes | REQ-010 | Cumplida: abre la página de subida; publica la persona |
| E2E sin red ni créditos | spec 002 | Cumplida: perfil `mock`, guarda de salida solo loopback |

Vistas relacionadas: [contexto](../../architecture/exported/svg/rrss-context.svg) · [integraciones](../../architecture/exported/svg/rrss-integrations.svg) · [despliegue](../../architecture/exported/svg/rrss-deployment.svg) · [análisis REQ-001](../../architecture/exported/svg/rrss-seq-analysis.svg) · [del guion al vídeo](../../architecture/exported/svg/rrss-seq-content.svg) · [documento de arquitectura](../architecture/rrss-architecture.md).
