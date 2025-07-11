# Astro项目快速发布平台 - 实施计划 (Implementation Plan)

**版本:** 1.1
**日期:** 2025-01-11
**角色:** 项目架构师
**目标:** 构建一个能够批量孵化高质量 Astro 项目的智能化平台 (V1 - 无 AI 集成)

---

## 📋 前置说明

### 核心原则
1. **原子化拆解**: 每个任务必须清晰到可以一次性完成。
2. **验证优先**: 每步都有明确的完成标准和测试方法。
3. **增量交付**: 每个阶段都产出可运行的成果。
4. **文档驱动**: 所有决策和架构都要记录在 memory-bank 中。

### 任务树总览
```
Astro项目快速发布平台
├── Phase 0: 架构验证与环境准备 (1周)
│   ├── 0.1 开发环境搭建
│   ├── 0.2 Monorepo 基础架构
│   ├── 0.3 AstroWind 架构研究
│   └── 0.4 技术验证 POC (CLI & 虚拟模块)
│
├── Phase 1: 核心基础设施 (3周)
│   ├── 1.1 CLI 工具基础框架
│   ├── 1.2 配置管理系统
│   └── 1.3 品牌资产管理
│
├── Phase 2: 组件生态构建 (3周)
│   ├── 2.1 Widget 系统移植
│   ├── 2.2 多模板支持
│   └── 2.3 类型系统完善
│
└── Phase 3: 平台化与生态 (2周)
    ├── 3.1 项目管理面板
    ├── 3.2 模板市场基础
    ├── 3.3 文档体系
    └── 3.4 部署与发布
```

---

## 🚀 Phase 0: 架构验证与环境准备

### 0.1 开发环境搭建

#### 任务 0.1.1: 安装和配置 Node.js 环境
**指令**: 确保系统安装了 Node.js v22.14.0，并配置 pnpm v9.1.1 作为包管理器。
**验证标准**: 
- Given: 终端环境
- When: 执行 `node -v` 和 `pnpm -v`
- Then: 分别显示 `v22.14.0` 和 `9.1.1`

#### 任务 0.1.2: 初始化 Git 仓库
**指令**: 在 `astro-base-zero` 目录下初始化 Git 仓库，配置 .gitignore。
**验证标准**:
- Given: 项目根目录
- When: 执行 `git status`
- Then: 显示干净的工作区，node_modules 等被正确忽略。

### 0.2 Monorepo 基础架构

#### 任务 0.2.1: 创建 pnpm workspace 配置
**指令**: 在项目根目录创建 `pnpm-workspace.yaml`，定义 packages 和 apps 工作区。
**验证标准**:
- Given: 项目根目录存在 pnpm-workspace.yaml
- When: 查看文件内容
- Then: 包含 `packages: ['packages/*', 'apps/*']` 配置。

#### 任务 0.2.2: 创建 Monorepo 目录结构
**指令**: 按照技术栈文档中的项目结构，创建完整的目录树（packages/cli, packages/core, packages/ui, packages/templates, apps/dashboard, apps/docs）。
**验证标准**:
- Given: 项目根目录
- When: 执行 `ls -R packages apps` 或 `tree -L 3 -d`
- Then: 显示完整的目录结构，每个包目录都存在。

#### 任务 0.2.3: 初始化根目录 package.json
**指令**: 创建根目录的 package.json，配置 workspace 脚本和 turbo。
**验证标准**:
- Given: 根目录的 package.json
- When: 执行 `pnpm install`
- Then: 成功安装依赖，无错误信息。

### 0.3 AstroWind 架构研究

#### 任务 0.3.1: 分析 AstroWind 源码结构
**指令**: 基于 `memory-bank/参考开源优秀prj-astrowind.html` 的内容，分析其项目结构、配置方案和组件化思想，生成架构分析文档 `memory-bank/astrowind-architecture-analysis.md`。
**验证标准**:
- Given: `memory-bank/参考开源优秀prj-astrowind.html` 文件存在。
- When: 查看 `memory-bank/astrowind-architecture-analysis.md`。
- Then: 文档包含对配置系统、Widget 架构、虚拟模块 (`/vendor/integration`) 等核心概念的详细分析。

