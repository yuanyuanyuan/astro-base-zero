---
title: 安装指南
description: 详细的环境配置和安装步骤
---

# 安装指南

本指南将帮助你完成 Astro Base Zero 的完整安装和环境配置。

## 📋 系统要求

### 必需环境

- **操作系统**: Windows 10+, macOS 10.14+, 或 Linux (Ubuntu 18.04+)
- **Node.js**: v20.11.0 (LTS) 或更高版本
- **内存**: 至少 4GB RAM
- **硬盘空间**: 至少 1GB 可用空间

### 推荐配置

- **Node.js**: v20.11.0 (最新 LTS 版本)
- **包管理器**: pnpm v8.15.0 (性能最佳)
- **编辑器**: VS Code + Astro 扩展
- **Git**: 用于版本控制

## 🚀 快速安装

### 方法一：使用 npm (推荐)

```bash
npm install -g @astro-base-zero/cli
```

### 方法二：使用 pnpm (性能最佳)

```bash
# 首先安装 pnpm
npm install -g pnpm

# 然后安装 CLI
pnpm add -g @astro-base-zero/cli
```

### 方法三：使用 yarn

```bash
yarn global add @astro-base-zero/cli
```

## 🔧 环境验证

安装完成后，验证环境是否正确配置：

```bash
# 验证 Node.js 版本
node --version
# 应该显示 v20.11.0 或更高

# 验证 CLI 安装
astro-zero --version
# 应该显示当前版本号

# 验证功能
astro-zero --help
# 应该显示可用命令列表
```

## 📦 Node.js 安装

如果你还没有安装 Node.js，推荐使用以下方法：

### Windows 用户

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本 (v20.11.0+)
3. 运行安装程序并按提示完成安装
4. 重启命令行工具

### macOS 用户

使用 Homebrew (推荐):

```bash
# 安装 Homebrew (如果还没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node@20
```

或使用 nvm:

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端，然后安装 Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

### Linux 用户

使用 nvm (推荐):

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端
source ~/.bashrc

# 安装 Node.js
nvm install 20
nvm use 20
nvm alias default 20
```

## 🎨 开发环境配置

### VS Code 配置

安装推荐的 VS Code 扩展：

```json
{
  "recommendations": [
    "astro-build.astro-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code 设置

在项目根目录创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "astro.typescript.enabled": true,
  "typescript.preferences.quoteStyle": "single",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🔐 权限配置

### npm 全局包权限 (macOS/Linux)

如果遇到权限问题，配置 npm 全局包路径：

```bash
# 创建全局包目录
mkdir ~/.npm-global

# 配置 npm
npm config set prefix '~/.npm-global'

# 更新 PATH (添加到 ~/.bashrc 或 ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# 重新加载配置
source ~/.bashrc  # 或 source ~/.zshrc
```

### Windows 权限

如果在 Windows 上遇到权限问题：

1. 以管理员身份运行命令提示符
2. 或使用 Windows Subsystem for Linux (WSL2)

## 🌐 网络配置

### 企业网络/代理配置

如果在企业网络环境中，可能需要配置代理：

```bash
# 配置 npm 代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 配置 pnpm 代理
pnpm config set proxy http://proxy.company.com:8080
pnpm config set https-proxy http://proxy.company.com:8080
```

### 私有 npm 仓库

如果使用私有 npm 仓库：

```bash
# 配置仓库地址
npm config set registry https://your-private-registry.com

# 或使用 .npmrc 文件
echo "registry=https://your-private-registry.com" > ~/.npmrc
```

## 🔄 更新和维护

### 检查更新

```bash
# 检查 CLI 工具更新
astro-zero update check

# 更新到最新版本
astro-zero update install
```

### 卸载

如果需要完全卸载：

```bash
# 卸载 CLI 工具
npm uninstall -g @astro-base-zero/cli

# 清理配置文件 (可选)
rm -rf ~/.astro-base-zero
```

## 🔍 故障排除

### 常见问题

**问题 1**: `command not found: astro-zero`

**解决方案**:

```bash
# 检查全局包安装路径
npm list -g --depth=0

# 检查 PATH 配置
echo $PATH

# 重新安装
npm install -g @astro-base-zero/cli
```

**问题 2**: `Permission denied` 错误

**解决方案**:

```bash
# macOS/Linux: 修复权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 或使用 nvm 管理 Node.js
```

**问题 3**: 网络连接超时

**解决方案**:

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 pnpm
pnpm config set registry https://registry.npmmirror.com
```

### 获取帮助

如果仍然遇到问题：

1. 查看 [常见问题](/getting-started/troubleshooting/)
2. 在 [GitHub Issues](https://github.com/astro-base-zero/astro-base-zero/issues) 搜索类似问题
3. 提交新的问题报告，包含以下信息：
   - 操作系统版本
   - Node.js 版本
   - CLI 工具版本
   - 完整的错误信息

## 🎉 下一步

安装完成后，你可以：

1. 📖 [阅读快速开始指南](/getting-started/quick-start/) - 创建第一个项目
2. 🎨 [配置个人品牌](/getting-started/brand-setup/) - 设置品牌信息
3. 🚀 [创建第一个项目](/getting-started/first-project/) - 详细的项目创建教程
