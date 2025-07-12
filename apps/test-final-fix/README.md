# test-final-fix

最终测试模板修复

> 由 [Astro Base Zero](https://github.com/astro-base-zero) 博客模板生成，基于
> [Astro](https://astro.build/) 构建。

## ✨ 特性

- 📝 **Markdown/MDX 支持** - 支持 Markdown 和 MDX 格式的文章
- 🏷️ **分类和标签系统** - 灵活的内容分类管理
- 🔍 **全文搜索功能** - 快速查找相关内容
- 📡 **RSS 订阅生成** - 自动生成 RSS 订阅源
- 🗺️ **自动站点地图** - SEO 友好的站点地图
- 📱 **响应式设计** - 适配所有设备尺寸
- ⚡ **优秀的性能表现** - 基于 Astro 的静态生成
- 🎨 **可定制主题** - 完全可自定义的设计系统

## 🚀 快速开始

### 前置要求

- Node.js >= 20.11.0
- pnpm >= 8.15.0

### 安装

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📁 项目结构

```
test-final-fix/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── BlogCard.astro  # 文章卡片组件
│   │   ├── Header.astro    # 头部导航
│   │   └── Footer.astro    # 底部信息
│   ├── content/           # 内容集合
│   │   ├── blog/          # 博客文章
│   │   ├── authors/       # 作者信息
│   │   ├── categories/    # 分类数据
│   │   └── config.ts      # 内容集合配置
│   ├── layouts/           # 布局模板
│   │   ├── BaseLayout.astro    # 基础布局
│   │   └── BlogLayout.astro    # 博客文章布局
│   ├── pages/             # 页面文件
│   │   ├── index.astro    # 首页
│   │   ├── blog/          # 博客页面
│   │   ├── categories/    # 分类页面
│   │   └── tags/          # 标签页面
│   ├── utils/             # 工具函数
│   └── env.d.ts           # 类型定义
├── brand.yaml             # 品牌配置
├── astro.config.mjs       # Astro 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## ✍️ 写作指南

### 创建新文章

1. 在 `src/content/blog/` 目录下创建新的 `.md` 或 `.mdx` 文件
2. 使用以下 frontmatter 格式：

```yaml
---
title: '文章标题'
description: '文章描述'
publishDate: 2025-01-11
category: '分类名称'
tags: ['标签1', '标签2']
author: 'test-final-fix'
featured: false # 是否为精选文章
readingTime: 5 # 预估阅读时间（分钟）
heroImage: '/hero.jpg' # 可选的主图
draft: false # 是否为草稿
---
# 文章内容

这里是你的文章内容...
```

### 支持的 Markdown 功能

- **标题** - 使用 `#` 到 `######`
- **粗体和斜体** - `**粗体**` 和 `*斜体*`
- **链接** - `[链接文本](URL)`
- **图片** - `![alt文本](图片URL)`
- **代码块** - 使用三个反引号包围
- **引用** - 使用 `>` 开头
- **列表** - 有序和无序列表
- **表格** - Markdown 表格语法

### 内容集合

项目使用 Astro 的内容集合功能，提供类型安全的内容管理：

- `blog` - 博客文章
- `authors` - 作者信息
- `categories` - 分类定义

## 🎨 自定义

### 品牌配置

编辑 `brand.yaml` 文件来自定义你的品牌资产：

```yaml
personal:
  name: 'test-final-fix'
  bio: ''
  # ... 其他配置

visual:
  colors:
    primary: '#3b82f6'
    accent: '#f59e0b'
    # ... 其他颜色

# 博客特定配置
blog:
  postsPerPage: 10
  showReadingTime: true
  showAuthor: true
  enableComments: false
  rss:
    enabled: true
    title: '博客 RSS 订阅'
```

### 导航菜单

修改 `src/components/Header.astro` 中的 `navigation` 数组来自定义导航菜单：

```javascript
const navigation = [
  { name: '首页', href: '/' },
  { name: '文章', href: '/blog' },
  { name: '分类', href: '/categories' },
  { name: '标签', href: '/tags' },
  { name: '关于', href: '/about' },
];
```

### 样式定制

1. **CSS 变量** - 在 `src/layouts/BaseLayout.astro` 中修改 CSS 变量
2. **Tailwind 配置** - 在 `tailwind.config.js` 中扩展主题
3. **组件样式** - 直接修改各个组件的样式

## 📡 RSS 订阅

博客自动生成 RSS 订阅源，访问 `/rss.xml` 即可获取。

## 🔍 SEO 优化

模板内置了 SEO 最佳实践：

- 自动生成 meta 标签
- Open Graph 和 Twitter Card 支持
- 结构化数据标记
- 自动站点地图生成
- 友好的 URL 结构

## 📚 了解更多

- [Astro 文档](https://docs.astro.build/)
- [Astro 内容集合](https://docs.astro.build/en/guides/content-collections/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [MDX 文档](https://mdxjs.com/)
- [Astro Base Zero 文档](https://astro-base-zero.github.io/docs/)

## 📄 许可证



---

**作者**: test-final-fix  
**邮箱**: hello@example.com  
**网站**: 

由 ❤️ 和 [Astro Base Zero](https://github.com/astro-base-zero) 制作
