import { Command } from 'commander';
import { existsSync } from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { projectStore } from '@astro-base-zero/core';

/**
 * 检查项目文件夹是否存在
 */
function checkProjectExists(projectPath: string): boolean {
  // 项目路径应该是相对于工作区根目录的 apps/ 路径
  const fullPath = path.resolve(process.cwd(), projectPath);
  return existsSync(fullPath);
}

/**
 * 清理无效项目的核心逻辑
 */
async function cleanInvalidProjects(options: { dryRun?: boolean; force?: boolean } = {}): Promise<void> {
  const spinner = ora('正在扫描项目...').start();
  
  try {
    // 初始化项目存储
    await projectStore.initialize();
    
    // 获取所有项目
    const allProjects = await projectStore.getAllProjects();
    
    if (allProjects.length === 0) {
      spinner.stop();
      console.log(chalk.yellow('📂 暂无项目记录'));
      return;
    }
    
    // 检查每个项目的文件夹是否存在
    const invalidProjects = [];
    const validProjects = [];
    
    for (const project of allProjects) {
      if (checkProjectExists(project.path)) {
        validProjects.push(project);
      } else {
        invalidProjects.push(project);
      }
    }
    
    spinner.stop();
    
    // 显示扫描结果
    console.log(chalk.cyan('\n🔍 扫描结果:'));
    console.log(`  总项目数: ${chalk.white(allProjects.length)}`);
    console.log(`  有效项目: ${chalk.green(validProjects.length)}`);
    console.log(`  无效项目: ${chalk.red(invalidProjects.length)}`);
    
    if (invalidProjects.length === 0) {
      console.log(chalk.green('\n✅ 所有项目都有效，无需清理'));
      return;
    }
    
    // 显示无效项目列表
    console.log(chalk.red('\n❌ 发现以下无效项目:'));
    invalidProjects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${chalk.bold(project.name)}`);
      console.log(`     路径: ${chalk.gray(project.path)}`);
      console.log(`     描述: ${chalk.gray(project.description)}`);
      console.log(`     创建时间: ${chalk.gray(new Date(project.createdAt).toLocaleString())}`);
    });
    
    // 如果是预览模式，直接返回
    if (options.dryRun) {
      console.log(chalk.yellow('\n👀 预览模式 - 未执行任何删除操作'));
      console.log(chalk.gray('  💡 使用 `pnpm cli clean` 执行实际清理'));
      return;
    }
    
    // 询问用户确认（除非强制模式）
    if (!options.force) {
      console.log(chalk.yellow('\n⚠️  即将从项目记录中移除这些无效项目'));
      console.log(chalk.gray('   注意：这只会删除项目记录，不会影响任何文件'));
      
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: '确定要继续吗？',
          default: false,
        },
      ]);
      
      if (!confirmed) {
        console.log(chalk.gray('操作已取消'));
        return;
      }
    }
    
    // 执行清理
    const cleanSpinner = ora('正在清理无效项目...').start();
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const project of invalidProjects) {
      try {
        const deleted = await projectStore.deleteProject(project.id);
        if (deleted) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        failureCount++;
        console.error(chalk.red(`删除项目 ${project.name} 失败: ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    
    cleanSpinner.stop();
    
    // 显示清理结果
    console.log(chalk.green('\n✨ 清理完成!'));
    console.log(`  成功清理: ${chalk.green(successCount)} 个项目`);
    if (failureCount > 0) {
      console.log(`  清理失败: ${chalk.red(failureCount)} 个项目`);
    }
    
    if (successCount > 0) {
      console.log(chalk.gray('\n💡 提示: 运行 `pnpm cli list` 查看更新后的项目列表'));
    }
    
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('❌ 清理过程中发生错误:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

/**
 * 创建 clean 命令
 */
export function createCleanCommand(): Command {
  const cmd = new Command('clean');
  
  cmd
    .description('清理无效的项目记录（项目文件夹已被手动删除）')
    .option('--dry-run', '预览模式，只显示将被清理的项目，不执行实际删除')
    .option('--force', '强制清理，跳过确认提示')
    .action(async (options) => {
      try {
        await cleanInvalidProjects(options);
      } catch (error) {
        console.error(chalk.red('❌ 命令执行失败:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return cmd;
} 