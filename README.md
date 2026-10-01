# DAISY Lab website

Source of **https://daisy-lab.ir**, the website of DAISY Lab (Data-Centric AI Systems), Department of Computer Engineering, Sharif University of Technology.

The design lives in `src/`; everything you see on the site lives in `content/` as Markdown and YAML. Push a change to `main` and GitHub Actions rebuilds and publishes the site in about two minutes.

**راهنمای فارسی: [GUIDE-fa.md](GUIDE-fa.md)**

## Three ways to edit

| Way | Best for | How |
|---|---|---|
| Content manager | Everyone, no Git needed | Open **https://daisy-lab.ir/admin/** and sign in with GitHub. Forms for people, papers, news, events, settings… |
| GitHub website | Quick text fixes | Every page has an *Edit this page* link at the bottom that opens its file on GitHub. |
| Command line | Bulk work | Clone, edit, `npm run dev`, commit, push. Helper scripts below. |

## Content

| Folder / file | What it is |
|---|---|
| `content/site.yml` | Lab name, contact, address, map pin, admissions banner, sponsors, social links, `show_samples` |
| `content/people/` | One file per person. `role`: faculty, postdoc, phd, msc, bsc, staff, visitor, affiliate. **Set `end:` to move someone to Alumni.** |
| `content/publications/` | One file per paper. Lab members in `authors` are linked automatically. BibTeX is generated. |
| `content/research/` | Research directions. Each one is a petal of the home-page flower. |
| `content/news/` | News items (RSS at `/rss.xml`). |
| `content/events/` | Seminars, reading groups, talks, defences (calendar feed at `/events.ics`). |
| `content/projects/` | Software, datasets, benchmarks. |
| `content/teaching/`, `positions/`, `blog/`, `handbook/` | Courses, open positions, blog posts, members' handbook. |
| `content/pages/` | Text of the About, Join and Contact pages. |
| `content/gallery.yml` | Lab photos (images in `public/images/gallery/`). |
| `public/images/` | Photos and logos. |

Blank templates for a person and a paper are in `templates/`.
Any entry can have `draft: true` (hidden) or `sample: true` (hidden when `show_samples: false`).

Sections with no entries (blog, gallery, events, …) disappear from the menu automatically.

## Helper scripts

```bash
npm install
npm run dev                                   # preview at http://localhost:4321

npm run add-paper -- 10.1038/s41598-024-82286-x   # paper from a DOI (Crossref)
npm run add-paper -- 2504.10753                   # paper from arXiv
npm run import-bib -- scholar-export.bib          # many papers from BibTeX; skips duplicates

npm run new -- person "Ali Rezaei" phd
npm run new -- news "Paper accepted at VLDB 2027"
npm run new -- event "Reading group: learned indexes" 2026-11-12T16:00
npm run new -- post "Why Text-to-SQL is still hard"
npm run new -- course "Advanced Database Systems" graduate
npm run new -- release "DAISY-SQL" dataset

npm run graduate -- ali-rezaei 2027 "PhD student, EPFL" academia

npm run build                                 # full build + search index into dist/
```

The *Add a paper from DOI or arXiv* workflow (GitHub → Actions) does the same as `add-paper`, then commits and republishes.

## How it is built

- [Astro](https://astro.build) static site; content collections with schemas in `src/content.config.ts`. A wrong field fails the build with the file name and the field, and the live site keeps its previous version.
- Search: [Pagefind](https://pagefind.app), built after Astro.
- Content manager: [Sveltia CMS](https://sveltiacms.app) at `/admin/`, configured in `public/admin/config.yml`. The bundle is copied from `node_modules` at build time (`scripts/vendor-cms.mjs`), so no third-party CDN is needed. GitHub sign-in goes through `auth-worker/`, a Cloudflare Worker on `auth.daisy-lab.ir`.
- Fonts are self-hosted (IBM Plex Sans, Source Serif 4, IBM Plex Mono) so the site loads without Google Fonts.
- `.github/workflows/deploy.yml` builds on every push to `main` and nightly, and publishes to GitHub Pages. The custom domain is set by `public/CNAME`.
- Feeds and machine-readable output: `/rss.xml`, `/events.ics`, `/publications.bib`, `/sitemap-index.xml`, JSON-LD and Google Scholar `citation_*` tags on paper pages.
