| Integración | Proveedor | Función | Entrada | Salida | Evidencia |
|---|---|---|---|---|---|
| OAuth web · ID token nativo | **Google · Apple** | Identidad federada para inicio de sesión | identidad del proveedor | — | `src/hooks/useAuth.tsx:201`; `src/hooks/useAuth.tsx:233` |
| Portadas y tráileres | **Imágenes y tráileres** | Portadas de TMDB y tráileres de YouTube servidos directamente a la app | imágenes y vídeo | — | `src/components/content/TrailerSection.tsx:125` |
| HTTPS REST (proxy) | **TMDB** | Catálogo de películas y series | búsqueda, fichas, temporadas, plataformas | — | `supabase/functions/tmdb/index.ts:10` |
| OAuth client credentials + REST | **IGDB** | Catálogo de videojuegos | juegos, plataformas, fechas | — | `supabase/functions/igdb/index.ts:117` |
| HTTPS (endpoints web) | **HowLongToBeat** | Duración estimada de videojuegos | título | duraciones | `supabase/functions/how-long-to-beat/index.ts:46` |
| HTTPS (HTML) | **Metacritic** | Referencias de crítica | título | puntuaciones | `supabase/functions/metacritic/index.ts:342` |
| RSS / HTML | **Medios y podcasts** | Noticias de 11 medios y episodios de podcast | titulares, artículos, episodios | — | `supabase/functions/fetch-news/`; `supabase/functions/article-reader/`; `supabase/functions/fetch-podcast-feed/` |
| Avatares, guardianes, arte, quiz y encuestas | **OpenAI API** | Imágenes de avatar, guardián, objetos y mascotas; borradores de quiz y encuestas | prompt, foto opcional | imagen · contexto editorial | `supabase/functions/_shared/openai-image.ts`; `supabase/functions/generate-weekly-quiz/` |
