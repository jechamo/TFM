# Comparativa de los tres productos

Solo evidencia verificada el 26/09/2026. Cada producto demuestra un área distinta del máster y del sistema.

| Capacidad | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|
| **Frontend** | React 19 · Next.js 15 App Router · React Flow | React 18 · Vite · shadcn/ui · 4 paneles por rol | React 18 · Vite · framer-motion · 47 rutas |
| **Backend** | 52 *Route Handlers* en un proceso Node | 28 Edge Functions (Deno) | 35 Edge Functions + 175 RPC en SQL |
| **Mobile** | no (vídeo vertical; emulación móvil para grabar) | iOS + Android con Capacitor 8 (salud, biometría, avisos) | iOS + Android con Capacitor 8 (login nativo, compartir, capturas) |
| **Base de datos** | SQLite + Prisma (11 modelos) | Postgres 17 (47 tablas, 52 migraciones) | Postgres 17 (88 tablas, 136 migraciones) |
| **IA** | 17/38 · Claude CLI, Gemini, fal.ai, HeyGen, ElevenLabs, Whisper | 12/62 · OpenAI texto, visión, imagen, voz, asistente | 4/63 · OpenAI imagen y editorial |
| **APIs externas** | 11 integraciones | 9 integraciones | 12 integraciones |
| **Auth** | sin cuentas (loopback) | Supabase Auth email, biometría | Supabase Auth email + Google + Apple |
| **Roles** | operador | cliente, entrenador, gimnasio, superusuario | usuario, influencer, admin + pilotos |
| **Automatización** | pipelines con SSE, grabación con Playwright | cola `pgmq` + `pg_cron` | 5 tareas `pg_cron` + `pg_net` |
| **Pagos** | — | Stripe (suscripciones y cupos) | economía interna (rupias) |
| **SDD** | greenfield: 18 requisitos + 2 specs del kit | 7 specs con evidencia RED/GREEN | auditoría como entrada a SDD |
| **TDD** | 71 + 138 tests en verde hoy; 9 E2E | 109 + 100 tests en verde hoy | sin tests (hallazgo crítico) |
| **Auditoría** | — | 53 hallazgos (15 críticos) | 48 hallazgos (16 críticos) |
| **CI/CD** | GitHub Actions en Windows 11 | Vercel Preview → Producción; SDD local | Vercel |
| **Cloud** | ninguna (local) | Vercel + Supabase (eu-north-1) | Vercel + Supabase (eu-west-1) |
| **Agentes** | kit SDD 0.9.1 instalado | despliegue por Supabase MCP | 81 de 97 PR desde ramas de agentes |

## Lectura

- **RRSS** demuestra el método de principio a fin y la integración con muchos proveedores de IA con control de coste.
- **ChaFit** demuestra SDD/TDD aplicado a un producto en producción con datos sensibles, pagos y apps nativas.
- **ICG Vault** demuestra escala funcional, lógica en base de datos y el uso del sistema para auditar y priorizar.

| | Módulos | Funcionalidades | Con IA | Integraciones |
|---|---:|---:|---:|---:|
| RRSS Studio | 11 | 38 | 17 | 11 |
| ChaFit | 13 | 62 | 12 | 9 |
| ICG Vault | 13 | 63 | 4 | 12 |
