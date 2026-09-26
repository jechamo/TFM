# ChaFit · Inventario de arquitectura (AS-IS)

> Repositorio privado `jechamo/chafit360` · commit `d18493d` (release 35) · inspección 26/09/2026.
> Las tablas de este documento se **generan desde el modelo** [`architecture/model/chafit.json`](../../architecture/model/chafit.json) con `node architecture/tools/export-model.mjs`: el mismo modelo que dibuja los diagramas. No se editan a mano.

## Forma de la arquitectura

ChaFit es una **SPA React única** que se distribuye de tres maneras —web/PWA servida por Vercel y apps iOS y Android empaquetadas con Capacitor 8— y que habla directamente con un **proyecto Supabase** (BaaS gestionado). La lógica que necesita secretos o potencia de servidor vive en **28 Edge Functions (Deno)**: toda la IA, los pagos, el email y el pipeline de miniaturas. Postgres 17 concentra los datos de dominio, las políticas RLS, las funciones SQL, una cola `pgmq` y tareas `pg_cron`.

No hay microservicios ni un backend tradicional propio: la frontera de confianza está entre el dispositivo del usuario (que solo tiene la clave publicable y su JWT) y el servidor (Edge Functions y Postgres, que custodian las claves de OpenAI, Stripe y Resend).

![Contenedores de ChaFit](../../architecture/exported/svg/chafit-container.svg)

## Componentes

