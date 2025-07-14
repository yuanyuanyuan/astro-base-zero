#!/usr/bin/env node
import { Command } from 'commander';
import { createConfigCommand } from './commands/config.js';
import { createCreateCommand, createListCommand } from './commands/create.js';
import { createDeployCommand } from './commands/deploy.js';
import { createCleanCommand } from './commands/clean.js';
import { validateProjectName } from './utils/validators.js';

const program = new Command();

program
  .name('astro-zero')
  .description('Astro Base Zero - 快速创建和管理 Astro 项目的 CLI 工具')
  .version('0.1.0');

// 添加 create 命令（新的完整实现）
program.addCommand(createCreateCommand());

// 添加 list 命令
program.addCommand(createListCommand());

// 添加 deploy 命令
program.addCommand(createDeployCommand());

// 添加 clean 命令
program.addCommand(createCleanCommand());

// 保留 init 命令作为 create 的别名
program
  .command('init')
  .description('初始化新的 Astro 项目（create 命令的别名）')
  .argument('<projectName>', '项目名称')
  .option('-t, --template <template>', '项目模板 (base/blog/tool)')
  .option('-d, --description <description>', '项目描述')
  .option('-r, --repository <repository>', '项目仓库地址')
  .option('--skip-install', '跳过依赖安装')
  .action(async (projectName, options) => {
    const { createProject } = await import('./commands/create.js');
    await createProject(projectName, options);
  });

// 添加配置管理命令
program.addCommand(createConfigCommand());

// 添加模板相关命令
const templatesCmd = new Command('templates');
templatesCmd
  .description('管理项目模板')
  .command('list')
  .description('列出可用的项目模板')
  .action(() => {
    console.log('可用的项目模板:');
    console.log('  base - 基础静态站点模板');
    console.log('  blog - 博客站点模板');
    console.log('  tool - 在线工具模板');
  });

program.addCommand(templatesCmd);

// 解析命令行参数
program.parse(process.argv);
