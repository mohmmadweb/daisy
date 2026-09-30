#!/usr/bin/env node
// Import every entry of a BibTeX file (e.g. exported from Google Scholar) as a
// publication file. Entries whose title already exists on the site are skipped.
//   npm run import-bib -- my-papers.bib
import fs from 'node:fs';
import { slug, writeNew, pubFile, findExisting } from './lib.mjs';

const file = process.argv[2];
if (!file) { console.error('Usage: npm run import-bib -- <file.bib>'); process.exit(1); }
const src = fs.readFileSync(file, 'utf8');

// Minimal BibTeX parser: handles nested braces and quoted values.
function parse(text) {
  const out = [];
  const re = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g;
  let m;
  while ((m = re.exec(text))) {
    let i = re.lastIndex, depth = 1;
    const start = i;
    while (i < text.length && depth > 0) { if (text[i] === '{') depth++; else if (text[i] === '}') depth--; i++; }
    const body = text.slice(start, i - 1);
    const fields = {};
    const fr = /(\w+)\s*=\s*/g;
    let f;
    while ((f = fr.exec(body))) {
      let j = fr.lastIndex, val = '';
      if (body[j] === '{') { let d = 0; const s = j; do { if (body[j] === '{') d++; else if (body[j] === '}') d--; j++; } while (d > 0 && j < body.length); val = body.slice(s + 1, j - 1); }
      else if (body[j] === '"') { const e = body.indexOf('"', j + 1); val = body.slice(j + 1, e); j = e + 1; }
      else { const e = body.slice(j).search(/[,\n]/); val = body.slice(j, e < 0 ? undefined : j + e); j += val.length; }
      fields[f[1].toLowerCase()] = val.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
      fr.lastIndex = j;
    }
    out.push({ type: m[1].toLowerCase(), key: m[2], fields, raw: text.slice(m.index, i) });
    re.lastIndex = i;
  }
  return out;
}

const name = (a) => a.includes(',') ? a.split(',').map((s) => s.trim()).reverse().join(' ') : a.trim();
const TYPE = { article: 'journal', inproceedings: 'conference', conference: 'conference', incollection: 'chapter', inbook: 'chapter', phdthesis: 'thesis', mastersthesis: 'thesis' };

let added = 0, skipped = 0;
for (const e of parse(src)) {
  const f = e.fields;
  if (!f.title) continue;
  const arxiv = (f.eprint ?? f.journal ?? f.url ?? '').match(/(\d{4}\.\d{4,5})/)?.[1];
  const type = arxiv && /arxiv/i.test(f.journal ?? f.archiveprefix ?? f.url ?? '') ? 'preprint' : TYPE[e.type] ?? 'other';
  const p = {
    title: f.title, authors: (f.author ?? '').split(/\s+and\s+/).map(name).filter(Boolean),
    venue: f.journal ?? f.booktitle ?? f.publisher ?? f.school ?? (type === 'preprint' ? 'arXiv preprint' : ''),
    year: Number(f.year) || new Date().getFullYear(), type,
    doi: f.doi, arxiv: type === 'preprint' ? arxiv : undefined, url: f.url, abstract: f.abstract,
  };
  if (findExisting(p)) { skipped++; continue; }
  const id = `${p.year}-${slug(p.title.split(/[:—–-]/)[0]).split('-').slice(0, 6).join('-')}`;
  if (writeNew('publications', id, pubFile(p))) added++;
}
console.log(`\n${added} added, ${skipped} already on the site.`);
