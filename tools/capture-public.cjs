// Captura pantallas públicas (sin login) de los productos y del sistema SDD.
// Uso: node tools/capture-public.cjs  → site/assets/img/screens/*.png
const path = require('path');
function loadPlaywright() {
  try { return require('playwright'); } catch (_) {}
  const root = require('child_process').execSync('npm root -g').toString().trim();
  return require(path.join(root, 'playwright'));
}
const OUT = path.join(__dirname, '..', 'site', 'assets', 'img', 'screens');
const SHOTS = [
  { name: 'chafit-landing', url: 'https://chafit.es/', w: 1440, h: 900 },
  { name: 'chafit-pricing', url: 'https://chafit.es/pricing', w: 1440, h: 900 },
  { name: 'chafit-landing-mobile', url: 'https://chafit.es/', w: 390, h: 844, mobile: true },
  { name: 'icgvault-landing', url: 'https://icgvault.es/', w: 1440, h: 900 },
  { name: 'icgvault-landing-mobile', url: 'https://icgvault.es/', w: 390, h: 844, mobile: true },
  { name: 'sdd-site', url: 'https://jechamo.github.io/Estructura_inicial_claude/', w: 1440, h: 900 },
  { name: 'sdd-docs', url: 'https://jechamo.github.io/Estructura_inicial_claude/documentacion.html', w: 1440, h: 900 },
];
(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  for (const s of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: s.mobile ? 2 : 1, isMobile: !!s.mobile, hasTouch: !!s.mobile, locale: 'es-ES' });
    const page = await ctx.newPage();
    try {
      await page.goto(s.url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) { console.log('warn', s.name, e.message.split('\n')[0]); }
    await page.waitForTimeout(2500);
    // Banner de consentimiento: siempre la opción más privada.
    const essential = page.getByRole('button', { name: /solo errores esenciales|rechazar|solo esenciales/i });
    if (await essential.count()) { await essential.first().click().catch(() => {}); await page.waitForTimeout(800); }
    await page.screenshot({ path: path.join(OUT, s.name + '.png') });
    console.log('ok', s.name, await page.title());
    await ctx.close();
  }
  await browser.close();
})();
