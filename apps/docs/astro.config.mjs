// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages 部署配置
	site: 'https://yuanyuanyuan.github.io',
	base: '/astro-base-zero/docs',
	
	integrations: [
		starlight({
			title: 'Astro Base Zero 文档',
			description: 'Astro 项目快速发布平台 - 完整的使用指南和 API 参考',
			social: [
				{ 
					icon: 'github', 
					label: 'GitHub', 
					href: 'https://github.com/yuanyuanyuan/astro-base-zero' 
				},
			],
			customCss: [
				'./src/styles/custom.css',
			],
			sidebar: [
				{
					label: '指南',
					autogenerate: { directory: 'guides' },
				},
				{
					label: '参考',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
