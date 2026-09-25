# ICG Vault: comunidad gamificada de películas, series y videojuegos

**Web:** [icgvault.es](https://icgvault.es) · **iOS:** [App Store](https://apps.apple.com/es/app/icg-vault/id6759173751) · **Android:** [Google Play](https://play.google.com/store/apps/details?id=com.icgvault.app)
**Repositorio:** [jechamo/icgbolt](https://github.com/jechamo/icgbolt) (privado) · **Versión nativa:** 71.0.0

## Qué es

> *«Vota películas, series y videojuegos, organiza tus listas y sigue a gente con criterio. Sube de
> nivel y haz que tu opinión pese más que la de los demás.»*

Una red social de cultura pop con mecánicas de RPG: cada voto da experiencia, el nivel da peso a tus
opiniones y los cofres desbloquean objetos, mascotas y guardianes generados con IA.

## Funcionalidades

| Área | Funcionalidades |
|---|---|
| **Catálogo y votos** | Fichas de películas, series y juegos (TMDB, IGDB, HowLongToBeat, Metacritic), voto rápido, listas personales y listas compartibles |
| **Progresión** | Niveles, cofres, objetos, mascotas/acompañantes, guardianes y avatares generados con IA |
| **Juegos** | ICG Duelo (cartas por turnos: mazo, sobres, *mulligan*, partidas), Arena PvP (completa y simple), Inmortales (temporadas, crónica, preinscripción), Zoom Out (reto diario con piloto automático), FlashOut, Timeline |
| **Comunidad** | Feed, perfil público con biblioteca, rankings, lo mejor de la semana, debates, encuestas y quizzes semanales con IA, sugerencias votadas |
| **Contenido** | Noticias (RSS con lector de artículos), podcast y calendario de estrenos |
| **Plataforma** | PWA, apps nativas, login con Google y Apple, *hub* de notificaciones, SEO, versión nativa mínima, modo mantenimiento y panel de administración |

## Datos técnicos

- **Stack:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion, Capacitor 8, Supabase.
- **Tamaño:** unas 88.300 líneas de TypeScript, 38 páginas, 198 componentes, 33 Edge Functions y 136 migraciones.
- **Historia:** 1.518 commits y 96 pull requests integradas.
- **IA:** OpenAI para texto (quizzes y encuestas semanales) e imagen (avatares, mascotas, guardianes y objetos) con la familia `gpt-image-2.5`. El modelo y la calidad se configuran **por función desde el panel de administración**.

## Evolución con el método

- Nació en Lovable y se ha llevado a producción nativa con agentes trabajando en ramas `claude/*`, **una PR por cambio acotado**.
- Pilotos de riesgo (ICG Duelo) diseñados como **puramente aditivos**, con [plan de rollback](https://github.com/jechamo/icgbolt/blob/main/docs/DUELO_ROLLBACK.md) para frontend, SQL y funciones.
- Rendimiento: miniaturas generadas en el cliente con interruptor y herramienta de *backfill*, y caché permanente de HLTB con descubrimiento que se repara solo.
- Robustez: cierre de huecos de tiempo en las funciones de imagen, `verify_jwt` declarado de forma explícita y validación del JWT de `service_role` en el piloto automático.
