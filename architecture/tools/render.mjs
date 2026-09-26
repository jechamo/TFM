// Renderizador de diagramas del TFM: modelo JSON (C4 + evidencias) → SVG con un único sistema visual.
// Sin dependencias. Uso:
//   node architecture/tools/render.mjs                 # todos los modelos, temas claro y oscuro
//   node architecture/tools/render.mjs chafit          # un modelo
// Salida: architecture/exported/svg/<modelo>-<vista>[-dark].svg
// El diseño está especificado en DIAGRAM_DESIGN_SYSTEM.md; si cambias un token, cámbialo allí también.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const MODELS = path.join(ROOT, 'architecture', 'model');
const OUT = path.join(ROOT, 'architecture', 'exported', 'svg');
const BRANDS = JSON.parse(readFileSync(path.join(import.meta.dirname, 'brand-marks.json'), 'utf8'));

// ───────────────────────── Tokens ─────────────────────────
const THEMES = {
  light: {
    bg: '#FBFAF7', ink: '#14171C', muted: '#586170', faint: '#8A93A0', line: '#D3D8DE',
    node: '#FFFFFF', nodeStroke: '#CBD2DA', labelBg: '#FBFAF7', zoneLabel: '#586170',
    cat: {
      person: '#343A46', client: '#2458D3', backend: '#0F766E', data: '#6D3FD6', ai: '#C2410C',
      external: '#4B5768', tool: '#5F6B7A', security: '#A15C07', platform: '#334155', human: '#BE123C',
    },
    zone: {
      trust: { fill: 'rgba(36,88,211,0.035)', stroke: '#9BA6B5', dash: '6 5' },
      platform: { fill: 'rgba(15,118,110,0.045)', stroke: '#8FB8B2', dash: '' },
      external: { fill: 'rgba(75,87,104,0.035)', stroke: '#A7B0BC', dash: '6 5' },
      ai: { fill: 'rgba(194,65,12,0.045)', stroke: '#DDB199', dash: '6 5' },
      neutral: { fill: 'rgba(20,23,28,0.02)', stroke: '#C4CBD3', dash: '' },
    },
    brandInk: null,
  },
  dark: {
    bg: '#0D1015', ink: '#E7EBF0', muted: '#9AA4B2', faint: '#6B7584', line: '#2B323D',
    node: '#151A21', nodeStroke: '#2C343F', labelBg: '#0D1015', zoneLabel: '#9AA4B2',
    cat: {
      person: '#C9D1DB', client: '#6EA2FF', backend: '#34D0B7', data: '#AE92FF', ai: '#FF9A5A',
      external: '#9FB0C4', tool: '#8C99AA', security: '#F2B84B', platform: '#A9B6C6', human: '#FF6F8E',
    },
    zone: {
      trust: { fill: 'rgba(110,162,255,0.05)', stroke: '#3A4556', dash: '6 5' },
      platform: { fill: 'rgba(52,208,183,0.05)', stroke: '#2E5A55', dash: '' },
      external: { fill: 'rgba(159,176,196,0.04)', stroke: '#3A4351', dash: '6 5' },
      ai: { fill: 'rgba(255,154,90,0.05)', stroke: '#5C3E2C', dash: '6 5' },
      neutral: { fill: 'rgba(255,255,255,0.02)', stroke: '#303845', dash: '' },
    },
    brandInk: '#E7EBF0',
  },
};

// Tipo de elemento → categoría de color, icono y etiqueta de tipo.
const TYPES = {
  person: ['person', 'person', 'Persona'],
  webapp: ['client', 'browser', 'Aplicación web'],
  mobile: ['client', 'mobile', 'App móvil'],
  device: ['client', 'chip', 'Dispositivo'],
  server: ['backend', 'server', 'Servidor'],
  gateway: ['backend', 'gateway', 'Pasarela'],
  function: ['backend', 'function', 'Serverless'],
  auth: ['security', 'shield', 'Autenticación'],
  realtime: ['backend', 'bolt', 'Tiempo real'],
  api: ['backend', 'api', 'API'],
  module: ['backend', 'module', 'Módulo'],
  database: ['data', 'database', 'Base de datos'],
  storage: ['data', 'folder', 'Almacenamiento'],
  queue: ['data', 'queue', 'Cola'],
  files: ['data', 'folder', 'Ficheros'],
  vault: ['security', 'lock', 'Secretos'],
  tool: ['tool', 'terminal', 'Herramienta local'],
  ai: ['ai', 'spark', 'Proveedor de IA'],
  external: ['external', 'globe', 'Servicio externo'],
  payments: ['external', 'card', 'Pagos'],
  email: ['external', 'mail', 'Email'],
  maps: ['external', 'pin', 'Mapas'],
  monitoring: ['external', 'pulse', 'Observabilidad'],
  automation: ['external', 'flow', 'Automatización'],
  feed: ['external', 'rss', 'Feeds'],
  social: ['external', 'share', 'Redes sociales'],
  hosting: ['platform', 'cloud', 'Hosting'],
  store: ['platform', 'bag', 'Distribución'],
  cicd: ['platform', 'loop', 'CI/CD'],
  repo: ['platform', 'branch', 'Repositorio'],
  host: ['platform', 'window', 'Entorno de agentes'],
  agent: ['client', 'agent', 'Agente'],
  skill: ['data', 'book', 'Skill'],
  hook: ['security', 'hook', 'Hook'],
  cli: ['backend', 'terminal', 'CLI determinista'],
  doc: ['external', 'doc', 'Artefacto'],
  gate: ['human', 'check', 'Gate humano'],
  system: ['backend', 'box', 'Sistema'],
  loop: ['backend', 'loop', 'Ciclo'],
  shield: ['security', 'shield', 'Verificación'],
  program: ['human', 'book', 'Formación'],
  product: ['client', 'box', 'Producto'],
};

