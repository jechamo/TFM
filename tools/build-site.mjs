// Sincroniza los recursos generados dentro de site/ (para que site/ se vea completo en local,
// incluso abierto como fichero) y ensambla el sitio publicable en _site/ (GitHub Pages).
// Uso: node tools/build-site.mjs [--with-videos]
//   --with-videos  copia los MP4 de media/final a _site/videos (solo previsualización local; en CI se
//                  descargan del GitHub Release indicado en site/data/videos.json).
import { cpSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(ROOT, '_site');

// 1. Diagramas generados → site/diagrams (svg estáticos y HTML interactivos de Archify).
const svgSrc = path.join(ROOT, 'architecture', 'exported', 'svg');
const htmlSrc = path.join(ROOT, 'architecture', 'exported', 'html');
rmSync(path.join(SITE, 'diagrams'), { recursive: true, force: true });
cpSync(svgSrc, path.join(SITE, 'diagrams', 'svg'), { recursive: true });
if (existsSync(htmlSrc)) cpSync(htmlSrc, path.join(SITE, 'diagrams', 'interactive'), { recursive: true });

// 2. Catálogo de vídeos como script: funciona con http:// y con file:// (fetch no).
const catalog = readFileSync(path.join(SITE, 'data', 'videos.json'), 'utf8');
writeFileSync(path.join(SITE, 'data', 'videos.js'), '// Generado por tools/build-site.mjs desde videos.json\nwindow.TFM_VIDEOS = ' + JSON.stringify(JSON.parse(catalog)) + ';\n');

// 3. Sitio publicable.
rmSync(OUT, { recursive: true, force: true });
cpSync(SITE, OUT, { recursive: true, filter: (src) => !src.includes(path.join(SITE, 'videos') + path.sep) || src.endsWith('.vtt') });
writeFileSync(path.join(OUT, '.nojekyll'), '');

if (process.argv.includes('--with-videos')) {
  const cat = JSON.parse(catalog);
  mkdirSync(path.join(OUT, 'videos'), { recursive: true });
  for (const v of cat.videos) {
    const src = path.join(ROOT, 'media', 'final', v.id, v.file);
    if (existsSync(src)) cpSync(src, path.join(OUT, 'videos', v.file));
  }
  console.log('vídeos copiados desde media/final');
}
console.log('site/ sincronizado y sitio ensamblado en _site/');
