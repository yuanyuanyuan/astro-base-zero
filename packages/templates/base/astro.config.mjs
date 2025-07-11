import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: '{{project.site}}',
  base: '{{project.base}}',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  build: {
    format: 'directory',
  },
}); 