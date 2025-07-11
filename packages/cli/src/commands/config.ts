import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { PlatformConfigSchema, loadConfig } from '@astro-base-zero/core';
import { logger } from '../utils/logger.js';

const CONFIG_DIR = path.join(os.homedir(), '.astro-launcher');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');

// Default platform configuration
const DEFAULT_CONFIG = {
  brand: {
    personal: {
      name: 'Default User',
    },
    socials: {},
  },
};

/**
 * Ensures the configuration directory and file exist.
 */
const ensureConfigFile = () => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, YAML.stringify(DEFAULT_CONFIG));
    logger.info(`Created default configuration file at ${CONFIG_FILE}`);
  }
};

/**
 * Loads the current platform configuration.
 */
const loadPlatformConfig = () => {
  ensureConfigFile();
  return loadConfig(PlatformConfigSchema, CONFIG_FILE);
};

/**
 * Saves the platform configuration to file.
 */
const savePlatformConfig = (config: any) => {
  ensureConfigFile();
  fs.writeFileSync(CONFIG_FILE, YAML.stringify(config, null, 2));
};

/**
 * Gets a nested property value using dot notation.
 */
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Sets a nested property value using dot notation.
 */
const setNestedValue = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const target = keys.reduce((current, key) => {
    if (!(key in current)) {
      current[key] = {};
    }
    return current[key];
  }, obj);
  target[lastKey] = value;
};

export const createConfigCommand = () => {
  const configCommand = new Command('config');
  configCommand.description('Manage global platform configurations.');

  // config get <key>
  configCommand
    .command('get')
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key in dot notation (e.g., brand.personal.name)')
    .action((key: string) => {
      try {
        const config = loadPlatformConfig();
        const value = getNestedValue(config, key);
        
        if (value === undefined) {
          logger.error(`Configuration key '${key}' not found.`);
          process.exit(1);
        }
        
        console.log(typeof value === 'object' ? YAML.stringify(value) : value);
      } catch (error) {
        logger.error(`Failed to get configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  // config set <key> <value>
  configCommand
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key in dot notation')
    .argument('<value>', 'Configuration value')
    .action((key: string, value: string) => {
      try {
        const config = loadPlatformConfig();
        
        // Try to parse value as JSON first, fallback to string
        let parsedValue: any;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }
        
        setNestedValue(config, key, parsedValue);
        
        // Validate the updated configuration
        const validatedConfig = PlatformConfigSchema.parse(config);
        savePlatformConfig(validatedConfig);
        
        logger.success(`Configuration '${key}' set to: ${value}`);
      } catch (error) {
        logger.error(`Failed to set configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  // config list
  configCommand
    .command('list')
    .description('List all configuration values')
    .action(() => {
      try {
        const config = loadPlatformConfig();
        console.log(YAML.stringify(config, null, 2));
      } catch (error) {
        logger.error(`Failed to list configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return configCommand;
}; 