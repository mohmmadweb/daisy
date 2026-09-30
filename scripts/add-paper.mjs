#!/usr/bin/env node
// Create a publication file from a DOI or an arXiv id.
//   npm run add-paper -- 10.1038/s41598-024-82286-x
//   npm run add-paper -- 2504.10753
//   npm run add-paper -- https://arxiv.org/abs/2504.10753
import { slug, writeNew, pubFile, findExisting } from './lib.mjs';

const arg = (process.argv[2] ?? '').trim();
if (!arg) { console.error('Usage: npm run add-paper -- <DOI or arXiv id>'); process.exit(1); }

const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const TYPE = { 'journal-article': 'journal', 'proceedings-article': 'conference', 'book-chapter': 'chapter', 'posted-content': 'preprint', dissertation: 'thesis' };

async function fromDoi(doi) {
  const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { 'User-Agent': 'daisy-lab-site (mailto:maryam.ramezani@sharif.edu)' } });
  if (!r.ok) throw new Error(`Crossref has no record for DOI ${doi} (HTTP ${r.status}).`);
  const m = (await r.json()).message;
  const parts = (m.published?.['date-parts'] ?? m.issued?.['date-parts'] ?? [[]])[0];
  const pad = (n) => String(n).padStart(2, '0');
  return {
    title: clean(m.title?.[0] ?? ''),
    authors: (m.author ?? []).map((a) => [a.given, a.family].filter(Boolean).join(' ') || a.name),
    venue: clean(m['container-title']?.[0] ?? m.publisher ?? ''),
    venue_short: m['short-container-title']?.[0],
    year: parts[0],
    date: parts.length === 3 ? `${parts[0]}-${pad(parts[1])}-${pad(parts[2])}` : undefined,
    type: TYPE[m.type] ?? 'other',
    doi: m.DOI,
    url: m.resource?.primary?.URL,
    abstract: m.abstract ? clean(m.abstract).replace(/^Abstract\s*/i, '') : undefined,
    tags: (m.subject ?? []).slice(0, 4),
  };
}

async function fromArxiv(id) {
  const r = await fetch(`https://export.arxiv.org/api/query?id_list=${id}`);
  const xml = await r.text();
  const entry = xml.split('<entry>')[1];
  if (!entry) throw new Error(`arXiv has no paper with id ${id}.`);
  const tag = (t) => clean(entry.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1] ?? '');
  const published = tag('published').slice(0, 10);
  const doi = entry.match(/<arxiv:doi[^>]*>([^<]+)</)?.[1];
  return {
    title: tag('title'),
    authors: [...entry.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => m[1].trim()),
    venue: 'arXiv preprint', venue_short: 'arXiv',
    year: Number(published.slice(0, 4)), date: published,
    type: 'preprint', arxiv: id.replace(/v\d+$/, ''), doi,
    abstract: tag('summary'),
  };
}

const arxivId = arg.match(/(\d{4}\.\d{4,5})(v\d+)?/)?.[1];
const doi = arg.match(/10\.\d{4,9}\/\S+/)?.[0];
try {
  const p = doi && !doi.startsWith('10.48550') ? await fromDoi(doi) : arxivId ? await fromArxiv(arxivId) : null;
  if (!p) throw new Error(`"${arg}" is neither a DOI nor an arXiv id.`);
  const dup = findExisting(p);
  if (dup) { console.log(`• Already on the site: content/publications/${dup} — nothing written.`); process.exit(0); }
  const short = slug(p.title.split(/[:—–-]/)[0]).split('-').slice(0, 6).join('-');
  const id = `${p.year}-${short}`;
  writeNew('publications', id, pubFile(p));
  console.log(`  Next: open content/publications/${id}.md and set areas, tags, code and selected.`);
} catch (e) {
  console.error('✗ ' + e.message); process.exit(1);
}
