// Genera, desde architecture/model/*.json, las tablas de inventario (componentes, integraciones,
// matriz) y el workspace de Structurizr. Las tablas se inyectan en los documentos que contengan los
// marcadores <!-- BEGIN:gen:<clave> --> … <!-- END:gen:<clave> -->, para que texto y modelo no diverjan.
// Uso: node architecture/tools/export-model.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const MODELS = path.join(ROOT, 'architecture', 'model');
const GEN = path.join(ROOT, 'architecture', 'model', 'generated');
mkdirSync(GEN, { recursive: true });
const models = readdirSync(MODELS).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(path.join(MODELS, f), 'utf8')));

const EXTERNAL = new Set(['ai', 'external', 'payments', 'email', 'maps', 'monitoring', 'automation', 'feed', 'social']);
const INFRA = new Set(['hosting', 'store', 'repo', 'cicd', 'host']);
const cell = (s) => String(s ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const code = (arr) => (arr ?? []).map((e) => '`' + e.replace(/`/g, '') + '`').join('; ') || '—';
const kindOf = (el, model) => {
  const zone = (model.zones ?? []).find((z) => z.id === el.zone);
  if (el.type === 'person') return 'Persona';
  if (el.type === 'product' || el.type === 'system') return 'Sistema';
  if (EXTERNAL.has(el.type) || (el.type === 'auth' && zone?.style === 'external') || zone?.style === 'external' || zone?.style === 'ai') return 'Sistema externo';
  if (INFRA.has(el.type)) return 'Infraestructura / entrega';
  if (el.type === 'tool') return 'Herramienta local';
  return 'Contenedor';
};
const category = (el) => ({ ai: 'IA', payments: 'Pagos', email: 'Email', maps: 'Mapas', monitoring: 'Observabilidad', automation: 'Automatización', feed: 'Contenido (RSS)', social: 'Redes sociales', auth: 'Identidad', repo: 'Código', hosting: 'Hosting', store: 'Distribución' }[el.type] ?? 'API / datos');

const out = {};
for (const m of models) {
  if (!m.relations?.length) continue;
  const els = Object.fromEntries(m.elements.map((e) => [e.id, e]));
  const real = m.elements.filter((e) => e.resp);
  const rels = m.relations;
  // 1) Componentes
  let t = '| Componente | Tipo | Tecnología | Responsabilidad | Conecta con | Evidencia |\n|---|---|---|---|---|---|\n';
  for (const e of real) {
    const links = rels.filter((r) => r.from === e.id && els[r.to]).map((r) => `→ ${els[r.to].name}`)
      .concat(rels.filter((r) => r.to === e.id && els[r.from]).map((r) => `← ${els[r.from].name}`));
    t += `| **${cell(e.name)}** | ${kindOf(e, m)} | ${cell(e.tech)} | ${cell(e.resp)} | ${cell([...new Set(links)].join(' · '))} | ${code(e.evidence)} |\n`;
  }
  out[`${m.id}-components`] = t;
  // 2) Integraciones (tabla corta del inventario de arquitectura)
  const extRels = rels.filter((r) => els[r.to] && ['Sistema externo', 'Infraestructura / entrega'].includes(kindOf(els[r.to], m)) && kindOf(els[r.from], m) !== 'Persona');
  let i = '| Integración | Proveedor | Función | Entrada | Salida | Evidencia |\n|---|---|---|---|---|---|\n';
  for (const r of extRels) {
    const [inp, outp] = String(r.data ?? '').includes('→') ? r.data.split('→').map((q) => q.trim()) : [r.data ?? '—', '—'];
    i += `| ${cell(r.label || r.protocol)} | **${cell(els[r.to].name)}** | ${cell(els[r.to].resp)} | ${cell(inp || '—')} | ${cell(outp || '—')} | ${code(r.evidence)} |\n`;
  }
  out[`${m.id}-integrations`] = i;
  // 3) Matriz completa de conexiones externas
  let x = '| Servicio | Tipo | Función | Desde | Hacia | Protocolo | Auth | Datos intercambiados | Evidencia |\n|---|---|---|---|---|---|---|---|---|\n';
  for (const r of extRels) {
    const mode = r.kind === 'async' ? ' · asíncrono' : ' · síncrono';
    x += `| **${cell(els[r.to].name)}** | ${category(els[r.to])} | ${cell(els[r.to].resp)} | ${cell(els[r.from].name)} | ${cell(els[r.to].name)} | ${cell((r.protocol ?? '—') + mode)} | ${cell(r.auth ?? '—')} | ${cell(r.data ?? '—')} | ${code(r.evidence)} |\n`;
  }
  out[`${m.id}-matrix`] = x;
}
for (const [k, v] of Object.entries(out)) writeFileSync(path.join(GEN, `${k}.md`), v);

// Inyección en documentos con marcadores.
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : d.name.endsWith('.md') ? [path.join(dir, d.name)] : [])); }
let injected = 0;
for (const f of [...walk(path.join(ROOT, 'docs'))]) {
  let s = readFileSync(f, 'utf8'); const before = s;
  s = s.replace(/<!-- BEGIN:gen:([a-z0-9-]+) -->[\s\S]*?<!-- END:gen:\1 -->/g, (all, key) => (out[key] ? `<!-- BEGIN:gen:${key} -->\n${out[key]}<!-- END:gen:${key} -->` : all));
  if (s !== before) { writeFileSync(f, s); injected++; }
}