// Tipo de relación → categoría de color y estilo de trazo.
const EDGE = {
  user: { cat: 'person', dash: '', w: 1.6, label: 'Uso por personas' },
  call: { cat: 'muted', dash: '', w: 1.5, label: 'Llamada interna' },
  api: { cat: 'external', dash: '', w: 1.5, label: 'API externa (HTTPS)' },
  ai: { cat: 'ai', dash: '', w: 1.8, label: 'Inferencia de IA' },
  data: { cat: 'data', dash: '', w: 1.5, label: 'Lectura/escritura de datos' },
  auth: { cat: 'security', dash: '', w: 1.5, label: 'Autenticación / secretos' },
  async: { cat: 'muted', dash: '6 4', w: 1.5, label: 'Asíncrono / evento / webhook' },
  deploy: { cat: 'platform', dash: '2 4', w: 1.6, label: 'Despliegue / distribución' },
  local: { cat: 'tool', dash: '', w: 1.5, label: 'Proceso local' },
  human: { cat: 'human', dash: '', w: 1.8, label: 'Aprobación humana' },
};

// ───────────────────────── Utilidades ─────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SANS = "Inter, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'JetBrains Mono', 'Cascadia Code', Consolas, 'SFMono-Regular', monospace";
const charW = (fs, mono) => fs * (mono ? 0.6 : 0.55);
function wrap(text, maxW, fs, mono = false, maxLines = 3) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = []; let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (t.length * charW(fs, mono) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
  return lines;
}
const textW = (s, fs, mono) => String(s).length * charW(fs, mono);

// Iconos de línea propios (24×24, trazo). No dependen de ninguna librería externa.
const ICONS = {
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
  browser: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01M9 6.5h.01"/>',
  mobile: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  gateway: '<path d="M4 12h16"/><path d="M14 6l6 6-6 6"/><path d="M4 6v12"/>',
  function: '<path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z"/><path d="M9.5 8.5l5 7M12.3 12.2L9.5 15.5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.7-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.8-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  bolt: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
  api: '<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M13.5 4l-3 16"/>',
  module: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
  database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13"/><path d="M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
  folder: '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/>',
  queue: '<rect x="3" y="7" width="4.5" height="10" rx="1"/><rect x="9.75" y="7" width="4.5" height="10" rx="1"/><rect x="16.5" y="7" width="4.5" height="10" rx="1"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><path d="M12 14.5v2.5"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5"/>',
  spark: '<path d="M12 2.8l2.1 6 6.1 2.2-6.1 2.2-2.1 6-2.1-6L3.8 11l6.1-2.2z"/><path d="M19 3.5v3M17.5 5h3"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/>',
  card: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6.5L20.5 7"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  pulse: '<path d="M3 12h4l2.5-6.5 5 13 2.5-6.5h4"/>',
  flow: '<circle cx="5.5" cy="6" r="2.5"/><circle cx="18.5" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M8 6h8M7 8l3.7 7.8M17 8l-3.7 7.8"/>',
  rss: '<path d="M5 4.5a14.5 14.5 0 0 1 14.5 14.5M5 10.5a8.5 8.5 0 0 1 8.5 8.5"/><circle cx="6" cy="18" r="1.5"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6"/>',
  cloud: '<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.7 4.7 0 0 0 7 18.5z"/>',
  bag: '<path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  loop: '<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3.5v3.8h-3.8M5.5 20.5v-3.8h3.8"/>',
  branch: '<circle cx="6.5" cy="5.5" r="2.2"/><circle cx="6.5" cy="18.5" r="2.2"/><circle cx="17.5" cy="8.5" r="2.2"/><path d="M6.5 7.7v8.6M17.5 10.7c0 4-11 2.5-11 5.6"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M8 12.5l2.5 2-2.5 2M12.5 16.5h3.5"/>',
  agent: '<rect x="4.5" y="7" width="15" height="12" rx="3.5"/><path d="M12 3.5V7"/><circle cx="12" cy="3" r="0.9"/><circle cx="9.3" cy="12.5" r="1.2"/><circle cx="14.7" cy="12.5" r="1.2"/><path d="M9.5 16h5"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z"/>',
  hook: '<path d="M15.5 3.5v9a5 5 0 1 1-10 0v-1.5"/><path d="M3.5 13l2-2.5 2 2.5"/>',
  doc: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12.5h7M9 16h7"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.5 2.5 4.9-5"/>',
  box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
};

