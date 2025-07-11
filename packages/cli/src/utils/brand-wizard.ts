/**
 * 品牌配置向导
 * 
 * 提供交互式的品牌信息收集和配置功能
 * 
 * @version 1.0
 * @date 2025-01-11
 */

import inquirer from 'inquirer';
import { 
  createBrandStore, 
  BrandStore,
  type Brand,
  type PersonalInfo, 
  type SocialLink, 
  type VisualBrand,
  type BrandDefaults
} from '@astro-base-zero/core';
import { logger } from './logger.js';
import { SocialPlatformSchema } from './validators.js';

// =============================================================================
// 品牌向导配置
// =============================================================================

/**
 * 向导步骤类型
 */
export type WizardStep = 'personal' | 'visual' | 'social' | 'defaults' | 'review';

/**
 * 向导选项
 */
export interface BrandWizardOptions {
  /** 是否跳过确认步骤 */
  skipConfirmation?: boolean;
  /** 要运行的特定步骤 */
  step?: WizardStep;
  /** 是否使用现有配置作为默认值 */
  useExistingDefaults?: boolean;
}

// =============================================================================
// 主要向导类
// =============================================================================

export class BrandWizard {
  private brandStore: BrandStore | null = null;
  private currentBrand: Brand | null = null;

  constructor(private options: BrandWizardOptions = {}) {}

