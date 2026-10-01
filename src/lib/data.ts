import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import fs from 'node:fs';
import { parse } from 'yaml';

export type Site = {
  name: string; full_name: string; tagline: string; intro: string; description: string;
  founded?: number; university: string; university_url?: string; department: string; department_url?: string;
  email: string; phone?: string; address: string[]; map?: { lat: number; lon: number };
  admissions?: { accepting: boolean; cycle?: string; note?: string };
  social?: Record<string, string>;
  sponsors?: { name: string; url?: string; logo?: string }[];
  affiliations?: { name: string; url?: string }[];
  show_samples: boolean; repo?: string;
};

import citationData from '../data/citations.json';
const CITES = citationData as Record<string, { count: number; openalex?: string }>;
/** Citation count from OpenAlex (refreshed on every build), if known. */
export const citations = (id: string) => CITES[id];
export const totalCitations = () => Object.values(CITES).reduce((n, c) => n + (c.count ?? 0), 0);

export const site: Site = parse(fs.readFileSync('./content/site.yml', 'utf8'));

/** Every published entry of a collection, with samples hidden when switched off. */
export async function load<C extends CollectionKey>(name: C): Promise<CollectionEntry<C>[]> {
  const all = await getCollection(name);
  return all.filter((e: any) => !e.data.draft && (site.show_samples || !e.data.sample));
}

// ── People ────────────────────────────────────────────────────
export type Person = CollectionEntry<'people'>;

export const ROLE_GROUPS: { role: Person['data']['role']; label: string; short: string }[] = [
  { role: 'faculty', label: 'Faculty', short: 'Faculty' },
  { role: 'postdoc', label: 'Postdoctoral researchers', short: 'Postdoc' },
  { role: 'phd', label: 'PhD students', short: 'PhD' },
  { role: 'msc', label: 'MSc students', short: 'MSc' },
  { role: 'bsc', label: 'Undergraduate researchers', short: 'BSc' },
  { role: 'staff', label: 'Staff', short: 'Staff' },
  { role: 'visitor', label: 'Visiting researchers', short: 'Visitor' },
  { role: 'affiliate', label: 'Affiliated researchers', short: 'Affiliate' },
];
export const roleShort = (r: string) => ROLE_GROUPS.find((g) => g.role === r)?.short ?? r;

export const isAlumni = (p: Person) => p.data.end !== undefined;
const byOrder = (a: Person, b: Person) =>
  a.data.order - b.data.order || (a.data.start ?? 0) - (b.data.start ?? 0) || a.data.name.localeCompare(b.data.name);

