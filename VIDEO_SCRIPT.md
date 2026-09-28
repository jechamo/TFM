# Guion del vídeo del TFM

> **Vídeo principal:** `tfm-completo` (16:30, 1920×1080, narración sintética, subtítulos en español y capítulos).
> Se compone de los cuatro vídeos finales en este orden: sistema SDD/TDD (`media/final/sdd`) → RRSS Studio → ChaFit → ICG Vault.
> Reproducir: <https://jechamo.github.io/TFM/video.html?v=tfm-completo> · Resumen de 8:08: `?v=tfm-resumen`.
> Montaje: [`tfm-video/combine.py`](tfm-video/combine.py). Capítulos y subtítulos: [`site/data/videos.json`](site/data/videos.json) y [`site/videos/`](site/videos/).

La columna *Narración* resume la locución real (el texto completo está en los subtítulos). Los tiempos son los del vídeo publicado.

## Parte 1 · Sistema SDD/TDD con agentes (0:00–4:39)

| Tiempo | Narración | Pantalla | Acción | Mensaje |
|---|---|---|---|---|
| 0:00 | Un agente escribe rápido, pero nadie sabe qué ha decidido ni si funciona; la respuesta: 20 agentes que no escriben sin especificación | web del sistema, portada | apertura | el problema y la tesis del TFM |
| 0:30 | Instalar en tres pasos: ruta, modo (greenfield, brownfield o auto), simular, instalar y verificar | instalador guiado de la web | se rellenan los campos y se copian los comandos | instalación segura: primero simula, después verifica contra el disco |
| 1:02 | `update` reconcilia sin sobrescribir: specs, decisiones y bitácora no se tocan | sección de actualización | recorrido por la tabla de reconciliación | el kit convive con el proyecto |
| 1:22 | El circuito: especificar, planificar, implementar (rojo, verde, refactor), verificar y entregar | diagrama del circuito | se ilumina cada etapa | cada fase produce lo que la siguiente necesita; el vídeo agrupa en cinco etapas las diez fases del circuito |
| 2:07 | Tres niveles (light, compact, full) y seis puertas humanas | niveles y gates | se señalan los niveles y las puertas | la máquina propone, la persona decide |
| 2:40 | 20 agentes en cinco familias; solo tres delegan y ninguna cadena pasa de dos saltos | mapa de agentes | recorrido por familias | arquitectura agentic con territorios |
| 3:00 | 27 skills invocables con `/` | catálogo de skills | desplazamiento | el circuito se maneja desde el chat |
| 3:18 | Cuatro garantías: sin spec no hay código, rojo antes que verde, OWASP y accesibilidad | garantías | resaltado | la calidad no depende de la memoria de nadie |
| 3:38 | Claude Code, Copilot, VS Code, Cursor, Codex, Gemini y Antigravity | entornos compatibles | logotipos | un solo perfil, adaptado a cada herramienta |
| 3:52 | Preguntas frecuentes: sin atajos en los controles, fusión, sin dependencias, cualquier lenguaje | FAQ | se abren respuestas | objeciones habituales resueltas |
| 4:24 | «La IA escribe el código… y el circuito se asegura de que esté bien hecho» | cierre | — | lema del sistema |

## Parte 2 · RRSS Studio · LeadView (4:39–8:38)

| Tiempo | Narración | Pantalla | Acción | Mensaje |
|---|---|---|---|---|
| 4:39 | Programar es la mitad; la otra es contarlo. LeadView va del código a las redes | panel de proyectos (ICG Vault y ChaFit) | se crea un proyecto | producto greenfield construido con el método |
| 5:12 | Analiza la web y el código, dibuja el mapa funcional con evidencias y escribe el dossier | pipeline en vivo, mapa y dossier | se lanza el análisis | IA combinada con evidencia verificable (Playwright) |
| 5:56 | Competencia, clientes potenciales reales en el mapa y virales del nicho | competencia, leads y virales | recorrido por pestañas | inteligencia de mercado accionable |
| 6:39 | Plan de montaje con segundos reales/IA y coste antes de generar; vídeo final y estudio multimedia | plan, guion y estudio | se aprueba el plan | control de coste y aprobación humana antes de gastar |
| 7:26 | Laboratorio de clips: los 10 momentos más virales y polémicos, en vertical y subtitulados | laboratorio de clips | se sube un vídeo | IA multimodal (transcripción, cortes, subtítulos) |
| 7:47 | Motor de IA elegible, claves cifradas con prueba de conexión, herramientas detectadas | ajustes | prueba de conexión | secretos en Vault cifrado, nunca en `.env` |
| 8:07 | Prueba en directo con la plantilla de este TFM | análisis de un proyecto nuevo | espera y resultados | funciona con cualquier proyecto |
| 8:30 | «Del código… a las redes» | cierre | — | — |

> **Discrepancia conocida (7:47).** La locución menciona «Claude Code o el Agent SDK»; en el código el Agent SDK es un marcador sin implementar. Está documentado como PARCIAL en el [inventario de RRSS](docs/discovery/RRSS_FUNCTIONAL_INVENTORY.md). Corregirlo en la locución es opcional (ver [estado de entrega](TFM_DELIVERY_STATUS.md)).