<!-- BEGIN:gen:chafit-components -->
| Componente | Tipo | Tecnología | Responsabilidad | Conecta con | Evidencia |
|---|---|---|---|---|---|
| **Clientes, entrenadores y gimnasios** | Persona | 3 roles de negocio | Usan la app según su rol: entrenar, planificar, gestionar clientes o el centro | → Cliente web y móvil | `src/App.tsx (rutas por rol)`; `src/pages/ClientDashboard.tsx`; `src/pages/TrainerDashboard.tsx`; `src/pages/GymDashboard.tsx` |
| **Superusuario** | Persona | rol superuser | Gobierna modelos de IA, cupos, costes, retos, códigos y catálogo | → Cliente web y móvil | `src/pages/SuperuserDashboard.tsx` |
| **Cliente web y móvil** | Contenedor | React 18 · Vite · TypeScript · shadcn/ui · PWA · Capacitor 8 | Interfaz única para web, PWA e iOS/Android; rutas por rol, ejecución de entrenamientos y llamadas a Supabase | → APIs del dispositivo · → Endpoint del proyecto · → Mapbox · → Sentry · → n8n (Elestio) · ← Clientes, entrenadores y gimnasios · ← Superusuario · ← Vercel | `src/App.tsx`; `vite.config.ts`; `capacitor.config.ts (appId com.chafit.app)` |
| **APIs del dispositivo** | Contenedor | HealthKit / Health Connect · biometría · notificaciones · archivos | Acceso a salud, biometría, notificaciones locales y ficheros desde la app nativa | ← Cliente web y móvil · ← App Store y Google Play | `src/services/healthService.ts`; `src/pages/Auth.tsx (NativeBiometric)`; `src/hooks/useExcelDownload.tsx` |
| **Endpoint del proyecto** | Contenedor | HTTPS + WebSocket · supabase-js · JWT | Punto de entrada HTTPS/WebSocket del proyecto Supabase; enruta a Auth, datos, Storage y funciones | → Supabase Auth · → API de datos · → Storage · → Edge Functions · ← Cliente web y móvil | `src/integrations/supabase/client.ts` |
| **Supabase Auth** | Contenedor | email + contraseña · JWT · 4 roles | Registro, inicio de sesión, recuperación y emisión de JWT | → PostgreSQL 17 · ← Endpoint del proyecto | `src/hooks/useAuth.tsx`; `src/utils/capacitorStorage.ts` |
| **API de datos** | Contenedor | PostgREST · RPC · Realtime | Consultas y RPC sobre Postgres bajo RLS; suscripciones en tiempo real | → PostgreSQL 17 · ← Endpoint del proyecto | `src/pages/Messages.tsx (Realtime)`; `src/hooks/useSubscriptionCheck.tsx (RPC)` |
| **Storage** | Contenedor | bucket exercise-images · miniaturas WebP | Imágenes de ejercicios y miniaturas WebP | ← Endpoint del proyecto · ← Edge Functions | `src/components/StorageManager.tsx`; `supabase/functions/_shared/thumbnail-service.ts` |
| **Edge Functions** | Contenedor | Deno · TypeScript · IA, pagos, email, miniaturas | Lógica de servidor con secretos: generación con IA, pagos, email, miniaturas y administración | → PostgreSQL 17 · → Storage · → OpenAI API · → Stripe · → Resend · ← Endpoint del proyecto · ← PostgreSQL 17 | `supabase/functions/* (28 directorios)` |
| **PostgreSQL 17** | Contenedor | 47 tablas · RLS · 52 migraciones · pg_cron · pgmq · pg_net · Vault | Datos de dominio, políticas RLS, funciones SQL, colas y tareas programadas | → Edge Functions · ← Supabase Auth · ← API de datos · ← Edge Functions | `src/integrations/supabase/types.ts (47 tablas)`; `supabase/migrations/ (52)`; `supabase/migrations/20260810120000_exercise_thumbnail_pipeline_foundation.sql` |
| **OpenAI API** | Sistema externo | chat · visión · images · edits · Whisper · Assistants | Texto, visión, imagen, edición de imagen, transcripción y asistente conversacional | ← Edge Functions | `supabase/functions/_shared/openai-models.ts:8`; `supabase/functions/transcribe-audio/`; `supabase/functions/chat-assistant/` |
| **Stripe** | Sistema externo | Checkout · Customer Portal · suscripciones | Checkout, portal de cliente y estado de suscripciones | ← Edge Functions | `supabase/functions/create-checkout/ (stripe@14.21.0)`; `supabase/functions/customer-portal/`; `supabase/functions/check-subscription/` |
| **Resend** | Sistema externo | API de email transaccional | Envío del formulario de contacto por email | ← Edge Functions | `supabase/functions/send-contact-email/ (api.resend.com/emails)` |
| **Mapbox** | Sistema externo | Mapbox GL · Geocoding v5 | Mapas y geocodificación para gimnasios, zonas de entrenador y búsqueda | ← Cliente web y móvil | `src/components/maps/GymLocationPicker.tsx:129`; `src/components/maps/TrainerZoneSelector.tsx:168` |
| **Sentry** | Sistema externo | errores saneados · Replay con consentimiento | Captura de errores saneados y diagnóstico opcional con consentimiento | ← Cliente web y móvil | `src/sentry.ts`; `src/observability/sanitize.ts` |
| **n8n (Elestio)** | Sistema externo | webhook de nuevas altas | Automatización externa que recibe las nuevas altas | ← Cliente web y móvil | `src/hooks/useAuth.tsx:264` |
| **Vercel** | Infraestructura / entrega | hosting estático · CDN · Preview → Producción | Hosting estático del bundle web y CDN | → Cliente web y móvil | `vercel.json (rewrite SPA)`; `docs/ops/VERCEL-DEPLOYMENT.md`; `cabecera Server: Vercel en chafit.es` |
| **App Store y Google Play** | Infraestructura / entrega | com.chafit.app · versión 35 | Distribución de las apps nativas | → APIs del dispositivo | `src/components/AppStoreBadges.tsx`; `package.json (35.0.0)` |
| **GitHub · chafit360** | Infraestructura / entrega | privado · 1 380 commits · 34 PR | Código fuente y pull requests |  | `git rev-list --count HEAD`; `git log --grep 'Merge pull request'` |
| **Autor + agentes SDD** | Infraestructura / entrega | Claude Code / Codex · Supabase MCP · Xcode · Android Studio | Desarrollo con agentes; despliegue de migraciones y funciones por Supabase MCP; builds nativos |  | `docs/specs/001-workout-table-contract/evidence.md (despliegue por Supabase MCP)` |
<!-- END:gen:chafit-components -->

## Integraciones con terceros

