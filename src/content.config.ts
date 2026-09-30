// Content schemas. Every Markdown file under /content is checked against these
// on each build; a typo in a field name or value fails the build with a clear
// message instead of silently producing a broken page.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const md = (dir: string) => glob({ pattern: '**/[^_]*.md', base: `./content/${dir}` });

// Optional values that also accept the empty value a web editor leaves behind.
const blank = (v: unknown) => (v === '' || v === null ? undefined : v);
const opt = z.preprocess(blank, z.string().optional());
const optNum = z.preprocess(blank, z.coerce.number().optional());
const list = z.preprocess((v) => (v === null || v === '' ? [] : v), z.array(z.string()).default([]));
// References to other entries may be written as an id ("maryam-ramezani") or,
// by the web editor, as a path ("content/people/maryam-ramezani.md").
const toId = (v: unknown) => (typeof v === 'string' ? v.replace(/^.*\//, '').replace(/\.md$/, '') : v);
const ref = z.preprocess((v) => blank(toId(v)), z.string().optional());
const refs = z.preprocess(
  (v) => (v === null || v === '' || v === undefined ? [] : (Array.isArray(v) ? v : [v]).map(toId)),
  z.array(z.string()).default([]),
);
const common = {
  sample: z.boolean().default(false),
  draft: z.boolean().default(false),
};

const research = defineCollection({
  loader: md('research'),
  schema: z.object({
    title: z.string(),
    short: opt, // short label used on the daisy diagram
    summary: z.string(),
    order: z.number().default(99),
    status: z.enum(['active', 'new', 'past']).default('active'),
    ...common,
  }),
});

const people = defineCollection({
  loader: md('people'),
  schema: z.object({
    name: z.string(),
    name_fa: opt,
    role: z.enum(['faculty', 'postdoc', 'phd', 'msc', 'bsc', 'staff', 'visitor', 'affiliate']),
    title: opt,
    photo: opt,
    email: opt,
    phone: opt,
    office: opt,
    start: optNum,
    // Setting `end` (the year they left) moves a person to Alumni automatically.
    end: optNum,
    next: opt, // where they went next, e.g. "PhD student, EPFL"
    next_type: z.preprocess(blank, z.enum(['academia', 'industry', 'startup', 'other']).optional()),
    thesis: z.preprocess(blank, z.object({ title: z.string(), url: opt, year: optNum }).optional()),
    co_advisor: opt,
    interests: list,
    areas: refs,
    aliases: list, // other spellings of the name used in author lists
    links: z.preprocess(
      (v) => v ?? {},
      z.object({
        website: opt, scholar: opt, github: opt, linkedin: opt, orcid: opt,
        dblp: opt, researchgate: opt, twitter: opt, cv: opt,
      }),
    ),
    education: z
      .array(z.object({ degree: z.string(), field: opt, institution: z.string(), year: optNum }))
      .default([]),
    experience: z
      .array(z.object({ title: z.string(), org: z.string(), period: opt, description: opt }))
      .default([]),
    order: z.number().default(99),
    ...common,
  }),
});

const publications = defineCollection({
  loader: md('publications'),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    venue: z.string(),
    venue_short: opt,
    year: z.coerce.number(),
    date: z.coerce.date().optional(),
    type: z.enum(['journal', 'conference', 'workshop', 'preprint', 'chapter', 'thesis', 'other']),
    doi: opt,
    arxiv: opt,
    pdf: opt,
    url: opt,
    code: opt,
    data: opt,
    slides: opt,
    video: opt,
    poster: opt,
    website: opt,
    award: opt,
    selected: z.boolean().default(false),
    areas: refs,
    tags: list,
    abstract: opt,
    bibtex: opt,
    ...common,
  }),
});

const news = defineCollection({
  loader: md('news'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['announcement', 'publication', 'award', 'talk', 'people', 'event', 'media', 'thesis']),
    summary: z.string(),
    people: refs,
    publication: ref,
    link: opt,
    image: opt,
    tags: list,
    ...common,
  }),
});

const blog = defineCollection({
  loader: md('blog'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    authors: refs, // people ids or plain names
    summary: z.string(),
    cover: opt,
    tags: list,
    ...common,
  }),
});

const events = defineCollection({
  loader: md('events'),
  schema: z.object({
    title: z.string(),
    type: z.enum(['seminar', 'reading-group', 'talk', 'workshop', 'defense', 'social']),
    series: opt,
    date: z.coerce.date(), // e.g. 2026-10-14T16:00:00+03:30
    end: z.coerce.date().optional(),
    speaker: opt,
    affiliation: opt,
    speaker_url: opt,
    location: opt,
    online: opt,
    slides: opt,
    video: opt,
    people: refs,
    ...common,
  }),
});

const teaching = defineCollection({
  loader: md('teaching'),
  schema: z.object({
    code: opt,
    title: z.string(),
    level: z.enum(['graduate', 'undergraduate']),
    terms: list,
    instructor: ref,
    website: opt,
    order: z.number().default(99),
    ...common,
  }),
});

const positions = defineCollection({
  loader: md('positions'),
  schema: z.object({
    title: z.string(),
    level: z.string(),
    status: z.enum(['open', 'closed']),
    summary: z.string(),
    order: z.number().default(99),
    ...common,
  }),
});

const projects = defineCollection({
  loader: md('projects'),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['software', 'dataset', 'benchmark', 'project']),
    summary: z.string(),
    status: z.enum(['active', 'archived']).default('active'),
    repo: opt,
    website: opt,
    docs: opt,
    download: opt,
    license: opt,
    publication: ref,
    areas: refs,
    people: refs,
    tags: list,
    cite: opt,
    order: z.number().default(99),
    ...common,
  }),
});

const handbook = defineCollection({
  loader: md('handbook'),
  schema: z.object({ title: z.string(), summary: opt, order: z.number().default(99), ...common }),
});

// Free text for fixed pages (about, join, contact).
const pages = defineCollection({
  loader: md('pages'),
  schema: z.object({ title: z.string(), summary: opt }),
});

export const collections = { research, people, publications, news, blog, events, teaching, positions, projects, handbook, pages };
