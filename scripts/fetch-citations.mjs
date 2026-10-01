#!/usr/bin/env node
// Refresh citation counts for every publication from OpenAlex (free, no key).
// Runs before each build; the site rebuilds nightly, so counts stay current.
// Lookup order: DOI, then the arXiv DOI, then an exact title match.
// If OpenAlex cannot be reached, the previous counts are kept.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { ROOT } from './lib.mjs';

const dir = path.join(ROOT, 'content/publications');
const out = path.join(ROOT, 'src/data/citations.json');
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {};
const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const UA = { 'User-Agent': 'daisy-lab.ir (mailto:maryam.ramezani@sharif.edu)' };

async function get(url) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(10000) });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
const sel = 'select=id,cited_by_count,title,publication_year';

async function lookup(p) {
  if (p.doi) { const w = await get(`https://api.openalex.org/works/doi:${encodeURIComponent(p.doi)}?${sel}`); if (w) return w; }
  if (p.arxiv) { const w = await get(`https://api.openalex.org/works/doi:10.48550/arxiv.${p.arxiv}?${sel}`); if (w) return w; }
  const q = encodeURIComponent(String(p.title).replace(/[,:|]/g, ' '));
  const res = await get(`https://api.openalex.org/works?filter=title.search:${q}&per-page=5&${sel}`);
  return res?.results?.find((w) => norm(w.title) === norm(p.title)) ?? null;
}

const result = {};
let ok = 0, kept = 0, missing = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
  const id = f.replace(/\.md$/, '');
  const fm = parse(fs.readFileSync(path.join(dir, f), 'utf8').split(/^---$/m)[1] ?? '') ?? {};
  try {
    const w = await lookup(fm);
    if (w) { result[id] = { count: w.cited_by_count ?? 0, openalex: w.id }; ok++; }
    else missing++;
  } catch (e) {
    if (prev[id]) { result[id] = prev[id]; kept++; }
    else missing++;
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`citations: ${ok} updated, ${kept} kept from last run, ${missing} not found`);
