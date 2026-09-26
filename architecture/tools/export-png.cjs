// Rasteriza los SVG exportados a PNG (2x) con el Chromium de Playwright.
// Uso: node architecture/tools/export-png.cjs [filtro]
const path = require('path');
const fs = require('fs');
function loadPlaywright() {
  try { return require('playwright'); } catch (_) {}
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const ROOT = path.resolve(__dirname, '..', '..');
const SVG = path.join(ROOT, 'architecture', 'exported', 'svg');
const PNG = path.join(ROOT, 'architecture', 'exported', 'png');
(async () => {
  fs.mkdirSync(PNG, { recursive: true });
  const filter = process.argv[2] || '';
  const files = fs.readdirSync(SVG).filter((f) => f.endsWith('.svg') && f.includes(filter));
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const f of files) {
    const svg = fs.readFileSync(path.join(SVG, f), 'utf8');
    const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
    const w = Math.ceil(+m[1]), h = Math.ceil(+m[2]);
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<html><head><style>html,body{margin:0;padding:0}</style></head><body>${svg}</body></html>`);
    await page.screenshot({ path: path.join(PNG, f.replace(/\.svg$/, '.png')), clip: { x: 0, y: 0, width: w, height: h } });
  }
  await browser.close();
  console.log(`${files.length} PNG en ${path.relative(ROOT, PNG)}`);
})();
