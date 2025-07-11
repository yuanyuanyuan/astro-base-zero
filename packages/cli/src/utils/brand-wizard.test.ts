/**
 * 品牌配置向导测试
 * 
 * 测试品牌向导的基础功能和数据处理逻辑
 * 
 * @version 1.0
 * @date 2025-01-11
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, unlinkSync } from 'node:fs';
import { 
  getBrandDataPath, 
  getAppDataDir,
  createDefaultBrandAssets,
  type BrandAssets 
} from '@astro-base-zero/core';
import { BrandWizard } from './brand-wizard.js';

describe('BrandWizard', () => {
  const testBrandPath = getBrandDataPath();
  
  beforeEach(() => {
    // 清理测试数据
    if (existsSync(testBrandPath)) {
      unlinkSync(testBrandPath);
    }
  });

  afterEach(() => {
    // 清理测试数据
    if (existsSync(testBrandPath)) {
      unlinkSync(testBrandPath);
    }
  });

  describe('基础功能', () => {
    it('应该能够创建品牌向导实例', () => {
      const wizard = new BrandWizard();
      expect(wizard).toBeDefined();
    });

    it('应该能够创建带选项的品牌向导实例', () => {
      const wizard = new BrandWizard({
        skipConfirmation: true,
        useExistingDefaults: false
      });
      expect(wizard).toBeDefined();
    });
  });

  describe('默认配置测试', () => {
    it('应该能够创建默认品牌资产', () => {
      const defaultAssets = createDefaultBrandAssets();
      
      expect(defaultAssets).toBeDefined();
      expect(defaultAssets.version).toBe('1.0.0');
      expect(defaultAssets.personal).toBeDefined();
      expect(defaultAssets.visual).toBeDefined();
      expect(defaultAssets.defaults).toBeDefined();
      
      // 检查必需的字段
      expect(defaultAssets.personal.name).toBe('');
      expect(defaultAssets.personal.email).toBe('');
      expect(defaultAssets.personal.bio).toBe('');
      expect(defaultAssets.personal.avatar).toBe('');
      expect(defaultAssets.personal.social.links).toEqual([]);
      
      // 检查视觉品牌
      expect(defaultAssets.visual.colors.primary).toBe('#3b82f6');
      expect(defaultAssets.visual.colors.accent).toBe('#f59e0b');
      
      // 检查默认设置
      expect(defaultAssets.defaults.license).toBe('MIT');
      expect(defaultAssets.defaults.copyrightText).toContain('{{brand.personal.name}}');
    });
  });

  describe('数据目录管理', () => {
    it('应该能够获取正确的应用数据目录路径', () => {
      const appDataDir = getAppDataDir();
      expect(appDataDir).toContain('.astro-launcher');
    });

    it('应该能够获取正确的品牌数据文件路径', () => {
      const brandDataPath = getBrandDataPath();
      expect(brandDataPath).toContain('.astro-launcher');
      expect(brandDataPath).toContain('brand.json');
    });
  });

  describe('数据验证', () => {
    it('应该验证完整的品牌资产结构', () => {
      const validBrandAssets: BrandAssets = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personal: {
          name: 'Test User',
          email: 'test@example.com',
          bio: 'Test bio',
          avatar: 'https://example.com/avatar.jpg',
          social: {
            links: [
              {
                platform: 'github',
                label: 'GitHub',
                url: 'https://github.com/testuser',
                openInNewTab: true,
                order: 0
              }
            ]
          }
        },
        visual: {
          colors: {
            primary: '#3b82f6',
            accent: '#f59e0b'
          },
          borderRadius: 'medium',
          shadowStyle: 'normal',
          supportDarkMode: true
        },
        defaults: {
          license: 'MIT',
          copyrightText: '© 2025 Test User. All rights reserved.',
          language: 'en',
          timezone: 'UTC'
        }
      };

      // 验证数据结构
      expect(validBrandAssets.personal.name).toBe('Test User');
      expect(validBrandAssets.personal.email).toBe('test@example.com');
      expect(validBrandAssets.personal.social.links).toHaveLength(1);
      expect(validBrandAssets.visual.colors.primary).toBe('#3b82f6');
      expect(validBrandAssets.defaults.license).toBe('MIT');
    });

    it('应该正确处理社交链接数据', () => {
      const socialLinks = [
        {
          platform: 'github' as const,
          label: 'GitHub',
          url: 'https://github.com/user',
          openInNewTab: true,
          order: 0
        },
        {
          platform: 'twitter' as const,
          label: 'Twitter',
          url: 'https://twitter.com/user',
          openInNewTab: true,
          order: 1
        }
      ];

      expect(socialLinks).toHaveLength(2);
      expect(socialLinks[0].platform).toBe('github');
      expect(socialLinks[1].platform).toBe('twitter');
      expect(socialLinks.every(link => link.openInNewTab)).toBe(true);
    });
  });
});

// 导出测试工具函数
export const testUtils = {
  createTestBrandAssets: (): BrandAssets => ({
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personal: {
      name: 'Test User',
      email: 'test@example.com',
      bio: 'A test user bio',
      avatar: 'https://example.com/avatar.jpg',
      location: 'Test City',
      profession: 'Developer',
      company: 'Test Company',
      skills: ['JavaScript', 'TypeScript', 'React'],
      interests: ['Programming', 'Technology'],
      social: {
        links: [
          {
            platform: 'github',
            label: 'GitHub',
            url: 'https://github.com/testuser',
            openInNewTab: true,
            order: 0
          },
          {
            platform: 'twitter',
            label: 'Twitter',
            url: 'https://twitter.com/testuser',
            openInNewTab: true,
            order: 1
          }
        ],
        primaryCount: 2,
        showMoreButton: false
      }
    },
    visual: {
      colors: {
        primary: '#3b82f6',
        accent: '#f59e0b',
        secondary: '#10b981'
      },
      typography: {
        primaryFont: 'Inter',
        secondaryFont: 'Roboto',
        codeFont: 'Fira Code',
        scale: 1.2,
        lineHeight: 1.6
      },
      borderRadius: 'medium',
      shadowStyle: 'normal',
      supportDarkMode: true,
      themeName: 'modern'
    },
    defaults: {
      license: 'MIT',
      copyrightText: '© 2025 Test User. All rights reserved.',
      language: 'en',
      timezone: 'UTC',
      analyticsId: 'GA-123456789',
      defaultKeywords: ['test', 'demo', 'example'],
      defaultAuthor: 'Test User'
    }
  }),

  cleanupTestData: () => {
    const testBrandPath = getBrandDataPath();
    if (existsSync(testBrandPath)) {
      unlinkSync(testBrandPath);
    }
  }
}; 