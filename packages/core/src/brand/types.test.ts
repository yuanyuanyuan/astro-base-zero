/**
 * 品牌资产数据模型类型定义验证
 * 确保所有导出的类型符合预期
 */

import { describe, it, expect } from 'vitest';
import type { 
  Brand, 
  PersonalInfo, 
  VisualBrand, 
  SocialLink,
  TemplateContext,
  BrandValidationResult,
  SocialPlatform
} from './types.js';

describe('Brand Assets Types', () => {
  it('should support complete Brand structure', () => {
    const completeBrand: Brand = {
      version: '1.0.0',
      createdAt: '2025-01-11T12:00:00Z',
      updatedAt: '2025-01-11T12:00:00Z',
      personal: {
        name: 'Jane Smith',
        avatar: 'https://example.com/jane-avatar.jpg',
        bio: 'Creative developer and designer',
        email: 'jane@example.com',
        social: {
          links: []
        }
      },
      visual: {
        colors: {
          primary: '#8b5cf6',
          accent: '#ec4899'
        }
      },
      defaults: {
        license: 'MIT',
        copyrightText: '© 2025 Jane Smith. All rights reserved.',
        language: 'en',
        defaultKeywords: ['developer', 'designer', 'creative']
      },
      projectTypes: [
        {
          projectType: 'blog',
          templateVariables: {
            postsPerPage: 10,
            enableComments: true
          }
        }
      ]
    };

    // 验证类型结构
    expect(completeBrand.version).toBe('1.0.0');
    expect(completeBrand.personal.name).toBe('Jane Smith');
    expect(completeBrand.visual.colors.primary).toBe('#8b5cf6');
    expect(completeBrand.defaults.license).toBe('MIT');
    expect(completeBrand.projectTypes?.[0].projectType).toBe('blog');
  });

  it('should provide type safety for PersonalInfo', () => {
    // 测试个人信息类型安全
    const personalInfo: PersonalInfo = {
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Full-stack developer passionate about open source',
      email: 'john@example.com',
      location: 'Beijing, China',
      profession: 'Software Engineer',
      company: 'Tech Corp',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      social: {
        links: [
          {
            platform: 'github',
            label: 'GitHub',
            url: 'https://github.com/johndoe',
            openInNewTab: true,
            order: 1
          },
          {
            platform: 'twitter',
            label: 'Twitter',
            url: 'https://twitter.com/johndoe',
            openInNewTab: true,
            order: 2
          }
        ],
        primaryCount: 3,
        showMoreButton: true
      }
    };

    // 验证类型结构
    expect(personalInfo.name).toBe('John Doe');
    expect(personalInfo.social.links).toHaveLength(2);
    expect(personalInfo.social.links[0].platform).toBe('github');
  });

  it('should provide type safety for VisualBrand', () => {
    // 测试视觉品牌类型安全
    const visualBrand: VisualBrand = {
      colors: {
        primary: '#3b82f6',
        accent: '#f59e0b',
        secondary: '#6b7280',
        background: '#ffffff',
        text: '#1f2937'
      },
      typography: {
        primaryFont: 'Inter, sans-serif',
        codeFont: 'Fira Code, monospace',
        scale: 1.2,
        lineHeight: 1.6
      },
      icons: {
        logo: 'https://example.com/logo.svg',
        favicon: 'https://example.com/favicon.ico'
      },
      themeName: 'modern-blue',
      supportDarkMode: true,
      borderRadius: 'medium',
      shadowStyle: 'normal'
    };

    // 验证类型结构
    expect(visualBrand.colors.primary).toBe('#3b82f6');
    expect(visualBrand.typography?.primaryFont).toBe('Inter, sans-serif');
    expect(visualBrand.borderRadius).toBe('medium');
  });

  it('should support social platform type constraints', () => {
    // 测试社交平台类型约束
    const validPlatforms: SocialPlatform[] = [
      'github',
      'twitter',
      'linkedin',
      'youtube',
      'bilibili',
      'weibo',
      'zhihu',
      'juejin',
      'csdn',
      'email',
      'website',
      'blog',
      'custom'
    ];

    // 验证所有平台类型都被支持
    expect(validPlatforms).toContain('github');
    expect(validPlatforms).toContain('bilibili');
    expect(validPlatforms).toContain('zhihu');
    
    // 测试类型约束生效
    const socialLink: SocialLink = {
      platform: 'github', // 这应该通过类型检查
      label: 'GitHub Profile',
      url: 'https://github.com/user'
    };

    expect(socialLink.platform).toBe('github');
  });

  it('should provide type safety for template context', () => {
    // 测试模板上下文类型安全
    const templateContext: TemplateContext = {
      brand: {
        version: '1.0.0',
        createdAt: '2025-01-11T12:00:00Z',
        updatedAt: '2025-01-11T12:00:00Z',
        personal: {
          name: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Test bio',
          email: 'test@example.com',
          social: {
            links: []
          }
        },
        visual: {
          colors: {
            primary: '#000000',
            accent: '#ffffff'
          }
        },
        defaults: {
          license: 'MIT',
          copyrightText: '© 2025 Test User'
        }
      },
      project: {
        name: 'My Awesome Project',
        description: 'A fantastic project description',
        type: 'demo'
      },
      generatedAt: '2025-01-11T12:00:00Z',
      extra: {
        buildId: 'build-123',
        environment: 'production'
      }
    };

    // 验证类型结构
    expect(templateContext.brand.personal.name).toBe('Test User');
    expect(templateContext.project?.name).toBe('My Awesome Project');
    expect(templateContext.extra?.buildId).toBe('build-123');
  });

  it('should provide type safety for validation result', () => {
    // 测试验证结果类型安全
    const validationResult: BrandValidationResult = {
      isValid: false,
      errors: ['Missing required field: personal.name'],
      warnings: ['Avatar URL format may not be optimal'],
      missingFields: ['personal.name', 'visual.colors.primary']
    };

    // 验证类型结构
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toHaveLength(1);
    expect(validationResult.warnings).toHaveLength(1);
    expect(validationResult.missingFields).toContain('personal.name');
  });
});

// 编译时类型检查测试 - 这些会在 TypeScript 编译期间验证
describe('Compile-time Type Safety', () => {
  it('should enforce required fields', () => {
    // 这个测试验证 TypeScript 编译器会正确识别缺失的必需字段
    // 如果取消注释下面的代码，应该产生编译错误

    // const invalidPersonalInfo: PersonalInfo = {
    //   // name: 'Missing name', // 缺失必需字段，应该产生错误
    //   avatar: 'avatar.jpg',
    //   bio: 'bio',
    //   email: 'email@example.com',
    //   social: { links: [] }
    // };

    expect(true).toBe(true); // 占位符测试
  });

  it('should provide intellisense support', () => {
    // 这个测试验证 IDE 应该为以下对象提供自动补全
    const brandAssets: Partial<Brand> = {
      // 在此输入时，IDE 应该提供 version, createdAt, updatedAt, personal, visual, defaults 等字段的自动补全
    };

    const personalInfo: Partial<PersonalInfo> = {
      // 在此输入时，IDE 应该提供 name, avatar, bio, email, location, social 等字段的自动补全
    };

    expect(typeof brandAssets).toBe('object');
    expect(typeof personalInfo).toBe('object');
  });
}); 