// ───────────────────────── Geometría ─────────────────────────
const box = (n) => ({ x: n.x, y: n.y, w: n.w, h: n.h, cx: n.x + n.w / 2, cy: n.y + n.h / 2, r: n.x + n.w, b: n.y + n.h });
function overlap(a0, a1, b0, b1) { const lo = Math.max(a0, b0), hi = Math.min(a1, b1); return hi - lo >= 28 ? [lo, hi] : null; }

function chooseSides(A, B, e) {
  if (e.sides) return e.sides;
  const oy = overlap(A.y, A.b, B.y, B.b), ox = overlap(A.x, A.r, B.x, B.r);
  if (oy && (B.x >= A.r || A.x >= B.r)) return B.cx > A.cx ? ['right', 'left'] : ['left', 'right'];
  if (ox && (B.y >= A.b || A.y >= B.b)) return B.cy > A.cy ? ['bottom', 'top'] : ['top', 'bottom'];
  const dx = B.cx - A.cx, dy = B.cy - A.cy;
  if (Math.abs(dx) >= Math.abs(dy)) return [dx > 0 ? 'right' : 'left', dy > 0 ? 'top' : 'bottom'];
  return [dy > 0 ? 'bottom' : 'top', dx > 0 ? 'left' : 'right'];
}

function portPoint(Bx, side, t) {
  switch (side) {
    case 'right': return [Bx.r, Bx.y + t];
    case 'left': return [Bx.x, Bx.y + t];
    case 'top': return [Bx.x + t, Bx.y];
    default: return [Bx.x + t, Bx.b];
  }
}
const sideLen = (Bx, side) => (side === 'left' || side === 'right' ? Bx.h : Bx.w);
const horiz = (s) => s === 'left' || s === 'right';

function assignPorts(edges, boxes) {
  // Agrupa extremos por nodo+lado; los alinea en recto cuando ambos nodos se solapan, si no, reparte.
  const groups = new Map();
  for (const e of edges) {
    for (const end of ['from', 'to']) {
      const id = e[end], side = end === 'from' ? e._s[0] : e._s[1];
      const key = id + '|' + side;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ e, end, side, id });
    }
  }
  const pairKey = (e) => [e.from, e.to].sort().join('~');
  const pairCount = {};
  for (const e of edges) pairCount[pairKey(e)] = (pairCount[pairKey(e)] ?? 0) + 1;
  for (const [, list] of groups) {
    const Bx = boxes[list[0].id], side = list[0].side, len = sideLen(Bx, side), base = horiz(side) ? Bx.y : Bx.x;
    const other = (it) => boxes[it.end === 'from' ? it.e.to : it.e.from];
    // 1) Forzados por el autor. 2) Rectos: si los nodos se solapan y se miran, al centro del solape
    //    (se omiten si chocan con otro fijo a menos de 16 px o si hay dos relaciones entre el mismo par).
    // 3) El resto se reparte de forma equidistante, ordenado por la posición del otro extremo.
    const fixed = [];
    for (const it of list) {
      const at = it.end === 'from' ? it.e.fromAt : it.e.toAt;
      if (at != null) { it.t = at <= 1 ? at * len : at; fixed.push(it.t); }
    }
    for (const it of list) {
      if (it.t != null) continue;
      const O = other(it);
      const ov = horiz(side) ? overlap(Bx.y, Bx.b, O.y, O.b) : overlap(Bx.x, Bx.r, O.x, O.r);
      const facing = horiz(it.e._s[0]) === horiz(it.e._s[1]);
      if (!ov || !facing || it.e.via || pairCount[pairKey(it.e)] > 1) continue;
      const t = (ov[0] + ov[1]) / 2 - base;
      if (fixed.every((f) => Math.abs(f - t) >= 16)) { it.t = t; it.straight = true; fixed.push(t); }
    }
    const free = list.filter((it) => it.t == null);
    free.sort((a, b) => { const A = other(a), B = other(b); return horiz(side) ? A.cy - B.cy : A.cx - B.cx; });
    const pad = Math.min(22, len / 4);
    // Ranuras equidistantes que no pisen a los fijos.
    const n = free.length;
    let slots = [];
    for (let k = 1; slots.length < n && k < 200; k++) {
      slots = [];
      const m = n + fixed.length + k - 1;
      for (let i = 1; i <= m; i++) { const t = pad + ((len - 2 * pad) * i) / (m + 1); if (fixed.every((f) => Math.abs(f - t) >= 14)) slots.push(t); }
    }
    // Respeta el orden respecto a los fijos: cada libre toma la primera ranura posterior a su
    // predecesor (fijo o libre) en el orden del otro extremo, para que las rutas no se crucen.
    const key = (it) => { const O = other(it); return horiz(side) ? O.cy : O.cx; };
    const all = [...list].sort((a, b) => key(a) - key(b));
    let last = -Infinity, si = 0;
    for (const it of all) {
      if (it.t != null && !free.includes(it)) { last = it.t; continue; }
      while (si < slots.length && slots[si] <= last) si++;
      it.t = slots[si] ?? Math.min(len - 6, last + 16); last = it.t; si++;
    }
    for (const it of list) { if (it.end === 'from') it.e._pa = portPoint(Bx, side, it.t); else it.e._pb = portPoint(Bx, side, it.t); }
  }
  // Pasada final: si una relación que se mira tiene un extremo solo en su lado, lo alinea con el otro.
  for (const e of edges) {
    if (e.via || horiz(e._s[0]) !== horiz(e._s[1])) continue;
    const h = horiz(e._s[0]), A = boxes[e.from], B = boxes[e.to];
    const soloA = groups.get(e.from + '|' + e._s[0]).length === 1 && e.fromAt == null;
    const soloB = groups.get(e.to + '|' + e._s[1]).length === 1 && e.toAt == null;
    const inB = (v, Q) => (h ? v > Q.y + 10 && v < Q.b - 10 : v > Q.x + 10 && v < Q.r - 10);
    if (soloB && inB(h ? e._pa[1] : e._pa[0], B)) { if (h) e._pb = [e._pb[0], e._pa[1]]; else e._pb = [e._pa[0], e._pb[1]]; }
    else if (soloA && inB(h ? e._pb[1] : e._pb[0], A)) { if (h) e._pa = [e._pa[0], e._pb[1]]; else e._pa = [e._pb[0], e._pa[1]]; }
  }
}

