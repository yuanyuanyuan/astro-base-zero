---
title: '欢迎来到我的博客'
description: '这是一篇示例文章，展示了博客模板的功能和样式。'
publishDate: 2025-01-11
category: '公告'
tags: ['欢迎', '博客', '开始']
author: '{{brand.personal.name}}'
featured: true
readingTime: 3
---

# 欢迎来到我的博客

欢迎来到我的个人博客！这里是我分享想法、经验和见解的地方。

## 关于这个博客

这个博客使用了 **Astro Base Zero** 博客模板构建，具有以下特性：

- **现代化设计** - 简洁、响应式的界面设计
- **Markdown 支持** - 支持 Markdown 和 MDX 格式的文章
- **内容集合** - 使用 Astro 的内容集合进行类型安全的内容管理
- **SEO 优化** - 内置 SEO 最佳实践
- **RSS 订阅** - 自动生成 RSS 订阅源

## 技术栈

这个博客基于以下技术构建：

1. **[Astro](https://astro.build/)** - 现代化的静态站点生成器
2. **[Tailwind CSS](https://tailwindcss.com/)** - 实用优先的 CSS 框架
3. **[TypeScript](https://www.typescriptlang.org/)** - 类型安全的 JavaScript
4. **[MDX](https://mdxjs.com/)** - 增强的 Markdown 格式

## 文章特性

每篇文章都支持丰富的元数据：

```yaml
---
title: '文章标题'
description: '文章描述'
publishDate: 2025-01-11
category: '分类'
tags: ['标签1', '标签2']
author: '作者名称'
featured: true  # 是否为精选文章
readingTime: 5  # 预估阅读时间（分钟）
heroImage: '/path/to/image.jpg'  # 可选的主图
---
```

## 代码示例

你可以在文章中包含代码块：

```javascript
// 示例 JavaScript 代码
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

```css
/* 示例 CSS 代码 */
.blog-post {
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem;
}
```

## 更多功能

### 引用块

> 这是一个引用块的示例。它可以用来突出重要的信息或引用他人的话语。

### 列表

**无序列表：**
- 项目 1
- 项目 2
- 项目 3

**有序列表：**
1. 第一步
2. 第二步
3. 第三步

### 表格

| 功能     | 描述              | 状态 |
|--------|-----------------|------|
| 文章管理 | 支持 Markdown/MDX | ✅    |
| 分类标签 | 灵活的分类系统    | ✅    |
| RSS 订阅 | 自动生成订阅源    | ✅    |
| 搜索功能 | 全文搜索          | 🚧   |

## 开始写作

要创建新的文章，只需在 `src/content/blog/` 目录下添加新的 Markdown 文件即可。文件名将作为文章的 URL 路径。

感谢你的阅读，期待与你分享更多精彩内容！

---

**标签：** #欢迎 #博客 #开始 