#### 任务 0.3.2: 提取 AstroWind 核心配置模式
**指令**: 分析 AstroWind 的 `config.yaml` 结构和 `/vendor/integration` 虚拟模块实现，创建配置模式文档 `memory-bank/astrowind-config-pattern.md`。
**验证标准**:
- Given: `memory-bank/astrowind-architecture-analysis.md` 已完成。
- When: 查看 `memory-bank/astrowind-config-pattern.md` 文档内容。
- Then: 文档包含完整的配置 Schema 定义（可参考 `config-schema.json`）和虚拟模块工作原理。

#### 任务 0.3.3: 识别可复用的 Widget 组件
**指令**: 基于 `参考开源优秀prj-astrowind.html`，列出 AstroWind 中所有位于 `src/components/widgets` 的组件，标注移植优先级和依赖关系，并记录到 `memory-bank/astrowind-widgets-inventory.md`。
**验证标准**:
- Given: `memory-bank/astrowind-widgets-inventory.md` 文件。
- When: 查看组件清单。
- Then: 每个组件都有名称、用途、依赖关系和优先级标记。

### 0.4 技术验证 POC

#### 任务 0.4.1: 验证 Vite 虚拟模块在 CLI 环境可行性
**指令**: 创建 `packages/poc/virtual-module-test`，实现一个最小化的虚拟模块加载示例。该示例应能模拟 `astro.config.ts` 中的 `astrowind` 集成，在 Node.js 脚本中加载并解析一个 YAML 配置文件。
**验证标准**:
- Given: poc 目录中的测试代码
- When: 执行 `pnpm test:virtual-module`
- Then: 成功加载虚拟模块，输出预期的配置内容。

#### 任务 0.4.2: 验证 Commander.js CLI 交互流程
**指令**: 创建 `packages/poc/cli-test`，使用 `Commander.js` 和 `Inquirer.js` 实现项目初始化的交互原型。
**验证标准**:
- Given: 命令行环境
- When: 执行 `node cli-test.js init`
- Then: 显示交互式提示，能收集项目名称和描述，并将其输出为 JSON 格式。

---

## 🏗️ Phase 1: 核心基础设施

### 1.1 CLI 工具基础框架

#### 任务 1.1.1: 初始化 CLI 包结构
**指令**: 在 `packages/cli` 中创建 TypeScript 项目，配置 `tsconfig.json` 和用于构建和开发的 `package.json` 脚本。
**验证标准**:
- Given: `packages/cli` 目录。
- When: 执行 `pnpm build`。
- Then: 生成 `dist` 目录，包含编译后的 JavaScript 文件。

#### 任务 1.1.2: 实现 CLI 入口和命令注册
**指令**: 创建 `src/index.ts` 作为 CLI 入口，使用 Commander.js 注册 `init`, `create`, `config` 三个基础命令。
**验证标准**:
- Given: 构建后的 CLI。
- When: 执行 `node ./dist/index.js --help`。
- Then: 显示三个命令的帮助信息。

#### 任务 1.1.3: 实现项目名称验证
**指令**: 创建 `src/utils/validators.ts`，实现项目名称的合法性检查（例如：字母开头、只含字母数字横线）。
**验证标准**:
- Given: 验证函数。
- When: 测试 "my-project", "123project", "my project"。
- Then: 分别返回 true, false, false。

#### 任务 1.1.4: 实现基础日志系统
**指令**: 创建 `src/utils/logger.ts`，使用 `chalk` 和 `ora` 实现不同级别的彩色日志（info, success, error）和加载动画（spinner）。
**验证标准**:
- Given: logger 实例。
- When: 调用 info、success、error、spinner 方法。
- Then: 终端显示相应的彩色输出和动画效果。

### 1.2 配置管理系统

#### 任务 1.2.1: 设计配置文件结构
**指令**: 创建 `packages/core/src/config/schema.ts`，使用 Zod 定义平台配置（`PlatformConfig`）和项目配置（`ProjectConfig`）的 Schema。
**验证标准**:
- Given: 一个测试用的配置对象。
- When: 使用 Zod Schema 进行验证。
- Then: 正确识别合法和非法配置，并能返回详细的错误信息。

#### 任务 1.2.2: 实现配置加载器
**指令**: 创建 `packages/core/src/config/loader.ts`，实现 YAML 配置文件的加载，并使用 `schema.ts` 中的 Zod Schema 进行验证。
**验证标准**:
- Given: 一个 `config.yaml` 文件。
- When: 调用 `loadConfig` 函数。
- Then: 返回经过 Zod 验证的、类型安全的配置对象。

