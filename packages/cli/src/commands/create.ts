import { Command } from 'commander';
import * as fs from 'fs-extra';
import { existsSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { validateProjectNameOrExit } from '../utils/validators.js';
import {
  processProjectTemplates,
  createTemplateData,
} from '../utils/template-engine.js';
import { loadBrandAssets, projectStore, type CreateProjectOptions as ProjectStoreCreateOptions } from '@astro-base-zero/core';

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
    features: ['响应式设计', 'SEO优化', '联系表单', 'Tailwind CSS'],
  },
  {
    name: 'blog',
    description: '博客站点 - 内容管理、文章发布',
    features: ['Markdown支持', '分类标签', 'RSS订阅', '评论系统'],
  },
  {
    name: 'tool',
    description: '在线工具 - 交互式应用、工具展示',
    features: ['React组件', 'API集成', '数据可视化', '工具集成'],
  },
];

/**
 * 映射模板类型到ProjectInfo类型
 */
function mapTemplateToProjectType(template: string): ProjectStoreCreateOptions['type'] {
  switch (template) {
    case 'base':
      return 'showcase';
    case 'blog':
      return 'blog';
    case 'tool':
      return 'tool';
    default:
      return 'demo';
  }
}

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
    path.resolve(
      path.dirname(currentModulePath),
      '..',
      '..',
      '..',
      'templates',
      templateName
    ),
  ];

  // 检查哪个路径存在
  for (const templatePath of possiblePaths) {
    if (existsSync(templatePath)) {
      return templatePath;
    }
  }

  // 如果都不存在，抛出错误
  throw new Error(`模板 "${templateName}" 不存在。可用模板: ${AVAILABLE_TEMPLATES.map(t => t.name).join(', ')}`);
}

/**
 * 复制模板文件
 */
