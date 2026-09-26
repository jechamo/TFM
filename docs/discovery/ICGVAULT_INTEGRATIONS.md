# ICG Vault · Integraciones e IA

> `jechamo/icgbolt@610d99d` · inspección de código 26/09/2026. Sin llamadas a producción ni consumo de cuotas. Solo nombres de variables, nunca valores.

**Criterio de recuento** (común a los tres productos). Resultado: **12 integraciones externas en tiempo de ejecución** — Supabase, OpenAI, TMDB, IGDB (con OAuth de Twitch), HowLongToBeat, Metacritic, 11 feeds RSS de medios (contados como una integración), feeds de podcast, YouTube (tráileres y vídeos), Google Sign-In, Apple Sign-In y Vercel. App Store y Google Play son distribución y se documentan aparte.

![Integraciones externas de ICG Vault](../../architecture/exported/svg/icgvault-integrations.svg)

## Plataforma: Supabase

| Servicio | Uso en ICG Vault | Protocolo | Autenticación | Evidencia |
|---|---|---|---|---|
| Auth | Email, Google (OAuth web) y Apple (ID token nativo con Capgo Social Login); traspaso de identidades Apple | HTTPS | clave publicable + JWT | `src/hooks/useAuth.tsx:201-233` |
| PostgREST + RPC | 88 tablas y 175 funciones: voto ponderado, economía, cofres, juegos, rankings | HTTPS | JWT + RLS | `src/integrations/supabase/types.ts` |
| Realtime | Partidas PvP y Duelo, avisos, mensajes de soporte (12 canales) | WebSocket | JWT | `src/hooks/useRealtimeNotifications.tsx`, `src/hooks/useDueloMatch.tsx` |
| Storage | `avatars`, `covers` (caché de portadas TMDB), `guardians`, `Tiers` | HTTPS | lectura pública | `supabase/functions/tmdb/index.ts:219` |
| Edge Functions | 35 funciones: *proxies* de catálogo, IA, PvP, Duelo, quiz, noticias, cuentas | HTTPS | JWT | `supabase/functions/` |
| `pg_cron` + `pg_net` | 5 tareas: autopiloto de Zoom Out, avance de Inmortales, Timeline y FlashOut semanales, limpieza de duelos | SQL / HTTP interno | secreto de servidor | `supabase/migrations/*autopilot*.sql` |

## Matriz de conexiones con terceros

<!-- BEGIN:gen:icgvault-matrix -->
| Servicio | Tipo | Función | Desde | Hacia | Protocolo | Auth | Datos intercambiados | Evidencia |
|---|---|---|---|---|---|---|---|---|
| **Google · Apple** | Identidad | Identidad federada para inicio de sesión | Cliente web y móvil | Google · Apple | OAuth 2.0 / OIDC · síncrono | IDs de cliente públicos | identidad del proveedor | `src/hooks/useAuth.tsx:201`; `src/hooks/useAuth.tsx:233` |
| **Imágenes y tráileres** | API / datos | Portadas de TMDB y tráileres de YouTube servidos directamente a la app | Cliente web y móvil | Imágenes y tráileres | HTTPS (img / iframe) · síncrono | sin credencial | imágenes y vídeo | `src/components/content/TrailerSection.tsx:125` |
| **TMDB** | API / datos | Catálogo de películas y series | Edge Functions | TMDB | HTTPS REST (proxy) · síncrono | clave de TMDB en secretos | búsqueda, fichas, temporadas, plataformas | `supabase/functions/tmdb/index.ts:10` |
| **IGDB** | API / datos | Catálogo de videojuegos | Edge Functions | IGDB | OAuth client credentials + REST · síncrono | client_id/secret de Twitch en secretos | juegos, plataformas, fechas | `supabase/functions/igdb/index.ts:117` |
| **HowLongToBeat** | API / datos | Duración estimada de videojuegos | Edge Functions | HowLongToBeat | HTTPS (endpoints web) · síncrono | sin credencial | título → duraciones | `supabase/functions/how-long-to-beat/index.ts:46` |
| **Metacritic** | API / datos | Referencias de crítica | Edge Functions | Metacritic | HTTPS (HTML) · síncrono | sin credencial | título → puntuaciones | `supabase/functions/metacritic/index.ts:342` |
| **Medios y podcasts** | Contenido (RSS) | Noticias de 11 medios y episodios de podcast | Edge Functions | Medios y podcasts | RSS / HTML · síncrono | sin credencial | titulares, artículos, episodios | `supabase/functions/fetch-news/`; `supabase/functions/article-reader/`; `supabase/functions/fetch-podcast-feed/` |
| **OpenAI API** | IA | Imágenes de avatar, guardián, objetos y mascotas; borradores de quiz y encuestas | Edge Functions | OpenAI API | HTTPS REST · síncrono | OPENAI_API_KEY (secreto) | prompt, foto opcional → imagen · contexto editorial → JSON | `supabase/functions/_shared/openai-image.ts`; `supabase/functions/generate-weekly-quiz/` |
<!-- END:gen:icgvault-matrix -->

