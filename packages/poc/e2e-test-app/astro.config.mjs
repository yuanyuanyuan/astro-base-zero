import { defineConfig } from 'astro/config';
import { brandAssetInjector } from '@astro-base-zero/core/brand';

export default defineConfig({
  integrations: [
    {
      name: 'brand-injector-test',
      hooks: {
        'astro:config:setup': ({ updateConfig }) => {
          updateConfig({
            vite: {
              plugins: [brandAssetInjector()],
            },
          });
        },
      },
    },
  ],
}); 