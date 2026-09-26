# Instalación y ejecución

## 1. Sistema SDD/TDD (núcleo)

Requisitos: Node.js ≥ 18 y Git. Sin dependencias de runtime.

```bash
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 init ./mi-proyecto --mode auto --dry-run
```

```bash
npx --yes github:jechamo/Estructura_inicial_claude#v0.9.1 init ./mi-proyecto --mode auto
```

`--dry-run` enseña qué escribiría, fusionaría o conservaría sin tocar el disco. `--mode auto` elige greenfield (carpeta vacía) o brownfield (con código). No hace commits, no escribe secretos y no activa MCP salvo `--with-mcp`.

Comprobar el propio kit desde su repositorio:

```bash
git clone https://github.com/jechamo/Estructura_inicial_claude.git && cd Estructura_inicial_claude
```

```bash
node scripts/check-sdd.mjs && npm test
```

Web informativa con instalador guiado: <https://jechamo.github.io/Estructura_inicial_claude/>.

## 2. RRSS Studio (LeadView)

Requisitos: Windows 11, Node.js ≥ 20. Opcionales: sesión de Claude Code, FFmpeg, yt-dlp, Chromium de Playwright, whisper.cpp.

```bash
git clone https://github.com/jechamo/rrss-automation-app.git && cd rrss-automation-app
```

Instalación guiada (doble clic en `preparar.bat`) o paso a paso:

```bash
node scripts/install-local.mjs prepare
```

```bash
node scripts/install-local.mjs start
```

Abrir <http://localhost:3000>. Las claves de proveedores se configuran en `/ajustes` y se guardan cifradas.

**Probar sin claves ni créditos** (cualquier sistema operativo):

```bash
npm ci && npx playwright install chromium && npm run test:e2e:mock
```

## 3. ChaFit e ICG Vault

Son productos en producción; para evaluarlos no hace falta instalarlos:

| Producto | Web | iOS | Android |
|---|---|---|---|
| ChaFit | <https://chafit.es> | [App Store](https://apps.apple.com/app/chafit/id6759172876) | [Google Play](https://play.google.com/store/apps/details?id=com.chafit.app) |
| ICG Vault | <https://icgvault.es> | [App Store](https://apps.apple.com/app/id6759173751) | [Google Play](https://play.google.com/store/apps/details?id=com.icgvault.app) |

Código: [`jechamo/chafit360`](https://github.com/jechamo/chafit360) y [`jechamo/icgbolt`](https://github.com/jechamo/icgbolt). Ejecutarlos en local requiere un proyecto Supabase propio con sus migraciones y secretos (no incluidos).

## 4. Este repositorio (entrega del TFM)

```bash
git clone https://github.com/jechamo/TFM.git && cd TFM
```

Regenerar diagramas, tablas y web:

```bash
node architecture/tools/render.mjs && node architecture/tools/export-model.mjs && node tools/build-site.mjs
```

Ver [`architecture/README.md`](../../architecture/README.md) para PNG, Archify, recorte de las vistas de slides y PDF.

Ver la web en local: abrir `site/index.html` directamente, o, para reproducir los vídeos y saltar entre capítulos, copiar los MP4 de `media/final` y servir `_site/` con cualquier servidor estático que admita peticiones *Range* (GitHub Pages las admite; `python -m http.server` no):

```bash
node tools/build-site.mjs --with-videos
```
