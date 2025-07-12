# Astro 项目快速发布平台 - Phase 1 实施计划 (v2.0)

**版本:** 2.0  
**日期:** 2025-07-12  
**核心思想:** 复用现有代码，聚焦于功能的集成、完善和验证，而非从零创建。

---

## 施工前检查 (Pre-flight Check)

本计划是指导 AI 编码的唯一指令集。所有步骤都经过原子化拆解，并包含明确的验证标准。

---

## Part 1: 项目奠基 (The Foundation) - 验证与标准化

### **目标：验证并标准化现有 Monorepo 骨架和核心工具链**

#### `step-1.1`: 验证项目结构和核心依赖

- **任务描述:** 审查根目录的 `package.json` 和 `pnpm-workspace.yaml`，确保 `turbo`, `typescript`, `eslint`, `prettier` 等核心开发依赖已安装且版本符合 `tech-stack.md` 的要求。
- **验证标准:**
  1. 运行 `pnpm install` 命令成功，无错误。
  2. `pnpm-workspace.yaml` 正确定义了 `apps/*` 和 `packages/*`。
  3. `turbo` 版本符合技术栈要求。

#### `step-1.2`: 标准化基础工具链配置

- **任务描述:**
  1. 审查并标准化根目录的 `.eslintrc.js` 和 `prettier.config.js`。
  2. **ESLint**: 使用业界流行的 `eslint:recommended` 和 `plugin:prettier/recommended` 规则集作为基础。
  3. **Prettier**: 使用社区公认的默认配置（例如：`tabWidth: 2`, `semi: true`, `singleQuote: true`）。
  4. 审查 `tsconfig.base.json` 和 `turbo.json`，确保它们满足项目基础编译和构建流程的需求。
- **验证标准:**
  1. `prettier.config.js` 和 `.eslintrc.js` 文件存在并包含标准配置。
  2. 在任意一个包内创建一个测试文件，运行 `pnpm lint` 和 `pnpm format` 能够成功执行并通过检查。
  3. `turbo.json` 包含了对 `dev`, `build`, `lint`, `test` 的 pipeline 定义。

#### `step-1.3`: 完善 `@/cli` 包的入口功能

- **任务描述:** 审查 `packages/cli/src/index.ts`，确保其已使用 `commander` 正确设置了 CLI 的主入口，并能响应 `--version` 和 `--help` 等基本命令。
- **验证标准:**
  1. 在根目录的 `package.json` 中定义一个 cli 别名脚本: `"cli": "pnpm --filter @astro-base-zero/cli start"`。
  2. 运行 `pnpm cli -- --version` 能成功打印版本号。
  3. 运行 `pnpm cli -- --help` 能展示帮助信息。

---

## Part 2: 品牌配置系统 (`brand` command) - 验证与增强

### **目标：确保 `brand` 命令能够通过交互式向导，可靠地管理全局品牌配置**

#### `step-2.1`: 验证并增强 `brand setup` 交互式命令

- **任务描述:**
  1. 审查 `packages/cli/src/utils/brand-wizard.ts`。
  2. 验证 `pnpm cli config brand` 命令能够使用 `inquirer` 启动交互式向导，并收集个人信息、视觉元素等。
  3. 确保数据能被正确保存到 **用户主目录** 的配置文件中。
  4. **(增强)** 在代码中必须使用 Node.js 的 `os.homedir()` 来获取用户主目录，以确保跨平台兼容性 (Windows, macOS, Linux)。
- **验证标准:**
  1. 运行 `pnpm cli config brand` 出现交互式问题。
  2. 完成向导后，在 `os.homedir()/.astro-launcher/brand.json` (或类似路径) 文件中能看到更新后的内容。

---

## Part 3: 项目生成引擎 (`create` command) - 核心集成

### **目标：将 `create` 命令、`@/core` 服务和 `@/templates` 模板三者打通**

#### `step-3.1`: 审查 `create <project-name>` 命令骨架

- **任务描述:** 审查 `packages/cli/src/commands/create.ts`。验证它能接收项目名称，并能从 `packages/templates/` 复制对应的模板到 `apps/` 目录下。
- **验证标准:**
  1. 运行 `pnpm cli create my-test-app --template base` 能在 `apps/` 目录下创建 `my-test-app` 文件夹。
  2. 该文件夹的内容是 `packages/templates/base` 的拷贝。
  3. 如果项目已存在，应有覆盖提示。

#### `step-3.2`: 集成品牌配置注入功能