function route(e) {
  const [a, b] = [e._pa, e._pb], [s1, s2] = e._s;
  if (e.via) return [a, ...e.via, b];
  if (horiz(s1) && horiz(s2)) {
    if (Math.abs(a[1] - b[1]) < 0.5) return [a, b];
    const mx = e.midX ?? (a[0] + b[0]) / 2; return [a, [mx, a[1]], [mx, b[1]], b];
  }
  if (!horiz(s1) && !horiz(s2)) {
    if (Math.abs(a[0] - b[0]) < 0.5) return [a, b];
    const my = e.midY ?? (a[1] + b[1]) / 2; return [a, [a[0], my], [b[0], my], b];
  }
  if (horiz(s1)) return [a, [b[0], a[1]], b];
  return [a, [a[0], b[1]], b];
}

function pathD(pts, r = 9) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(x - px, y - py), d2 = Math.hypot(nx - x, ny - y), rr = Math.min(r, d1 / 2, d2 / 2);
    const ax = x - ((x - px) / d1) * rr, ay = y - ((y - py) / d1) * rr, bx = x + ((nx - x) / d2) * rr, by = y + ((ny - y) / d2) * rr;
    d += ` L${ax.toFixed(1)},${ay.toFixed(1)} Q${x},${y} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + ` L${l[0]},${l[1]}`;
}

// ───────────────────────── Piezas SVG ─────────────────────────
function catColor(T, cat) { return cat === 'muted' ? T.muted : T.cat[cat] ?? T.muted; }

function brandMark(T, id, x, y, size) {
  const m = BRANDS[id]; if (!m) return '';
  const fill = T.brandInk && (m.hex === '000000' || m.hex === '181717' || m.hex === '191919') ? T.brandInk : '#' + m.hex;
  const s = size / m.viewBox;
  return `<g transform="translate(${x},${y}) scale(${s.toFixed(4)})"><path d="${m.path}" fill="${fill}"/></g>`;
}

function nodeSVG(T, el, n) {
  const [cat, icon, kindLabel] = TYPES[el.type] ?? TYPES.system;
  const c = T.cat[cat];
  const x = n.x, y = n.y, w = n.w, h = n.h;
  const small = h < 76;
  let s = `<g class="node" data-id="${esc(el.id)}">`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${T.node}" stroke="${T.nodeStroke}" stroke-width="1.2"/>`;
  s += `<path d="M${x + 10},${y} h-0 a10 10 0 0 0 -10 10 v${h - 20} a10 10 0 0 0 10 10" fill="none"/>`;
  s += `<rect x="${x}" y="${y + 10}" width="3.5" height="${h - 20}" rx="1.75" fill="${c}"/>`;
  s += `<g transform="translate(${x + 14},${y + 13}) scale(0.78)" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon] ?? ICONS.box}</g>`;
  // El rótulo de tipo nunca invade el logotipo: primero se acorta al primer segmento y, si aun
  // así no cabe, se prescinde del logotipo (el nombre ya identifica el producto).
  let kind = (n.kind ?? el.kind ?? kindLabel).toUpperCase();
  let showBrand = !!(el.brand && BRANDS[el.brand] && !n.noBrand);
  const kW = (t) => t.length * (10.5 * 0.64 + 0.7);
  const avail = () => w - 38 - (showBrand ? 36 : 12);
  if (kW(kind) > avail() && kind.includes(' · ')) kind = kind.split(' · ')[0];
  if (kW(kind) > avail() && showBrand) showBrand = false;
  s += `<text x="${x + 38}" y="${y + 26}" font-family="${SANS}" font-size="10.5" font-weight="600" letter-spacing="0.7" fill="${c}">${esc(kind)}</text>`;
  if (showBrand) s += brandMark(T, el.brand, x + w - 30, y + 12, 16);
  const nameFs = n.nameFs ?? 16.5;
  const nameLines = wrap(n.name ?? el.name, w - 28, nameFs, false, 2);
  let ty = y + 50;
  for (const l of nameLines) { s += `<text x="${x + 14}" y="${ty}" font-family="${SANS}" font-size="${nameFs}" font-weight="650" fill="${T.ink}">${esc(l)}</text>`; ty += nameFs + 3; }
  const tech = n.tech ?? el.tech;
  if (tech && !small) {
    const tl = wrap(tech, w - 28, 12.2, true, n.techLines ?? 2);
    ty += 1;
    for (const l of tl) { if (ty > y + h - 8) break; s += `<text x="${x + 14}" y="${ty}" font-family="${MONO}" font-size="12.2" fill="${T.muted}">${esc(l)}</text>`; ty += 16; }
  }
  const desc = n.desc;
  if (desc) {
    const dl = wrap(desc, w - 28, 12.8, false, 4);
    ty += 3;
    for (const l of dl) { if (ty > y + h - 8) break; s += `<text x="${x + 14}" y="${ty}" font-family="${SANS}" font-size="12.8" fill="${T.muted}">${esc(l)}</text>`; ty += 17; }
  }
  if (n.items) {
    let iy = Math.max(ty + 14, y + (n.itemsTop ?? 0));
    s += `<line x1="${x + 14}" y1="${iy - 14}" x2="${x + w - 14}" y2="${iy - 14}" stroke="${T.line}"/>`;
    for (const it of n.items) {
      const parts = String(it).split('|');
      s += `<circle cx="${x + 18}" cy="${iy - 4}" r="2.2" fill="${c}"/>`;
      s += `<text x="${x + 28}" y="${iy}" font-family="${MONO}" font-size="12" fill="${T.ink}">${esc(parts[0])}</text>`;
      if (parts[1]) s += `<text x="${x + 28}" y="${iy + 15}" font-family="${SANS}" font-size="11.5" fill="${T.muted}">${esc(parts[1])}</text>`;
      iy += parts[1] ? (n.itemGap ?? 40) : (n.itemGap ?? 22);
    }
  }
  return s + '</g>';
}

