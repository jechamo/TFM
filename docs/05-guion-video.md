# Guion del vídeo (12-15 minutos)

> Requisito: grabar la pantalla mientras se explica; mostrar la cara es opcional.
> Herramientas recomendadas: OBS Studio (pantalla + micrófono, 1080p/30fps), subida a YouTube como **oculto** o **público**.
> Consejo: ten abiertas de antemano todas las pestañas y cuentas de demo para no perder tiempo.

| # | Tiempo | Sección | En pantalla | Qué contar |
|---|---|---|---|---|
| 1 | 0:00-0:45 | **Presentación** | Slide 1-2 | Quién eres, el título del TFM y la pregunta: *¿se puede trabajar con agentes de IA con la disciplina de un equipo profesional?* |
| 2 | 0:45-2:00 | **Problema y propuesta** | Slides 3-4 | La IA hace el código barato y la deuda cara. Las 4 piezas: plantilla, greenfield y dos productos en producción. |
| 3 | 2:00-4:00 | **Estructura_inicial** | VS Code o Claude Code con el repo | Enseñar `.agents/` (roles y skills). Ejecutar `python tools/sdd.py sync --check`, `python tools/sdd.py check` y `python -m unittest discover -s tests`. Enseñar un `handoffs/*.json` y `execution-log.jsonl`. Explicar por qué `check --strict` rechaza lo no verificado. |
| 4 | 4:00-7:30 | **RRSS Studio (demo)** | `localhost:3000` | Dashboard → proyecto (p. ej. Chafit360) → pipeline de nodos en vivo → dossier → competencia → virales → generar contenido: plan de cortes con coste y **preflight de prompts** → bandeja → modal de publicación asistida → Laboratorio de clips → Ajustes (Vault, «Probar conexión»). Si no hay claves: `npm run test:e2e:mock:ui`. |
| 5 | 7:30-8:15 | **RRSS Studio: ingeniería** | `docs/01-requisitos.md`, `.sdd/`, `e2e/` | Decisiones D-01 a D-15, requisitos uno a uno, E2E sin red ni créditos e instalador guiado. |
| 6 | 8:15-10:15 | **ICG Vault (producción)** | icgvault.es + móvil (espejo de pantalla) | Landing → votar → nivel y cofres → ICG Duelo o Inmortales → rankings → la ficha en App Store y Google Play. Enseñar un PR de GitHub y el plan de rollback de Duelo. |
| 7 | 10:15-12:15 | **Chafit360 (producción)** | chafit.es + móvil | Entrenador genera una rutina con IA → cliente la ejecuta deslizando tarjetas → sustitución con IA → foto de la máquina. Enseñar `docs/specs/003-*` y la bitácora con deuda aceptada. |
| 8 | 12:15-13:15 | **Arquitectura y despliegue** | Slides de arquitectura y despliegue | SPA + Capacitor + Supabase + Vercel; RLS; compatibilidad hacia atrás con las apps publicadas; por qué RRSS Studio es local. |
| 9 | 13:15-14:30 | **Resultados y conclusiones** | Slides de métricas y conclusiones | Números (commits, PR, versiones), las 5 lecciones y el trabajo futuro. |
| 10 | 14:30-15:00 | **Cierre** | Slide final | Enlaces al repositorio, slides y apps. Agradecimiento. |

## Frases clave (para no olvidarlas)

- «La IA ha abaratado escribir código; lo caro ahora es entenderlo y gobernarlo.»
- «Una app publicada en la tienda es un contrato: no puedo obligar a nadie a actualizar, así que todo cambio es aditivo.»
- «Que un agente diga que ha terminado no demuestra nada; lo demuestran los checks y las evidencias.»
- «Antes de gastar un crédito de vídeo, la persona ve el plan, el coste y cada prompt.»

## Checklist previo a grabar

- [ ] Cuentas de demo de ICG Vault y Chafit360 con datos de ejemplo cargados.
- [ ] RRSS Studio arrancado con un proyecto ya analizado (para no esperar a la IA en directo).
- [ ] Notificaciones del sistema silenciadas; sin pestañas con datos personales o claves visibles.
- [ ] Ajustes de RRSS Studio: comprobar que no se ve ninguna clave (la UI las enmascara).
- [ ] Móvil con espejo de pantalla (QuickTime en iOS o `scrcpy` en Android).
- [ ] Audio probado: micrófono cerca y sala sin eco.
