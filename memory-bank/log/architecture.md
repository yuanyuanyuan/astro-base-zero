# Astro 项目快速发布平台 - 架构文档

**版本:** 1.2  
**最后更新:** 2025-01-13  
**架构状态:** Phase 1 - 静态版本架构 + GitHub Pages 自动部署 + 独立应用架构

---

## 🏗️ 总体架构

### 技术栈架构
基于 `tech-stack-v4-分阶段交付版.md` 的 Phase 1 静态版本架构：

```
Astro Base Zero Monorepo
├── 核心运行时层: Node.js v22.14.0 + pnpm v9.1.1
├── 静态生成引擎: Astro v5.0.0 + TypeScript v5.3.3 + Tailwind CSS v3.4.1
├── CLI工具链: Commander.js v12.0.0 + Inquirer.js v9.2.14
├── 配置系统: YAML v2.3.4 + Zod v3.22.4 + Handlebars v4.7.8
├── 本地存储: lowdb v7.0.1 + fs-extra v11.2.0
├── 构建部署: Vite v5.0.12 + Turbo v1.12.0 + GitHub Actions + GitHub Pages
└── 开发工具: ESLint v8.56.0 + Prettier v3.2.4 + Vitest v1.2.2
```

---

## 📁 文件结构

### 当前项目结构
```
astro-base-zero/
├── package.json                    # 根目录配置 + CLI别名脚本
├── pnpm-workspace.yaml             # 工作区配置
├── turbo.json                      # Monorepo构建配置
├── tsconfig.base.json              # TypeScript基础配置
├── .github/workflows/              # CI/CD 工作流
│   └── deploy.yml                 # GitHub Pages 自动部署配置
├── apps/                           # 应用层（独立应用架构）
│   ├── dashboard/                  # 工具和模板展示中心 (部署到 /dashboard)
│   │   ├── src/
│   │   │   ├── layouts/DashboardLayout.astro
│   │   │   ├── components/
│   │   │   │   ├── Navigation.astro
│   │   │   │   └── Sidebar.astro
│   │   │   └── pages/
│   │   │       ├── index.astro     # 工具中心主页
│   │   │       └── templates/      # 模板展示
│   │   └── astro.config.mjs        # base: /astro-base-zero/dashboard
│   ├── projects/                   # 独立项目管理应用 (部署到 /projects)
│   │   ├── src/
│   │   │   ├── layouts/ProjectsLayout.astro
│   │   │   ├── components/
│   │   │   │   ├── ProjectList.astro
│   │   │   │   └── ProjectCard.astro
│   │   │   ├── pages/
│   │   │   │   ├── index.astro     # 项目列表
│   │   │   │   └── manage.astro    # 项目操作指南
│   │   │   └── styles/global.css
│   │   ├── astro.config.mjs        # base: /astro-base-zero/projects
│   │   ├── tailwind.config.mjs     # 独立 Tailwind 配置
│   │   └── package.json            # 独立依赖管理
│   └── docs/                       # 文档应用 (部署到 /docs)
│       ├── astro.config.mjs        # base: /astro-base-zero/docs
│       └── src/content/docs/       # Starlight 文档内容
├── packages/                       # 核心包
│   ├── cli/                        # CLI工具包
│   │   ├── src/
│   │   │   ├── index.ts           # CLI入口点
│   │   │   ├── commands/
│   │   │   │   ├── config.ts      # 配置管理命令
│   │   │   │   ├── create.ts      # 项目创建命令
│   │   │   │   ├── list.ts        # 项目列表命令
│   │   │   │   └── clean.ts       # 项目清理命令
│   │   │   └── utils/
│   │   │       ├── brand-wizard.ts # 品牌配置向导
│   │   │       └── validators.ts   # 输入验证
│   │   └── package.json
│   ├── core/                       # 核心逻辑包
│   │   ├── src/
│   │   │   ├── config/            # 配置管理
│   │   │   ├── project-store/     # 项目数据存储
│   │   │   └── types/             # 类型定义
│   │   └── package.json
│   └── ui/                         # 共享UI组件包
│       ├── src/
│       └── package.json
└── memory-bank/                    # 项目文档和记录
    ├── progress.md                 # 开发进度记录
    ├── architecture.md             # 架构文档（本文件）
    └── implementation-plan.md      # 实施计划
```

### 应用架构分离说明

#### 架构重构原则
- **单一职责**: 每个应用专注于特定功能领域
- **独立部署**: 每个应用可独立构建和部署
- **松耦合**: 应用间通过导航链接连接，无直接依赖
- **共享核心**: 共享 core 包的数据类型和业务逻辑

