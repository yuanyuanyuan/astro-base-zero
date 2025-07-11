#!/usr/bin/env node
import { Command } from 'commander';
import { createConfigCommand } from './commands/config.js';

const program = new Command();

program
  .name('astro-launcher')
  .description('A CLI tool to quickly launch Astro projects from templates.')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a new Astro project from a template.')
  .action(() => {
    console.log('Initializing project...');
    // 后续将实现具体逻辑
  });

program
  .command('create')
  .description('Create a new component, page, or layout.')
  .action(() => {
    console.log('Creating something new...');
    // 后续将实现具体逻辑
  });

// Add the config command with subcommands
program.addCommand(createConfigCommand());

program.parse(process.argv);
