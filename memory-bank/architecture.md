# Astro 项目快速发布平台 - 架构文档

**版本:** 1.0  
**最后更新:** 2025-01-13  
**架构状态:** Phase 1 - 静态版本架构

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
├── 构建部署: Vite v5.0.12 + Turbo v1.12.0 + GitHub Actions
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
├── apps/                           # 应用层
│   ├── dashboard/                  # 管理面板应用
│   └── docs/                       # 文档应用
├── packages/                       # 核心包
│   ├── cli/                        # CLI工具包
│   │   ├── src/
│   │   │   ├── index.ts           # CLI入口点
│   │   │   ├── commands/
│   │   │   │   ├── config.ts      # 配置管理命令
│   │   │   │   └── create.ts      # 项目创建命令
│   │   │   └── utils/
│   │   │       ├── brand-wizard.ts # 品牌配置向导
│   │   │       └── validators.ts   # 输入验证
│   │   └── package.json           # CLI包配置
│   ├── core/                       # 核心业务逻辑
│   │   ├── src/
│   │   │   ├── brand/             # 品牌系统
│   │   │   │   ├── store.ts       # 品牌数据存储
│   │   │   │   └── types.ts       # 品牌类型定义
│   │   │   ├── config/            # 配置系统
│   │   │   ├── project/           # 项目管理
│   │   │   └── template/          # 模板引擎
│   │   └── package.json           # 核心包配置
│   ├── templates/                  # 项目模板
│   │   ├── base/                  # 基础模板
│   │   ├── blog/                  # 博客模板
│   │   └── tool/                  # 工具模板
│   └── ui/                        # 共享UI组件
└── memory-bank/                   # 项目文档
    ├── implementation-plan.md      # 实施计划
    ├── progress.md                # 进度跟踪
    ├── architecture.md            # 架构文档 (本文件)
    ├── PRD-v3-分阶段交付版.md      # 产品需求文档
    └── tech-stack-v4-分阶段交付版.md # 技术栈文档
