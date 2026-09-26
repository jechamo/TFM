# RRSS Studio (LeadView) · Integraciones e IA

> Copia local = `main` `f6510e0` · inspección de código 26/09/2026. No se han hecho peticiones de pago, autenticaciones ni publicaciones. Las claves se describen por su nombre en Ajustes, nunca por su valor.

**Criterio de recuento** (común a los tres productos). Resultado: **11 integraciones externas** — Anthropic (vía Claude Code CLI y sus herramientas WebSearch/WebFetch), Google Gemini, fal.ai, HeyGen, ElevenLabs, Scrape Creators, GitHub, la app web objetivo, YouTube/TikTok/Instagram (fuentes y publicación asistida), Google Maps (mapa embebido de leads) y Clearbit/favicons de Google (logos de competidores). Aparte, **5 herramientas locales** sin red: Claude Code CLI (binario), FFmpeg/ffprobe, yt-dlp, Playwright/Chromium y whisper.cpp.

![Integraciones externas de RRSS Studio](../../architecture/exported/svg/rrss-integrations.svg)

## Matriz de conexiones con terceros

<!-- BEGIN:gen:rrss-matrix -->
| Servicio | Tipo | Función | Desde | Hacia | Protocolo | Auth | Datos intercambiados | Evidencia |
|---|---|---|---|---|---|---|---|---|
| **Anthropic · Claude** | IA | Modelos Claude detrás de la CLI; búsqueda web para leads y virales | Claude Code CLI | Anthropic · Claude | HTTPS (gestionado por la CLI) · síncrono | login de Claude Code (sin API key en la app) | prompts de dossier, mapa, competencia, leads, virales y guiones | `src/core/ai/claude-cli.ts` |
| **YouTube · TikTok · Instagram** | Redes sociales | Fuente de vídeos de referencia y destino de la publicación asistida | yt-dlp | YouTube · TikTok · Instagram | HTTPS (yt-dlp) · síncrono | sin credencial | vídeo público y subtítulos | `src/core/clips/youtube-captions.ts` |
| **Google Gemini** | IA | Comprensión de vídeo para virales y laboratorio de clips | Servidor Next.js | Google Gemini | HTTPS REST · síncrono | API key del Vault | vídeo o URL de YouTube + prompt → descripción o JSON de momentos | `src/core/media/gemini.ts:17` |
| **fal.ai** | IA | Generación de cortes de vídeo con modelos del catálogo | Servidor Next.js | fal.ai | HTTPS · cola + polling · síncrono | Authorization: Key (Vault) | prompt visual → corte de vídeo | `src/core/media/fal.ts` |
| **HeyGen** | IA | Vídeo de presentador con avatar y voz | Servidor Next.js | HeyGen | HTTPS REST v3 + polling · síncrono | API key del Vault | guion, voz, foto → vídeo de presentador | `src/core/media/heygen.ts` |
| **ElevenLabs** | IA | Locución a partir de texto | Servidor Next.js | ElevenLabs | HTTPS REST · síncrono | xi-api-key (Vault) | texto + voz → MP3 | `src/core/media/elevenlabs.ts:45` |
| **Scrape Creators** | API / datos | Búsqueda estructurada de virales y métricas de autores | Servidor Next.js | Scrape Creators | HTTPS REST · síncrono | API key del Vault | consultas → vídeos y métricas públicas | `src/core/virales/scrape-creators.ts:30` |
| **GitHub** | Código | Clonado de repositorios para analizar código | Servidor Next.js | GitHub | git clone --depth 1 · REST · síncrono | token opcional (Vault) para privados | código fuente para resumir | `src/core/repo/index.ts:216` |
| **App web objetivo** | API / datos | La web que se analiza, recorre y graba | Servidor Next.js | App web objetivo | HTTP fetch (crawl) · Playwright · síncrono | login cifrado por proyecto | HTML, rutas, grabación de pantalla | `src/core/crawler/index.ts` |
<!-- END:gen:rrss-matrix -->

Complementos de interfaz (sin credencial): mapa de leads embebido de Google Maps (`src/components/MiniMap.tsx:17`) y logos de competidores desde Clearbit con respaldo en favicons de Google (`src/components/EntityLogo.tsx:60`).

