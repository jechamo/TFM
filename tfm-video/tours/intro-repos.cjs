// Graba la intro del TFM: la slide 2 («cuatro repositorios») revelando cada repo cuando la voz lo nombra.
// Uso: node tools/build-site.mjs && node tfm-video/tours/intro-repos.cjs <salida.mp4> [timeline.json]
// La slide se abre en modo grabación (?rec): sin barra de navegación ni credenciales, y con window.setStep(n).
// timeline.json = { "duration": s, "steps": [[segundo, paso], …] } (lo genera intro_timeline.py a partir de la
// voz). Sin timeline usa tiempos por defecto, útiles para previsualizar. Misma captura que tours/sdd-web.cjs:
// screencast de Chromium (fotogramas con marca de tiempo) ensamblado a 30 fps con ffmpeg.
const path = require('path');
const fs = require('fs');
const os = require('os');
const { pathToFileURL } = require('url');
const { execFileSync, execSync } = require('child_process');

const root = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(root, 'playwright'));

const OUT = path.resolve(process.argv[2] || 'Intro.mp4');
const TIMELINE = process.argv[3]
  ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))
  : { duration: 34, steps: [[6.5, 1], [14, 2], [19.5, 3], [24.5, 4], [31, 5]] };
const SLIDES = path.resolve(__dirname, '..', '..', '_site', 'slides', 'index.html');
const W = 1920, H = 1080;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  if (!fs.existsSync(SLIDES)) throw new Error(`No existe ${SLIDES}: ejecuta antes node tools/build-site.mjs`);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'intro-tour-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(pathToFileURL(SLIDES).href + '?rec#2', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.setStep(0));
  await sleep(1200);                                   // imágenes decodificadas y estado inicial estable

  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  let first = null;
  cdp.on('Page.screencastFrame', async f => {
    const file = path.join(tmp, `f${String(frames.length).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    if (first) first();
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (_) {}
  });
  const started = new Promise(r => { first = r; });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await started;                                       // t = 0 es el primer fotograma
  const t0 = Date.now();
  const log = [];
  for (const [t, n] of TIMELINE.steps) {
    await sleep(Math.max(0, t0 + t * 1000 - Date.now()));
    await page.evaluate(k => window.setStep(k), n);
    log.push(`${((Date.now() - t0) / 1000).toFixed(2).padStart(6)}  paso ${n}`);
    console.log(log.at(-1));
  }
  await sleep(Math.max(0, t0 + TIMELINE.duration * 1000 - Date.now()));
  const tEnd = frames[0].t + (Date.now() - t0) / 1000;
  await cdp.send('Page.stopScreencast');
  await sleep(300);
  await browser.close();

  // Cada fotograma dura hasta el siguiente; el último, hasta el final de la grabación (la slide queda quieta).
  const list = frames.map((f, i) => {
    const next = frames[i + 1] ? frames[i + 1].t : tEnd;
    return `file '${f.file.replace(/\\/g, '/')}'\nduration ${Math.max(next - f.t, 0.001).toFixed(4)}`;
  }).join('\n') + `\nfile '${frames.at(-1).file.replace(/\\/g, '/')}'\n`;
  const listFile = path.join(tmp, 'frames.txt');
  fs.writeFileSync(listFile, list);
  const ff = execFileSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-t', String(TIMELINE.duration), OUT]);
  fs.writeFileSync(OUT.replace(/\.mp4$/, '.tiempos.txt'), log.join('\n') + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`ok ${OUT} · ${frames.length} fotogramas · ${TIMELINE.duration} s`);
})().catch(e => { console.error(e); process.exit(1); });
