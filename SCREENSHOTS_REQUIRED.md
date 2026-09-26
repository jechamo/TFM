# Capturas pendientes (manuales)

## Lo que ya está cubierto automáticamente

| Material | Origen | Dónde |
|---|---|---|
| 39 fotogramas reales de las apps (RRSS 12, ChaFit 13, ICG Vault 14) | extraídos de los vídeos finales con ffmpeg | `site/assets/img/frames/` |
| 7 capturas públicas sin login (portadas de ChaFit, ICG Vault y del sistema SDD, en escritorio y móvil) | `node tools/capture-public.cjs` (Playwright) | `site/assets/img/screens/` |
| 9 miniaturas de vídeo | `python tools/prepare-videos.py` | `site/assets/img/thumbs/` |
| 56 diagramas de arquitectura | `node architecture/tools/render.mjs` | `architecture/exported/svg/` |

Con esto, la web, las slides y la documentación ya se ven completas. **Las capturas de abajo son opcionales**: refuerzan zonas que el vídeo no enseña (paneles de administración y evidencias técnicas). Todas están detrás de login o de una consola privada, por eso no se pueden hacer automáticamente.

## Reglas para todas las capturas

- Sin datos personales de usuarios reales: usar cuentas demo o difuminar nombres, emails y fotos.
- Sin claves, tokens, URLs firmadas ni identificadores de proyecto de Supabase.
- PNG a 1440×900 (escritorio) o 390×844 a 2× (móvil). Se convierten a WebP al integrarlas.

## Listado

### 1 · ChaFit · Panel de administración

| Campo | Valor |
|---|---|
| Proyecto | ChaFit |
| URL | https://chafit.es |
| Usuario | cuenta con rol superusuario (no la cuenta demo) |
| Ruta | panel de administración (menú del superusuario) |
| Pantalla | vista principal del panel de administración |
| Acción previa | iniciar sesión como superusuario |
| Qué debe verse | gestión de usuarios, gimnasios o entrenadores y configuración de IA, sin datos personales legibles |
| Resolución | 1440×900 |
| Nombre archivo | `chafit-admin.png` |
| Destino | `site/assets/img/screens/` |
| Uso | caso de estudio de ChaFit (módulo Administración: 6 funcionalidades, ninguna visible en el vídeo) |

### 2 · ICG Vault · Panel de administración y automatización

| Campo | Valor |
|---|---|
| Proyecto | ICG Vault |
| URL | https://icgvault.es |
| Usuario | cuenta con rol admin (no la cuenta demo) |
| Ruta | panel de administración |
| Pantalla | generación editorial con IA (quiz o encuestas) y tareas programadas |
| Acción previa | iniciar sesión como admin |
| Qué debe verse | borrador generado con IA pendiente de revisión, sin publicar nada |
| Resolución | 1440×900 |
| Nombre archivo | `icgvault-admin.png` |
| Destino | `site/assets/img/screens/` |
| Uso | caso de estudio de ICG Vault (módulo Administración y automatización: 7 funcionalidades, 2 con IA) |

### 3 · RRSS Studio · Bandeja y publicación

| Campo | Valor |
|---|---|
| Proyecto | RRSS Studio |
| URL | http://localhost:3000 |
| Usuario | — (app local sin cuentas) |
| Ruta | bandeja de contenidos |
| Pantalla | piezas generadas listas para publicar |
| Acción previa | `node scripts/install-local.mjs start` con un proyecto que ya tenga contenido |
| Qué debe verse | lista de piezas con su estado |
| Resolución | 1440×900 |
| Nombre archivo | `rrss-inbox.png` |
| Destino | `site/assets/img/frames/rrss/` |
| Uso | mapa funcional de RRSS (módulo Bandeja y publicación, no mostrado en el vídeo) |

### 4 · ChaFit · Edge Functions desplegadas (evidencia técnica)

| Campo | Valor |
|---|---|
| Proyecto | ChaFit |
| URL | consola de Supabase del proyecto |
| Usuario | propietario del proyecto |
| Ruta | Edge Functions |
| Pantalla | listado de funciones con versión y fecha de despliegue |
| Acción previa | ninguna |
| Qué debe verse | `generate-workout` (v22) y `modify-workout` (v6) activas; **ocultar la barra de URL y el identificador del proyecto** |
| Resolución | 1440×900 |
| Nombre archivo | `chafit-edge-functions.png` |
| Destino | `docs/evidence/img/` |
| Uso | evidencia de la spec 001 en [implementation-evidence](docs/evidence/implementation-evidence.md) |

### 5 · ICG Vault · Historial de PR de agentes (evidencia técnica)

| Campo | Valor |
|---|---|
| Proyecto | ICG Vault |
| URL | https://github.com/jechamo/icgbolt/pulls?q=is%3Apr |
| Usuario | propietario del repositorio |
| Ruta | Pull requests → cerradas |
| Pantalla | lista de PR con ramas de agentes |
| Acción previa | filtrar por PR cerradas |
| Qué debe verse | PR fusionadas desde ramas de agentes y revisadas por el autor |
| Resolución | 1440×900 |
| Nombre archivo | `icgvault-agent-prs.png` |
| Destino | `docs/evidence/img/` |
| Uso | respaldo visual del dato «81 de 97 PR» (el repositorio es privado y el tribunal podría no tener acceso) |

## Después de añadirlas

Avísame (o ejecuta el paso a mano): convertirlas a WebP, enlazarlas desde el caso de estudio correspondiente y reconstruir con `node tools/build-site.mjs`.
