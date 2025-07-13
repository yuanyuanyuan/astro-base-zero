import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

export function createDeployCommand() {
  const deploy = new Command('deploy')
    .description('Generate deployment configurations and guide for a project.')
    .argument('<project-name>', 'The name of the project to deploy')
    .option('--skip-workflow', 'Skip creating the GitHub Actions workflow file', false)
    .option('--custom-domain <domain>', 'Specify a custom domain for GitHub Pages')
    .action(async (projectName, options) => {
      console.log(chalk.cyan(`🚀 Starting deployment process for project: ${chalk.bold(projectName)}`));

      const projectPath = path.join(process.cwd(), 'apps', projectName);

      // 1. 验证项目是否存在
      if (!await fs.pathExists(projectPath)) {
        console.error(chalk.red(`❌ Error: Project '${projectName}' not found at ${projectPath}`));
        process.exit(1);
      }
      console.log(chalk.green(`✅ Project found at: ${projectPath}`));

      // 2. 检查 Git 状态
      const gitPath = path.join(projectPath, '.git');
      const isGitRepo = await fs.pathExists(gitPath);
      if (isGitRepo) {
        console.log(chalk.blue('ℹ️  Project is already a Git repository.'));
      } else {
        console.log(chalk.yellow('⚠️  Project is not a Git repository. Will provide instructions to initialize.'));
      }

      // 3. 检查 Actions 配置
      const workflowPath = path.join(projectPath, '.github', 'workflows');
      if (await fs.pathExists(workflowPath)) {
        console.log(chalk.blue('ℹ️  GitHub Actions workflow directory already exists.'));
      }

      // 4. 生成 .gitignore 文件
      await generateGitignore(projectPath);

      // 5. 生成 GitHub Actions 工作流
      if (!options.skipWorkflow) {
        await generateWorkflow(projectPath, projectName, options.customDomain);
      } else {
        console.log(chalk.yellow('⏭️  Skipping GitHub Actions workflow creation.'));
      }

      // 6. 生成部署指南
      await generateDeployGuide(projectPath, projectName, {
        isGitRepo,
        hasCustomDomain: !!options.customDomain,
        customDomain: options.customDomain,
        skipWorkflow: options.skipWorkflow
      });

      // 完成提示
      console.log(chalk.green('\n🎉 Deploy configuration completed!'));
      console.log(chalk.cyan('📖 Check DEPLOY.md for detailed deployment instructions.'));
    });

  return deploy;
}

async function generateGitignore(projectPath: string) {
  const gitignorePath = path.join(projectPath, '.gitignore');
  
  // 检查是否已存在 .gitignore
  if (await fs.pathExists(gitignorePath)) {
    console.log(chalk.blue('ℹ️  .gitignore file already exists.'));
    return;
  }

  // Astro项目的标准 .gitignore 内容
  const gitignoreContent = `# Build outputs
dist/
.output/

# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# MacOS
.DS_Store

# Astro specific
.astro/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
`;

  try {
    await fs.writeFile(gitignorePath, gitignoreContent);
    console.log(chalk.green('✅ Generated .gitignore file'));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create .gitignore: ${error}`));
  }
}

async function generateWorkflow(projectPath: string, projectName: string, customDomain?: string) {
  const workflowDir = path.join(projectPath, '.github', 'workflows');
  const workflowFile = path.join(workflowDir, 'deploy.yml');

  // 检查工作流文件是否已存在
  if (await fs.pathExists(workflowFile)) {
    console.log(chalk.blue('ℹ️  GitHub Actions workflow file already exists.'));
    return;
  }

  // 确保目录存在
  await fs.ensureDir(workflowDir);

  // GitHub Actions 工作流内容
  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'

    - name: Setup pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9

    - name: Get pnpm store directory
      shell: bash
      run: |
        echo "STORE_PATH=\$(pnpm store path --silent)" >> $GITHUB_ENV

    - name: Setup pnpm cache
      uses: actions/cache@v4
      with:
        path: \${{ env.STORE_PATH }}
        key: \${{ runner.os }}-pnpm-store-\${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: |
          \${{ runner.os }}-pnpm-store-

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Build with Astro
      run: pnpm run build

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist'

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false
`;

  try {
    await fs.writeFile(workflowFile, workflowContent);
    console.log(chalk.green('✅ Generated GitHub Actions workflow'));
    
    // 如果有自定义域名，生成 CNAME 文件
    if (customDomain) {
      await generateCNAME(projectPath, customDomain);
    }
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create workflow: ${error}`));
  }
}

async function generateCNAME(projectPath: string, domain: string) {
  const cnamePath = path.join(projectPath, 'public', 'CNAME');
  
  try {
    // 确保 public 目录存在
    await fs.ensureDir(path.join(projectPath, 'public'));
    await fs.writeFile(cnamePath, domain);
    console.log(chalk.green(`✅ Generated CNAME file for domain: ${domain}`));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create CNAME file: ${error}`));
  }
}

