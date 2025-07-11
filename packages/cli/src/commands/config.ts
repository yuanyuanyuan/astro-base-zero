import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import { PlatformConfigSchema, loadConfig, loadBrandAssets, brandDataExists } from '@astro-base-zero/core';
import { logger } from '../utils/logger.js';
import { runBrandWizard, runBrandWizardStep, type WizardStep } from '../utils/brand-wizard.js';

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
 * Loads combined configuration including brand data.
 */
const loadCombinedConfig = async () => {
  const platformConfig = loadPlatformConfig();
  
  // 尝试加载品牌数据
  if (brandDataExists()) {
    try {
      const brandAssets = await loadBrandAssets();
      return {
        ...platformConfig,
        brand: brandAssets
      };
    } catch (error) {
      logger.warn('Failed to load brand data, using platform config only');
      return platformConfig;
    }
  }
  
  return platformConfig;
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
    .action(async (key: string) => {
      try {
        const config = await loadCombinedConfig();
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

  // config brand
  configCommand
    .command('brand')
    .description('Setup or update brand information using interactive wizard')
    .option('-s, --step <step>', 'Run specific configuration step (personal, social, visual, defaults, review)')
    .option('--skip-confirmation', 'Skip final confirmation step')
    .option('--no-defaults', 'Don\'t load existing configuration as defaults')
    .action(async (options) => {
      try {
        logger.info('🎨 Starting Brand Configuration Wizard...\n');

        const wizardOptions = {
          skipConfirmation: options.skipConfirmation || false,
          step: options.step as WizardStep | undefined,
          useExistingDefaults: options.defaults !== false
        };

        if (options.step) {
          // 运行特定步骤
          const validSteps: WizardStep[] = ['personal', 'social', 'visual', 'defaults', 'review'];
          if (!validSteps.includes(options.step as WizardStep)) {
            logger.error(`Invalid step: ${options.step}. Valid steps are: ${validSteps.join(', ')}`);
            process.exit(1);
          }
          
          await runBrandWizardStep(options.step as WizardStep, wizardOptions);
          logger.success(`✅ Brand configuration step '${options.step}' completed!`);
        } else {
          // 运行完整向导
          await runBrandWizard(wizardOptions);
          logger.success('🎉 Brand configuration wizard completed successfully!');
        }

        logger.info('\n📝 You can now use your brand information in project templates.');
        logger.info('💡 Tip: Run `astro-launcher config get brand` to view your current brand configuration.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('cancelled by user')) {
          logger.info('⏹️  Brand configuration cancelled.');
          process.exit(0);
        }
        
        logger.error(`❌ Brand wizard failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
      }
    });

  return configCommand;
}; 