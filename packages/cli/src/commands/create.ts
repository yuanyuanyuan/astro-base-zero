import { Command } from 'commander';
import * as fs from 'fs-extra';
import { existsSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { validateProjectName } from '../utils/validators.js';
import { processProjectTemplates, createTemplateData } from '../utils/template-engine.js';
import { loadBrandAssets } from '@astro-base-zero/core';

export interface CreateOptions {
  template?: string;
  description?: string;
  repository?: string;
  skipInstall?: boolean;
  skipTemplate?: boolean;
}

/**
 * 可用的项目模板
 */
const AVAILABLE_TEMPLATES = [
  {
    name: 'base',
    description: '基础静态站点 - 企业官网、产品展示等',
    features: ['响应式设计', 'SEO优化', '联系表单', 'Tailwind CSS']
  },
  {
    name: 'blog',
    description: '博客站点 - 内容管理、文章发布',
    features: ['Markdown支持', '分类标签', 'RSS订阅', '评论系统']
  },
  {
    name: 'tool',
    description: '在线工具 - 交互式应用、工具展示',
    features: ['React组件', 'API集成', '数据可视化', '工具集成']
  }
];

/**
 * 获取模板源路径
 */
function getTemplatePath(templateName: string): string {
  // 获取当前模块的目录路径
  const currentModulePath = fileURLToPath(import.meta.url);
  const currentDir = process.cwd();
  
  // 尝试多个可能的路径
  const possiblePaths = [
    // 如果在项目根目录运行
    path.resolve(currentDir, 'packages', 'templates', templateName),
    // 如果在 test-projects 目录运行
    path.resolve(currentDir, '..', 'packages', 'templates', templateName),
    // 基于当前模块路径计算（packages/cli/dist/commands/create.js -> packages/templates）
    path.resolve(path.dirname(currentModulePath), '..', '..', '..', 'templates', templateName),
  ];
  
  console.log('查找模板路径:', templateName);
  console.log('当前工作目录:', currentDir);
  console.log('尝试的路径:');
  possiblePaths.forEach((p, i) => console.log(`  ${i + 1}: ${p}`));
  
  // 检查哪个路径存在
  for (const templatePath of possiblePaths) {
    if (existsSync(templatePath)) {
      console.log('找到模板:', templatePath);
      return templatePath;
    }
  }
  
  console.log('未找到模板，使用默认路径:', possiblePaths[1]);
  // 如果都不存在，返回第二个作为默认值
  return possiblePaths[1];
}

/**
 * 复制模板文件
 */
async function copyTemplate(templatePath: string, targetPath: string): Promise<void> {
  const spinner = ora('复制项目模板...').start();
  
  try {
    // 检查模板是否存在
    if (!await fs.pathExists(templatePath)) {
      throw new Error(`模板不存在: ${templatePath}`);
    }
    
    // 创建目标目录
    await fs.ensureDir(targetPath);
    
    // 复制模板文件
    await fs.copy(templatePath, targetPath, {
      filter: (src) => {
        // 排除不需要复制的文件和目录
        const relativePath = path.relative(templatePath, src);
        return !relativePath.includes('node_modules') && 
               !relativePath.includes('.git') &&
               !relativePath.includes('dist') &&
               !relativePath.startsWith('.');
      }
    });
    
    spinner.succeed('项目模板复制完成');
  } catch (error) {
    spinner.fail('项目模板复制失败');
    throw error;
  }
}

/**
 * 安装项目依赖
 */
async function installDependencies(projectPath: string): Promise<void> {
  const spinner = ora('安装项目依赖...').start();
  
  try {
    const { execSync } = await import('child_process');
    
    // 检查包管理器
    let packageManager = 'npm';
    if (await fs.pathExists(path.join(projectPath, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (await fs.pathExists(path.join(projectPath, 'yarn.lock'))) {
      packageManager = 'yarn';
    }
    
    // 执行安装
    execSync(`${packageManager} install`, {
      cwd: projectPath,
      stdio: 'pipe'
    });
    
    spinner.succeed(`依赖安装完成 (使用 ${packageManager})`);
  } catch (error) {
    spinner.fail('依赖安装失败');
    throw error;
  }
}

/**
 * 交互式项目配置
 */
async function promptProjectConfig(projectName: string, options: CreateOptions) {
  const questions = [];
  
  // 模板选择
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: '请选择项目模板:',
      choices: AVAILABLE_TEMPLATES.map(t => ({
        name: `${t.name} - ${t.description}`,
        value: t.name,
        short: t.name
      }))
    });
  }
  
  // 项目描述
  if (!options.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: '请输入项目描述:',
      default: `使用 Astro Base Zero 创建的 ${projectName} 项目`
    });
  }
  
  // 仓库地址
  if (!options.repository) {
    questions.push({
      type: 'input',
      name: 'repository',
      message: '请输入项目仓库地址 (可选):',
      default: ''
    });
  }
  
  // 是否跳过依赖安装
  if (options.skipInstall === undefined) {
    questions.push({
      type: 'confirm',
      name: 'installDeps',
      message: '是否自动安装依赖?',
      default: true
    });
  }
  
  const answers = await inquirer.prompt(questions);
  
  return {
    template: options.template || answers.template,
    description: options.description || answers.description,
    repository: options.repository || answers.repository,
    skipInstall: options.skipInstall ?? !answers.installDeps
  };
}

