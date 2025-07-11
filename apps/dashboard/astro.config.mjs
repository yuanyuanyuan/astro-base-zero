import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@ui': '../../packages/ui/src',
        '@core': '../../packages/core/src',
      },
    },
  },
}); 