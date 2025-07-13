---
title: CLI 命令参考
description: Astro Base Zero CLI 工具的完整命令参考手册
---

# CLI 命令参考

Astro Base Zero CLI 提供了一套完整的命令行工具，帮助你快速创建和管理项目。

## 🚀 基础命令

### `astro-zero --version`

显示 CLI 工具的当前版本。

```bash
astro-zero --version
# 输出: 1.0.0
```

### `astro-zero --help`

显示可用命令的帮助信息。

```bash
astro-zero --help
```

## 🎨 品牌配置

### `astro-zero config brand`

启动交互式品牌配置向导。

```bash
astro-zero config brand
```

**配置项**:

- 个人/公司名称
- 联系邮箱
- 社交媒体链接
- 品牌色彩
- Logo 和头像

### `astro-zero config show`

显示当前的品牌配置。

```bash
astro-zero config show
```

## 🚀 项目管理

### `astro-zero create <name>`

创建新项目。

```bash
astro-zero create my-project --template base
astro-zero create my-blog --template blog
astro-zero create my-tool --template tool
```

**参数**:

- `<name>`: 项目名称
- `--template, -t`: 项目模板 (base/blog/tool)
- `--directory, -d`: 项目目录 (可选)

### `astro-zero templates list`

显示可用的项目模板。

```bash
astro-zero templates list
```

### `astro-zero templates info <template>`

显示特定模板的详细信息。

```bash
astro-zero templates info base
astro-zero templates info blog
astro-zero templates info tool
```

## 🚀 部署命令

### `astro-zero deploy <platform>`

部署项目到指定平台。

```bash
astro-zero deploy github
astro-zero deploy netlify
astro-zero deploy vercel
```

**支持的平台**:

- `github`: GitHub Pages
- `netlify`: Netlify
- `vercel`: Vercel

### `astro-zero deploy status`

检查当前项目的部署状态。

```bash
astro-zero deploy status
```

## 🔧 实用工具

### `astro-zero update check`

检查 CLI 工具更新。

```bash
astro-zero update check
```

### `astro-zero update install`

更新 CLI 工具到最新版本。

```bash
astro-zero update install
```

### `astro-zero doctor`

诊断当前环境和配置。

```bash
astro-zero doctor
```

## 📊 项目统计

### `astro-zero stats`

显示项目统计信息。

```bash
astro-zero stats
```

输出包括:

- 项目总数
- 使用的模板分布
- 部署平台统计
- 最近活动

## 🔍 调试选项

### 全局选项

**`--verbose, -v`**: 显示详细日志

```bash
astro-zero create my-project --verbose
```

**`--debug`**: 启用调试模式

```bash
astro-zero create my-project --debug
```

**`--quiet, -q`**: 静默模式

```bash
astro-zero create my-project --quiet
```

## 📋 环境变量

### `ASTRO_ZERO_CONFIG_DIR`

自定义配置文件目录。

```bash
export ASTRO_ZERO_CONFIG_DIR=~/my-config
astro-zero config brand
```

### `ASTRO_ZERO_TEMPLATE_SOURCE`

自定义模板源。

```bash
export ASTRO_ZERO_TEMPLATE_SOURCE=https://my-templates.com
astro-zero templates list
```

## 🔧 配置文件

### 全局配置文件

位置: `~/.astro-base-zero/config.yaml`

```yaml
brand:
  name: '我的站点'
  description: '我的个人网站'
  contact:
    email: 'hello@example.com'
  social:
    github: 'https://github.com/my-username'
  colors:
    primary: '#3B82F6'
    secondary: '#1F2937'

preferences:
  defaultTemplate: 'base'
  packageManager: 'pnpm'
  editor: 'vscode'
```

### 项目配置文件

位置: `project-root/brand.yaml`

```yaml
name: '项目名称'
description: '项目描述'
version: '1.0.0'
template: 'base'
created: '2024-01-01T00:00:00Z'
```

## 🚨 错误代码

常见错误代码及解决方案:

- **ERR_001**: 配置文件格式错误
- **ERR_002**: 模板下载失败
- **ERR_003**: 项目目录已存在
- **ERR_004**: 网络连接问题
- **ERR_005**: 权限不足

详细的错误处理请参考[故障排除指南](/getting-started/troubleshooting/)。