interface DeployGuideOptions {
  isGitRepo: boolean;
  hasCustomDomain: boolean;
  customDomain?: string;
  skipWorkflow: boolean;
}

async function generateDeployGuide(projectPath: string, projectName: string, options: DeployGuideOptions) {
  const deployGuidePath = path.join(projectPath, 'DEPLOY.md');
  
  // 检查是否已存在
  if (await fs.pathExists(deployGuidePath)) {
    console.log(chalk.blue('ℹ️  DEPLOY.md file already exists.'));
    return;
  }

  const deployGuideContent = `# 🚀 部署指南 - ${projectName}

本指南将帮助您将 **${projectName}** 项目部署到 GitHub Pages。

## 📋 部署前检查

### 必需条件
- [x] 项目已创建并配置完成
- [x] 已安装 Git
- [x] 拥有 GitHub 账户
${options.skipWorkflow ? '- [ ] 需要手动创建 GitHub Actions 工作流' : '- [x] GitHub Actions 工作流已自动生成'}
${options.hasCustomDomain ? `- [x] 自定义域名已配置: \`${options.customDomain}\`` : '- [ ] 使用默认 GitHub Pages 域名'}

### 验证项目构建
在部署前，请确保项目能够正常构建：

\`\`\`bash
cd apps/${projectName}
npm install  # 或 pnpm install / yarn install
npm run build
\`\`\`

如果构建成功，您将看到 \`dist/\` 目录被创建。

---

## 🔧 GitHub 仓库设置

### 步骤 1: 创建 GitHub 仓库

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称建议使用: \`${projectName}\`
4. 选择 "Public" (GitHub Pages 免费版需要公开仓库)
5. **不要**勾选 "Add a README file"、".gitignore" 或 "license"
6. 点击 "Create repository"

### 步骤 2: 本地 Git 初始化

在项目目录中执行以下命令：

\`\`\`bash
cd apps/${projectName}

${!options.isGitRepo ? `# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "Initial commit"

# 设置默认分支为 main
git branch -M main` : `# 项目已是 Git 仓库，确保所有更改已提交
git add .
git commit -m "Add deployment configuration"`}

# 添加远程仓库 (替换 YOUR_USERNAME 为您的 GitHub 用户名)
git remote add origin https://github.com/YOUR_USERNAME/${projectName}.git

# 推送到 GitHub
git push -u origin main
\`\`\`

---

## ⚙️ GitHub Pages 配置

### 步骤 3: 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 "Settings" 选项卡
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 部分，选择 "GitHub Actions"
4. 保存设置

${options.hasCustomDomain ? `### 步骤 4: 配置自定义域名