#### 任务 1.2.3: 实现配置继承链
**指令**: 在 `loader.ts` 中实现三层配置合并逻辑：平台默认配置 → 模板配置 → 项目配置。
**验证标准**:
- Given: 三个不同层级的配置文件。
- When: 执行配置合并。
- Then: 项目配置应能正确覆盖模板配置，模板配置应能覆盖平台默认配置。

#### 任务 1.2.4: 创建配置管理 CLI 命令
**指令**: 在 CLI 中实现 `astro-launcher config` 命令，支持 `get`、`set`、`list` 子命令，用于操作平台级配置文件。
**验证标准**:
- Given: 用户配置文件。
- When: 执行 `config set brand.personal.name "John Doe"`。
- Then: 配置文件被更新，且 `config get brand.personal.name` 返回 "John Doe"。

### 1.3 品牌资产管理

#### 任务 1.3.1: 设计品牌资产数据模型
**指令**: 创建 `packages/core/src/brand/types.ts`，根据产品需求文档定义个人品牌信息的 TypeScript 接口。
**验证标准**:
- Given: 品牌信息对象。
- When: TypeScript 编译。
- Then: 类型检查通过，IDE 提供正确的自动补全。

#### 任务 1.3.2: 实现品牌资产存储
**指令**: 创建 `packages/core/src/brand/store.ts`，使用 `lowdb` 将品牌信息持久化到用户主目录下的 `~/.astro-launcher/brand.json`。
**验证标准**:
- Given: 品牌信息数据。
- When: 调用 `save` 和 `load` 方法。
- Then: 数据被正确保存到 `~/.astro-launcher/brand.json`。

#### 任务 1.3.3: 创建品牌配置向导
**指令**: 在 CLI 中实现一个交互式的品牌信息收集流程（`astro-launcher config brand`），使用 `inquirer.js` 提示用户输入。
**验证标准**:
- Given: 执行 `astro-launcher config brand`。
- When: 完成所有提示问题。
- Then: 品牌信息被保存到配置文件中，可通过 `config get` 命令查看。

#### 任务 1.3.4: 实现品牌资产注入器
**指令**: 创建 `packages/core/src/brand/injector.ts`，实现一个函数，该函数能读取项目模板文件内容，并将品牌信息（如 `{{brand.personal.name}}`）注入到模板占位符中。
**验证标准**:
- Given: 一个包含 `{{brand.personal.name}}` 占位符的模板文件。
- When: 执行注入器函数。
- Then: 占位符被替换为配置文件中的实际品牌信息。

---

## 🎨 Phase 2: 组件生态构建

### 2.1 Widget 系统移植

#### 任务 2.1.1: 创建 Widget 基础架构
**指令**: 在 `packages/ui/src/widgets` 中创建 `BaseWidget` 组件和相关的类型定义，作为所有 Widget 的基础。
**验证标准**:
- Given: Widget 组件定义。
- When: 在一个 Astro 项目中导入并使用它。
- Then: 组件能正确渲染，且其 props 是类型安全的。

#### 任务 2.1.2: 移植 Hero Widget
**指令**: 从 AstroWind 移植 `Hero` 组件到 `packages/ui/src/widgets`，保持其接口兼容性，并增强配置能力。
**验证标准**:
- Given: 一个 `Hero` 组件的配置对象。
- When: 在页面中渲染该组件。
- Then: 页面正确显示标题、副标题、CTA 按钮和背景图片。

#### 任务 2.1.3: 移植 Features Widget
**指令**: 移植 `Features` 组件，确保它支持多种布局模式（如 `grid`, `list`, `cards`）。
**验证标准**:
- Given: Features 数据和布局配置。
- When: 在页面中切换不同的布局模式。
- Then: 内容以相应的布局方式正确展示。

#### 任务 2.1.4: 创建 Widget 注册系统
**指令**: 实现一个动态的 Widget 加载和注册机制，以支持按需加载，避免不必要的组件打包。
**验证标准**:
- Given: 一个包含启用 Widget 的配置列表。
- When: 页面加载。
- Then: 只有在配置中启用的 Widget 被加载和渲染。

### 2.2 多模板支持

