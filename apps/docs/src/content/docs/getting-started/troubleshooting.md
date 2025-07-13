---
title: 常见问题
description: 安装、使用和部署过程中的常见问题及解决方案
---

# 常见问题与故障排除

本页面收集了 Astro Base Zero 使用过程中的常见问题和解决方案。

## 🚨 安装问题

### CLI 工具安装失败

**问题**: `npm install -g @astro-base-zero/cli` 失败

**可能原因**:

- 网络连接问题
- 权限不足
- Node.js 版本过低

**解决方案**:

1. **检查 Node.js 版本**:

```bash
node --version
# 需要 v20.11.0 或更高版本
```

2. **使用不同的包管理器**:

```bash
# 尝试使用 pnpm
npm install -g pnpm
pnpm add -g @astro-base-zero/cli

# 或使用 yarn
npm install -g yarn
yarn global add @astro-base-zero/cli
```

3. **解决权限问题 (macOS/Linux)**:

```bash
# 方法一：使用 nvm 管理 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# 方法二：配置 npm 全局路径
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

4. **使用镜像源**:

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com
npm install -g @astro-base-zero/cli
```

### 命令未找到错误

**问题**: `command not found: astro-zero`

**解决方案**:

1. **检查安装状态**:

```bash
npm list -g @astro-base-zero/cli
```

2. **检查 PATH 配置**:

```bash
echo $PATH
# 确保包含 npm 全局包路径
```

3. **重新安装**:

```bash
npm uninstall -g @astro-base-zero/cli
npm install -g @astro-base-zero/cli
```

4. **重启终端**: 安装后重新打开终端窗口

## 🎨 品牌配置问题

### 品牌配置向导无法启动

**问题**: `astro-zero config brand` 没有响应

**解决方案**:

1. **检查 CLI 版本**:

```bash
astro-zero --version
```

2. **清理配置缓存**:

```bash
rm -rf ~/.astro-base-zero
astro-zero config brand
```

3. **手动创建配置文件**:

```yaml
# ~/.astro-base-zero/config.yaml
brand:
  name: '我的站点'
  description: '我的个人网站'
  contact:
    email: 'hello@example.com'
  social:
    github: 'https://github.com/your-username'
  colors:
    primary: '#3B82F6'
    secondary: '#1F2937'
```

### 配置文件格式错误

**问题**: YAML 格式错误导致配置失败

**解决方案**:

1. **验证 YAML 格式**: 使用在线 YAML 验证工具检查格式

2. **常见格式问题**:

```yaml
# ❌ 错误格式
name:"我的站点"
colors:
primary: "#3B82F6"

# ✅ 正确格式
name: "我的站点"
colors:
  primary: "#3B82F6"
```

## 🚀 项目创建问题

### 项目创建失败

**问题**: `astro-zero create` 命令失败

**可能原因**:

- 目标目录已存在
- 权限不足
- 模板下载失败

**解决方案**:

1. **检查目录状态**:

```bash
# 确保目标目录不存在或为空
ls -la my-project
```

2. **使用不同的项目名称**:

```bash
astro-zero create my-unique-project-name --template base
```

3. **指定不同的目录**:

```bash
astro-zero create ~/projects/my-project --template base
```

4. **检查模板可用性**:

```bash
astro-zero templates list
```

### 依赖安装失败

**问题**: 项目创建后 `pnpm install` 失败

**解决方案**:

1. **清理缓存**:

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

2. **使用不同的包管理器**:

```bash
# 使用 npm
rm pnpm-lock.yaml
npm install

# 使用 yarn
rm pnpm-lock.yaml
yarn install
```

3. **检查网络连接**:

```bash
# 测试 npm 连通性
npm ping
```

## 🏃‍♂️ 开发服务器问题

### 端口占用问题

**问题**: `Error: listen EADDRINUSE: address already in use :::4321`

**解决方案**:

1. **查找占用端口的进程**:

```bash
# macOS/Linux
lsof -i :4321

# Windows
netstat -ano | findstr :4321
```

2. **终止占用进程**:

```bash
# macOS/Linux
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

3. **使用不同端口**:

```bash
pnpm dev --port 3000
```

### 热重载不工作

**问题**: 修改文件后页面不自动刷新

**解决方案**:

1. **检查文件监听限制 (Linux)**:

```bash
# 增加文件监听限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

2. **重启开发服务器**:

```bash
# 停止服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

3. **检查防火墙设置**: 确保防火墙没有阻止本地端口访问

## 🎨 样式和组件问题

### Tailwind CSS 样式不生效

**问题**: CSS 类不起作用

**解决方案**:

1. **检查 Tailwind 配置**:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

2. **确保导入了 CSS 文件**:

```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **重新构建项目**:

```bash
rm -rf dist .astro
pnpm dev
```

### 组件导入错误

**问题**: `Cannot resolve module` 错误

**解决方案**:

1. **检查文件路径**:

```astro
<!-- ❌ 错误路径 -->
import Header from './components/Header.astro';

<!-- ✅ 正确路径 -->
import Header from '../components/Header.astro';
```

2. **检查文件扩展名**:

```astro
<!-- 确保包含正确的扩展名 -->
import Header from '../components/Header.astro';
import Button from '../components/Button.tsx';
```

## 🚀 部署问题

### GitHub Pages 部署失败

**问题**: 部署到 GitHub Pages 后页面空白

**解决方案**:

1. **检查 base 配置**:

```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://your-username.github.io',
  base: '/your-repository-name',
});
```

2. **检查构建输出**:

```bash
pnpm build
ls -la dist/
```

3. **验证 GitHub Actions**: 检查 `.github/workflows/deploy.yml` 配置

### 构建时内存不足

**问题**: `JavaScript heap out of memory`

**解决方案**:

1. **增加 Node.js 内存限制**:

```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

2. **优化图片资源**: 压缩大图片文件，使用适当的格式

3. **分块构建**:

```javascript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro'],
          },
        },
      },
    },
  },
});
```

## 🔧 性能问题

### 构建速度慢

**问题**: `pnpm build` 耗时过长

**解决方案**:

1. **启用并行构建**:

```bash
# 使用多核构建
pnpm build --parallel
```

2. **清理缓存**:

```bash
rm -rf .astro dist node_modules
pnpm install
pnpm build
```

3. **优化图片处理**:

```javascript
// astro.config.mjs
export default defineConfig({
  image: {
    service: squooshImageService(),
  },
});
```

### 运行时性能问题

**问题**: 页面加载速度慢

**解决方案**:

1. **分析 bundle 大小**:

```bash
pnpm build
npx astro build --analyze
```

2. **启用预加载**:

```astro
---
// 在需要的组件中
export const prerender = true;
---
```

3. **优化图片**:

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="Hero"
  loading="lazy"
  format="webp"
/>
```

## 📞 获取更多帮助

如果以上解决方案都无法解决你的问题：

### 社区支持

1. **GitHub Issues**: [提交问题报告](https://github.com/astro-base-zero/astro-base-zero/issues)
2. **讨论区**: [参与社区讨论](https://github.com/astro-base-zero/astro-base-zero/discussions)
3. **文档**: [查看完整文档](/)

### 问题报告模板

提交问题时，请包含以下信息：

```markdown
## 环境信息

- 操作系统: (Windows 11 / macOS 13 / Ubuntu 22.04)
- Node.js 版本: (node --version)
- CLI 版本: (astro-zero --version)
- 包管理器: (npm / pnpm / yarn)

## 问题描述

简单描述遇到的问题

## 重现步骤

1. 第一步
2. 第二步
3. 看到错误

## 期望结果

描述期望的正确行为

## 实际结果

描述实际发生的情况

## 错误信息
```

粘贴完整的错误信息

```

## 额外信息
其他可能有用的信息
```

### 调试模式

启用详细日志来帮助诊断问题：

```bash
# 启用调试模式
DEBUG=astro-zero:* astro-zero create my-project

# 或使用详细模式
astro-zero create my-project --verbose
```