您的自定义域名 \`${options.customDomain}\` 已经通过 CNAME 文件配置。

**DNS 设置：**
1. 在您的域名提供商处，添加以下 DNS 记录：
   - 类型: \`CNAME\`
   - 名称: \`www\` (或您想要的子域名)
   - 值: \`YOUR_USERNAME.github.io\`

2. 等待 DNS 传播（通常需要几分钟到几小时）

3. 在 GitHub Pages 设置中，在 "Custom domain" 字段输入: \`${options.customDomain}\`

4. 勾选 "Enforce HTTPS"` : `### 步骤 4: 获取网站地址

部署完成后，您的网站将在以下地址可用：
\`https://YOUR_USERNAME.github.io/${projectName}\`

（将 YOUR_USERNAME 替换为您的 GitHub 用户名）`}

---

## 🔄 自动部署流程

${!options.skipWorkflow ? `### GitHub Actions 工作流

项目已自动配置 GitHub Actions 工作流 (\`.github/workflows/deploy.yml\`)，它将：

1. **触发条件**: 当您推送代码到 \`main\` 分支时
2. **构建过程**: 
   - 安装 Node.js 22 和 pnpm 9
   - 安装项目依赖
   - 运行 \`pnpm run build\` 构建项目
3. **部署过程**: 自动将构建结果部署到 GitHub Pages

### 查看部署状态

1. 推送代码后，访问 GitHub 仓库页面
2. 点击 "Actions" 选项卡
3. 您将看到部署工作流的运行状态
4. 绿色 ✅ 表示部署成功，红色 ❌ 表示部署失败

### 部署时间

通常整个部署过程需要 2-5 分钟。` : `### 手动工作流设置

由于您选择了跳过自动工作流创建，您需要：

1. 在项目根目录创建 \`.github/workflows/deploy.yml\` 文件
2. 复制标准的 Astro + GitHub Pages 工作流配置
3. 提交并推送到 GitHub

**建议**: 运行 \`astro-zero deploy ${projectName}\` 不带 \`--skip-workflow\` 参数来自动生成工作流。`}

---

## 🎯 部署后验证

### 检查列表

- [ ] GitHub Actions 工作流运行成功
- [ ] 网站可以正常访问
- [ ] 所有页面和资源加载正常
- [ ] 样式和交互功能正常工作
${options.hasCustomDomain ? `- [ ] 自定义域名解析正确` : ''}

### 常见问题

**问题**: 部署后网站显示 404
**解决**: 检查 Astro 配置中的 \`base\` 设置，确保与仓库名称匹配

**问题**: 样式文件加载失败
**解决**: 确保所有资源路径都是相对路径或正确的绝对路径

**问题**: GitHub Actions 构建失败
**解决**: 
1. 检查 \`package.json\` 中的构建脚本
2. 确保所有依赖都在 \`package.json\` 中声明
3. 查看 Actions 日志获取详细错误信息

---

## 🔄 更新部署

### 日常更新流程

1. 在本地修改代码
2. 测试构建: \`npm run build\`
3. 提交更改: \`git add . && git commit -m "Update content"\`
4. 推送到 GitHub: \`git push\`
5. GitHub Actions 将自动重新部署

### 回滚部署

如果需要回滚到之前的版本：

\`\`\`bash
# 查看提交历史
git log --oneline

# 回滚到特定提交 (替换 COMMIT_HASH)
git reset --hard COMMIT_HASH

# 强制推送 (谨慎使用)
git push --force
\`\`\`

---

## 📞 获取帮助

- **Astro 文档**: https://docs.astro.build/
- **GitHub Pages 文档**: https://docs.github.com/pages
- **GitHub Actions 文档**: https://docs.github.com/actions

**项目生成时间**: ${new Date().toLocaleString()}
**CLI 版本**: astro-zero v0.1.0

---

🎉 **恭喜！** 您的项目现在已经准备好部署了。按照上述步骤，您将在几分钟内拥有一个在线的网站！
`;

  try {
    await fs.writeFile(deployGuidePath, deployGuideContent);
    console.log(chalk.green('✅ Generated deployment guide (DEPLOY.md)'));
  } catch (error) {
    console.error(chalk.red(`❌ Failed to create deployment guide: ${error}`));
  }
} 