#### 应用职责划分
1. **Dashboard 应用**: 工具和模板展示中心
   - CLI 工具安装指南
   - 模板库展示和浏览
   - 快速开始指南
   - 品牌配置工具介绍

2. **Projects 应用**: 独立项目管理平台
   - 项目列表展示和统计
   - 项目状态管理
   - CLI 操作指南和命令构建器
   - 项目生命周期管理指南

3. **Docs 应用**: 技术文档中心
   - API 参考文档
   - 使用指南和教程
   - 最佳实践和示例

#### 独立应用优势
- **开发效率**: 团队可并行开发不同应用
- **部署灵活**: 可独立更新和发布
- **性能优化**: 每个应用可独立优化构建
- **维护性**: 代码职责清晰，易于维护

---

## 🚀 部署架构

### GitHub Pages 自动部署流程
```
代码推送 → GitHub Actions 触发 → 构建阶段 → 部署阶段 → 发布到子目录
    ↓
main 分支推送
    ↓
┌─────────────────────────────────────┐
│            build job                │
├─────────────────────────────────────┤
│ 1. checkout                         │
│ 2. setup pnpm & node               │
│ 3. pnpm install                    │
│ 4. pnpm build (turbo handles deps) │
│ 5. create combined dist structure  │
│ 6. setup pages & upload artifact   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│           deploy job                │
├─────────────────────────────────────┤
│ 1. deploy pages artifact           │
│ 2. publish to github-pages env     │
└─────────────────────────────────────┘
    ↓
https://yuanyuanyuan.github.io/astro-base-zero/
    ├── / (项目索引页)
    ├── /dashboard (工具展示中心)
    ├── /projects (项目管理应用)
    └── /docs (文档中心)
```

### 部署配置详情
- **触发条件**: 推送到 main 分支或手动触发 (workflow_dispatch)
- **构建环境**: Ubuntu Latest + Node.js 22 + pnpm 9.1.1
- **部署目标**: 
  - 项目索引: `https://yuanyuanyuan.github.io/astro-base-zero/`
  - Dashboard: `https://yuanyuanyuan.github.io/astro-base-zero/dashboard/`
  - Projects: `https://yuanyuanyuan.github.io/astro-base-zero/projects/`
  - Docs: `https://yuanyuanyuan.github.io/astro-base-zero/docs/`
- **构建产物**: 
  - Dashboard: `./apps/dashboard/dist` → `./dist/dashboard`
  - Projects: `./apps/projects/dist` → `./dist/projects`
  - Docs: `./apps/docs/dist` → `./dist/docs`
- **部署机制**: 
  - 使用 GitHub 官方 Pages Actions (非第三方)
  - Artifact 上传方式，避免分支推送权限问题
  - 两阶段部署：构建 → 部署，确保稳定性
  - Turbo 依赖管理：自动处理 core → apps 构建顺序

### Astro 配置适配
- **site**: `https://yuanyuanyuan.github.io` (GitHub Pages 主域名)
- **base**: 各应用的子路径配置
  - Dashboard: `/astro-base-zero/dashboard`
  - Projects: `/astro-base-zero/projects`
  - Docs: `/astro-base-zero/docs`
- **开发兼容**: 本地开发不受影响，自动适配环境
- **样式配置**: 每个应用独立的 Tailwind 配置，确保样式正确加载

### 导航链接架构
- **跨应用导航**: 使用绝对路径确保在部署环境中正确跳转
- **本地开发兼容**: 开发环境和生产环境使用相同的链接结构
- **资源路径**: favicon 等静态资源使用正确的 base path

---

## 🔧 核心组件架构

### CLI 工具架构
```
CLI Entry Point (packages/cli/src/index.ts)
├── Commands Layer
│   ├── config.ts          # 配置管理 (list, brand)
│   ├── create.ts          # 项目创建
│   ├── list.ts            # 项目列表
│   └── clean.ts           # 项目清理
├── Utils Layer
│   ├── brand-wizard.ts    # 交互式品牌配置
│   ├── validators.ts      # 数据验证
│   └── template-engine.ts # 模板处理
└── Core Integration
    ├── @astro-base-zero/core # 核心逻辑包
    └── Local Storage (~/.astro-launcher/)
```

### 数据存储架构
```
本地数据目录: ~/.astro-launcher/
├── config.yaml            # 平台配置
├── brand.json             # 品牌配置
├── projects.json          # 项目记录 (lowdb)
└── backups/               # 配置备份
    ├── brand-backup-*.json
    └── (自动清理，保留最近5个)
```

