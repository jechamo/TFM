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
