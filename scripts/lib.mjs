// Shared helpers for the content scripts.
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');

// Quote a YAML scalar only when it needs quoting.
export function y(v) {
  const s = String(v);
  if (s === '' || /^[\d.+-eE]+$/.test(s) || /[:#"'\[\]{}&*!|>%@`]/.test(s) || /^[-?,\s]/.test(s) || /\s$/.test(s)
      || ['yes', 'no', 'true', 'false', 'null', 'on', 'off'].includes(s.toLowerCase())) return JSON.stringify(s);
  return s;
}
export const fold = (s, width = 88) => {
  const words = s.replace(/\s+/g, ' ').trim().split(' ');
  const lines = []; let line = '';
  for (const w of words) { if ((line + ' ' + w).trim().length > width) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }
  if (line) lines.push(line);
  return '>-\n  ' + lines.join('\n  ');
};

export function writeNew(dir, id, text) {
  const file = path.join(ROOT, 'content', dir, `${id}.md`);
  if (fs.existsSync(file)) { console.error(`✗ ${path.relative(ROOT, file)} already exists — nothing written.`); process.exitCode = 1; return null; }
  fs.writeFileSync(file, text);
  console.log(`✓ created ${path.relative(ROOT, file)}`);
  return file;
}

export function pubFile(p) {
  const L = ['---', `title: ${y(p.title)}`, 'authors:', ...p.authors.map((a) => `  - ${y(a)}`), `venue: ${y(p.venue)}`];
  if (p.venue_short) L.push(`venue_short: ${y(p.venue_short)}`);
  L.push(`year: ${p.year}`);
  if (p.date) L.push(`date: ${p.date}`);
  L.push(`type: ${p.type}`);
  for (const k of ['doi', 'arxiv', 'url', 'pdf', 'code']) if (p[k]) L.push(`${k}: ${k === 'arxiv' ? JSON.stringify(p[k]) : y(p[k])}`);
  L.push('selected: false', `areas: []`, `tags: [${(p.tags ?? []).map(y).join(', ')}]`);
  if (p.abstract) L.push(`abstract: ${fold(p.abstract)}`);
  L.push('---', '');
  return L.join('\n');
}

// Is this paper already on the site? Matches DOI, arXiv id or title.
export function findExisting(p) {
  const dir = path.join(ROOT, 'content/publications');
  const norm = (t) => (t ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))) {
    const t = fs.readFileSync(path.join(dir, f), 'utf8');
    const get = (k) => t.match(new RegExp(`^${k}:\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim();
    if ((p.doi && get('doi')?.toLowerCase() === p.doi.toLowerCase()) || (p.arxiv && get('arxiv') === p.arxiv) || norm(get('title')) === norm(p.title)) return f;
  }
  return null;
}