Las 11 fuentes RSS están codificadas en `fetch-news`: Vandal, 3DJuegos, Eurogamer, HobbyConsolas, Vida Extra, MeriStation, IGN España, Espinof, SensaCine, eCartelera y Mundiario Cine. HowLongToBeat y Metacritic no ofrecen una API pública estable: la integración usa sus endpoints web y extracción de HTML, con caché y degradación si fallan.

## Inventario de IA

Proveedor único: **OpenAI**, desde Edge Functions. La IA de ICG Vault es **generativa de contenido**: imágenes para la economía RPG y borradores editoriales. **4 funcionalidades** la invocan.

| Uso | Modelo (en código) | Endpoint | Origen → destino | Entrada | Salida | Configuración | Fallback | Control de coste | Seguridad | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|
| Avatar | `gpt-image-2.5-sunburst` (mejor) / `-flare` (rápido) | `/v1/images/generations` | Cliente → `generate-avatar` → OpenAI → Storage | nombre de usuario / descripción | PNG en `avatars` | el admin elige modelo y calidad; el usuario usa el predeterminado | cambio al otro modelo ante indisponibilidad o *timeout* (70 s / 25 s) | pago en rupias y elegibilidad (`can_generate_avatar`) | JWT | `supabase/functions/_shared/openai-image.ts:20-71` |
| Guardián | idem | `/v1/images/edits` con foto · `/v1/images/generations` sin foto | Cliente → `generate-guardian` → OpenAI → Storage | estilo, descripción, foto opcional | PNG en `guardians` + fila en `user_custom_guardians` | calidad alta | idem | 200 rupias (`spend_rupias_for_guardian`) | `auth.getUser(token)` | `generate-guardian/index.ts:58-232` |
| Objetos y mascotas (admin) | idem, seleccionable | `/v1/images/generations` | Panel → `generate-item` / `generate-pet` → OpenAI | nombre, descripción, rareza | arte del catálogo RPG | modelo y calidad por petición del admin | idem | acción manual de administración | rol admin | `supabase/functions/generate-item/`, `generate-pet/` |
| Quiz y encuestas semanales (admin) | `gpt-4o-mini` por defecto; opción de la familia `gpt-5` | `/v1/chat/completions` | Panel → `generate-weekly-quiz` / `-survey` → OpenAI | tema, noticias, preguntas previas | borrador JSON revisable antes de publicar | modelo elegible en el panel | limpieza y normalización del JSON; modo manual de encuestas | acción manual | rol admin | `supabase/functions/generate-weekly-quiz/` |

No son IA, aunque lo parezcan: recomendaciones por plataforma (`get_platform_recommendations`), rankings, poder de voto y la dificultad de los juegos son **reglas y consultas SQL**.

**Límites.** Identificadores de modelo tal como figuran en el código; no se han consumido créditos. La auditoría del 23/09/2026 recomienda validar entradas y limitar por usuario las funciones de imagen (ver [resumen saneado](../audits/icgvault-audit-summary.md)).

Relacionado: [inventario de arquitectura](ICGVAULT_ARCHITECTURE_INVENTORY.md) · [IA en los tres productos](../architecture/ai-integrations.md).
