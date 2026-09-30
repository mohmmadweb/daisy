#!/usr/bin/env node
// Move a member to Alumni.
//   npm run graduate -- ali-rezaei 2027 "PhD student, EPFL" academia
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, y } from './lib.mjs';

const [id, end = String(new Date().getFullYear()), next = '', nextType = ''] = process.argv.slice(2);
const file = path.join(ROOT, 'content/people', `${id?.replace(/\.md$/, '')}.md`);
if (!id || !fs.existsSync(file)) {
  const ids = fs.readdirSync(path.join(ROOT, 'content/people')).filter((f) => !f.startsWith('_')).map((f) => f.replace(/\.md$/, ''));
  console.error(`Usage: npm run graduate -- <person-id> [year] ["where they went"] [academia|industry|startup|other]\nPeople: ${ids.join(', ')}`);
  process.exit(1);
}
let text = fs.readFileSync(file, 'utf8');
const [, fm, body] = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
const set = (src, key, value) => {
  const line = `${key}: ${value}`;
  return new RegExp(`^${key}:.*$`, 'm').test(src) ? src.replace(new RegExp(`^${key}:.*$`, 'm'), line) : `${src}\n${line}`;
};
let out = set(fm, 'end', end);
if (next) out = set(out, 'next', y(next));
if (nextType) out = set(out, 'next_type', nextType);
fs.writeFileSync(file, `---\n${out}\n---\n${body}`);
console.log(`✓ ${id} is now listed under Alumni (left ${end}${next ? `, now ${next}` : ''}).`);
