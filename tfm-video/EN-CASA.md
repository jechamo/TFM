# Montar el vídeo de ICG Vault en tu PC

El vídeo en bruto está en Drive (`Screen_Recording_20260925_141002_Chrome.mp4`, 110 MB, grabación del
móvil, sin voz). Desde el entorno en la nube no se puede descargar, así que el montaje se hace en local.

## 1. Preparar (una sola vez)

```bat
git clone https://github.com/jechamo/TFM.git
cd TFM
git checkout claude/wonderful-mayer-8d0vkf
pip install imageio-ffmpeg
npm i -g playwright
npx playwright install chromium
```

## 2. Colocar los archivos

```text
tfm-video/raw/icg-vault-movil.mp4    ← el vídeo descargado de Drive, renombrado
tfm-video/assets/music.mp3           ← música (mejor de la Biblioteca de audio de YouTube)
tfm-video/assets/whoosh.ogg          ← efecto de transición (p. ej. Kenney impactSoft_medium_001)
```

`raw/`, `assets/`, `work/` y `final/` están en `.gitignore`: los vídeos no se suben al repositorio.

## 3. Pedírselo a Claude Code

Abre Claude Code en la carpeta `TFM` y pega:

> Monta el vídeo de ICG Vault con `tfm-video/edit.py` y `tfm-video/projects/icg-vault.json`.
> Primero revisa fotogramas de `tfm-video/raw/icg-vault-movil.mp4` cada 2 s y ajusta en el JSON
> las leyendas (`callouts`) a lo que se ve en cada momento, los tramos de espera que acelerar
> (`speedups`) y los zooms. Haz un `--draft`, enséñame fotogramas de cada leyenda y luego la versión final.
> Después, haz un tráiler de 20 s con `/brag-slim` usando ese metraje y los colores y el copy reales de `icgbolt`.

O a mano:

```bat
cd tfm-video\projects
python ..\edit.py icg-vault.json --draft
python ..\edit.py icg-vault.json
```

Resultado en `tfm-video/final/icg-vault/`: `tfm-video.mp4`, `chapters.txt` y `thumbnail.jpg`.

## 4. Tráiler con /brag

```bat
npx skills add https://github.com/latent-spaces/brag --skill brag-slim
```

Y en Claude Code, dentro de la carpeta de `icgbolt`: *«/brag-slim sobre ICG Vault, usando el metraje real
de `..\TFM\tfm-video\raw\icg-vault-movil.mp4`, tono polished, 20 s»*.