  /**
   * 运行完整的品牌配置向导
   */
  async run(): Promise<Brand> {
    logger.info('🎨 Welcome to the Brand Configuration Wizard!');
    logger.info('Let\'s set up your personal brand information step by step.\n');

    try {
      // 初始化品牌存储
      this.brandStore = await createBrandStore();

      // 加载现有配置（如果存在）
      if (this.options.useExistingDefaults !== false) {
        try {
          this.currentBrand = await this.brandStore.load();
          logger.info('📋 Loaded existing brand configuration as defaults.\n');
        } catch {
          // 如果没有现有配置，使用默认配置
          this.currentBrand = null;
        }
      }

      // 根据选项运行特定步骤或全部步骤
      if (this.options.step) {
        await this.runSingleStep(this.options.step);
      } else {
        await this.runAllSteps();
      }

      // 保存最终配置
      if (this.currentBrand && this.brandStore) {
        await this.brandStore.save(this.currentBrand, { 
          validate: true, 
          createBackup: true 
        });
        
        logger.success('✅ Brand configuration saved successfully!');
        const stats = await this.brandStore.getStats();
        logger.info(`📁 Configuration saved to: ${stats.path}`);
        
        return this.currentBrand;
      } else {
        throw new Error('Configuration was not completed properly');
      }
    } catch (error) {
      logger.error(`❌ Brand wizard failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * 运行所有配置步骤
   */
  private async runAllSteps(): Promise<void> {
    // 1. 个人信息配置
    await this.configurePersonalInfo();
    
    // 2. 社交媒体配置
    await this.configureSocialLinks();
    
    // 3. 视觉品牌配置
    await this.configureVisualBrand();
    
    // 4. 默认设置配置
    await this.configureDefaults();
    
    // 5. 审查和确认
    if (!this.options.skipConfirmation) {
      await this.reviewConfiguration();
    }
  }

  /**
   * 运行单个配置步骤
   */
  private async runSingleStep(step: WizardStep): Promise<void> {
    switch (step) {
      case 'personal':
        await this.configurePersonalInfo();
        break;
      case 'social':
        await this.configureSocialLinks();
        break;
      case 'visual':
        await this.configureVisualBrand();
        break;
      case 'defaults':
        await this.configureDefaults();
        break;
      case 'review':
        await this.reviewConfiguration();
        break;
      default:
        throw new Error(`Unknown wizard step: ${step}`);
    }
  }

  /**
   * 配置个人信息
   */
  private async configurePersonalInfo(): Promise<void> {
    logger.info('👤 Personal Information');
    logger.info('Please provide your basic personal information:\n');

    const currentPersonal: Partial<PersonalInfo> = this.currentBrand?.personal || {};
    
    const personalQuestions = [
      {
        type: 'input',
        name: 'name',
        message: 'Your name or nickname:',
        default: currentPersonal.name || '',
        validate: (input: string) => input.trim().length > 0 || 'Name is required'
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name (leave empty to use name):',
        default: currentPersonal.displayName || ''
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email address:',
        default: currentPersonal.email || '',
        validate: (input: string) => {
          if (!input.trim()) return 'Email is required';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(input) || 'Please enter a valid email address';
        }
      },
      {
        type: 'input',
        name: 'bio',
        message: 'Short bio or tagline:',
        default: currentPersonal.bio || '',
        validate: (input: string) => input.trim().length > 0 || 'Bio is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Detailed description (optional):',
        default: currentPersonal.description || ''
      },
      {
        type: 'input',
        name: 'avatar',
        message: 'Avatar image URL:',
        default: currentPersonal.avatar || '',
        validate: (input: string) => {
          if (!input.trim()) return 'Avatar URL is required';
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      },
      {
        type: 'input',
        name: 'location',
        message: 'Location (optional):',
        default: currentPersonal.location || ''
      },
      {
        type: 'input',
        name: 'profession',
        message: 'Profession/Job title (optional):',
        default: currentPersonal.profession || ''
      },
      {
        type: 'input',
        name: 'company',
        message: 'Company/Organization (optional):',
        default: currentPersonal.company || ''
      }
    ];

    const personalAnswers = await inquirer.prompt(personalQuestions);

    // 技能标签配置
    const skillsAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'skills',
        message: 'Skills (comma-separated, optional):',
        default: currentPersonal.skills?.join(', ') || ''
      }
    ]);

    // 兴趣爱好配置
    const interestsAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'interests',
        message: 'Interests (comma-separated, optional):',
        default: currentPersonal.interests?.join(', ') || ''
      }
    ]);

    // 处理技能和兴趣数组
    const skills = skillsAnswer.skills ? 
      skillsAnswer.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : 
      [];
    
    const interests = interestsAnswer.interests ? 
      interestsAnswer.interests.split(',').map((i: string) => i.trim()).filter(Boolean) : 
      [];

    // 更新当前品牌配置
    if (!this.currentBrand) {
      this.currentBrand = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personal: {} as PersonalInfo,
        visual: { colors: { primary: '#3b82f6', accent: '#f59e0b' } },
        defaults: { license: 'MIT', copyrightText: '' }
      };
    }

    this.currentBrand.personal = {
      ...this.currentBrand.personal,
      ...personalAnswers,
      skills: skills.length > 0 ? skills : undefined,
      interests: interests.length > 0 ? interests : undefined,
      social: this.currentBrand.personal.social || { links: [] }
    };

    logger.success('✅ Personal information configured!\n');
  }

  /**
   * 配置社交媒体链接
   */
  private async configureSocialLinks(): Promise<void> {
    logger.info('🔗 Social Media Links');
    logger.info('Let\'s add your social media profiles:\n');

    const currentLinks = this.currentBrand?.personal?.social?.links || [];
    const newLinks: SocialLink[] = [];

    // 常见的社交平台选项
    const platformOptions = [
      { name: 'GitHub', value: 'github' },
      { name: 'Twitter/X', value: 'twitter' },
      { name: 'LinkedIn', value: 'linkedin' },
      { name: 'YouTube', value: 'youtube' },
      { name: 'Bilibili', value: 'bilibili' },
      { name: 'Weibo', value: 'weibo' },
      { name: 'Zhihu', value: 'zhihu' },
      { name: 'Juejin', value: 'juejin' },
      { name: 'Personal Website', value: 'website' },
      { name: 'Blog', value: 'blog' },
      { name: 'Custom', value: 'custom' }
    ];

    // 添加社交链接的循环
    let addMore = true;
    
    while (addMore) {
      const { platform } = await inquirer.prompt([
        {
          type: 'list',
          name: 'platform',
          message: 'Choose a social platform to add:',
          choices: platformOptions.filter(option => 
            !newLinks.some(link => link.platform === option.value)
          )
        }
      ]);

      const linkQuestions = [
        {
          type: 'input',
          name: 'label',
          message: `Display label for ${platform}:`,
          default: platform === 'custom' ? '' : platformOptions.find(p => p.value === platform)?.name
        },
        {
          type: 'input',
          name: 'url',
          message: `URL for ${platform}:`,
          validate: (input: string) => {
            if (!input.trim()) return 'URL is required';
            try {
              new URL(input);
              return true;
            } catch {
              return 'Please enter a valid URL';
            }
          }
        }
      ];

      const linkAnswers = await inquirer.prompt(linkQuestions);

      newLinks.push({
        platform,
        label: linkAnswers.label,
        url: linkAnswers.url,
        openInNewTab: true,
        order: newLinks.length
      });

      // 询问是否继续添加
      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: 'Add another social link?',
          default: false
        }
      ]);

      addMore = continueAdding && newLinks.length < platformOptions.length;
    }

    // 合并现有链接和新链接
    const allLinks = [...currentLinks, ...newLinks];

    // 询问主要显示数量
    const { primaryCount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'primaryCount',
        message: 'How many links to show prominently? (others will be under "more"):',
        default: Math.min(allLinks.length, 4),
        validate: (input: number) => input > 0 && input <= allLinks.length || `Please enter a number between 1 and ${allLinks.length}`
      }
    ]);

    // 更新社交链接配置
    if (this.currentBrand) {
      this.currentBrand.personal.social = {
        links: allLinks,
        primaryCount,
        showMoreButton: allLinks.length > primaryCount
      };
    }

    logger.success(`✅ Added ${newLinks.length} social links!\n`);
  }

  /**
   * 配置视觉品牌
   */
  private async configureVisualBrand(): Promise<void> {
    logger.info('🎨 Visual Brand');
    logger.info('Let\'s configure your brand colors and visual style:\n');

    const currentVisual: Partial<VisualBrand> = this.currentBrand?.visual || {};
    const currentColors = currentVisual.colors || { primary: '#3b82f6', accent: '#f59e0b' };

    const colorQuestions = [
      {
        type: 'input',
        name: 'primary',
        message: 'Primary brand color (hex format):',
        default: currentColors.primary || '#3b82f6',
        validate: (input: string) => {
          const hexRegex = /^#[0-9a-f]{3,8}$/i;
          return hexRegex.test(input) || 'Please enter a valid hex color (e.g., #3b82f6)';
        }
      },
      {
        type: 'input',
        name: 'accent',
        message: 'Accent color (hex format):',
        default: currentColors.accent || '#f59e0b',
        validate: (input: string) => {
          const hexRegex = /^#[0-9a-f]{3,8}$/i;
          return hexRegex.test(input) || 'Please enter a valid hex color (e.g., #f59e0b)';
        }
      },
      {
        type: 'input',
        name: 'secondary',
        message: 'Secondary color (optional, hex format):',
        default: currentColors.secondary || ''
      }
    ];

    const colorAnswers = await inquirer.prompt(colorQuestions);

    // 主题风格选择
    const styleQuestions = [
      {
        type: 'list',
        name: 'borderRadius',
        message: 'Preferred border radius style:',
        choices: [
          { name: 'None (sharp corners)', value: 'none' },
          { name: 'Small (subtle rounding)', value: 'small' },
          { name: 'Medium (moderate rounding)', value: 'medium' },
          { name: 'Large (very rounded)', value: 'large' }
        ],
        default: currentVisual.borderRadius || 'medium'
      },
      {
        type: 'list',
        name: 'shadowStyle',
        message: 'Shadow style preference:',
        choices: [
          { name: 'None', value: 'none' },
          { name: 'Subtle', value: 'subtle' },
          { name: 'Normal', value: 'normal' },
          { name: 'Strong', value: 'strong' }
        ],
        default: currentVisual.shadowStyle || 'normal'
      },
      {
        type: 'confirm',
        name: 'supportDarkMode',
        message: 'Enable dark mode support?',
        default: currentVisual.supportDarkMode !== false
      }
    ];

    const styleAnswers = await inquirer.prompt(styleQuestions);

    // 更新视觉品牌配置
    if (this.currentBrand) {
      this.currentBrand.visual = {
        ...currentVisual,
        colors: {
          ...currentColors,
          primary: colorAnswers.primary,
          accent: colorAnswers.accent,
          ...(colorAnswers.secondary && { secondary: colorAnswers.secondary })
        },
        borderRadius: styleAnswers.borderRadius,
        shadowStyle: styleAnswers.shadowStyle,
        supportDarkMode: styleAnswers.supportDarkMode
      };
    }

    logger.success('✅ Visual brand configured!\n');
  }

  /**
   * 配置默认设置
   */
  private async configureDefaults(): Promise<void> {
    logger.info('⚙️ Default Settings');
    logger.info('Configure default values for your projects:\n');

    const currentDefaults: Partial<BrandDefaults> = this.currentBrand?.defaults || {};

    const defaultsQuestions = [
      {
        type: 'list',
        name: 'license',
        message: 'Default license for projects:',
        choices: [
          'MIT',
          'Apache-2.0',
          'GPL-3.0',
          'BSD-3-Clause',
          'ISC',
          'Unlicense',
          'Custom'
        ],
        default: currentDefaults.license || 'MIT'
      },
      {
        type: 'input',
        name: 'language',
        message: 'Default language code (e.g., en, zh-CN):',
        default: currentDefaults.language || 'en'
      },
      {
        type: 'input',
        name: 'timezone',
        message: 'Default timezone (e.g., UTC, Asia/Shanghai):',
        default: currentDefaults.timezone || 'UTC'
      },
      {
        type: 'input',
        name: 'analyticsId',
        message: 'Google Analytics ID (optional):',
        default: currentDefaults.analyticsId || ''
      }
    ];

    const defaultsAnswers = await inquirer.prompt(defaultsQuestions);

    // SEO 关键词配置
    const { defaultKeywords } = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultKeywords',
        message: 'Default SEO keywords (comma-separated, optional):',
        default: currentDefaults.defaultKeywords?.join(', ') || ''
      }
    ]);

    const keywordsArray = defaultKeywords ? 
      defaultKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : 
      [];

    // 版权文本配置
    const currentYear = new Date().getFullYear();
    const defaultCopyrightText = `© ${currentYear} ${this.currentBrand?.personal?.name || '{{brand.personal.name}}'}. All rights reserved.`;

    const { copyrightText } = await inquirer.prompt([
      {
        type: 'input',
        name: 'copyrightText',
        message: 'Copyright text:',
        default: currentDefaults.copyrightText || defaultCopyrightText
      }
    ]);

    // 更新默认设置配置
    if (this.currentBrand) {
      this.currentBrand.defaults = {
        ...currentDefaults,
        ...defaultsAnswers,
        copyrightText,
        defaultKeywords: keywordsArray.length > 0 ? keywordsArray : undefined,
        defaultAuthor: this.currentBrand.personal.name
      };
    }

    logger.success('✅ Default settings configured!\n');
  }

  /**
   * 审查配置
   */
  private async reviewConfiguration(): Promise<void> {
    logger.info('📋 Configuration Review');
    logger.info('Please review your brand configuration:\n');

    if (!this.currentBrand) {
      throw new Error('No configuration to review');
    }

    // 显示配置摘要
    console.log('👤 Personal Info:');
    console.log(`   Name: ${this.currentBrand.personal.name}`);
    console.log(`   Email: ${this.currentBrand.personal.email}`);
    console.log(`   Bio: ${this.currentBrand.personal.bio}`);
    if (this.currentBrand.personal.location) {
      console.log(`   Location: ${this.currentBrand.personal.location}`);
    }
    console.log('');

    console.log('🔗 Social Links:');
    this.currentBrand.personal.social.links.forEach(link => {
      console.log(`   ${link.label}: ${link.url}`);
    });
    console.log('');

    console.log('🎨 Visual Brand:');
    console.log(`   Primary Color: ${this.currentBrand.visual.colors.primary}`);
    console.log(`   Accent Color: ${this.currentBrand.visual.colors.accent}`);
    console.log(`   Border Radius: ${this.currentBrand.visual.borderRadius || 'medium'}`);
    console.log(`   Dark Mode: ${this.currentBrand.visual.supportDarkMode ? 'Yes' : 'No'}`);
    console.log('');

    console.log('⚙️ Defaults:');
    console.log(`   License: ${this.currentBrand.defaults.license}`);
    console.log(`   Language: ${this.currentBrand.defaults.language || 'en'}`);
    console.log('');

    // 确认保存
    const { confirmSave } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSave',
        message: 'Save this configuration?',
        default: true
      }
    ]);

    if (!confirmSave) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Edit personal information', value: 'personal' },
            { name: 'Edit social links', value: 'social' },
            { name: 'Edit visual brand', value: 'visual' },
            { name: 'Edit default settings', value: 'defaults' },
            { name: 'Cancel and exit', value: 'cancel' }
          ]
        }
      ]);

      if (action === 'cancel') {
        throw new Error('Configuration cancelled by user');
      } else {
        await this.runSingleStep(action as WizardStep);
        await this.reviewConfiguration(); // 递归调用重新审查
      }
    }
  }
}

// =============================================================================
// 便利函数
// =============================================================================

/**
 * 运行品牌配置向导
 */
export async function runBrandWizard(options: BrandWizardOptions = {}): Promise<Brand> {
  const wizard = new BrandWizard(options);
  return await wizard.run();
}

/**
 * 运行特定步骤的配置向导
 */
export async function runBrandWizardStep(step: WizardStep, options: Omit<BrandWizardOptions, 'step'> = {}): Promise<Brand> {
  return runBrandWizard({ ...options, step });
} 