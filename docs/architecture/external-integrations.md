# Integraciones externas de los tres productos

Criterio común: servicio de terceros al que el sistema se conecta **en tiempo de ejecución**, contado por proveedor. Detalle y matrices completas en cada inventario.

| Categoría | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|
| **IA** | Anthropic (Claude Code CLI) · Google Gemini · fal.ai · HeyGen · ElevenLabs | OpenAI | OpenAI |
| **Datos y contenido** | Scrape Creators · web objetivo · YouTube/TikTok/Instagram · GitHub | — | TMDB · IGDB (Twitch OAuth) · HowLongToBeat · Metacritic · 11 RSS de medios · feeds de podcast · YouTube |
| **Plataforma / backend** | — (todo local) | Supabase | Supabase |
| **Hosting** | — | Vercel | Vercel |
| **Pagos** | — | Stripe | — |
| **Comunicación** | — | Resend (email) · n8n (webhook de altas) | — |
| **Mapas** | Google Maps (embed de leads) | Mapbox GL + Geocoding | — |
| **Observabilidad** | — | Sentry (web + Capacitor, con consentimiento) | — (analítica interna) |
| **Identidad** | — | — (email propio en Supabase Auth) | Google · Apple |
| **Dispositivo** | — | HealthKit / Health Connect | — |
| **Otros** | Clearbit / favicons de Google (logos) | — | — |
| **Distribución** | GitHub (clonar e instalar) | App Store · Google Play | App Store · Google Play |
| **Total en ejecución** | **11** (+5 herramientas locales) | **9** | **12** |

## Cómo se protegen las credenciales

| | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|
| Dónde viven | Vault AES-256-GCM local (`data/`) | Secretos de Edge Functions y Vault de Postgres | Secretos de Edge Functions |
| Qué ve el cliente | nada (loopback, sin cuentas) | clave publicable de Supabase, token público de Mapbox, DSN de Sentry | clave publicable de Supabase, IDs públicos de OAuth |
| IA | sesión local de Claude Code (sin API key) + keys del Vault | `OPENAI_API_KEY` en servidor | `OPENAI_API_KEY` en servidor |
| Pruebas | E2E con proveedores simulados y salida bloqueada | contrato que impide incrustar contraseñas demo en Playwright | — |

## Patrones de integración

- **Proxy de servidor con caché** (ICG Vault): la app pide a `tmdb`/`igdb`, que consultan `cached_content`, llaman al tercero si hace falta, guardan portada en Storage y sirven la copia caducada si el tercero falla.
- **Trabajo asíncrono con consulta periódica** (ChaFit): `job_id` inmediato, procesamiento en segundo plano, *polling* del estado.
- **Cola + *polling* del proveedor** (RRSS con fal.ai y HeyGen) con *timeout* explícito.
- **Webhook saliente** (ChaFit → n8n) y **tareas programadas que invocan funciones** (`pg_cron` + `pg_net` en ChaFit e ICG Vault).
- **OAuth**: *client credentials* de Twitch para IGDB (servidor); OAuth/OIDC de Google y Apple (cliente).

Vistas: [RRSS](../../architecture/exported/svg/rrss-integrations.svg) · [ChaFit](../../architecture/exported/svg/chafit-integrations.svg) · [ICG Vault](../../architecture/exported/svg/icgvault-integrations.svg).
