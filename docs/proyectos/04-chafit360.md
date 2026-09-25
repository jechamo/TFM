# Chafit360: plataforma de entrenamiento integral con IA

**Web:** [chafit.es](https://chafit.es) · **iOS:** [App Store](https://apps.apple.com/app/chafit/id6759172876) · **Android:** [Google Play](https://play.google.com/store/apps/details?id=com.chafit.app)
**Repositorio:** [jechamo/chafit360](https://github.com/jechamo/chafit360) (privado) · **Versión:** 35.0.0

## Qué es

Una plataforma que conecta **clientes, entrenadores personales y gimnasios**. La IA genera rutinas y
planes de nutrición personalizados, y la app guía cada sesión de entrenamiento serie a serie.

## Roles

| Rol | Qué hace |
|---|---|
| **Cliente** | Ejecuta rutinas, registra series, sigue su progreso y su nutrición, chatea con el asistente y cambia ejercicios |
| **Entrenador** | Gestiona clientes, genera y edita rutinas y revisa progreso y marcas de cambio |
| **Gimnasio** | Panel del centro y códigos de gimnasio para sus socios |
| **Superusuario** | Configura modelos y calidad de imagen por función, costes y mantenimiento |

## Funcionalidades

- **Rutinas con IA**: gimnasio, calistenia, CrossFit, HIIT y circuitos, con un **contrato estricto de 9 columnas** (JSON Schema).
- **Ejecución guiada**: tarjetas deslizables como una baraja, biseries, descansos, reanudación en la serie exacta, flechas y puntos accesibles por teclado.
- **Sustitución de ejercicios**: edición manual o hasta 3 alternativas generadas por IA, heredando series, repeticiones y descanso.
- **Imágenes de ejercicios**: ilustración de catálogo o foto de la **máquina del propio gimnasio**; la preferencia se guarda y volver atrás no gasta crédito.
- **Nutrición**: planes con IA y análisis de fotos de comida.
- **Progreso**: análisis con IA, rankings y retos.
- **Comunicación**: mensajería, chat asistente y transcripción de voz.
- **Negocio**: suscripciones con Stripe (checkout y portal de cliente) y muro de suscripción.

## Datos técnicos

- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui, Capacitor, Supabase (Postgres, Auth, RLS, PGMQ, Cron), Stripe, Sentry y Vercel.
- **Tamaño:** unas 59.200 líneas de TypeScript, 25 páginas, 145 componentes, 28 Edge Functions y 54 migraciones.
- **Historia:** 1.380 commits y 34 pull requests integradas.
- **IA:** OpenAI (chat completions con JSON Schema estricto, imágenes y edición sobre foto, transcripción de audio y asistentes).

## Evolución con el método (brownfield)

| Artefacto | Contenido |
|---|---|
| `docs/architecture/CURRENT-STATE.md` | Lo observado frente a lo inferido y los riesgos priorizados |
| `docs/architecture/constitution.md` | Principios innegociables del proyecto |
| ADR-0001 / ADR-0002 | Arquitectura heredada · Vercel + Sentry sin tocar la autorización |
| 7 specs (`docs/specs/001…007`) | Spec, diseño, plan, modelo de datos, plan de pruebas y evidencias |
| `docs/bitacora/DECISIONS.md` | Decisiones con alternativas descartadas y deuda aceptada |
| `docs/quality/` | Informes de calidad y deuda técnica |
| `docs/ops/` | Observabilidad, despliegue en Vercel y runbooks |
| `CHANGELOG.md` | Keep a Changelog, escrito para el usuario final |

**Ejemplo de disciplina:** la migración a Vercel y Sentry (spec 003) se hizo **sin una sola migración
SQL**, comparando por hash las políticas RLS, los grants y seis funciones auxiliares antes y después.
Cualquier diferencia bloqueaba la subida a producción.
