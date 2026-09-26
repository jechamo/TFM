// Extrae del catálogo de Archify (Simple Icons 16.28.0, CC0) solo las marcas que usan los modelos.
// Uso: node architecture/tools/extract-brands.mjs  → architecture/tools/brand-marks.json
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');
const src = path.join(root, '.cache', 'archify', 'archify', 'renderers', 'shared', 'generated-brand-marks.mjs');
const { BRAND_MARKS } = await import(pathToFileURL(src).href);
const wanted = ['supabase', 'openai', 'stripe', 'vercel', 'sentry', 'react', 'next-js', 'github', 'github-actions',
  'anthropic', 'claude', 'google-gemini', 'youtube', 'tiktok', 'instagram', 'postgresql', 'sqlite', 'prisma',
  'typescript', 'node-js', 'google-cloud'];
const out = {};
for (const id of wanted) {
  const m = BRAND_MARKS.find((b) => b.id === id);
  if (!m) { console.warn('no encontrada:', id); continue; }
  out[id] = { title: m.title, viewBox: m.viewBox, hex: m.hex, path: m.path, source: `${m.provenance.provider} ${m.provenance.providerVersion}` };
}
writeFileSync(path.join(root, 'architecture', 'tools', 'brand-marks.json'), JSON.stringify(out, null, 1));
console.log('marcas:', Object.keys(out).length);
