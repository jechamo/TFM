# ICG Vault · Inventario de arquitectura (AS-IS)

> Repositorio privado `jechamo/icgbolt` · commit `610d99d` (versión 71; `main` ya en 72 sin cambios de arquitectura) · inspección 26/09/2026.
> Tablas generadas desde [`architecture/model/icgvault.json`](../../architecture/model/icgvault.json).

## Forma de la arquitectura

Misma familia que ChaFit —SPA React + Capacitor 8 para web/PWA, iOS y Android sobre Supabase—, pero con un rasgo propio: **gran parte de la lógica de negocio está en SQL**. Las 175 funciones RPC del contrato generado implementan el voto ponderado, la economía de rupias, cofres, experiencia, juegos diarios y temporadas. Las **35 Edge Functions** hacen de *proxy* hacia catálogos externos (TMDB, IGDB, HowLongToBeat, Metacritic, RSS), generan imágenes y contenido editorial con OpenAI y arbitran las partidas PvP y de ICG Duelo. `pg_cron` y `pg_net` programan retos y avanzan temporadas sin intervención humana.

La app **nunca llama directamente a una API de catálogo con clave**: todo pasa por Edge Functions, que además cachean fichas en `cached_content` y portadas en Storage. Sí llegan directos al cliente las imágenes de `image.tmdb.org`, los tráileres de YouTube (modo sin cookies) y los proveedores de identidad Google y Apple.

![Contenedores de ICG Vault](../../architecture/exported/svg/icgvault-container.svg)

## Componentes

