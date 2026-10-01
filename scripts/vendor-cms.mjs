// Copy the Sveltia CMS bundle into public/admin so the editor is served from
// daisy-lab.ir itself instead of a third-party CDN.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const src = path.join(ROOT, 'node_modules/@sveltia/cms/dist');
const out = path.join(ROOT, 'public/admin');
fs.copyFileSync(path.join(src, 'sveltia-cms.js'), path.join(out, 'sveltia-cms.js'));
fs.mkdirSync(path.join(out, 'chunks'), { recursive: true });
for (const f of fs.readdirSync(path.join(src, 'chunks')).filter((f) => !f.endsWith('.map'))) {
  fs.copyFileSync(path.join(src, 'chunks', f), path.join(out, 'chunks', f));
}
