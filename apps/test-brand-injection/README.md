# test-brand-injection

测试品牌配置注入功能

> 由 [Astro Base Zero](https://github.com/astro-base-zero) 生成的项目，基于
> [Astro](https://astro.build/) 构建。

## ✨ 特性

- 🚀 **Astro 5.0+** - 现代化的静态站点生成器
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 🔧 **TypeScript** - 完整的类型安全支持
- 🏷️ **品牌管理** - 自动注入个人品牌资产
- 📱 **响应式设计** - 适配所有设备尺寸
- ⚡ **零配置** - 开箱即用的开发体验

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
test-brand-injection/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   ├── layouts/           # 布局模板
│   ├── pages/             # 页面文件
│   └── env.d.ts           # 类型定义
├── brand.yaml             # 品牌配置
├── astro.config.mjs       # Astro 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 🎨 自定义

### 品牌配置

编辑 `brand.yaml` 文件来自定义你的品牌资产：

```yaml
personal:
  name: 'test-brand-injection'
  bio: ''
  # ... 其他配置

visual:
  colors:
    primary: '#3b82f6'
    accent: '#f59e0b'
    # ... 其他颜色
```

### 样式定制

1. **CSS 变量**: 在 `src/layouts/BaseLayout.astro` 中修改 CSS 变量
2. **Tailwind 配置**: 在 `tailwind.config.js` 中扩展主题
3. **全局样式**: 在布局文件中添加全局样式

### 组件使用

项目集成了 Astro Base Zero UI 组件库：

```astro
---
import { Hero, Features, CallToAction } from '@astro-base-zero/ui/widgets';
---

<Hero
  title="你的标题"
  subtitle="你的副标题"
  ctas={[
    { text: '开始使用', href: '/get-started', variant: 'primary' },
  ]}
/>
```

## 📚 了解更多

- [Astro 文档](https://docs.astro.build/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Astro Base Zero 文档](https://astro-base-zero.github.io/docs/)

## 📄 许可证

MIT License

---

**作者**: test-brand-injection  
**邮箱**: hello@example.com  
**项目**: https://github.com/your-username/test-brand-injection

由 ❤️ 和 [Astro Base Zero](https://github.com/astro-base-zero) 制作