<!-- BEGIN:gen:icgvault-components -->
| Componente | Tipo | Tecnología | Responsabilidad | Conecta con | Evidencia |
|---|---|---|---|---|---|
| **Votantes y jugadores** | Persona | usuarios e influencers | Votan, gestionan su biblioteca, progresan en el RPG, juegan y participan en la comunidad | → Cliente web y móvil | `src/App.tsx (RequireAuth)`; `src/hooks/useRoleMultipliers.tsx` |
| **Administración** | Persona | rol admin · 24 pestañas | Opera catálogo RPG, juegos, contenido editorial, configuración remota y soporte | → Cliente web y móvil | `src/pages/Admin.tsx`; `src/components/routing/RequireAdmin.tsx` |
| **Cliente web y móvil** | Contenedor | React 18 · Vite · TypeScript · Tailwind · framer-motion · PWA · Capacitor 8 | Interfaz única para web, PWA e iOS/Android; catálogo, voto, perfil, juegos y comunidad | → APIs del dispositivo · → Google · Apple · → Imágenes y tráileres · → Endpoint del proyecto · ← Votantes y jugadores · ← Administración | `src/App.tsx`; `vite.config.ts`; `capacitor.config.ts` |
| **APIs del dispositivo** | Contenedor | Sign-In Google/Apple · compartir · archivos · detector de capturas | Inicio de sesión nativo, compartir imágenes, descargas y detección de capturas | ← Cliente web y móvil | `src/hooks/useAuth.tsx:201`; `src/plugins/screenshotDetector.ts`; `src/lib/nativeDownload.ts` |
| **Endpoint del proyecto** | Contenedor | HTTPS + WebSocket · supabase-js · JWT | Punto de entrada HTTPS/WebSocket del proyecto Supabase | → Supabase Auth · → API de datos · → Storage · → Edge Functions · ← Cliente web y móvil | `src/integrations/supabase/client.ts` |
| **Supabase Auth** | Contenedor | email · Google · Apple (ID token) | Cuentas con email, Google y Apple; sesiones JWT | → PostgreSQL 17 · ← Endpoint del proyecto | `src/hooks/useAuth.tsx:221`; `src/hooks/useAuth.tsx:233` |
| **API de datos** | Contenedor | PostgREST · 175 funciones RPC · Realtime | Consultas, 175 funciones RPC (voto, economía, juegos) y tiempo real | → PostgreSQL 17 · ← Endpoint del proyecto | `src/integrations/supabase/types.ts (Functions)`; `src/hooks/useRealtimeNotifications.tsx` |
| **Storage** | Contenedor | avatars · covers · guardians · Tiers | Avatares, portadas, guardianes y arte de tiers | ← Endpoint del proyecto · ← Edge Functions | `storage.from(avatars, covers, guardians) en src y funciones` |
| **Edge Functions** | Contenedor | Deno · catálogo, IA, juegos, editorial | Proxies de catálogo, generación con IA, partidas PvP y Duelo, quiz, noticias y mantenimiento | → PostgreSQL 17 · → Storage · → TMDB · → IGDB · → HowLongToBeat · → Metacritic · → Medios y podcasts · → OpenAI API · ← Endpoint del proyecto · ← PostgreSQL 17 | `supabase/functions/* (35 directorios)` |
| **PostgreSQL 17** | Contenedor | 88 tablas (tipos) · RLS · 136 migraciones · pg_cron · pg_net | Datos de dominio, reglas de economía y juegos en SQL, RLS y tareas programadas | → Edge Functions · ← Supabase Auth · ← API de datos · ← Edge Functions | `src/integrations/supabase/types.ts`; `supabase/migrations/ (136)`; `auditoría 23/09: 92 tablas y 5 tareas cron en producción` |
| **Imágenes y tráileres** | Sistema externo | image.tmdb.org · YouTube nocookie | Portadas de TMDB y tráileres de YouTube servidos directamente a la app | ← Cliente web y móvil | `src/components/content/TrailerSection.tsx:125`; `image.tmdb.org en src` |
| **Google · Apple** | Sistema externo | OAuth web · Sign-In nativo | Identidad federada para inicio de sesión | ← Cliente web y móvil | `src/hooks/useAuth.tsx:201`; `src/hooks/useAuth.tsx:233`; `@capgo/capacitor-social-login` |
| **TMDB** | Sistema externo | API v3 · cine y series | Catálogo de películas y series | ← Edge Functions | `supabase/functions/tmdb/index.ts:10` |
| **IGDB** | Sistema externo | Twitch OAuth · API v4 | Catálogo de videojuegos | ← Edge Functions | `supabase/functions/igdb/index.ts:117`; `supabase/functions/igdb/index.ts:139` |
| **HowLongToBeat** | Sistema externo | duración de juegos | Duración estimada de videojuegos | ← Edge Functions | `supabase/functions/how-long-to-beat/index.ts:46` |
| **Metacritic** | Sistema externo | crítica (HTML) | Referencias de crítica | ← Edge Functions | `supabase/functions/metacritic/index.ts:342` |
| **Medios y podcasts** | Sistema externo | 11 feeds RSS · feeds de podcast | Noticias de 11 medios y episodios de podcast | ← Edge Functions | `supabase/functions/fetch-news/ (11 fuentes)`; `supabase/functions/fetch-podcast-feed/` |
| **OpenAI API** | Sistema externo | images · edits · chat/completions | Imágenes de avatar, guardián, objetos y mascotas; borradores de quiz y encuestas | ← Edge Functions | `supabase/functions/_shared/openai-image.ts`; `supabase/functions/generate-weekly-quiz/` |
| **Vercel** | Infraestructura / entrega | hosting estático · CDN · rewrite SPA | Hosting estático del bundle web y CDN |  | `vercel.json`; `cabecera Server: Vercel en icgvault.es` |
| **App Store y Google Play** | Infraestructura / entrega | com.icgvault.app · versión 72 | Distribución de las apps nativas |  | `src/components/NativeVersionGate.tsx`; `commit 0231ad5` |
| **GitHub · icgbolt** | Infraestructura / entrega | privado · 1 518 commits · 97 PR (81 de agentes) | Código fuente y pull requests (la mayoría de agentes) |  | `git log origin/main` |
| **Autor + agentes de IA** | Infraestructura / entrega | ramas claude/* · Supabase · Xcode · Android Studio | Evolución por pull requests con agentes; builds nativos |  | `97 PR, 81 desde ramas claude/*` |
<!-- END:gen:icgvault-components -->

## Integraciones con terceros

<!-- BEGIN:gen:icgvault-integrations -->
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
<!-- END:gen:icgvault-integrations -->

## Superficie medida

| Métrica | Valor | Método |
|---|---:|---|
| Declaraciones de ruta | 47 | `path=` en `src/App.tsx` (públicas, protegidas, piloto, admin, comodín) |
| Páginas | 38 | `ls src/pages/*.tsx` |
| Hooks | 43 | `ls src/hooks` |
| Carpetas de componentes | 31 | `ls src/components` |
| Pestañas de administración | 24 | `TabsTrigger` en `src/pages/Admin.tsx` |
| Ficheros versionados en `src/` | 422 | `git ls-files src` |
| Edge Functions | 35 | directorios de `supabase/functions` sin `_shared`, `_duelo_shared` |
| Migraciones SQL | 136 (+1 en `main`) | `supabase/migrations/*.sql` |
| Tablas / funciones en el contrato generado | 88 / 175 | `src/integrations/supabase/types.ts` |
| Canales Realtime distintos | 12 | `.channel(` en `src/` |
| Buckets de Storage | 4 | `avatars`, `covers`, `guardians`, `Tiers` (auditoría 23/09) |
| Tareas `pg_cron` | 5 | auditoría 23/09 (medido en producción) |
| Historia | 1 518 commits · 97 PR (81 desde ramas `claude/*`) | `git log origin/main` |

En producción la auditoría midió 92 tablas y 135 migraciones registradas: el repositorio y la base real no están alineados al 100 % (parte de las migraciones se aplicó desde el panel o por MCP).

## Qué no existe

- No hay tests automatizados en el repositorio (ni *runner* ni ficheros `*.test.*`): lo recoge la auditoría como hallazgo crítico de calidad.
- No hay *push* remoto (existe la tabla `user_push_tokens`, sin envío localizado).
- No hay observabilidad externa tipo Sentry; la analítica es interna (`activity_log` y pestaña *analytics*).
- Las recomendaciones y rankings no usan modelos de IA: son consultas SQL.

Vistas relacionadas: [contexto](../../architecture/exported/svg/icgvault-context.svg) · [integraciones](../../architecture/exported/svg/icgvault-integrations.svg) · [despliegue](../../architecture/exported/svg/icgvault-deployment.svg) · [voto](../../architecture/exported/svg/icgvault-seq-vote.svg) · [catálogo con caché](../../architecture/exported/svg/icgvault-seq-catalog.svg) · [guardián con IA](../../architecture/exported/svg/icgvault-seq-guardian.svg) · [documento de arquitectura](../architecture/icgvault-architecture.md).