function markerDefs(T, prefix) {
  let s = '<defs>';
  for (const [k, v] of Object.entries(EDGE)) {
    const c = catColor(T, v.cat);
    s += `<marker id="${prefix}-a-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${c}"/></marker>`;
  }
  return s + '</defs>';
}

function labelSVG(T, text, x, y, color, fs = 12.2, bold = false) {
  const lines = String(text).split('\n');
  const wmax = Math.max(...lines.map((l) => textW(l, fs))) + 12, hh = lines.length * (fs + 3) + 6;
  let s = `<rect x="${(x - wmax / 2).toFixed(1)}" y="${(y - hh / 2).toFixed(1)}" width="${wmax.toFixed(1)}" height="${hh}" rx="4" fill="${T.labelBg}" fill-opacity="0.94"/>`;
  lines.forEach((l, i) => {
    s += `<text x="${x.toFixed(1)}" y="${(y - hh / 2 + 3 + (i + 1) * (fs + 3) - 3).toFixed(1)}" text-anchor="middle" font-family="${SANS}" font-size="${fs}" ${bold ? 'font-weight="600"' : ''} fill="${color}">${esc(l)}</text>`;
  });
  return s;
}

function edgeSVG(T, e, prefix) {
  const st = EDGE[e.kind] ?? EDGE.call, c = catColor(T, st.cat);
  const pts = e._pts;
  let s = `<path d="${pathD(pts)}" fill="none" stroke="${c}" stroke-width="${st.w}" ${st.dash ? `stroke-dasharray="${st.dash}"` : ''} marker-end="url(#${prefix}-a-${e.kind ?? 'call'})" ${e.both ? `marker-start="url(#${prefix}-a-${e.kind ?? 'call'})"` : ''}/>`;
  return s;
}

function labelPos(e) {
  if (!e.label) return null;
  if (e.labelAt) return e.labelAt;
  const pts = e._pts; let best = 0, bi = 0;
  for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); if (L > best) { best = L; bi = i; } }
  const f = e.labelPos ?? 0.5;
  return [Math.round(pts[bi][0] + (pts[bi + 1][0] - pts[bi][0]) * f), Math.round(pts[bi][1] + (pts[bi + 1][1] - pts[bi][1]) * f)];
}

function edgeLabel(T, e) {
  if (!e.label) return '';
  const st = EDGE[e.kind] ?? EDGE.call, c = e.kind === 'ai' ? T.cat.ai : T.muted;
  let lx, ly;
  if (e.labelAt) [lx, ly] = e.labelAt;
  else {
    const pts = e._pts; let best = 0, bi = 0;
    for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); if (L > best) { best = L; bi = i; } }
    const f = e.labelPos ?? 0.5;
    lx = pts[bi][0] + (pts[bi + 1][0] - pts[bi][0]) * f; ly = pts[bi][1] + (pts[bi + 1][1] - pts[bi][1]) * f;
    if (e.labelDx) lx += e.labelDx; if (e.labelDy) ly += e.labelDy;
    // En un tramo horizontal corto, la etiqueta se parte en líneas para no invadir los nodos.
    const horizSeg = Math.abs(pts[bi + 1][1] - pts[bi][1]) < 0.5;
    if (horizSeg && !e.label.includes('\n')) {
      const room = Math.max(best - 18, 84);
      if (textW(e.label, 12.2) + 12 > room) return labelSVG(T, wrap(e.label, room - 12, 12.2, false, 4).join('\n'), lx, ly, c);
    }
  }
  void st;
  return labelSVG(T, e.label, lx, ly, c);
}

