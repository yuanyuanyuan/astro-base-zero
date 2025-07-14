import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: '{{default project.site "https://example.com"}}',
  base: '{{default project.base "/"}}',
  integrations: [
    tailwind(),
    react(),
    sitemap(),
  ],
  output: 'static',
  build: {
    format: 'directory',
  },
}); 