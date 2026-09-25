// Renderiza los gráficos de titles/card.html a PNG (fijos) o a secuencias de fotogramas (animados).
// Uso: node render.cjs <trabajos.json> <carpeta_salida>
// Cada trabajo: { name, kind, params: {title, sub, n, url}, dur: segundos (0 = imagen fija),
//                 transparent: bool, width, height }
const path = require('path');
const fs = require('fs');

function loadPlaywright() {
  try { return require('playwright'); } catch (_) {}
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}

(async () => {
  const [jobsFile, outDir] = process.argv.slice(2);
  const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));
  const fps = 30;
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const card = 'file://' + path.join(__dirname, 'titles', 'card.html');

  for (const job of jobs) {
    const w = job.width || 1920, h = job.height || 1080;
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const qs = new URLSearchParams({ kind: job.kind, ...(job.params || {}), dur: String(job.dur || 0) });
    await page.goto(`${card}?${qs}`);
    await page.evaluate(() => document.fonts.ready);
    const shot = file => page.screenshot({ path: file, omitBackground: !!job.transparent, clip: { x: 0, y: 0, width: w, height: h } });

    if (!job.dur) {
      await shot(path.join(outDir, `${job.name}.png`));
    } else {
      const dir = path.join(outDir, job.name);
      fs.mkdirSync(dir, { recursive: true });
      const frames = Math.round(job.dur * fps);
      for (let f = 0; f < frames; f++) {
        await page.evaluate(t => window.setT(t), f / fps);
        await shot(path.join(dir, `f${String(f).padStart(5, '0')}.png`));
      }
    }
    await page.close();
    console.log('ok', job.name);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
