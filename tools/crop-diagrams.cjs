// Recorta el marco (título, etiqueta y pie) de las vistas usadas en las slides y
// ajusta el viewBox al contenido real, para que el diagrama ocupe la diapositiva.
// Uso: node tools/crop-diagrams.cjs   (tras node architecture/tools/render.mjs)
const path = require('path');
const fs = require('fs');
function loadPlaywright() {
  try { return require('playwright'); } catch (_) {}
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'architecture', 'exported', 'svg');
const OUT = path.join(ROOT, 'site', 'slides', 'img');
const VIEWS = ['sdd-circuit-dark', 'sdd-agents-dark', 'tfm-overview-dark', 'rrss-slides-dark', 'chafit-slides-dark', 'icgvault-slides-dark'];
const HEAD = 95, FOOT = 50, PAD = 28;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const name of VIEWS) {
    const svg = fs.readFileSync(path.join(SRC, name + '.svg'), 'utf8');
    await page.setContent(`<!doctype html><body style="margin:0">${svg}</body>`);
    const box = await page.evaluate(({ HEAD, FOOT }) => {
      const root = document.querySelector('svg');
      const [, , W, H] = root.getAttribute('viewBox').split(/\s+/).map(Number);
      const r0 = root.getBoundingClientRect(), k = W / r0.width;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      root.querySelectorAll('rect,path,text,circle,line,polyline,polygon,ellipse').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        const a = (r.left - r0.left) * k, b = (r.top - r0.top) * k, c = (r.right - r0.left) * k, d = (r.bottom - r0.top) * k;
        if (c - a >= W * 0.95) return;          // fondo
        if (b < HEAD || d > H - FOOT) return;   // título, etiqueta y pie del marco
        x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d);
      });
      return { x0, y0, x1, y1, W, H };
    }, { HEAD, FOOT });
    const x = Math.max(0, Math.floor(box.x0 - PAD)), y = Math.max(0, Math.floor(box.y0 - PAD));
    const w = Math.ceil(Math.min(box.W, box.x1 + PAD) - x), h = Math.ceil(Math.min(box.H, box.y1 + PAD) - y);
    const out = svg
      .replace(/viewBox="[^"]*"/, `viewBox="${x} ${y} ${w} ${h}"`)
      .replace(/(<svg[^>]*?)\swidth="[^"]*"/, '$1').replace(/(<svg[^>]*?)\sheight="[^"]*"/, '$1');
    fs.writeFileSync(path.join(OUT, name + '.svg'), out);
    console.log(name, `${x} ${y} ${w} ${h}`);
  }
  await browser.close();
})();
