import chalk from 'chalk';
import ora, { Ora } from 'ora';

const info = (text: string) => {
  console.log(chalk.blue(text));
};

const success = (text: string) => {
  console.log(chalk.green(text));
};

const error = (text: string) => {
  console.log(chalk.red(text));
};

const spinner = (): Ora => {
  return ora();
};

export const logger = {
  info,
  success,
  error,
  spinner,
}; 