- **任务描述:**
  1. 增强 `create` 命令的逻辑。
  2. 在复制模板文件后，调用 `@/core` 中的 `loadBrandAssets` 函数加载用户的品牌配置。
  3. 使用 `handlebars` 作为模板引擎，处理新创建项目中的所有文本文件（.md, .astro, .js, .ts, .json 等）。
  4. **(明确)** 模板引擎需识别并替换 `{{brand.personal.name}}` 或 `{{project.name}}` 这样的占位符。
- **验证标准:**
  1. 创建一个新项目后，其 `README.md` 或 `src/layouts/BaseLayout.astro` 中的作者名和项目名已被替换为品牌配置中的值。
  2. 新项目的 `tailwind.config.js` 或类似样式文件中的主色调被更新为品牌色。

#### `step-3.3`: 集成项目依赖自动安装

- **任务描述:** 在 `create` 命令成功创建项目并注入品牌信息后，自动在**新项目的目录**中运行 `pnpm install`。
- **验证标准:**
  1. 运行 `create` 命令的最后阶段，会看到依赖安装的日志。
  2. 命令结束后，新项目文件夹中已生成 `node_modules` 目录。

---

## Part 4: 本地项目管理 (`list` command) - 数据驱动

### **目标：使用 `@/core` 中的 `projectStore` 实现项目记录与查询**

#### `step-4.1`: 集成 `projectStore` 进行项目记录

- **任务描述:** 修改 `create` 命令，在成功创建项目后，调用 `@/core` 中的 `projectStore.createProject` 方法，将新项目的元数据（名称、模板、路径、创建时间等）保存下来。
- **验证标准:**
  1. `projectStore` 的数据文件（例如 `~/.astro-launcher/projects.json`）被创建或更新。
  2. 该文件中包含了新创建项目的正确信息。

#### `step-4.2`: 实现 `list` 命令

- **任务描述:**
  1. 在 CLI 中实现 `list` 命令。
  2. 该命令调用 `@/core` 的 `projectStore.getAllProjects` 方法获取所有项目数据。
  3. 使用 `chalk` 美化输出，在控制台以表格形式展示所有已创建的项目及其信息。
- **验证标准:**
  1. 运行 `pnpm cli list` 能清晰地列出所有已创建的项目。
  2. 输出的列表格式清晰、对齐且带有颜色，易于阅读。

---

## Part 5: 一键部署到 GitHub (`deploy` command) - 新功能开发

### **目标：实现全新的 `deploy` 命令，完成从本地到线上的自动化流程**

#### `step-5.1`: 实现 `deploy` 命令和 GitHub 认证

- **任务描述:**
  1. 创建 `deploy <project-name>` 命令。
  2. 首次运行时，引导用户通过 GitHub App 或 Personal Access Token (PAT) 进行认证。
  3. **(明确)** Token 必须安全地存储在本地用户目录中，**严禁**存放在项目文件夹内。路径确定必须使用 `os.homedir()` 以保证跨平台兼容。
- **验证标准:**
  1. 运行 `pnpm cli deploy my-test-app` 时，提示用户输入 GitHub PAT。
  2. 认证成功后，凭证被加密或以安全方式保存在 `~/.config/@astro-launcher/` 或类似路径下。

#### `step-5.2`: 实现 GitHub 仓库创建和代码推送

- **任务描述:** 在用户认证后，`deploy` 命令使用 `@octokit/rest` 在用户的 GitHub 账户下创建新的远程仓库。然后，使用 `simple-git` 将 `apps/<project-name>` 目录初始化为 Git 仓库（如果尚未初始化），并将其内容推送到新创建的远程仓库。
- **验证标准:**
  1. 运行 `deploy` 命令后，用户的 GitHub 账户下出现一个新的同名仓库。
  2. 本地项目代码被成功推送到该仓库的 `main` 分支。

#### `step-5.3`: 实现 GitHub Actions 自动部署

- **任务描述:** `deploy` 命令会在 `apps/<project-name>` 目录中，自动创建一个 `.github/workflows/deploy.yml` 文件。此 workflow 会在代码推送到 `main` 分支时触发，自动构建 Astro 项目并将其部署到 GitHub Pages。
- **验证标准:**
  1. 项目文件夹中存在 `.github/workflows/deploy.yml` 文件。
  2. 推送代码后，在 GitHub 的 Actions 选项卡中，可以看到一个正在运行或已成功的部署 workflow。
  3. Workflow 成功后，`deploy` 命令最后会打印出最终的网站 URL，并且该 URL 可以正常访问。 