async function copyTemplate(
  templatePath: string,
  targetPath: string
): Promise<void> {
  const spinner = ora('复制项目模板...').start();

  try {
    // 检查模板是否存在
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`模板不存在: ${templatePath}`);
    }

    // 创建目标目录
    await fs.ensureDir(targetPath);

    // 复制模板文件
    await fs.copy(templatePath, targetPath, {
      filter: src => {
        // 排除不需要复制的文件和目录
        const relativePath = path.relative(templatePath, src);
        return (
          !relativePath.includes('node_modules') &&
          !relativePath.includes('.git') &&
          !relativePath.includes('dist') &&
          !relativePath.startsWith('.')
        );
      },
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
      stdio: 'pipe',
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
async function promptProjectConfig(
  projectName: string,
  options: CreateOptions
) {
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
        short: t.name,
      })),
    });
  }

  // 项目描述 - 如果没有提供，使用默认值而不是询问
  if (!options.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: '请输入项目描述:',
      default: `使用 Astro Base Zero 创建的 ${projectName} 项目`,
    });
  }

  // 仓库地址 - 如果没有提供，使用默认值而不是询问
  if (options.repository === undefined) {
    questions.push({
      type: 'input',
      name: 'repository',
      message: '请输入项目仓库地址 (可选):',
      default: '',
    });
  }

  // 是否跳过依赖安装
  if (options.skipInstall === undefined) {
    questions.push({
      type: 'confirm',
      name: 'installDeps',
      message: '是否自动安装依赖?',
      default: true,
    });
  }

  // 如果没有需要询问的问题，直接返回配置
  if (questions.length === 0) {
    return {
      template: options.template!,
      description: options.description || `使用 Astro Base Zero 创建的 ${projectName} 项目`,
      repository: options.repository || '',
      skipInstall: options.skipInstall ?? false,
    };
  }

  const answers = await inquirer.prompt(questions);

  return {
    template: options.template || answers.template,
    description: options.description || answers.description || `使用 Astro Base Zero 创建的 ${projectName} 项目`,
    repository: options.repository || answers.repository || '',
    skipInstall: options.skipInstall ?? !answers.installDeps,
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
    validateProjectNameOrExit(projectName);

    // 修正：目标目录应该是 apps/<project-name>
    const appsDir = path.resolve(process.cwd(), 'apps');
    const targetPath = path.resolve(appsDir, projectName);
    
    // 确保 apps 目录存在
    await fs.ensureDir(appsDir);
    
    if (await fs.pathExists(targetPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `目录 "apps/${projectName}" 已存在，是否覆盖?`,
          default: false,
        },
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
    console.log(`  路径: ${chalk.white(`apps/${projectName}`)}`);
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
      const spinner = ora('处理模板变量...').start();
      
      try {
        // 加载品牌配置
        let brandConfig = null;
        try {
          brandConfig = await loadBrandAssets();
          spinner.text = '品牌配置加载成功，正在注入模板...';
        } catch (brandError) {
          spinner.warn('未找到品牌配置，使用默认值');
          console.log(chalk.gray('  💡 提示: 运行 `pnpm cli config brand` 来设置个人品牌信息'));
          brandConfig = null;
        }

        // 创建模板数据
        const templateData = createTemplateData(
          {
            name: projectName,
            description: config.description,
            type: config.template,
            repository: config.repository,
          },
          brandConfig
        );

        // 显示模板数据摘要
        console.log(chalk.cyan('\n📝 模板数据摘要:'));
        console.log(`  作者: ${chalk.white(templateData.brand.personal.name)}`);
        console.log(`  邮箱: ${chalk.white(templateData.brand.personal.email)}`);
        console.log(`  主色调: ${chalk.white(templateData.brand.visual.colors.primary)}`);
        console.log(`  强调色: ${chalk.white(templateData.brand.visual.colors.accent)}`);
        console.log();

        // 处理模板文件
        await processProjectTemplates(targetPath, templateData);
        
        spinner.succeed('模板变量处理完成');
      } catch (error) {
        spinner.fail('模板处理失败');
        console.warn(chalk.yellow('⚠ 模板处理失败，项目已创建但可能需要手动配置'));
        console.warn(chalk.gray(`  错误详情: ${error instanceof Error ? error.message : String(error)}`));
        console.warn(chalk.gray('  💡 提示: 您可以手动编辑项目文件中的占位符'));
      }
    }

    // 安装依赖
    if (!config.skipInstall) {
      await installDependencies(targetPath);
    }

    // 保存项目元数据到projectStore
    try {
      const spinner = ora('保存项目元数据...').start();
      
      // 初始化projectStore
      await projectStore.initialize();
      
      // 映射模板类型到ProjectInfo类型
      const projectType = mapTemplateToProjectType(config.template);
      
      const projectOptions: ProjectStoreCreateOptions = {
        name: projectName,
        description: config.description,
        type: projectType,
        path: targetPath,
        repository: config.repository || undefined,
        tags: [config.template], // 使用模板名作为标签
      };
      
      await projectStore.createProject(projectOptions);
      spinner.succeed('项目元数据保存成功');
    } catch (error) {
      console.warn(chalk.yellow('⚠ 项目元数据保存失败，但项目已成功创建'));
      console.warn(chalk.gray(`  错误详情: ${error instanceof Error ? error.message : String(error)}`));
    }

    // 成功提示
    console.log(chalk.green('\n✅ 项目创建成功!'));
    console.log('\n' + chalk.cyan('下一步:'));
    console.log(`  cd apps/${projectName}`);
    if (config.skipInstall) {
      console.log('  npm install  # 安装依赖');
    }
    console.log('  npm run dev  # 启动开发服务器');
    console.log();
    console.log(chalk.gray('更多帮助: astro-zero --help'));
  } catch (error) {
    console.error(chalk.red('❌ 项目创建失败:'));
    console.error(
      chalk.red(error instanceof Error ? error.message : String(error))
    );
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

/**
 * 创建 list 命令
 */
export function createListCommand(): Command {
  const cmd = new Command('list');

  cmd
    .description('列出所有已创建的项目')
    .option('-t, --type <type>', '按类型过滤 (demo/tool/showcase/blog/docs/portfolio)')
    .option('-s, --status <status>', '按状态过滤 (active/archived/draft)')
    .option('--search <keyword>', '搜索关键词')
    .option('--sort <field>', '排序字段 (name/createdAt/updatedAt/type)', 'updatedAt')
    .option('--order <direction>', '排序方向 (asc/desc)', 'desc')
    .action(async (options) => {
      try {
        const spinner = ora('加载项目列表...').start();
        
        // 初始化projectStore
        await projectStore.initialize();
        
        // 构建过滤选项
        const filterOptions: any = {};
        if (options.type) filterOptions.type = options.type;
        if (options.status) filterOptions.status = options.status;
        if (options.search) filterOptions.search = options.search;
        
        // 构建排序选项
        const sortOptions = {
          field: options.sort as any,
          direction: options.order as 'asc' | 'desc',
        };
        
        // 获取项目列表
        const projects = await projectStore.filterProjects(filterOptions, sortOptions);
        
        spinner.stop();
        
        if (projects.length === 0) {
          console.log(chalk.yellow('📂 暂无项目'));
          console.log(chalk.gray('  💡 使用 `pnpm cli create <project-name>` 创建新项目'));
          return;
        }
        
        // 显示项目统计
        const stats = await projectStore.getProjectStats();
        console.log(chalk.cyan('\n📊 项目统计:'));
        console.log(`  总计: ${chalk.white(stats.total)} 个项目`);
        console.log(`  活跃: ${chalk.green(stats.byStatus.active)}`);
        console.log(`  归档: ${chalk.gray(stats.byStatus.archived)}`);
        console.log(`  草稿: ${chalk.yellow(stats.byStatus.draft)}`);
        console.log(`  最近活跃: ${chalk.blue(stats.recentlyActive)}`);
        
        // 显示项目列表
        console.log(chalk.cyan('\n📋 项目列表:'));
        
        projects.forEach((project, index) => {
          const statusColor = project.status === 'active' ? chalk.green : 
                             project.status === 'archived' ? chalk.gray : chalk.yellow;
          const typeColor = chalk.blue;
          
          console.log(`\n${chalk.white(`${index + 1}.`)} ${chalk.bold(project.name)}`);
          console.log(`   ${chalk.gray('描述:')} ${project.description}`);
          console.log(`   ${chalk.gray('类型:')} ${typeColor(project.type)} | ${chalk.gray('状态:')} ${statusColor(project.status)}`);
          console.log(`   ${chalk.gray('路径:')} ${project.path}`);
          if (project.repository) {
            console.log(`   ${chalk.gray('仓库:')} ${chalk.blue(project.repository)}`);
          }
          if (project.site) {
            console.log(`   ${chalk.gray('网站:')} ${chalk.blue(project.site)}`);
          }
          if (project.tags && project.tags.length > 0) {
            console.log(`   ${chalk.gray('标签:')} ${project.tags.map(tag => chalk.cyan(`#${tag}`)).join(' ')}`);
          }
          console.log(`   ${chalk.gray('创建:')} ${chalk.white(new Date(project.createdAt).toLocaleString())}`);
          console.log(`   ${chalk.gray('更新:')} ${chalk.white(new Date(project.updatedAt).toLocaleString())}`);
        });
        
        // 显示帮助信息
        console.log(chalk.gray('\n💡 提示:'));
        console.log(chalk.gray('  • 使用 --type 过滤特定类型的项目'));
        console.log(chalk.gray('  • 使用 --search 搜索项目名称或描述'));
        console.log(chalk.gray('  • 使用 --sort 和 --order 自定义排序'));
        
      } catch (error) {
        console.error(chalk.red('❌ 获取项目列表失败:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });

  return cmd;
}