#### 任务 2.2.1: 创建基础模板结构
**指令**: 在 `packages/templates/base` 中创建一个最小化的、可独立运行的 Astro 项目模板。
**验证标准**:
- Given: `base` 模板目录。
- When: 执行 `pnpm create astro@latest -- --template ./packages/templates/base`。
- Then: 成功生成一个可运行的 Astro 项目。

#### 任务 2.2.2: 实现模板变量系统
**指令**: 设计模板占位符规范（如 `{{projectName}}`），并使用 `Handlebars` 实现一个渲染引擎来替换这些变量。
**验证标准**:
- Given: 一个包含 `{{projectName}}` 的模板文件。
- When: 提供变量值并执行渲染。
- Then: 生成的文件内容中，占位符被正确替换。

#### 任务 2.2.3: 创建博客模板
**指令**: 在 `packages/templates/blog` 中，基于基础模板添加博客特定功能，如文章列表、分类和标签页。
**验证标准**:
- Given: 选择博客模板。
- When: 创建一个新项目。
- Then: 生成的项目包含完整的博客功能和示例文章。

#### 任务 2.2.4: 创建工具展示模板
**指令**: 在 `packages/templates/tool` 中，创建一个适合展示在线工具的模板，包含交互演示区域和说明文档布局。
**验证标准**:
- Given: 选择工具模板。
- When: 创建一个新项目。
- Then: 生成的项目包含工具演示组件和使用说明布局。

### 2.3 类型系统完善

#### 任务 2.3.1: 生成项目类型定义
**指令**: 创建一个类型生成器脚本，该脚本能基于项目配置文件（`ProjectConfig`）自动生成项目的 TypeScript 类型定义文件（`types/generated.d.ts`）。
**验证标准**:
- Given: 项目配置文件。
- When: 执行类型生成器脚本。
- Then: `types/generated.d.ts` 文件被创建，并包含所有配置的类型。

#### 任务 2.3.2: 实现内容集合类型安全
**指令**: 为每个项目模板预先配置好 Astro 的 `Content Collections`，使用 Zod Schema 确保内容（如博客文章、项目介绍）的类型安全。
**验证标准**:
- Given: 内容集合定义。
- When: 在 Markdown 或 MDX 文件中编写内容。
- Then: 编辑器（如 VS Code）能提供完整的类型提示和自动补全。

#### 任务 2.3.3: 创建类型守卫工具集
**指令**: 在 `packages/core/src/utils` 中实现一系列运行时类型检查函数（类型守卫），用于在处理未知数据源时确保数据类型安全。
**验证标准**:
- Given: 未知类型的 JSON 数据。
- When: 使用类型守卫函数进行检查。
- Then: 函数能正确识别数据类型，并且 TypeScript 的类型收窄功能正常工作。

---

## 📊 Phase 3: 平台化与生态

### 3.1 项目管理面板

#### 任务 3.1.1: 创建面板基础架构
**指令**: 在 `apps/dashboard` 目录中初始化一个新的 Astro 项目，配置基础路由和布局。
**验证标准**:
- Given: 访问 `localhost:4321`。
- When: 页面加载。
- Then: 显示项目管理面板的基础布局（如导航栏、侧边栏）。

#### 任务 3.1.2: 实现项目列表页
**指令**: 创建一个项目列表组件，该组件能读取本地项目元数据（例如从 `~/.astro-launcher/projects.json`）并显示所有已创建的项目。
**验证标准**:
- Given: 本地存储的项目数据。
- When: 访问项目列表页面。
- Then: 页面上以卡片形式显示所有项目，包含项目名称、类型和最后更新时间。

#### 任务 3.1.3: 实现项目管理页 ✅ 已完成
**指令**: 创建静态项目管理指南页面，提供完整的 CLI 工具使用说明和项目操作指南。
**验证标准**:
- Given: 访问 `/projects/manage` 页面。
- When: 查看页面内容和功能。
- Then: 页面显示完整的 CLI 使用指南、项目操作命令和 GitHub Pages 部署流程。
**完成日期**: 2025-01-11
**重要变更**: 由于 GitHub Pages 静态部署要求，重新设计为 CLI 指南页面而非动态项目详情页。

#### 任务 3.1.4: 添加项目操作功能
**指令**: 在项目详情页实现“构建”、“预览”、“部署”等操作按钮，并连接到后端的 CLI 命令。
**验证标准**:
- Given: 项目详情页。
- When: 点击“构建”按钮。
- Then: 后端触发项目的构建流程，并在前端实时显示构建日志。

