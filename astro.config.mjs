import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://daisy-lab.ir',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [sitemap()],
  markdown: { shikiConfig: { theme: 'github-light' } },
});
