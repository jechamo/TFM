// Graba un recorrido por la web del ecosistema SDD a 1920×1080 (sin audio) para montarlo con narrated.py.
// Uso: node tours/sdd-web.cjs <salida.mp4> [url]
// Captura con el screencast de Chromium (fotogramas JPEG con marca de tiempo) y los ensambla a 30 fps con
// ffmpeg. Imprime el guion de tiempos (qué se ve en cada segundo) para planificar los planos.
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync, execSync } = require('child_process');

const root = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(root, 'playwright'));

const OUT = path.resolve(process.argv[2] || 'SDD.mp4');
const URL = process.argv[3] || 'https://jechamo.github.io/Estructura_inicial_claude/';
// La web se amplía al 150 % con zoom CSS: se captura a 1920×1080 reales con el texto grande y nítido
// (el screencast ignora deviceScaleFactor, así que no sirve una ventana pequeña a densidad 1,5).
const W = 1920, H = 1080, ZOOM = 1.5;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sdd-tour-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(z => {
    document.documentElement.style.zoom = String(z);
    document.documentElement.style.scrollBehavior = 'auto';   // el scroll lo anima el recorrido
  }, ZOOM);

  // Cursor visible: un punto que sigue al ratón y late al hacer clic.
  await page.addStyleTag({ content: `
    #cursor-tour { position: fixed; left: 0; top: 0; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%;
      background: rgba(255,255,255,.92); box-shadow: 0 0 0 3px rgba(124,131,255,.55), 0 4px 14px rgba(0,0,0,.5);
      pointer-events: none; z-index: 2147483647; transition: transform .12s ease; }
    #cursor-tour.clic { transform: scale(.6); }` });
  await page.evaluate(() => {
    const c = document.createElement('div'); c.id = 'cursor-tour'; document.body.appendChild(c);
    // Con zoom en <html>, el cursor (dentro del documento) también se amplía: se divide por el zoom.
    const z = parseFloat(document.documentElement.style.zoom) || 1;
    addEventListener('mousemove', e => { c.style.left = e.clientX / z + 'px'; c.style.top = e.clientY / z + 'px'; });
    addEventListener('mousedown', () => c.classList.add('clic'));
    addEventListener('mouseup', () => c.classList.remove('clic'));
  });

  // Screencast
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => {
    const file = path.join(tmp, `f${String(frames.length).padStart(6, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (_) {}
  });

  let mx = W / 2, my = H / 2;
  const move = async (x, y, steps = 25) => { await page.mouse.move(x, y, { steps }); mx = x; my = y; };
  const t0 = Date.now();
  const log = [];
  const mark = what => { const s = ((Date.now() - t0) / 1000).toFixed(1); log.push(`${s.padStart(6)}  ${what}`); console.log(log.at(-1)); };

  // Desplazamiento suave (easeInOutCubic) hasta que el elemento quede a `offset` px del borde superior.
  const scrollTo = async (target, ms = 1800, offset = 90) => {
    const y = typeof target === 'number' ? target : await target.evaluate((el, off) =>
      Math.max(0, el.getBoundingClientRect().top + scrollY - off), offset);
    await page.evaluate(([to, dur]) => new Promise(res => {
      const from = scrollY, d = to - from, start = performance.now();
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = now => { const p = Math.min((now - start) / dur, 1); scrollTo(0, from + d * ease(p)); p < 1 ? requestAnimationFrame(step) : res(); };
      requestAnimationFrame(step);
    }), [y, ms]);
    await sleep(150);
  };
  const byText = (sel, text) => page.locator(sel, { hasText: text }).first();
  // Posición de scroll que deja el final de la sección en el borde inferior de la ventana.
  const bottomOf = sel => page.locator(sel).first().evaluate((el, h) =>
    Math.max(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight - h), H);
  const clickEl = async (loc, pause = 250) => {
    const b = await loc.boundingBox();
    await move(b.x + b.width / 2, b.y + b.height / 2, 20);
    await sleep(pause);
    await loc.click();
  };

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await move(W * 0.78, H * 0.65, 1);

  // 1 · Portada
  mark('portada: titular, terminal con npx init');
  await sleep(7000);
  await move(W * 0.4, H * 0.52);
  await sleep(1500);
  const diagrama = page.locator('img[alt^="Diagrama del circuito"]');
  await scrollTo(diagrama, 2200, 160);
  mark('diagrama del circuito + contadores (20 agentes, 27 skills, 7 entornos, 0 dependencias)');
  await sleep(6500);

  // 2 · Instalación
  await scrollTo(page.locator('#instalar'), 2000, 0);
  mark('instalar: cabecera «Instalación en tres pasos»');
  await sleep(4500);
  const ruta = page.locator('#ruta');
  await scrollTo(ruta, 1500, 260);
  mark('configuración: ruta, modo, hooks, baseline');
  await clickEl(ruta);
  await page.keyboard.type('C:\\proyectos\\mi-app', { delay: 90 });
  await sleep(1200);
  const modo = page.locator('#modo');
  await clickEl(modo, 200);
  await page.keyboard.press('Escape');
  await modo.selectOption({ index: 2 }); mark('modo brownfield');
  await sleep(1800);
  await modo.selectOption({ index: 1 }); mark('modo greenfield');
  await sleep(1500);
  await modo.selectOption({ index: 0 }); mark('modo auto');
  await sleep(1200);
  const checks = page.locator('#instalar input[type=checkbox]');
  for (let i = 0; i < await checks.count(); i++) { await clickEl(checks.nth(i)); await sleep(1300); }
  mark('casillas: sin hooks · con baseline');
  for (let i = 0; i < await checks.count(); i++) { await clickEl(checks.nth(i)); await sleep(500); }
  const copiar = page.locator('#instalar .copiar');
  for (const [i, nombre] of ['paso 1 · simular (--dry-run)', 'paso 2 · instalar', 'paso 3 · verificar (check-sdd)'].entries()) {
    await scrollTo(copiar.nth(i), 1700, 380);
    mark(nombre);
    await sleep(3500);
    await clickEl(copiar.nth(i));
    await sleep(1800);
  }

  // 3 · Actualizar
  await scrollTo(page.locator('#actualizar'), 2000, 0);
  mark('actualizar: cabecera y comando update');
  await sleep(5000);
  await scrollTo(page.locator('#actualizar .caso').first(), 2000, 160);
  mark('las cuatro categorías: escribe, fusiona, conserva, conflicto');
  await move(W * 0.36, H * 0.46);
  await sleep(7000);

  // 4 · Circuito
  await scrollTo(page.locator('#circuito'), 2200, 0);
  mark('circuito: «Un circuito, no una colección de prompts»');
  await sleep(4500);
  const tabs = ['Especificar', 'Planificar', 'Implementar', 'Verificar', 'Entregar'];
  await scrollTo(page.locator('#tab-1'), 1500, 200);
  for (let i = 1; i <= 5; i++) {
    await clickEl(page.locator(`#tab-${i}`));
    mark(`pestaña ${tabs[i - 1]}`);
    await sleep(5000);
  }
  const niveles = byText('#circuito h3, #circuito h2', 'Tres niveles');
  await scrollTo(niveles, 2000, 120);
  mark('tres niveles: light, compact, full (texto)');
  await sleep(6000);
  await scrollTo(page.locator('#circuito pre, #circuito .terminal').nth(1), 2500, 200);
  mark('comandos --circuit-status / run --release');
  await sleep(5000);
  const tarjetaLight = page.getByText('Texto o activo exacto', { exact: true }).first();
  await scrollTo(tarjetaLight, 2200, 260);
  mark('tarjetas light · compact · full');
  await move(W * 0.26, H * 0.52); await sleep(2000); await move(W * 0.5, H * 0.52); await sleep(2000); await move(W * 0.74, H * 0.52); await sleep(2200);
  await scrollTo(page.locator('img[alt^="Representación de las seis puertas"]'), 2200, 120);
  mark('imagen: seis puertas de aprobación humana');
  await sleep(6000);

  // 5 · Agentes
  await scrollTo(page.locator('#agentes'), 2000, 0);
  mark('agentes: «Veinte agentes con territorio propio»');
  await sleep(5000);
  const flechas = page.locator('.carrusel__flecha');
  await scrollTo(page.locator('.carrusel__punto').first(), 1500, 700);
  const familias = ['Circuito (5)', 'Arquitectura y diseño (3)', 'Construcción (4)', 'Calidad (4)', 'Auditoría y memoria (4)'];
  mark(`familia ${familias[0]}`);
  await sleep(5000);
  // A 1920 px se ven varias familias a la vez: se avanza mientras el botón «siguiente» esté activo.
  for (let i = 1; i < 5 && await flechas.nth(1).isEnabled(); i++) {
    await clickEl(flechas.nth(1));
    mark(`carrusel avanza (${familias[i]})`);
    await sleep(4500);
  }
  await scrollTo(page.locator('img[alt^="Mapa de los veinte agentes"]'), 2000, 120);
  mark('imagen: mapa de delegación');
  await sleep(6000);

  // 6 · Skills
  await scrollTo(page.locator('#skills'), 2000, 0);
  mark('skills: «Veintisiete skills invocables»');
  await sleep(4000);
  const filtros = page.locator('.filtro');
  for (let i = 1; i < await filtros.count(); i++) {
    await clickEl(filtros.nth(i));
    mark(`filtro ${(await filtros.nth(i).textContent()).trim()}`);
    await sleep(3000);
  }
  await clickEl(filtros.nth(0));
  mark('filtro Todas · 27');
  await sleep(1500);
  await scrollTo(await bottomOf('#skills'), 6000);
  mark('recorrido por las 27 skills');
  await sleep(2500);

  // 7 · Garantías
  await scrollTo(page.locator('#garantias'), 2000, 0);
  mark('garantías: SDD, TDD, SEC, UX, DOC');
  await sleep(5000);
  await scrollTo(await bottomOf('#garantias'), 5000);
  mark('garantías (resto)');
  await sleep(4000);

  // 8 · Entornos
  await scrollTo(byText('section', 'El mismo contrato en todos los entornos'), 2000, 120);
  mark('entornos: Claude Code, Copilot, VS Code, Cursor, Codex, Gemini CLI, Antigravity');
  await sleep(7000);

  // 9 · Preguntas
  await scrollTo(page.locator('#preguntas'), 2000, 0);
  mark('preguntas razonables');
  await sleep(3000);
  const acordeon = page.locator('.acordeon__disparador');
  for (let i = 0; i < await acordeon.count(); i++) {
    const a = acordeon.nth(i);
    await scrollTo(a, 1000, 260);
    await clickEl(a);
    mark(`pregunta: ${(await a.textContent()).trim()}`);
    await sleep(5000);
    await clickEl(a);
    await sleep(600);
  }

  // 10 · Cierre
  await scrollTo(page.locator('footer'), 1800, 400);
  mark('pie de página');
  await sleep(3000);
  await scrollTo(0, 3500);
  mark('vuelta a la portada');
  await sleep(5000);

  await cdp.send('Page.stopScreencast');
  await sleep(300);
  await browser.close();

  // Ensamblado a 30 fps respetando el tiempo real de cada fotograma.
  const list = frames.map((f, i) => {
    const next = frames[i + 1] ? frames[i + 1].t : f.t + 1 / 30;
    return `file '${f.file.replace(/\\/g, '/')}'\nduration ${Math.max(next - f.t, 0.001).toFixed(4)}`;
  }).join('\n') + `\nfile '${frames.at(-1).file.replace(/\\/g, '/')}'\n`;
  const listFile = path.join(tmp, 'frames.txt');
  fs.writeFileSync(listFile, list);
  const ff = execFileSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();
  execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', OUT]);
  fs.writeFileSync(OUT.replace(/\.mp4$/, '.tiempos.txt'), log.join('\n') + '\n');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`ok ${OUT} · ${frames.length} fotogramas · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})().catch(e => { console.error(e); process.exit(1); });