/**
 * 创建项目
 */
export async function createProject(
  projectName: string,
  options: CreateOptions = {}
): Promise<void> {
  try {
    // 验证项目名称
    validateProjectName(projectName);
    
    // 检查目标目录
    const targetPath = path.resolve(process.cwd(), projectName);
    if (await fs.pathExists(targetPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `目录 "${projectName}" 已存在，是否覆盖?`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('项目创建已取消'));
        return;
      }
      
      await fs.remove(targetPath);
    }
    
    // 获取项目配置
    const config = await promptProjectConfig(projectName, options);
    
    // 显示配置信息
    console.log('\n' + chalk.cyan('项目配置:'));
    console.log(`  名称: ${chalk.white(projectName)}`);
    console.log(`  模板: ${chalk.white(config.template)}`);
    console.log(`  描述: ${chalk.white(config.description)}`);
    if (config.repository) {
      console.log(`  仓库: ${chalk.white(config.repository)}`);
    }
    console.log();
    
    // 复制模板
    const templatePath = getTemplatePath(config.template);
    await copyTemplate(templatePath, targetPath);
    
    // 处理模板变量（如果未跳过）
    if (!options.skipTemplate) {
      try {
        // 加载品牌配置
        const brandConfig = await loadBrandAssets();
        
        // 创建模板数据
        const templateData = createTemplateData({
          name: projectName,
          description: config.description,
          type: config.template,
          repository: config.repository
        }, brandConfig);
        
        // 处理模板文件
        await processProjectTemplates(targetPath, templateData);
      } catch (error) {
        console.warn(chalk.yellow('⚠ 模板处理失败，请手动修改配置文件'));
        console.warn(chalk.gray(error instanceof Error ? error.message : String(error)));
      }
    }
    
    // 安装依赖
    if (!config.skipInstall) {
      await installDependencies(targetPath);
    }
    
    // 成功提示
    console.log(chalk.green('\n✅ 项目创建成功!'));
    console.log('\n' + chalk.cyan('下一步:'));
    console.log(`  cd ${projectName}`);
    if (config.skipInstall) {
      console.log('  npm install  # 安装依赖');
    }
    console.log('  npm run dev  # 启动开发服务器');
    console.log();
    console.log(chalk.gray('更多帮助: astro-zero --help'));
    
  } catch (error) {
    console.error(chalk.red('❌ 项目创建失败:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * 创建 create 命令
 */
export function createCreateCommand(): Command {
  const cmd = new Command('create');
  
  cmd
    .description('创建新的 Astro 项目')
    .argument('<project-name>', '项目名称')
    .option('-t, --template <template>', '项目模板 (base/blog/tool)')
    .option('-d, --description <description>', '项目描述')
    .option('-r, --repository <repository>', '项目仓库地址')
    .option('--skip-install', '跳过依赖安装')
    .option('--skip-template', '跳过模板变量处理')
    .action(async (projectName: string, options: CreateOptions) => {
      await createProject(projectName, options);
    });
  
  return cmd;
} 