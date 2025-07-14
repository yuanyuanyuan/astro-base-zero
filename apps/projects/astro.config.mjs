import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages 部署配置
  site: 'https://yuanyuanyuan.github.io',
  base: '/astro-base-zero/projects',
  
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  output: 'static',
  adapter: undefined, // 确保使用 SSG 模式
  build: {
    format: 'directory',
  },
  vite: {
    resolve: {
      alias: {
        '@ui': '../../packages/ui/src',
        '@core': '../../packages/core/src',
        '@/*': './src/*'
      },
    },
  },
}); 