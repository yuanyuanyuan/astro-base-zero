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

### 2025-01-13 - Part 3 & Part 4 完成 🎉
- ✅ **step-3.2:** 集成品牌配置注入功能 - 模板引擎增强完成
- ✅ **step-3.3:** 集成项目依赖自动安装 - 智能包管理器检测完成
- ✅ **step-4.1:** 集成projectStore进行项目记录 - 项目元数据存储完成
- ✅ **step-4.2:** 实现list命令 - 项目管理界面完成
- ✅ **里程碑2达成:** 项目创建和管理功能完成，Phase 1核心功能基本就绪

### 2025-01-13 - step-4.2 完成
- ✅ 实现完整的list命令功能
- ✅ 支持项目过滤、搜索、排序
- ✅ 美观的CLI界面和项目统计
- ✅ 完善的用户体验和帮助信息

### 2025-01-13 - step-4.1 完成
- ✅ 集成projectStore到create命令
- ✅ 自动保存项目元数据到本地数据库
- ✅ 实现模板类型到ProjectInfo类型映射
- ✅ 完善的错误处理和用户反馈

### 2025-01-13 - step-3.3 完成
- ✅ 实现智能包管理器检测（pnpm/yarn/npm）
- ✅ 项目创建后自动安装依赖
- ✅ 支持跳过安装选项和用户控制
- ✅ 完善的进度反馈和错误处理

### 2025-01-13 - step-3.2 完成
- ✅ 修复所有Handlebars模板语法错误
- ✅ 添加自定义Handlebars helpers（default, if_exists, json）
- ✅ 实现完整的品牌配置注入功能
- ✅ 支持15种文件类型的模板处理
- ✅ 优雅的错误处理和默认值降级

---

## 🔧 新增架构决策

### ADR-005: Handlebars模板引擎增强策略
**决策时间:** 2025-01-13 (step-3.2)
**问题:** 模板文件中的复杂Handlebars语法导致编译错误
**决策:** 添加自定义Handlebars helpers来处理复杂逻辑
**实现:**
- `default` helper：处理默认值逻辑，替代`||`操作符
- `if_exists` helper：处理条件显示，替代`&&`操作符
- `json` helper：支持JSON序列化
**理由:**
- Handlebars不支持复杂的JavaScript表达式
- 自定义helpers提供更好的可读性和维护性
- 避免模板编译错误，提升用户体验
**影响:** 所有模板文件现在可以正确处理品牌配置注入

### ADR-006: 项目数据存储策略
**决策时间:** 2025-01-13 (step-4.1)
**问题:** 如何持久化项目元数据以支持项目管理功能？
**决策:** 使用lowdb在用户主目录存储项目数据
**实现:**
- 存储位置：`~/.astro-launcher/projects.json`
- 数据格式：JSON，使用lowdb管理
- 数据结构：ProjectInfo接口定义的完整项目信息
**理由:**
- lowdb轻量级，适合CLI工具的本地存储需求
- 用户主目录确保数据持久性和隐私性
- JSON格式易于调试和数据迁移
**影响:** 用户可以通过list命令查看和管理所有创建的项目

### ADR-007: CLI命令架构扩展
**决策时间:** 2025-01-13 (step-4.2)
**问题:** 如何组织越来越多的CLI命令？
**决策:** 在单个文件中实现相关命令，通过导出函数注册
**实现:**
- `createCreateCommand()` - 项目创建命令
- `createListCommand()` - 项目列表命令
- 都在`commands/create.ts`中实现，共享相关逻辑
**理由:**
- 相关功能保持在同一文件中，便于维护
- 避免过度拆分导致的代码碎片化
- 共享类型定义和工具函数
**影响:** CLI命令结构清晰，易于扩展和维护

---

## 📊 新增数据流架构

### 项目创建完整流程
```
用户输入 → 参数验证 → 模板复制 → 品牌配置加载 → Handlebars渲染 → 依赖安装 → 项目记录 → 成功反馈
```

### 项目列表查询流程
```
CLI命令 → 过滤参数解析 → projectStore查询 → 数据排序 → 美化输出 → 统计信息显示
```

### 模板处理流程
```
模板文件 → Handlebars编译 → 自定义helpers处理 → 品牌数据注入 → 输出处理后文件
```

---

## 🗃️ 更新的数据存储架构

### 本地存储位置
- **用户配置:** `~/.astro-launcher/config.yaml`
- **品牌数据:** `~/.astro-launcher/brand.json`
- **项目记录:** `~/.astro-launcher/projects.json` ✨ 新增
- **备份文件:** `~/.astro-launcher/*.backup`

### 项目数据结构
```typescript
interface ProjectInfo {
  id: string;                    // 唯一标识
  name: string;                  // 项目名称
  description: string;           // 项目描述
  type: 'demo' | 'tool' | 'showcase' | 'blog' | 'docs' | 'portfolio';
  path: string;                  // 项目路径
  repository?: string;           // 仓库地址
  site?: string;                 // 网站地址
  status: 'active' | 'archived' | 'draft';
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
  tags?: string[];               // 标签
}
```

---

## 🔧 更新的开发工具架构

### 新增CLI命令
- **create**: 创建新项目（增强版）
- **list**: 项目列表管理 ✨ 新增
  - 支持过滤：`--type`, `--status`, `--search`
  - 支持排序：`--sort`, `--order`
  - 美观的彩色输出和统计信息

### 模板处理工具
- **Handlebars引擎**: 支持自定义helpers
- **文件类型支持**: 15种文件类型（.astro, .ts, .js, .md, .json等）
- **错误处理**: 优雅降级和详细错误信息

---

## 📝 变更记录

### 2025-01-13 - Part 3 & Part 4 完成 🎉
- ✅ **step-3.2:** 集成品牌配置注入功能 - 模板引擎增强完成
- ✅ **step-3.3:** 集成项目依赖自动安装 - 智能包管理器检测完成
- ✅ **step-4.1:** 集成projectStore进行项目记录 - 项目元数据存储完成
- ✅ **step-4.2:** 实现list命令 - 项目管理界面完成
- ✅ **里程碑2达成:** 项目创建和管理功能完成，Phase 1核心功能基本就绪

### 待完成变更
- ⏳ 实现deploy命令和GitHub认证 (step-5.1)
- ⏳ 实现GitHub仓库创建和代码推送 (step-5.2)
- ⏳ 实现GitHub Actions自动部署 (step-5.3)

---

**最后更新:** 2025-01-13 by AI Assistant  
**下次更新:** step-5.1 完成后 