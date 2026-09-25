# Postproducción del vídeo del TFM

Montaje reproducible. Las grabaciones en bruto entran por un lado y salen el vídeo final, los
subtítulos, los capítulos para YouTube y la miniatura. Todo se describe en un `project.json`, así que
cambiar un corte o un título es editar una línea y volver a lanzar el script.

```text
raw/*.mp4 ──► edit.py (pasada 1: encuadre · zooms · cortes · acelerados · cartelas · fundidos)
          ──► work/assembled.mp4
          ──► edit.py (pasada 2: voz limpia · música con ducking · SFX · subtítulos · -14 LUFS)
          ──► final/tfm-video.mp4 · tfm-video.srt · chapters.txt · thumbnail.jpg
```

## Qué hace

| Efecto | Cómo |
|---|---|
| **Ventana flotante** | La grabación de pantalla se muestra como una ventana con esquinas redondeadas y sombra sobre el fondo degradado de las slides. |
| **Móvil en marco** | El vídeo del móvil entra en un marco de teléfono, solo (`phone`) o junto a la web (`side`). |
| **Zooms suaves** | Zoom con *easing* hacia un punto (`cx`, `cy` de 0 a 1) entre `t0` y `t1` de la grabación. |
| **Cortes automáticos** | Detecta los silencios de más de 0,7 s y los recorta dejando algo de aire. |
| **Acelerados** | Las esperas (builds, cargas, IA pensando) se aceleran con la etiqueta `⏩ ×4`; la música cubre ese hueco. |
| **Cartelas animadas** | Intro, una cartela numerada por sección y cierre, con la tipografía y los colores de las slides. |
| **Rótulos inferiores** | Nombre y URL del producto entran y salen deslizándose. |
| **Transiciones** | Fundidos variados entre secciones (fade, deslizamiento, apertura circular) con un golpe sonoro suave. |
| **Audio** | Filtro de graves, reducción de ruido, compresión, música a -24 dB que baja sola cuando hablas y `loudnorm` a -14 LUFS (el nivel de YouTube). |
| **Subtítulos** | Quemados en el vídeo y también en `.srt` aparte. Salen de faster-whisper o de un `.srt` propio, y un glosario corrige nombres como Chafit360, ICG Vault o Supabase. |
| **Capítulos y miniatura** | `chapters.txt` listo para pegar en la descripción de YouTube y `thumbnail.jpg` a 1280×720. |

## Cómo grabar (para que el montaje quede bien)

- **OBS Studio**, 1920×1080 a 30 fps, x264 con CRF 23 (o unos 6.000 kbps). Voz en la pista 1.
- **Un archivo por sección del [guion](../docs/05-guion-video.md)**: `01-intro.mp4`, `02-plantilla.mp4`, `03-rrss.mp4`…
  Si te equivocas, **haz una pausa de 2 segundos y repite la frase**: el corte de silencios facilita quitar la toma mala.
- **Móvil**: grábalo con la grabación de pantalla del propio sistema (iOS o Android) y **da una palmada o di «sync»**
  al empezar, visible y audible en las dos grabaciones, para poder sincronizarlas (`phone_offset`).
- Apunta los segundos de las **esperas** (para acelerarlas) y de los **momentos clave** (para hacer zoom).
  Si no lo haces, los saco yo revisando fotogramas.
- **Cada archivo por debajo de 95 MB** (el límite de GitHub es de 100 MB): con CRF 23 son unos 2 minutos por archivo.

## Cómo pasarme las grabaciones

Este entorno solo puede descargar de GitHub (Drive y Dropbox están bloqueados y el conector de Drive
no sirve para archivos grandes):

1. Crea un repositorio **privado** nuevo, p. ej. `jechamo/tfm-video-raw`. **No uses el repositorio público `TFM`.**
2. Sube los clips a `raw/` (arrastrándolos en la web de GitHub o con `git push`).
3. Dímelo: lo añado a la sesión, monto el vídeo y te devuelvo el resultado en ese mismo repositorio, en `final/`
   (partido en trozos si pasa de 95 MB, con un `unir.bat` para recomponerlo).

## Uso

```bash
pip install imageio-ffmpeg faster-whisper      # ffmpeg estático + transcripción
npm i -g playwright                            # renderizado de las cartelas
python edit.py project.json --draft            # borrador rápido para revisar
python edit.py project.json                    # versión final (x264 slow, CRF 18)
python edit.py project.json --only-finish      # rehace solo audio y subtítulos
```

Ejemplo comentado de proyecto: [`project.example.json`](project.example.json).

## Música y efectos

- Efectos: [Kenney](https://kenney.nl/) (CC0), tomados del repositorio [`latent-spaces/brag`](https://github.com/latent-spaces/brag).
- Música: los borradores usan la serie *Happy Beats / Business Moves* de [ende.app](https://ende.app/en), que viene
  en `brag`. **Su licencia no está verificada**, así que para el vídeo publicado en YouTube es más seguro usar un
  tema de la **Biblioteca de audio de YouTube** (YouTube Studio → Biblioteca de audio), que no genera reclamaciones.

## Tráileres con /brag

Aparte del montaje, [`/brag-slim`](https://github.com/latent-spaces/brag) sirve para hacer **tráileres de unos
20 s** de cada producto, con tu metraje real, su música y su texto para compartir. Van al principio del vídeo y
de cada bloque de producto, y en vertical sirven para redes.

## Escena «hecho con mi propia app»

Ver [`rrss-studio-escena.md`](rrss-studio-escena.md): usar el Laboratorio de clips de RRSS Studio sobre este mismo
vídeo y enseñarlo en el bloque de RRSS Studio.