export async function people() {
  const all = await load('people');
  const current = all.filter((p) => !isAlumni(p)).sort(byOrder);
  const alumni = all.filter(isAlumni).sort((a, b) => (b.data.end! - a.data.end!) || a.data.name.localeCompare(b.data.name));
  return { all, current, alumni };
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const years = (p: Person) =>
  p.data.start ? `${p.data.start}–${p.data.end ?? 'present'}` : p.data.end ? `until ${p.data.end}` : '';

// ── Author matching ───────────────────────────────────────────
const norm = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

/** Map every spelling of every lab member's name to their person id. */
export async function authorIndex() {
  const idx = new Map<string, Person>();
  for (const p of await load('people')) {
    for (const n of [p.data.name, ...p.data.aliases]) idx.set(norm(n), p);
  }
  return (author: string) => idx.get(norm(author));
}

// ── Publications ──────────────────────────────────────────────
export type Pub = CollectionEntry<'publications'>;
const pubTime = (p: Pub) => (p.data.date ? p.data.date.getTime() : Date.UTC(p.data.year, 0, 1));
export async function publications() {
  return (await load('publications')).sort((a, b) => pubTime(b) - pubTime(a) || a.data.title.localeCompare(b.data.title));
}

export const PUB_TYPES: Record<string, string> = {
  journal: 'Journal', conference: 'Conference', workshop: 'Workshop', preprint: 'Preprint',
  chapter: 'Book chapter', thesis: 'Thesis', other: 'Other',
};

export function pubLinks(p: Pub) {
  const d = p.data;
  const out: { label: string; href: string }[] = [];
  if (d.pdf) out.push({ label: 'PDF', href: d.pdf });
  if (d.doi) out.push({ label: 'DOI', href: `https://doi.org/${d.doi}` });
  if (d.url) out.push({ label: 'Publisher', href: d.url });
  if (d.arxiv) out.push({ label: 'arXiv', href: `https://arxiv.org/abs/${d.arxiv}` });
  if (d.code) out.push({ label: 'Code', href: d.code });
  if (d.data) out.push({ label: 'Data', href: d.data });
  if (d.slides) out.push({ label: 'Slides', href: d.slides });
  if (d.video) out.push({ label: 'Video', href: d.video });
  if (d.poster) out.push({ label: 'Poster', href: d.poster });
  if (d.website) out.push({ label: 'Website', href: d.website });
  return out;
}

export function bibtex(p: Pub): string {
  const d = p.data;
  if (d.bibtex) return d.bibtex.trim();
  const first = d.authors[0]?.split(/\s+/).pop()?.toLowerCase().replace(/[^a-z]/g, '') ?? 'anon';
  const word = d.title.toLowerCase().split(/\W+/).find((w) => w.length > 3 && !['with', 'from', 'using', 'towards'].includes(w)) ?? 'paper';
  const key = `${first}${d.year}${word}`;
  const kind = d.type === 'journal' ? 'article'
    : d.type === 'conference' || d.type === 'workshop' ? 'inproceedings'
    : d.type === 'chapter' ? 'incollection'
    : d.type === 'thesis' ? 'phdthesis' : 'misc';
  const venueKey = kind === 'article' ? 'journal' : kind === 'phdthesis' ? 'school' : kind === 'misc' ? 'howpublished' : 'booktitle';
  const f: [string, string | number | undefined][] = [
    ['title', `{${d.title}}`],
    ['author', d.authors.join(' and ')],
    [venueKey, d.type === 'preprint' ? undefined : d.venue],
    ['year', d.year],
    ['doi', d.doi],
    ...(d.arxiv ? [['eprint', d.arxiv], ['archivePrefix', 'arXiv']] as [string, string][] : []),
    ['url', d.url ?? (d.arxiv ? `https://arxiv.org/abs/${d.arxiv}` : undefined)],
  ];
  const body = f.filter(([, v]) => v !== undefined).map(([k, v]) => `  ${k} = {${v}}`).join(',\n');
  return `@${kind}{${key},\n${body}\n}`;
}

// ── Dates & misc ──────────────────────────────────────────────
const TZ = 'Asia/Tehran';
export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }) =>
  d.toLocaleDateString('en-GB', { timeZone: TZ, ...opts });
export const fmtTime = (d: Date) => d.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

export const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const byDateDesc = <T extends { data: { date: Date } }>(a: T, b: T) => b.data.date.getTime() - a.data.date.getTime();

export async function research() {
  return (await load('research')).sort((a, b) => a.data.order - b.data.order);
}

export async function events() {
  const all = (await load('events')).sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  const now = Date.now();
  const isPast = (e: (typeof all)[number]) => (e.data.end ?? e.data.date).getTime() < now;
  return { all, upcoming: all.filter((e) => !isPast(e)), past: all.filter(isPast).reverse() };
}

export const EVENT_TYPES: Record<string, string> = {
  seminar: 'Seminar', 'reading-group': 'Reading group', talk: 'Talk', workshop: 'Workshop', defense: 'Thesis defence', social: 'Social',
};
export const NEWS_CATEGORIES: Record<string, string> = {
  announcement: 'Announcement', publication: 'Publication', award: 'Award', talk: 'Talk',
  people: 'People', event: 'Event', media: 'In the media', thesis: 'Thesis',
};
export const PROJECT_KINDS: Record<string, string> = {
  software: 'Software', dataset: 'Dataset', benchmark: 'Benchmark', project: 'Project',
};

// ── Gallery (a plain list in content/gallery.yml) ─────────────
export type Photo = { src: string; caption: string; date?: Date; sample?: boolean };
export function gallery(): Photo[] {
  const raw = parse(fs.readFileSync('./content/gallery.yml', 'utf8')) ?? [];
  return (raw as any[])
    .filter((p) => p && p.src && (site.show_samples || !p.sample))
    .map((p) => ({ src: String(p.src), caption: String(p.caption ?? ''), date: p.date ? new Date(p.date) : undefined, sample: !!p.sample }))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
}

/** Which optional sections have content, used to hide empty pages from the menu. */
export async function sections() {
  const [blog, handbook, projects, ev, teaching] = await Promise.all([
    load('blog'), load('handbook'), load('projects'), load('events'), load('teaching'),
  ]);
  return {
    blog: blog.length > 0, gallery: gallery().length > 0, handbook: handbook.length > 0,
    projects: projects.length > 0, events: ev.length > 0, teaching: teaching.length > 0,
  };
}

export const editUrl = (collection: string, id: string) =>
  site.repo ? `${site.repo}/edit/main/content/${collection}/${id}.md` : undefined;