// Structurizr DSL (interoperable; no se valida localmente porque el parser requiere JVM).
const id = (s) => s.replace(/[^a-zA-Z0-9_]/g, '_');
let dsl = `/*\n * Workspace generado desde architecture/model/*.json por architecture/tools/export-model.mjs.\n * No editar a mano. Validación: docker run --rm -v "$PWD":/usr/local/structurizr structurizr/cli validate -workspace architecture/structurizr/workspace.dsl\n */\nworkspace "TFM · Jorge Chamorro" "Sistema SDD/TDD con agentes y tres productos: RRSS Studio, ChaFit e ICG Vault" {\n  !identifiers hierarchical\n  model {\n`;
const views = [];
for (const m of models) {
  if (!m.relations?.length) continue;
  const els = Object.fromEntries(m.elements.map((e) => [e.id, e]));
  const real = m.elements.filter((e) => e.resp);
  const sys = `${id(m.id)}`;
  dsl += `\n    // ── ${m.name} (${m.source?.repo}@${m.source?.commit})\n`;
  for (const e of real.filter((e) => e.type === 'person')) dsl += `    ${sys}_${id(e.id)} = person "${e.name}" "${e.resp}"\n`;
  for (const e of real.filter((e) => kindOf(e, m) === 'Sistema externo' || kindOf(e, m) === 'Infraestructura / entrega')) dsl += `    ${sys}_${id(e.id)} = softwareSystem "${e.name}" "${e.resp}" { tags "Externo" }\n`;
  dsl += `    ${sys} = softwareSystem "${m.name}" "${m.summary.replace(/"/g, "'")}" {\n`;
  for (const e of real.filter((e) => ['Contenedor', 'Herramienta local'].includes(kindOf(e, m)))) dsl += `      ${id(e.id)} = container "${e.name}" "${e.resp}" "${(e.tech ?? '').replace(/"/g, "'")}"\n`;
  dsl += `    }\n`;
  const ref = (eid) => { const e = els[eid]; if (!e || !e.resp) return null; const k = kindOf(e, m); return ['Contenedor', 'Herramienta local'].includes(k) ? `${sys}.${id(eid)}` : `${sys}_${id(eid)}`; };
  for (const r of m.relations) { const a = ref(r.from), b = ref(r.to); if (a && b) dsl += `    ${a} -> ${b} "${(r.label || r.protocol || '').replace(/\n/g, ' ').replace(/"/g, "'")}" "${(r.protocol ?? '').replace(/"/g, "'")}"\n`; }
  views.push(`    systemContext ${sys} "${id(m.id)}-contexto" { include * autolayout lr }\n    container ${sys} "${id(m.id)}-contenedores" { include * autolayout lr }\n`);
}
dsl += `  }\n  views {\n${views.join('')}    styles {\n      element "Person" { shape Person background #343A46 color #ffffff }\n      element "Container" { background #0F766E color #ffffff }\n      element "Externo" { background #4B5768 color #ffffff }\n    }\n  }\n}\n`;
mkdirSync(path.join(ROOT, 'architecture', 'structurizr'), { recursive: true });
writeFileSync(path.join(ROOT, 'architecture', 'structurizr', 'workspace.dsl'), dsl);
console.log(`tablas: ${Object.keys(out).length} · documentos actualizados: ${injected} · workspace.dsl escrito`);