### 项目模板架构
```
Template Processing Pipeline:
1. 模板选择 (base/blog/tool)
2. 文件复制 (templates/ → apps/<project-name>/)
3. Handlebars 处理 (.astro, .ts, .js, .md, .json, .mjs 文件)
4. 品牌配置注入 (颜色、字体、个人信息)
5. 依赖安装 (自动检测包管理器)
6. 项目记录 (保存到 projects.json)
```

---

## 🔍 数据流架构

### 配置数据流
```
用户输入 → 验证层 → 数据存储 → 模板注入 → 项目生成
    ↓
Brand Wizard (CLI) → Validators → brand.json → Handlebars → New Project
Platform Config → config.yaml → CLI Commands → User Feedback
```

### 项目管理数据流
```
CLI Commands → Project Store → JSON Storage → Web Display
    ↓
create → projectStore.createProject() → projects.json → Projects App
list → projectStore.getAllProjects() → Filter/Sort → CLI Output
clean → projectStore.removeProject() → projects.json → Updated List
```

---

## 🛡️ 安全与验证架构

### 数据验证层
- **输入验证**: Zod schemas + 自定义验证器
- **文件安全**: 路径验证，防止目录遍历
- **配置安全**: 敏感信息本地存储，不提交到版本控制
- **备份机制**: 自动备份 + 恢复功能

### 错误处理架构
- **分层错误处理**: CLI → Utils → Core 层级错误传播
- **用户友好提示**: 彩色输出 + 详细错误信息
- **优雅降级**: 配置缺失时使用默认值
- **回滚机制**: 操作失败时自动恢复

---

## 📊 性能优化架构

### 构建优化
- **Turbo 缓存**: 增量构建，避免重复编译
- **并行构建**: 多应用并行构建
- **依赖优化**: 自动处理包依赖关系
- **资源优化**: Astro 静态生成 + Tailwind CSS 优化

### 运行时优化
- **懒加载**: CLI 命令按需加载
- **缓存策略**: 配置文件缓存读取
- **批量操作**: 项目清理等批量处理
- **内存管理**: lowdb 轻量级数据库

---

## 🔄 开发工作流架构

### 本地开发流程
```
1. pnpm install          # 安装依赖
2. pnpm dev             # 启动所有应用开发服务器
3. pnpm cli <command>   # 测试 CLI 功能
4. pnpm build           # 构建验证
5. git commit           # 提交代码
```

### CI/CD 流程
```
1. 代码推送到 main 分支
2. GitHub Actions 触发
3. 环境设置 (Node.js + pnpm)
4. 依赖安装 (pnpm install)
5. 构建验证 (pnpm build)
6. 部署到 GitHub Pages
7. 多应用同时发布
```

---

## 📈 扩展性架构

### 水平扩展
- **新应用添加**: 在 `apps/` 目录添加新的 Astro 应用
- **新命令添加**: 在 `packages/cli/src/commands/` 添加新命令
- **新模板添加**: 在模板目录添加新的项目模板

### 垂直扩展
- **功能增强**: 在现有命令中添加新选项和功能
- **配置扩展**: 在品牌配置中添加新的配置项
- **集成扩展**: 集成更多第三方服务和工具

---

## 🎯 架构决策记录

### 关键架构决策

#### 1. 独立应用架构 (2025-01-13)
**决策**: 将项目管理功能从 dashboard 分离为独立的 projects 应用
**原因**: 
- 单一职责原则，每个应用专注特定功能
- 便于团队并行开发和独立部署
- 提高代码可维护性和扩展性
**影响**: 需要重构导航和部署配置，但长期收益显著

#### 2. GitHub Pages 子目录部署 (2025-01-13)
**决策**: 使用 GitHub Pages 的子目录部署策略
**原因**: 
- 免费的静态托管解决方案
- 与 GitHub 仓库深度集成
- 支持多应用独立访问
**影响**: 需要配置 Astro base path 和导航链接

#### 3. Turbo Monorepo 架构 (2025-01-12)
**决策**: 使用 Turbo 管理 monorepo 构建和依赖
**原因**: 
- 高效的增量构建和缓存
- 自动依赖关系管理
- 支持并行构建多个包
**影响**: 显著提升构建速度和开发体验

#### 4. Tailwind CSS 独立配置 (2025-01-13)
**决策**: 为每个应用创建独立的 Tailwind 配置
**原因**: 
- 避免样式冲突和丢失问题
- 每个应用可独立优化样式
- 部署环境样式一致性
**影响**: 增加了配置文件数量，但确保了样式稳定性

---

**文档维护**: 本架构文档随项目演进持续更新，记录所有重要的架构决策和变更。 