function legendSVG(T, kinds, x, y, prefix) {
  let s = `<text x="${x}" y="${y}" font-family="${SANS}" font-size="10.5" font-weight="700" letter-spacing="0.8" fill="${T.zoneLabel}">LEYENDA</text>`;
  let cx = x;
  const yy = y + 18;
  for (const k of kinds) {
    const st = EDGE[k]; if (!st) continue;
    const c = catColor(T, st.cat);
    s += `<line x1="${cx}" y1="${yy}" x2="${cx + 30}" y2="${yy}" stroke="${c}" stroke-width="${st.w}" ${st.dash ? `stroke-dasharray="${st.dash}"` : ''} marker-end="url(#${prefix}-a-${k})"/>`;
    s += `<text x="${cx + 38}" y="${yy + 4}" font-family="${SANS}" font-size="11.5" fill="${T.muted}">${esc(st.label)}</text>`;
    cx += 38 + textW(st.label, 11.5) + 26;
  }
  return s;
}

function frameSVG(T, model, view, W, H) {
  let s = `<rect width="${W}" height="${H}" fill="${T.bg}"/>`;
  s += `<text x="40" y="52" font-family="${SANS}" font-size="24" font-weight="700" fill="${T.ink}">${esc(view.title)}</text>`;
  if (view.subtitle) s += `<text x="40" y="78" font-family="${SANS}" font-size="14" fill="${T.muted}">${esc(view.subtitle)}</text>`;
  const tag = view.tag ?? '';
  if (tag) {
    const tw = textW(tag, 11, true) + 22;
    s += `<rect x="${W - 40 - tw}" y="34" width="${tw}" height="24" rx="12" fill="none" stroke="${T.line}"/>`;
    s += `<text x="${W - 40 - tw / 2}" y="50" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${T.muted}">${esc(tag)}</text>`;
  }
  const src = model.source ? `Fuente: ${model.source.repo}@${model.source.commit} · inspección ${model.source.inspected}` : '';
  const foot = [src, view.footer].filter(Boolean).join('  ·  ');
  if (foot) s += `<text x="40" y="${H - 22}" font-family="${SANS}" font-size="11.5" fill="${T.faint}">${esc(foot)}</text>`;
  s += `<text x="${W - 40}" y="${H - 22}" text-anchor="end" font-family="${SANS}" font-size="11.5" fill="${T.faint}">TFM · Jorge Chamorro · AS-IS</text>`;
  return s;
}

