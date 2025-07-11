import { Command } from 'commander';
import inquirer from 'inquirer';

const program = new Command();

program
  .name('cli-test')
  .description('A POC for CLI interaction with commander and inquirer.');

program
  .command('init')
  .description('Initialize a new project')
  .action(async () => {
    console.log('--- 启动项目初始化交互流程 ---');

    const questions = [
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称:',
        validate: (input) => {
          if (/^([a-z0-9-]+)$/.test(input)) return true;
          return '项目名称只能包含小写字母、数字和连字符。';
        },
      },
      {
        type: 'input',
        name: 'description',
        message: '请输入项目描述:',
      },
    ];

    try {
      const answers = await inquirer.prompt(questions);
      console.log('\n--- 收集到的项目信息 ---');
      console.log(JSON.stringify(answers, null, 2));
      console.log('\n✅ POC 验证成功！');
    } catch (error) {
      console.error('❌ POC 执行出错:', error);
      process.exit(1);
    }
  });

program.parse(process.argv); 