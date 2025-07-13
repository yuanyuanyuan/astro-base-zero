---
title: 快速开始
description: 5分钟快速体验 Astro Base Zero 平台
---

# 快速开始

欢迎使用 Astro Base Zero！这个指南将帮助你在 5 分钟内创建第一个项目。

## 🎯 准备工作

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: v20.11.0 或更高版本
- **包管理器**: 推荐使用 pnpm v8.15.0
- **Git**: 用于版本控制

## 📦 安装 CLI 工具

```bash
# 使用 npm 安装
npm install -g @astro-base-zero/cli

# 或使用 pnpm 安装
pnpm add -g @astro-base-zero/cli

# 验证安装
astro-zero --version
```

## 🎨 配置个人品牌

首次使用需要配置你的个人品牌信息：

```bash
astro-zero config brand
```

系统会引导你完成以下配置：

- **个人/公司名称**: 用于项目标题和版权信息
- **联系邮箱**: 用于表单和联系信息
- **社交媒体**: GitHub、Twitter 等社交媒体链接
- **品牌色彩**: 主色调和辅助色彩
- **Logo 和头像**: 个人或公司标识

## 🚀 创建第一个项目

配置完成后，开始创建你的第一个项目：

```bash
# 创建基础站点
astro-zero create my-awesome-site --template base

# 创建博客站点
astro-zero create my-blog --template blog

# 创建在线工具
astro-zero create my-tool --template tool
```

## 🏃‍♂️ 启动开发服务器

```bash
# 进入项目目录
cd my-awesome-site

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

开发服务器启动后，打开浏览器访问 `http://localhost:4321` 查看你的项目。

## 🎉 项目结构预览

生成的项目包含以下核心文件：

```
my-awesome-site/
├── src/
│   ├── pages/           # 页面文件
│   ├── components/      # 组件库
│   ├── layouts/         # 布局模板
│   └── styles/          # 样式文件
├── public/              # 静态资源
├── brand.yaml           # 品牌配置
├── astro.config.mjs     # Astro 配置
└── package.json         # 项目依赖
```

## 📝 自定义内容

### 编辑首页内容

主页内容位于 `src/pages/index.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="欢迎访问我的站点">
  <main>
    <h1>欢迎访问我的站点</h1>
    <p>这是一个使用 Astro Base Zero 创建的站点。</p>
  </main>
</BaseLayout>
```

### 更新品牌信息

修改 `brand.yaml` 文件来更新品牌信息：

```yaml
name: '我的站点'
description: '我的个人/公司网站'
contact:
  email: 'hello@example.com'
social:
  github: 'https://github.com/your-username'
colors:
  primary: '#3B82F6'
  secondary: '#1F2937'
```

## 🚀 部署上线

当你的项目准备就绪时，可以一键部署到各大平台：

```bash
# 部署到 GitHub Pages
astro-zero deploy github

# 部署到 Netlify
astro-zero deploy netlify

# 部署到 Vercel
astro-zero deploy vercel
```

## 🎯 下一步

恭喜！你已经成功创建了第一个 Astro Base Zero 项目。接下来你可以：

- 📖 [学习项目管理](/guides/project-management/) - 了解完整的项目生命周期
- 🎨 [自定义主题](/guides/theming/) - 打造独特的视觉风格
- 🔧 [配置部署](/guides/deployment/) - 设置自动化部署流程
- 📚 [查看 API 文档](/reference/api/) - 深入了解平台功能

如果遇到任何问题，请查看 [常见问题](/getting-started/troubleshooting/) 或在
[GitHub](https://github.com/astro-base-zero/astro-base-zero/issues) 上提交问题。
