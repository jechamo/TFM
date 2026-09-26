// Deriva especificaciones Archify del mismo modelo que alimenta a los SVG, las valida y entrega HTML
// interactivo (pan/zoom, búsqueda, trazado de relaciones, exportación a PNG/SVG desde el visor).
// Uso: node architecture/tools/export-archify.mjs
// Requiere Archify en .cache/archify (ver architecture/README.md). El visor de Archify muestra su
// interfaz en inglés: no admite español como locale; el contenido de los diagramas sí está en español.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const ARCHIFY = path.join(ROOT, '.cache', 'archify', 'archify', 'bin', 'archify.mjs');
const SPEC_DIR = path.join(ROOT, 'architecture', 'archify');
const HTML_DIR = path.join(ROOT, 'architecture', 'exported', 'html');
if (!existsSync(ARCHIFY)) { console.error('Falta Archify en .cache/archify. Ver architecture/README.md.'); process.exit(1); }
mkdirSync(SPEC_DIR, { recursive: true }); mkdirSync(HTML_DIR, { recursive: true });

const BRANDS = new Set(JSON.parse(execFileSync('node', [ARCHIFY, 'brands', '--json'], { encoding: 'utf8' })).marks.map((m) => m.id));
const TYPE = {
  webapp: 'frontend', mobile: 'frontend', device: 'frontend', agent: 'frontend', product: 'frontend',
  server: 'backend', gateway: 'backend', function: 'backend', api: 'backend', module: 'backend', cli: 'backend', realtime: 'backend', tool: 'backend', system: 'backend', loop: 'backend',
  database: 'database', storage: 'database', queue: 'messagebus', files: 'database', skill: 'database',
  auth: 'security', vault: 'security', hook: 'security', gate: 'security', shield: 'security',
  hosting: 'cloud', store: 'cloud', cicd: 'cloud', repo: 'cloud', host: 'cloud',
};
const t = (el) => TYPE[el.type] ?? 'external';
const oneLine = (s) => String(s ?? '').replace(/\n/g, ' · ').trim();
const cut = (s, n) => { s = oneLine(s); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const variant = (k) => ({ ai: 'emphasis', async: 'dashed', deploy: 'dashed', auth: 'security', human: 'security' }[k] ?? 'default');

function architectureSpec(model, view) {
  const els = Object.fromEntries(model.elements.map((e) => [e.id, e]));
  const rels = Object.fromEntries((model.relations ?? []).map((r) => [r.id, r]));
  const components = view.nodes.map((n) => {
    const el = els[n.ref];
    const c = { id: n.ref, type: t(el), label: cut(n.name ?? el.name, 34), sublabel: cut(n.tech ?? el.tech ?? '', 38), pos: [n.at[0], n.at[1]], size: [n.w ?? 220, n.h ?? 92] };
    if (el.brand && BRANDS.has(el.brand)) c.brand = el.brand;
    if (!c.sublabel) delete c.sublabel;
    return c;
  });
  // Misma geometría que los SVG: lados, puntos de paso y posición de etiqueta calculados por render.mjs.
  const geo = JSON.parse(readFileSync(path.join(ROOT, 'architecture', 'exported', 'geometry', `${model.id}-${view.id}.json`), 'utf8'));
  const connections = (view.edges ?? []).map((ve, i) => {
    const r = typeof ve === 'string' ? rels[ve] : ve.ref ? { ...rels[ve.ref], ...ve } : ve;
    const g = geo[i];
    // Archify ancla en el punto medio de cada lado: se le pasan los lados del modelo y él enruta.
    const c = { id: `c${i + 1}`, from: r.from, to: r.to, variant: variant(r.kind), fromSide: g.sides[0], toSide: g.sides[1] };
    const label = oneLine(ve.label ?? r.short ?? r.label);
    if (label) c.label = cut(label, 42);
    return c;
  });
  const members = (z) => z.members ?? view.nodes.filter((n) => els[n.ref].zone === z.ref).map((n) => n.ref);
  const boundaries = (view.zones ?? []).map((z) => {
    const zd = (model.zones ?? []).find((q) => q.id === z.ref) ?? z;
    return { kind: (zd.style === 'trust' ? 'security-group' : 'region'), label: z.label ?? zd.label, wraps: members(z), pad: 22 };
  }).filter((b) => b.wraps.length);
  return {
    schema_version: 1, diagram_type: 'architecture',
    meta: { title: view.title, quality_profile: 'standard', viewBox: [view.width, view.height] },
    components, connections, ...(boundaries.length ? { boundaries } : {}),
    cards: [{ dot: 'cyan', title: 'Fuente', items: [`${model.source?.repo ?? ''}@${model.source?.commit ?? ''}`, 'Modelo: architecture/model/' + model.id + '.json'] }],
  };
}

function sequenceSpec(model, view) {
  const els = Object.fromEntries(model.elements.map((e) => [e.id, e]));
  const parts = view.participants.map((p) => {
    const ref = typeof p === 'string' ? p : p.ref, id = (typeof p === 'object' && p.id) || ref, el = els[ref];
    return { id, type: t(el), label: cut((typeof p === 'object' && p.name) || el.name, 24), sublabel: cut((typeof p === 'object' && p.tech) || el.tech || '', 28) };
  });
  const messages = []; let y = 170;
  view.steps.forEach((s, i) => {
    if (s.note || s.from === s.to) return;
    messages.push({ id: `m${i + 1}`, from: s.from, to: s.to, y, label: cut(s.label, 58), variant: s.ret ? 'return' : variant(s.kind) });
    y += 30;
  });
  return {
    schema_version: 1, diagram_type: 'sequence',
    meta: { title: view.title, viewBox: [1280, Math.max(480, y + 80)], column_fit: 'spread', quality_profile: 'standard' },
    participants: parts.map((p) => (p.sublabel ? p : { id: p.id, type: p.type, label: p.label })),
    messages,
  };
}

const results = [];
for (const f of readdirSync(path.join(ROOT, 'architecture', 'model')).filter((q) => q.endsWith('.json'))) {
  const model = JSON.parse(readFileSync(path.join(ROOT, 'architecture', 'model', f), 'utf8'));
  for (const view of model.views ?? []) {
    let type, spec;
    if (view.id === 'container') { type = 'architecture'; spec = architectureSpec(model, view); }
    else if (view.type === 'sequence') { type = 'sequence'; spec = sequenceSpec(model, view); }
    else continue;
    const name = `${model.id}-${view.id}`;
    const specPath = path.join(SPEC_DIR, `${name}.${type}.json`);
    writeFileSync(specPath, JSON.stringify(spec, null, 1));
    if (type === 'architecture') {
      for (let round = 0; round < 8; round++) {
        let out;
        try { out = execFileSync('node', [ARCHIFY, 'validate', type, specPath, '--quality', 'standard', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
        catch (e) { out = (e.stdout || '').toString(); }
        let j; try { j = JSON.parse(out); } catch { break; }
        if (j.ok) break;
        const err = String(j.error ?? '');
        let changed = false;
        // 1) Lado no respetado → se deja ese extremo en automático.
        for (const m of err.matchAll(/connections\[(\d+)\][^\n]*?(first|final) segment[^\n]*?(?:fromSide|toSide)/g)) {
          const c = spec.connections[+m[1]]; const k = m[2] === 'first' ? 'fromSide' : 'toSide';
          if (c && c[k]) { delete c[k]; changed = true; }
        }
        // 2) Etiqueta solapada → primera corrección sugerida por Archify.
        for (const m of err.matchAll(/Label "([^"]+)" overlaps[\s\S]*?Suggested fix: labelAt \[(-?[\d.]+), (-?[\d.]+)\]/g)) {
          const c = spec.connections.find((q) => q.label === m[1]);
          if (c && !(c.labelAt && c.labelAt[0] === +m[2] && c.labelAt[1] === +m[3])) { c.labelAt = [+m[2], +m[3]]; changed = true; }
        }
        if (!changed) break;
        writeFileSync(specPath, JSON.stringify(spec, null, 1));
      }
    }
    let ok = false, detail = '';
    try {
      const out = execFileSync('node', [ARCHIFY, 'deliver', type, specPath, path.join(HTML_DIR, `${name}.html`), '--quality', 'standard', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      ok = JSON.parse(out).ok !== false; detail = 'entregado';
    } catch (e) {
      detail = (e.stdout || e.stderr || e.message).toString().slice(0, 600);
    }
    results.push({ name, type, ok, detail: ok ? detail : detail.replace(/\s+/g, ' ') });
  }
}
writeFileSync(path.join(SPEC_DIR, 'RECEIPT.json'), JSON.stringify({ generated: new Date().toISOString(), results }, null, 1));
for (const r of results) console.log(r.ok ? 'OK ' : 'KO ', r.name, r.ok ? '' : r.detail.slice(0, 300));
