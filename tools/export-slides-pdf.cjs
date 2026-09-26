// Exporta la presentación a PDF (una página 1920×1080 por diapositiva) con los enlaces activos.
// Los enlaces relativos se reescriben a la URL pública para que funcionen desde el PDF.
// Uso: node tools/build-site.mjs && node tools/export-slides-pdf.cjs
const path = require('path');
const { pathToFileURL } = require('url');
function loadPlaywright() {
  try { return require('playwright'); } catch (_) {}
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const ROOT = path.resolve(__dirname, '..');
const PUBLIC = 'https://jechamo.github.io/TFM/slides/';
const REPO = 'https://github.com/jechamo/TFM/blob/HEAD/';
const OUT = path.join(ROOT, 'site', 'slides', 'TFM-Jorge-Chamorro.pdf');
(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(pathToFileURL(path.join(ROOT, '_site', 'slides', 'index.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(({ PUBLIC, REPO }) => {
    document.querySelectorAll('a[href]').forEach((a) => {
      a.href = a.dataset.gh ? REPO + a.dataset.gh : new URL(a.getAttribute('href'), PUBLIC).href;
    });
  }, { PUBLIC, REPO });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: OUT, width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await browser.close();
  console.log('PDF:', path.relative(ROOT, OUT));
})();