// ───────────────────────── Vistas ─────────────────────────
function renderBoxView(model, view, theme) {
  const T = THEMES[theme], prefix = `${model.id}-${view.id}-${theme}`;
  const els = Object.fromEntries(model.elements.map((e) => [e.id, e]));
  const rels = Object.fromEntries((model.relations ?? []).map((r) => [r.id, r]));
  const nodes = {}, boxes = {};
  for (const n of view.nodes) {
    const el = els[n.ref] ?? (n.el ? { id: n.ref, ...n.el } : null);
    if (!el) throw new Error(`${model.id}/${view.id}: elemento desconocido ${n.ref}`);
    const nn = { w: 220, h: 92, ...n, x: n.at[0], y: n.at[1] };
    nodes[n.ref] = { el, n: nn }; boxes[n.ref] = box(nn);
  }
  const edges = (view.edges ?? []).map((ve) => {
    const r = typeof ve === 'string' ? rels[ve] : ve.ref ? { ...rels[ve.ref], ...ve } : ve;
    if (!r || !r.from) throw new Error(`${model.id}/${view.id}: relación desconocida ${JSON.stringify(ve)}`);
    if (!boxes[r.from] || !boxes[r.to]) throw new Error(`${model.id}/${view.id}: extremo fuera de la vista ${r.from}→${r.to}`);
    return { ...r, label: ve.label ?? r.short ?? r.label };
  });
  for (const e of edges) e._s = chooseSides(boxes[e.from], boxes[e.to], e);
  assignPorts(edges, boxes);
  for (const e of edges) e._pts = route(e);
  if (theme === 'light') {
    GEOMETRY[`${model.id}-${view.id}`] = edges.map((e) => ({ from: e.from, to: e.to, sides: e._s, points: e._pts.map((q) => q.map((v) => Math.round(v * 10) / 10)), labelAt: labelPos(e) }));
  }

  const W = view.width ?? 1440, H = view.height ?? 900;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t-${prefix} d-${prefix}">`;
  s += `<title id="t-${prefix}">${esc(view.title)}</title><desc id="d-${prefix}">${esc(view.description ?? view.subtitle ?? '')}</desc>`;
  s += markerDefs(T, prefix) + frameSVG(T, model, view, W, H);
  // Zonas: rectángulo envolvente de sus miembros (o explícito).
  for (const z of view.zones ?? []) {
    const zd = (model.zones ?? []).find((q) => q.id === z.ref) ?? z;
    let x0, y0, x1, y1;
    if (z.rect) [x0, y0, x1, y1] = [z.rect[0], z.rect[1], z.rect[0] + z.rect[2], z.rect[1] + z.rect[3]];
    else {
      const members = (z.members ?? Object.values(nodes).filter((q) => q.el.zone === z.ref).map((q) => q.el.id)).map((id) => boxes[id]).filter(Boolean);
      if (!members.length) continue;
      const p = z.pad ?? 22;
      const lab = z.labelPos === 'bottom' ? [0, 20] : [20, 0];
      x0 = Math.min(...members.map((m) => m.x)) - p; y0 = Math.min(...members.map((m) => m.y)) - p - lab[0];
      x1 = Math.max(...members.map((m) => m.r)) + p; y1 = Math.max(...members.map((m) => m.b)) + p + lab[1];
    }
    const st = T.zone[zd.style ?? 'neutral'];
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="14" fill="${st.fill}" stroke="${st.stroke}" stroke-width="1.2" ${st.dash ? `stroke-dasharray="${st.dash}"` : ''}/>`;
    const ly = z.labelPos === 'bottom' ? y1 - 12 : y0 + 22;
    s += `<text x="${x0 + 16}" y="${ly}" font-family="${SANS}" font-size="11" font-weight="700" letter-spacing="0.9" fill="${T.zoneLabel}">${esc((z.label ?? zd.label).toUpperCase())}</text>`;
    if (zd.note || z.note) s += `<text x="${x1 - 16}" y="${ly}" text-anchor="end" font-family="${MONO}" font-size="10.5" fill="${T.faint}">${esc(z.note ?? zd.note)}</text>`;
  }
  for (const e of edges) s += edgeSVG(T, e, prefix);
  for (const { el, n } of Object.values(nodes)) s += nodeSVG(T, el, n);
  for (const e of edges) s += edgeLabel(T, e);
  for (const note of view.notes ?? []) {
    const lines = wrap(note.text, note.w ?? 260, 12.5, false, 6);
    s += `<g><rect x="${note.at[0]}" y="${note.at[1]}" width="${(note.w ?? 260) + 24}" height="${lines.length * 17 + 20}" rx="8" fill="none" stroke="${T.line}" stroke-dasharray="3 3"/>`;
    lines.forEach((l, i) => { s += `<text x="${note.at[0] + 12}" y="${note.at[1] + 22 + i * 17}" font-family="${SANS}" font-size="12.5" fill="${T.muted}">${esc(l)}</text>`; });
    s += '</g>';
  }
  if (view.legend !== false) {
    const kinds = [...new Set(edges.map((e) => e.kind ?? 'call'))];
    const [lx, ly] = view.legendAt ?? [40, H - 70];
    s += legendSVG(T, kinds, lx, ly, prefix);
  }
  return s + '</svg>';
}

function renderSequence(model, view, theme) {
  const T = THEMES[theme], prefix = `${model.id}-${view.id}-${theme}`;
  const els = Object.fromEntries(model.elements.map((e) => [e.id, e]));
  const parts = view.participants.map((p) => {
    const ref = typeof p === 'string' ? p : p.ref;
    const el = els[ref] ?? (p.el ? { id: ref, ...p.el } : null);
    if (!el) throw new Error(`${model.id}/${view.id}: participante desconocido ${ref}`);
    return { ref: (typeof p === 'object' && p.id) || ref, el, name: (typeof p === 'object' && p.name) || el.name, tech: typeof p === 'object' ? p.tech : undefined };
  });
  const W = view.width ?? 1440, left = 60, right = 60;
  const colW = (W - left - right) / parts.length, cardW = Math.min(210, colW - 24), cardH = 74, top = 112;
  const X = Object.fromEntries(parts.map((p, i) => [p.ref, left + colW * i + colW / 2]));
  const stepH = view.stepH ?? 50;
  const steps = view.steps;
  const y0 = top + cardH + 44;
  const H = view.height ?? y0 + steps.length * stepH + 130;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t-${prefix} d-${prefix}">`;
  s += `<title id="t-${prefix}">${esc(view.title)}</title><desc id="d-${prefix}">${esc(view.description ?? view.subtitle ?? '')}</desc>`;
  s += markerDefs(T, prefix) + frameSVG(T, model, view, W, H);
  // Fragmentos (alt/opt/loop) detrás de los mensajes.
  for (const g of view.groups ?? []) {
    const gy0 = y0 + g.from * stepH - 22, gy1 = y0 + g.to * stepH + 18;
    const gx0 = g.x0 ?? left + 6, gx1 = g.x1 ?? W - right - 6;
    s += `<rect x="${gx0}" y="${gy0}" width="${gx1 - gx0}" height="${gy1 - gy0}" rx="10" fill="${T.zone[g.style ?? 'neutral'].fill}" stroke="${T.zone[g.style ?? 'neutral'].stroke}" stroke-dasharray="5 4"/>`;
    s += `<text x="${gx0 + 12}" y="${gy0 + 17}" font-family="${SANS}" font-size="11" font-weight="700" letter-spacing="0.8" fill="${T.zoneLabel}">${esc(g.label.toUpperCase())}</text>`;
  }
  for (const p of parts) {
    const cx = X[p.ref];
    s += `<line x1="${cx}" y1="${top + cardH}" x2="${cx}" y2="${H - 64}" stroke="${T.line}" stroke-width="1.3" stroke-dasharray="4 5"/>`;
    s += nodeSVG(T, p.el, { x: cx - cardW / 2, y: top, w: cardW, h: cardH, name: p.name, tech: p.tech ?? p.el.tech, techLines: 1, nameFs: 15 });
  }
  steps.forEach((st, i) => {
    const y = y0 + i * stepH;
    if (st.note) {
      const x1 = X[st.over ?? st.from], lines = wrap(st.note, 300, 12, false, 2);
      const w = Math.max(...lines.map((l) => textW(l, 12))) + 20;
      s += `<rect x="${x1 - w / 2}" y="${y - 16}" width="${w}" height="${lines.length * 16 + 10}" rx="6" fill="${T.node}" stroke="${T.nodeStroke}"/>`;
      lines.forEach((l, k) => { s += `<text x="${x1}" y="${y + 1 + k * 16}" text-anchor="middle" font-family="${SANS}" font-size="12" fill="${T.muted}">${esc(l)}</text>`; });
      return;
    }
    const kind = st.kind ?? 'call', stl = EDGE[kind] ?? EDGE.call, c = catColor(T, stl.cat);
    const xa = X[st.from], xb = X[st.to];
    const ret = !!st.ret, dash = ret ? '5 4' : stl.dash;
    if (st.from === st.to) {
      s += `<path d="M${xa},${y - 6} h40 v18 h-36" fill="none" stroke="${c}" stroke-width="${stl.w}" ${dash ? `stroke-dasharray="${dash}"` : ''} marker-end="url(#${prefix}-a-${kind})"/>`;
      s += `<text x="${xa + 50}" y="${y + 7}" font-family="${SANS}" font-size="12.5" fill="${T.ink}">${esc(st.label)}</text>`;
    } else {
      const dir = xb > xa ? 1 : -1;
      s += `<line x1="${xa + dir * 3}" y1="${y}" x2="${xb - dir * 4}" y2="${y}" stroke="${c}" stroke-width="${ret ? 1.3 : stl.w}" ${dash ? `stroke-dasharray="${dash}"` : ''} marker-end="url(#${prefix}-a-${kind})"/>`;
      const mid = (xa + xb) / 2, span = Math.abs(xb - xa);
      const fits = textW(st.label, 12.5) + 30 < span;
      const lx = fits ? mid : Math.min(xa, xb) + 22, anchor = fits ? 'middle' : 'start';
      s += `<text x="${lx}" y="${y - 8}" text-anchor="${anchor}" font-family="${SANS}" font-size="12.5" fill="${ret ? T.muted : T.ink}">${esc(st.label)}</text>`;
    }
    if (!ret) {
      const n = steps.slice(0, i + 1).filter((q) => !q.note && !q.ret).length;
      s += `<circle cx="${xa - (xb >= xa ? 14 : -14)}" cy="${y}" r="9" fill="${c}"/><text x="${xa - (xb >= xa ? 14 : -14)}" y="${y + 4}" text-anchor="middle" font-family="${SANS}" font-size="10.5" font-weight="700" fill="${T.bg}">${n}</text>`;
    }
  });
  if (view.legend !== false) {
    const kinds = [...new Set(steps.filter((q) => !q.note).map((q) => q.kind ?? 'call'))];
    s += legendSVG(T, kinds, 40, H - 76, prefix);
  }
  return s + '</svg>';
}

// ───────────────────────── Main ─────────────────────────
const GEOMETRY = {};
mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const files = readdirSync(MODELS).filter((f) => f.endsWith('.json') && (!only || f === `${only}.json`));
let count = 0;
for (const f of files) {
  const model = JSON.parse(readFileSync(path.join(MODELS, f), 'utf8'));
  for (const view of model.views ?? []) {
    for (const theme of view.themes ?? ['light', 'dark']) {
      const svg = view.type === 'sequence' ? renderSequence(model, view, theme) : renderBoxView(model, view, theme);
      const name = `${model.id}-${view.id}${theme === 'dark' ? '-dark' : ''}.svg`;
      writeFileSync(path.join(OUT, name), svg);
      count++;
    }
  }
}
const GEO_DIR = path.join(ROOT, 'architecture', 'exported', 'geometry');
mkdirSync(GEO_DIR, { recursive: true });
for (const [k, v] of Object.entries(GEOMETRY)) writeFileSync(path.join(GEO_DIR, `${k}.json`), JSON.stringify(v));
console.log(`${count} SVG generados en ${path.relative(ROOT, OUT)}`);