<!-- BEGIN:gen:chafit-integrations -->
| Integración | Proveedor | Función | Entrada | Salida | Evidencia |
|---|---|---|---|---|---|
| Rutinas, dietas, visión, imágenes, voz y asistente | **OpenAI API** | Texto, visión, imagen, edición de imagen, transcripción y asistente conversacional | perfil, encargo, fotos, audio | JSON, texto, imágenes | `supabase/functions/_shared/openai-models.ts` |
| Checkout, portal y estado | **Stripe** | Checkout, portal de cliente y estado de suscripciones | cliente, precio, suscripción | — | `supabase/functions/create-checkout/` |
| Email de contacto | **Resend** | Envío del formulario de contacto por email | remitente, asunto, mensaje | — | `supabase/functions/send-contact-email/` |
| Mapas y geocodificación | **Mapbox** | Mapas y geocodificación para gimnasios, zonas de entrenador y búsqueda | coordenadas, búsqueda de lugar | — | `src/components/maps/GymLocationPicker.tsx:129` |
| Errores saneados | **Sentry** | Captura de errores saneados y diagnóstico opcional con consentimiento | evento sin PII; Replay solo con consentimiento | — | `src/sentry.ts` |
| Webhook de alta | **n8n (Elestio)** | Automatización externa que recibe las nuevas altas | datos del registro | — | `src/hooks/useAuth.tsx:264` |
<!-- END:gen:chafit-integrations -->

Supabase no aparece en la tabla porque se modela como plataforma del propio sistema (sus servicios son contenedores gestionados); su detalle está en la tabla de componentes y en [integraciones](CHAFIT_INTEGRATIONS.md).

## Superficie medida

| Métrica | Valor | Método |
|---|---:|---|
| Páginas | 25 | `ls src/pages/*.tsx` |
| Declaraciones de ruta | 24 | `path=` en `src/App.tsx` (incluye comodín) |
| Componentes (raíz + subcarpetas) | 77 + 13 | `ls src/components`, `maps/`, `nutrition/`, `workout/` |
| Hooks | 22 | `ls src/hooks` |
| Ficheros versionados en `src/` | 265 | `git ls-files src` |
| Edge Functions | 28 | directorios de `supabase/functions` sin `_shared` |
| Migraciones SQL | 52 | `supabase/migrations/*.sql` |
| Tablas en el contrato generado | 47 | `Database.public.Tables` en `src/integrations/supabase/types.ts` |
| Tests de contrato ejecutados por el autor | 21 ficheros Node + 13 Deno | `package.json` (`test:unit:node`, `test:unit:deno`) |
| Historia | 1 380 commits · 34 PR | `git rev-list --count HEAD`, `git log --grep "Merge pull request"` |
| Specs SDD | 7 (001–007) | `docs/specs/` |

Son métricas de superficie, no de calidad. La auditoría del 23/09/2026 midió en producción 47 tablas y 27 funciones desplegadas (frente a 28 en el repositorio): se trata de fuentes y fechas distintas.

## Qué no existe (para no dibujar una arquitectura supuesta)

- No hay API REST propia ni servidor Node: el cliente usa `supabase-js` contra el proyecto.
- No hay *push* remoto: las notificaciones son locales (Capacitor) o en tiempo real dentro de la app.
- Los adaptadores Garmin/Samsung/Health Connect de `src/services/wearables` son esqueletos; la integración real de salud es `healthService` con `cordova-plugin-health`.
- No hay *webhook* de Stripe en el repositorio: el estado de la suscripción se consulta con `check-subscription`.
- El arnés SDD (agentes, skills, hooks) se instaló localmente sin versionar; lo versionado es el expediente: 7 specs, 2 ADR y la bitácora.

Vistas relacionadas: [contexto](../../architecture/exported/svg/chafit-context.svg) · [integraciones](../../architecture/exported/svg/chafit-integrations.svg) · [despliegue](../../architecture/exported/svg/chafit-deployment.svg) · [rutina con IA](../../architecture/exported/svg/chafit-seq-routine.svg) · [miniaturas](../../architecture/exported/svg/chafit-seq-thumbnails.svg) · [documento de arquitectura](../architecture/chafit-architecture.md).