## Inventario de IA

RRSS Studio es el producto con **más IA por funcionalidad: 17 de 38**. Combina un motor de texto intercambiable (`AiEngine`) con proveedores multimedia y transcripción local.

| Uso | Proveedor · modelo | Endpoint / SDK | Origen → destino | Entrada | Salida | Configuración | Fallback | Control de coste | Seguridad | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|
| Mapa funcional, dossier, competencia, leads, virales, guiones, demo | Anthropic · alias del CLI (`default`, `sonnet`, `opus`, `haiku`) | Claude Code CLI `-p --output-format json --allowedTools Skill[,WebSearch,WebFetch]` | Servidor → subproceso → Anthropic | prompts de dominio con crawl, código, dossier o patrones | JSON por dominio | motor y modelo en Ajustes | mapa degrada al crawl si la IA falla; errores por JSON inválido | usa la sesión del operador, no una API key | herramientas mínimas por tarea; la app no maneja la credencial | `src/core/ai/claude-cli.ts:135-144` |
| Motor alternativo | Claude Agent SDK | — | — | — | — | seleccionable en Ajustes | devuelve "no implementado" | — | — | `src/core/ai/claude-agent-sdk.ts` (**marcador**) |
| Comprensión de vídeo | Google · `gemini-3.6-flash` (sustituible por `GEMINI_VIDEO_MODEL`) | REST `generateContent` + subida de ficheros | Servidor → Gemini | URL de YouTube o vídeo + prompt | descripción o JSON de momentos | modo del laboratorio de clips | el enriquecimiento de virales es opcional; borra ficheros remotos al terminar | se usa solo en modos que lo piden | API key del Vault | `src/core/media/gemini.ts:17` |
| Cortes de vídeo | fal.ai · 9 modelos (Seedance 1.0/2.0, Kling 2.5/3.0, Veo 3.1, Luma Ray 2) | cola `queue.fal.run` + *polling* | Servidor → fal.ai | prompt visual, duración, aspecto | clip descargado a `data/` | modelo por pieza | reintento con otra duración ante 4xx; *timeout* explícito | plan y coste estimado **antes** de generar; máximo de cortes por pieza; aprobación humana | `Key` del Vault | `src/core/media/contracts.ts`, `src/core/media/fal.ts` |
| Presentador con avatar | HeyGen · API v3 | REST + *polling* | Servidor → HeyGen | guion, voz, foto o audio propio | vídeo del presentador | voz y *look* en el configurador | reintentos de catálogo y *polling* | coste estimado previo | API key del Vault | `src/core/media/heygen.ts` |
| Locución | ElevenLabs · `eleven_multilingual_v2` | REST `text-to-speech/{voiceId}` | Servidor → ElevenLabs | texto + voz | `locucion.mp3` | voz seleccionable | voz por defecto si falta selección | coste estimado previo | `xi-api-key` del Vault | `src/core/media/elevenlabs.ts:45` |
| Transcripción de clips | whisper.cpp 1.9.1 · `ggml-small.bin` (local) | binario local | Servidor → proceso local | audio del corte | texto con tiempos | solo si faltan subtítulos editoriales o CC de YouTube | sin binario, se informa de la limitación | coste de API cero | no sale de la máquina | `src/core/clips/local-transcription.ts:12` |
| Pruebas E2E | Motor simulado (`MockAiEngine`) y proveedores falsos | — | Servidor → *fakes* locales | escenarios | respuestas deterministas | perfil `RRSS_E2E_MODE=mock` | — | cero créditos | guarda de salida: solo loopback | `src/core/ai/mock-engine.ts`, `src/core/runtime/egress-policy.ts` |

**Control de coste real, no declarado:** el plan audiovisual calcula segundos de grabación real frente a IA y un intervalo de coste antes de autorizar el gasto (`src/core/media/pricing.ts`), y el operador revisa cada prompt de fal.ai (`FalPromptReviewPanel`). Las tarifas internas son estimaciones fechadas, no facturación medida.

Relacionado: [inventario de arquitectura](RRSS_ARCHITECTURE_INVENTORY.md) · [IA en los tres productos](../architecture/ai-integrations.md).