### 3.2 模板市场基础

#### 任务 3.2.1: 设计模板元数据规范
**指令**: 创建 `template.json` 的文件规范，用于定义模板的名称、描述、作者、预览图等元数据。
**验证标准**:
- Given: 一个模板目录。
- When: 该目录中包含一个符合规范的 `template.json` 文件。
- Then: 系统能够正确解析并索引该模板。

#### 任务 3.2.2: 实现模板发现机制
**指令**: 创建一个模板扫描器，能够从本地目录和指定的远程 Git 仓库中发现可用的模板。
**验证标准**:
- Given: 配置好的本地和远程模板源。
- When: 执行扫描器。
- Then: 返回一个包含所有可用模板及其元数据的列表。

#### 任务 3.2.3: 创建模板展示页面
**指令**: 在管理面板中添加一个模板市场页面，用于展示所有发现的模板，并支持按类型或关键词进行预览和筛选。
**验证标准**:
- Given: 模板列表数据。
- When: 访问模板市场页面。
- Then: 页面以卡片形式展示所有模板，并支持筛选功能。

### 3.3 文档体系

#### 任务 3.3.1: 初始化文档站点
**指令**: 在 `apps/docs` 中使用 Astro 的 `Starlight` 主题创建一个新的文档站点。
**验证标准**:
- Given: 访问文档站点的 URL。
- When: 页面加载。
- Then: 显示 Starlight 的默认文档首页和导航结构。

#### 任务 3.3.2: 编写快速开始指南
**指令**: 创建 `getting-started.md`，详细说明如何安装 CLI、配置环境以及创建第一个项目的完整步骤。
**验证标准**:
- Given: 一个新用户。
- When: 严格按照该指南操作。
- Then: 用户能够成功创建并运行他的第一个项目。

#### 任务 3.3.3: 编写 API 参考文档
**指令**: 使用 `TypeDoc` 或类似工具，从 `packages/core` 和 `packages/cli` 的 JSDoc 注释中自动生成 API 文档，并将其集成到文档站点。
**验证标准**:
- Given: 带有 JSDoc 注释的源代码。
- When: 执行文档生成脚本。
- Then: 生成包含所有公开 API 的类型、参数和示例的完整参考文档。

### 3.4 部署与发布

#### 任务 3.4.1: 配置 GitHub Actions
**指令**: 创建 `.github/workflows/release.yml`，配置一个自动化的工作流，用于在创建新的 Git tag 时自动构建所有包并发布到 npm。
**验证标准**:
- Given: 推送一个新的 Git tag (e.g., `v1.0.0`)。
- When: GitHub Actions 工作流被触发。
- Then: 所有包被成功构建并发布到 npm registry。

#### 任务 3.4.2: 实现版本管理
**指令**: 配置 `changesets`，用于管理所有包的版本号和生成 `CHANGELOG.md`。
**验证标准**:
- Given: 有新的代码变更。
- When: 执行 `pnpm changeset` 并提交。
- Then: `changeset` 会生成变更记录文件，`pnpm version` 能正确更新包版本号。

#### 任务 3.4.3: 创建发布检查清单
**指令**: 在根目录编写 `RELEASE_CHECKLIST.md`，列出每次发布前必须检查的所有事项，如单元测试、端到端测试、文档更新等。
**验证标准**:
- Given: 准备进行一次新版本发布。
- When: 按照检查清单逐项检查。
- Then: 所有测试均通过，文档已更新，所有示例均可正常运行。

---

## 📝 实施注意事项

### 关键成功因素
1. **持续验证**: 每完成一个任务立即验证，不积累问题。
2. **文档同步**: 代码变更必须同步更新 `architecture.md`。
3. **原子提交**: 每个任务完成后独立提交，便于回滚。

### 风险控制
1. **依赖版本锁定**: 使用 `pnpm-lock.yaml` 确保依赖稳定。
2. **类型安全**: 不允许使用 `any` 类型，必须明确类型定义。
3. **测试覆盖**: 核心功能必须有单元测试。
4. **错误处理**: 所有用户交互点都要有友好的错误提示。

### 迭代建议
- Phase 0-1 完成后进行第一次用户测试。
- 根据反馈调整 Phase 2 的优先级。
- Phase 3 可以根据实际需求调整范围。

---

**文档状态**: ✅ 1.1 版完成  
**下一步**: 开始 Phase 0 实施。 