## Parte 3 · ChaFit (8:38–12:23)

| Tiempo | Narración | Pantalla | Acción | Mensaje |
|---|---|---|---|---|
| 8:38 | Rutina, dieta, pesos y entrenador dispersos; ChaFit lo junta | apertura | — | producto brownfield en producción |
| 8:58 | Progreso, sesión guiada con calentamiento, superseries, descanso, progreso por ejercicio, antes/después con IA, rutinas, cambio de ejercicio con IA y «tu máquina» | app del cliente (móvil) | sesión completa | IA de visión e imagen al servicio del entrenamiento |
| 10:20 | Dieta con foto al plato, rutina/dieta por texto, voz o foto, logros, rankings, asistente y mapa de entrenadores | dieta, generador y mapa | foto al plato y generación | IA multimodal con JSON Schema estricto |
| 11:20 | Panel del entrenador: clientes, asignación y perfil público con radio | panel del entrenador | asignación | cuatro roles en una sola SPA |
| 11:46 | Panel del gimnasio: entrenadores, alumnos, rendimiento y códigos | panel del gimnasio | tutorial y métricas | producto B2B además de B2C |
| 12:10 | «Tu entrenamiento, al siguiente nivel» · web, iPhone y Android | cierre | — | publicado en tres plataformas |

## Parte 4 · ICG Vault (12:23–16:30)

| Tiempo | Narración | Pantalla | Acción | Mensaje |
|---|---|---|---|---|
| 12:23 | ¿Dónde está tu opinión sobre lo que ves y juegas? | apertura | — | producto brownfield en producción |
| 12:48 | Fichas con TMDB, IGDB, HowLongToBeat y Metacritic; voto rápido y biblioteca | fichas y voto rápido | búsqueda y votos | catálogo externo tras un proxy con caché |
| 13:28 | El voto pesa más cuanto más nivel tienes | perfil y niveles | subida de nivel | lógica de juego en SQL (RPC) |
| 13:49 | Cofres, objetos, mascotas y guardianes creados con IA | cofres y perfil | apertura de un cofre | IA generativa de imagen |
| 14:07 | ICG Duelo, Arena PvP, Inmortales, Zoom Out, FlashOut y Timeline | juegos | partidas | juegos diarios y competitivos |
| 15:05 | Feed, listas, debates, encuestas, quiz semanal con IA, sugerencias, noticias, podcast y rankings | comunidad | recorrido | escala funcional: 63 funcionalidades en 13 módulos |
| 15:55 | Web, iPhone y Android con Google o Apple | apps y login | — | publicado en tres plataformas |
| 16:19 | «¡Nos vemos dentro!» | cierre | — | — |

## Cobertura frente a lo que debe enseñar el vídeo

| Tema | Dónde aparece |
|---|---|
| Sistema, SDD, agentes y workflow | Parte 1 completa |
| RRSS, ChaFit e ICG Vault | Partes 2, 3 y 4 |
| IA e integraciones | 5:12–7:47 (RRSS), 8:58–10:20 (ChaFit), 12:48 y 13:49 (ICG Vault) |
| Arquitectura | **no aparece en pantalla**: cubierta por las slides 8, 10, 12 y 14 y por la web |
| Auditorías, resultados y relación con el máster | **no aparecen**: cubiertos por las slides 16, 17, 19 y 20 |

## Bloque técnico opcional (ACCIÓN REQUERIDA DEL AUTOR, opcional)

Si el tribunal espera que el vídeo cubra también arquitectura, auditorías y máster, se puede grabar un bloque de unos 2 minutos **con voz propia** (que además responde a cualquier duda sobre la narración sintética) y anteponerlo o añadirlo al final con `tfm-video/combine.py`. Pantalla: las slides en <https://jechamo.github.io/TFM/slides/> a pantalla completa (tecla `f`).

| Tiempo | Narración propuesta | Pantalla | Acción | Mensaje |
|---|---|---|---|---|
| 0:00 | «Soy Jorge Chamorro. Mi TFM es un sistema de ingeniería de software con agentes que he aplicado a tres productos reales, en cuatro repositorios.» | slides 1–2 | — | quién y qué |
| 0:15 | «Los agentes escriben deprisa, pero se autocertifican. En ChaFit eso acabó en 317 filas desplazadas en producción.» | slide 3 | — | el problema con un dato real |
| 0:30 | «La spec manda, el test demuestra y la persona decide: diez fases, seis puertas y verificación fuera del modelo.» | slides 4–5 | — | la solución |
| 0:50 | «Cada producto tiene su arquitectura modelada como código: un monolito local, una SPA con Edge Functions y una red social con la lógica del juego en SQL.» | slides 10, 12 y 14 | — | arquitectura |
| 1:15 | «Treinta y dos integraciones y treinta y tres funcionalidades con IA, sin claves en el cliente.» | slide 15 | — | integraciones e IA |
| 1:30 | «El sistema también audita: 53 hallazgos en ChaFit y 48 en ICG Vault. Las correcciones están planificadas y pendientes de aprobación.» | slide 16 | — | auditorías, con honestidad |
| 1:45 | «46 de 54 competencias del máster tienen evidencia enlazada. A continuación, el sistema y los productos en acción.» | slides 19–20 | — | máster y transición |