```

---

## 🔧 关键架构决策

### ADR-001: CLI工具访问方式
**决策时间:** 2025-01-13 (step-1.1)
**问题:** 如何从根目录方便地访问CLI工具？
**决策:** 在根目录 `package.json` 添加 `"cli": "node packages/cli/dist/index.js"` 脚本
**理由:** 
- 简化用户访问路径
- 避免复杂的pnpm filter语法
- 直接执行编译后的JS文件，性能更好
**影响:** 用户可以使用 `pnpm cli <command>` 直接访问所有CLI功能

### ADR-002: 依赖版本策略
**决策时间:** 2025-01-13 (step-1.1)
**问题:** 如何确保依赖版本符合技术栈要求？
**决策:** 严格按照 `tech-stack-v4-分阶段交付版.md` 的版本要求
**验证结果:**
- Node.js: v22.14.0 ✅ (完全匹配)
- pnpm: v9.1.1 ✅ (完全匹配)
- Turbo: v1.13.4 ✅ (高于要求的 v1.12.0)
- TypeScript: v5.8.3 ✅ (高于要求的 v5.3.3)
**影响:** 确保技术栈的稳定性和兼容性

### ADR-003: 项目创建目标目录策略
**决策时间:** 2025-01-13 (step-3.1)
**问题:** 新创建的项目应该放在哪个目录？
**决策:** 所有通过CLI创建的项目统一放在 `apps/` 目录下
**理由:**
- 符合Monorepo的标准结构约定
- 与现有的dashboard和docs应用保持一致
- 便于项目管理和构建配置
- 符合实施计划的验证标准要求
**影响:** 用户创建的所有项目都位于 `apps/<project-name>` 路径

### ADR-004: CLI交互模式策略
**决策时间:** 2025-01-13 (step-3.1)
**问题:** 如何平衡CLI的交互性和自动化需求？
**决策:** 实现双模式支持 - 交互模式和无交互模式
**理由:**
- 交互模式提供友好的用户体验
- 无交互模式支持自动化和CI/CD场景
- 通过完整参数自动切换到无交互模式
**实现:**
- 当提供所有必需参数时，自动进入无交互模式
- 参数不完整时，提供交互式提示补充
- 支持 `--skip-*` 参数跳过特定步骤
**影响:** CLI工具既用户友好又支持自动化，提升了整体可用性

---

## 🔄 数据流架构

### CLI命令执行流程
```
用户输入 → pnpm cli → node packages/cli/dist/index.js → Commander.js解析 → 具体命令执行
```

### 品牌配置流程
```
用户配置 → Inquirer.js收集 → Zod验证 → 存储到~/.astro-launcher/ → 模板注入使用
```

### 项目创建流程
```
CLI命令 → 模板选择 → 品牌配置加载 → Handlebars渲染 → 文件复制 → 依赖安装 → 项目记录
```

---

## 🗃️ 数据存储架构

### 本地存储位置
- **用户配置:** `~/.astro-launcher/config.yaml`
- **品牌数据:** `~/.astro-launcher/brand.json`
- **项目记录:** `~/.astro-launcher/projects.json`
- **备份文件:** `~/.astro-launcher/*.backup`

### 数据格式
- **配置文件:** YAML格式，人类可读
- **品牌数据:** JSON格式，结构化存储
- **项目记录:** JSON格式，使用lowdb管理

---

## 🚀 构建与部署架构

### 构建流程
```
源代码 → TypeScript编译 → Turbo并行构建 → 各包dist/目录
```

### 部署流程 (规划中)
```
本地项目 → GitHub仓库创建 → GitHub Actions触发 → Astro构建 → GitHub Pages部署
```

---

## 📦 包依赖关系

### 依赖图
```
@astro-base-zero/cli
├── @astro-base-zero/core (workspace依赖)
├── commander (CLI框架)
├── inquirer (交互式提示)
├── chalk + ora (CLI美化)
└── handlebars (模板引擎)

@astro-base-zero/core
├── lowdb (本地数据库)
├── zod (数据验证)
├── yaml (配置解析)
└── handlebars (模板处理)
```

---

## 🔐 安全架构

### 敏感数据处理
- **GitHub Token:** 存储在用户主目录，不进入项目文件
- **用户配置:** 本地存储，不上传到远程
- **API密钥:** 外部AI CLI工具自行管理

### 权限控制
- **文件系统:** 只访问用户主目录和项目目录
- **网络访问:** 仅限GitHub API调用
- **进程执行:** 仅限必要的外部CLI工具

---

## 📈 性能架构

### 优化策略
- **并行构建:** Turbo实现包级别并行
- **增量编译:** TypeScript watch模式
- **缓存机制:** 构建缓存 + 依赖缓存
- **模板预编译:** Handlebars模板预处理

### 性能目标
- **CLI启动时间:** < 1秒
- **项目创建时间:** < 10分钟 (含部署)
- **构建时间:** < 3分钟

---

## 🔄 架构演进计划

### Phase 1 → Phase 2 升级路径
- **数据迁移:** 本地文件 → PostgreSQL数据库
- **AI集成:** 外部CLI工具 → 云端AI服务
- **部署方式:** 静态部署 → 动态应用部署

### 兼容性保证
- **数据格式:** 向后兼容的Schema版本化
- **API接口:** 渐进式API演进
- **用户体验:** 平滑的升级过程

---

## 🔧 开发工具架构

### 代码质量工具
- **ESLint:** 代码规范检查 (待配置)
- **Prettier:** 代码格式化 (待配置)
- **TypeScript:** 类型检查
- **Vitest:** 单元测试

### 开发流程
- **本地开发:** `pnpm dev` 启动watch模式
- **构建验证:** `pnpm build` 全量构建
- **代码检查:** `pnpm lint` + `pnpm format`
- **测试运行:** `pnpm test`

---

## 📝 变更记录

### 2025-01-13 - Part 1 完成 ✨
- ✅ **step-1.1:** 添加CLI别名脚本到根目录package.json
- ✅ **step-1.2:** 标准化基础工具链配置（ESLint + Prettier）
- ✅ **step-1.3:** 验证CLI工具入口功能完善
- ✅ **里程碑1达成:** 基础工具链完成，为后续开发奠定坚实基础

### 2025-01-13 - step-1.3 完成
- ✅ 验证CLI工具所有基本功能正常
- ✅ 确认命令结构完整：create, config, templates
- ✅ 验证错误处理和帮助信息完善
- ✅ CLI功能结构文档化

### 2025-01-13 - step-1.2 完成
- ✅ 创建eslint.config.js配置文件
- ✅ 创建prettier.config.js配置文件
- ✅ 更新turbo.json添加format pipeline
- ✅ 安装ESLint相关依赖
- ✅ 验证代码质量工具链正常工作

### 2025-01-13 - step-1.1 完成
- ✅ 添加CLI别名脚本到根目录package.json
- ✅ 确认依赖版本符合技术栈要求
- ✅ 验证CLI工具基础功能正常
- ✅ 建立项目文档架构

### 2025-01-13 - step-3.1 完成
- ✅ 完成项目创建命令骨架审查和增强
- ✅ 修复ELIFECYCLE错误：解决交互式输入导致的进程退出问题
- ✅ 修正目标目录路径：确保项目创建到正确的 `apps/` 目录
- ✅ 实现双模式支持：交互模式和无交互模式自动切换
- ✅ 优化用户体验：移除调试输出，提供清晰的操作反馈
- ✅ 增强错误处理：模板不存在时提供清晰错误信息
- ✅ 验证所有模板类型：base, blog, tool 模板复制功能正常
- ✅ 确认覆盖提示功能：支持用户选择是否覆盖现有项目

### 待完成变更
- ⏳ 集成品牌配置注入功能 (step-3.2)
- ⏳ 集成项目依赖自动安装 (step-3.3)
- ⏳ 实现本地项目管理 (step-4.x)
- ⏳ 集成GitHub部署功能 (step-5.x)

---

**最后更新:** 2025-01-13 by AI Assistant  
**下次更新:** step-3.2 完成后 