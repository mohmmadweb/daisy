#!/usr/bin/env node
// Scaffold a new content file with every field filled in or commented.
//   npm run new -- person "Ali Rezaei" phd
//   npm run new -- news "Paper accepted at VLDB 2027"
//   npm run new -- event "Reading group: learned indexes" 2026-11-12T16:00
//   npm run new -- post "Why Text-to-SQL is still hard"
//   npm run new -- course "Advanced Database Systems" graduate
//   npm run new -- release "DAISY-SQL benchmark" dataset
import { slug, y, writeNew } from './lib.mjs';

const [kind, title, extra] = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);
const year = new Date().getFullYear();
const ROLES = ['faculty', 'postdoc', 'phd', 'msc', 'bsc', 'staff', 'visitor', 'affiliate'];
const TITLES = { phd: 'PhD Student in Computer Engineering', msc: 'MSc Student in Computer Engineering', bsc: 'BSc Student in Computer Engineering', postdoc: 'Postdoctoral Researcher', staff: 'Research Engineer', visitor: 'Visiting Researcher', affiliate: 'Affiliated Researcher', faculty: 'Assistant Professor' };

const templates = {
  person: () => {
    const role = ROLES.includes(extra) ? extra : 'phd';
    const id = slug(title);
    return ['people', id, `---
name: ${y(title)}
name_fa: ""
role: ${role}
title: ${TITLES[role]}
photo: ""            # e.g. /images/people/${id}.jpg (square, at least 400×400)
email: ""
start: ${year}
end:                 # year they leave → moves them to Alumni
next: ""             # after leaving, e.g. "PhD student, EPFL"
next_type:           # academia | industry | startup | other
interests: []
areas: []            # ids from content/research, e.g. [text-to-sql]
aliases: []          # other spellings of the name in author lists
links:
  website: ""
  scholar: ""
  github: ""
  linkedin: ""
  orcid: ""
---

Two or three sentences about ${title.split(' ')[0]}'s research.
`];
  },
  news: () => [
    'news', `${today}-${slug(title)}`, `---
title: ${y(title)}
date: ${today}
category: announcement   # announcement | publication | award | talk | people | event | media | thesis
summary: One sentence shown in lists.
people: []               # ids of people involved, e.g. [maryam-ramezani]
publication: ""          # id of a related paper, if any
tags: []
---

The full story.
`],
  event: () => {
    const when = extra ?? `${today}T16:00`;
    const iso = /[+Z]/.test(when.slice(10)) ? when : /T\d\d:\d\d$/.test(when) ? `${when}:00+03:30` : `${when}+03:30`;
    return ['events', `${when.slice(0, 10)}-${slug(title)}`, `---
title: ${y(title)}
type: seminar          # seminar | reading-group | talk | workshop | defense | social
series: DAISY Seminar
date: ${iso}
end:                   # e.g. ${iso.replace('T16', 'T17')}
speaker: ""
affiliation: ""
location: Room 821, Department of Computer Engineering
online: ""             # meeting link
slides: ""
video: ""
people: []
---

Abstract and speaker biography.
`];
  },
  post: () => ['blog', `${today}-${slug(title)}`, `---
title: ${y(title)}
date: ${today}
authors: []            # people ids, e.g. [maryam-ramezani]
summary: One or two sentences shown in the list and in link previews.
tags: []
---

Write the post here.
`],
  course: () => ['teaching', slug(title), `---
code: ""
title: ${y(title)}
level: ${extra === 'undergraduate' ? 'undergraduate' : 'graduate'}
terms: [Fall ${year}]
instructor: maryam-ramezani
website: ""
---

A short description of the course.
`],
  release: () => ['projects', slug(title), `---
title: ${y(title)}
kind: ${['software', 'dataset', 'benchmark', 'project'].includes(extra) ? extra : 'software'}
summary: One or two sentences on what it is and who it is for.
repo: ""
download: ""
docs: ""
license: ""
publication: ""        # id of the paper that introduced it
areas: []
people: []
tags: []
---

What it does, how to install or download it, and how to use it.
`],
};

if (!templates[kind] || !title) {
  console.error('Usage: npm run new -- <person|news|event|post|course|release> "Title" [role|date|level|kind]');
  process.exit(1);
}
const [dir, id, text] = templates[kind]();
writeNew(dir, id, text);
