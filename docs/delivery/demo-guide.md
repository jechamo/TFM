# Guía de demostración (10–15 minutos)

## Recorrido recomendado

| Min. | Qué enseñar | Dónde | Mensaje |
|---:|---|---|---|
| 0–1 | Visión global | slide "Del máster a producción" | un sistema de ingeniería aplicado a tres productos reales |
| 1–4 | Sistema SDD | vídeo `sdd` (capítulos 1:22–3:38) o [web del sistema](https://jechamo.github.io/Estructura_inicial_claude/) | circuito, gates humanos, 20 agentes, verificación fuera del modelo |
| 4–5 | Evidencia del sistema | terminal: `node scripts/check-sdd.mjs` | 17 specs · 114 tareas · 20 agentes · 27 skills, en verde |
| 5–8 | RRSS Studio | vídeo `rrss-4min` o `npm run test:e2e:mock` | de la URL de una app a su mapa, su mercado y un vídeo; coste antes de gastar |
| 8–11 | ChaFit | vídeo `chafit-4min` + [chafit.es](https://chafit.es) | rutina con IA, sesión guiada, "tu máquina", foto al plato; spec 001 sobre producción |
| 11–13 | ICG Vault | vídeo `icg-vault-4min` + [icgvault.es](https://icgvault.es) | voto que pesa, RPG, juegos; 81 PR de agentes; auditoría |
| 13–15 | Arquitectura y auditorías | slides + vistas interactivas | AS-IS con evidencia; auditorías obtenidas con el modelo SDD |

## Demostración en vivo sin riesgo

- **RRSS Studio**: la suite E2E simulada recorre los flujos principales sin red ni claves.
- **ChaFit / ICG Vault**: navegar las páginas públicas y, con la cuenta demo del formulario de entrega, las áreas de cliente y de usuario. No usar funciones de administración ni generar con IA en directo (consumen cuota).

## Cuentas demo

Se facilitan en el formulario privado de entrega (ver [seguridad](../security/security.md#credenciales-demo-criterio)).
