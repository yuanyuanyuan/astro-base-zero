# {{project.name}}

{{project.description}}

> 由 [Astro Base Zero](https://github.com/astro-base-zero) 工具模板生成，基于
> [Astro](https://astro.build/) 构建。

## ✨ 特性

- 🛠️ **专为工具展示优化** - 针对在线工具的专用布局和设计
- ⚡ **React 组件支持** - 集成 React 用于构建交互式工具
- 🎯 **交互演示区域** - 清晰的工具操作界面
- 📖 **详细使用说明** - 完整的使用指南和帮助信息
- 🎨 **现代化设计** - 简洁美观的用户界面
- 📱 **移动端适配** - 完美适配各种设备尺寸
- 🔍 **SEO 友好** - 优化的搜索引擎表现
- 🔒 **隐私保护** - 本地处理，数据不上传

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
{{project.name}}/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用组件
│   │   ├── TextCounter.tsx # 示例工具组件
│   │   ├── ToolInfo.astro  # 工具信息组件
│   │   ├── UsageInstructions.astro # 使用说明组件
│   │   ├── Header.astro    # 头部导航
│   │   └── Footer.astro    # 底部信息
│   ├── layouts/           # 布局模板
│   │   ├── BaseLayout.astro    # 基础布局
│   │   └── ToolLayout.astro    # 工具专用布局
│   ├── pages/             # 页面文件
│   │   └── index.astro    # 首页
│   ├── utils/             # 工具函数
│   └── env.d.ts           # 类型定义
├── brand.yaml             # 品牌配置
├── astro.config.mjs       # Astro 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 🛠️ 工具开发指南

### 创建新工具

1. 在 `src/components/` 目录下创建新的 React 组件
2. 使用 TypeScript 确保类型安全
3. 遵循响应式设计原则

```tsx
// src/components/MyTool.tsx
import React, { useState } from 'react';

const MyTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const processData = () => {
    // 工具逻辑处理
    setResult(input.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="输入内容"
      />
      <button
        onClick={processData}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        处理
      </button>
      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p>结果: {result}</p>
        </div>
      )}
    </div>
  );
};

export default MyTool;
```

### 使用工具布局

在页面中使用 `ToolLayout` 来获得完整的工具展示体验：

```astro
---
import ToolLayout from '@/layouts/ToolLayout.astro';
import MyTool from '@/components/MyTool.tsx';

const toolInfo = {
  title: '我的工具',
  description: '工具描述',
  category: '实用工具',
  features: ['特性1', '特性2'],
  instructions: ['步骤1', '步骤2']
};
---

<ToolLayout
  title={toolInfo.title}
  description={toolInfo.description}
  toolCategory={toolInfo.category}
  features={toolInfo.features}
  instructions={toolInfo.instructions}
>
  <MyTool client:load />
</ToolLayout>
```

### 工具设计原则

1. **用户体验优先** - 界面简洁直观，操作流程清晰
2. **隐私保护** - 数据在本地处理，不上传到服务器
3. **响应式设计** - 适配桌面端和移动端
4. **无障碍访问** - 支持键盘导航和屏幕阅读器
5. **性能优化** - 快速加载和响应

## 🎨 自定义

### 品牌配置

编辑 `brand.yaml` 文件来自定义你的品牌资产：

```yaml
personal:
  name: '{{brand.personal.name}}'
  bio: '{{brand.personal.bio}}'

visual:
  colors:
    primary: '{{brand.visual.colors.primary}}'
    accent: '{{brand.visual.colors.accent}}'

# 工具特定配置
tool:
  category: '实用工具'
  features:
    - '完全免费使用'
    - '无需注册登录'
    - '数据不会上传到服务器'
    - '开源代码可查看'
```

### 样式定制

1. **CSS 变量** - 在 `src/layouts/BaseLayout.astro` 中修改 CSS 变量
2. **Tailwind 配置** - 在 `tailwind.config.js` 中扩展主题
3. **组件样式** - 使用 Tailwind 类名或 CSS-in-JS

### 添加新功能

#### 使用统计

```tsx
// 添加使用统计
const [usageCount, setUsageCount] = useState(0);

const trackUsage = () => {
  setUsageCount(prev => prev + 1);
  // 保存到 localStorage
  localStorage.setItem('toolUsage', String(usageCount + 1));
};
```

#### 结果导出

```tsx
// 添加导出功能
const exportResult = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
```

## 🔍 SEO 优化

模板内置了工具 SEO 最佳实践：

- 结构化数据标记（工具类型、功能描述）
- 丰富的 meta 标签和 Open Graph 信息
- 语义化的 HTML 结构
- 友好的 URL 和导航结构

## 📊 性能优化

- **组件懒加载** - 使用 `client:load` 指令
- **代码分割** - React 组件按需加载
- **静态生成** - 基于 Astro 的静态站点生成
- **资源优化** - 图片和字体的预加载

## 🔒 安全和隐私

- **本地处理** - 所有数据在浏览器中处理
- **无数据收集** - 不收集用户的个人信息
- **开源透明** - 代码完全开源可审查
- **HTTPS 支持** - 支持安全的 HTTPS 传输

## 📚 了解更多

- [Astro 文档](https://docs.astro.build/)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [Astro Base Zero 文档](https://astro-base-zero.github.io/docs/)

## 🤝 贡献

欢迎提交问题和改进建议！

## 📄 许可证

{{brand.defaults.license}}

---

**作者**: {{brand.personal.name}}  
**邮箱**: {{brand.personal.email}}  
**网站**: {{brand.personal.social.links[0].url}}

由 ❤️ 和 [Astro Base Zero](https://github.com/astro-base-zero) 制作
