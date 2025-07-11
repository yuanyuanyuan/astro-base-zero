/**
 * 类型生成器
 * 
 * 基于项目配置文件自动生成 TypeScript 类型定义文件
 * 确保项目的类型安全和开发体验
 * 
 * @version 1.0
 * @date 2025-01-11
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Brand } from '../brand/types.js';
import type { ProjectInfo, TemplateMetadata } from './types.js';

// =============================================================================
// 类型生成配置
// =============================================================================

/**
 * 类型生成选项
 */
export interface TypeGeneratorOptions {
  /** 项目根目录 */
  projectRoot: string;
  /** 输出文件路径 */
  outputPath?: string;
  /** 品牌配置 */
  brand: Brand;
  /** 项目信息 */
  project: ProjectInfo;
  /** 模板元数据 */
  template?: TemplateMetadata;
  /** 是否包含注释 */
  includeComments?: boolean;
  /** 是否格式化输出 */
  formatOutput?: boolean;
}

/**
 * 生成的类型信息
 */
export interface GeneratedTypeInfo {
  /** 类型名称 */
  name: string;
  /** 类型定义 */
  definition: string;
  /** 描述 */
  description?: string;
  /** 是否导出 */
  exported: boolean;
}

// =============================================================================
// 类型生成器类
// =============================================================================

/**
 * TypeScript 类型生成器
 */
export class TypeGenerator {
  private options: TypeGeneratorOptions;
  private generatedTypes: Map<string, GeneratedTypeInfo> = new Map();

  constructor(options: TypeGeneratorOptions) {
    this.options = {
      outputPath: 'types/generated.d.ts',
      includeComments: true,
      formatOutput: true,
      ...options,
    };
  }

  /**
   * 生成所有类型定义
   */
  async generate(): Promise<string> {
    this.generatedTypes.clear();

    // 生成品牌相关类型
    this.generateBrandTypes();

    // 生成项目相关类型
    this.generateProjectTypes();

    // 生成模板相关类型
    if (this.options.template) {
      this.generateTemplateTypes();
    }

    // 生成内容集合类型（如果是博客模板）
    if (this.options.project.type === 'blog') {
      this.generateContentCollectionTypes();
    }

    // 生成工具配置类型（如果是工具模板）
    if (this.options.project.type === 'tool') {
      this.generateToolTypes();
    }

    // 生成最终的类型定义文件内容
    const typeDefinitions = this.buildTypeDefinitions();

    // 写入文件
    if (this.options.outputPath) {
      const outputFile = path.resolve(this.options.projectRoot, this.options.outputPath);
      await this.ensureDirectoryExists(path.dirname(outputFile));
      await fs.writeFile(outputFile, typeDefinitions, 'utf-8');
    }

    return typeDefinitions;
  }

  /**
   * 生成品牌相关类型
   */
  private generateBrandTypes(): void {
    const brand = this.options.brand;

    // 个人信息类型
    this.addType('PersonalInfo', {
      name: 'PersonalInfo',
      definition: this.generateInterfaceDefinition('PersonalInfo', {
        name: { type: 'string', description: '姓名' },
        displayName: { type: 'string', optional: true, description: '显示名称' },
        avatar: { type: 'string', description: '头像URL' },
        bio: { type: 'string', description: '个人简介' },
        email: { type: 'string', description: '邮箱地址' },
        location: { type: 'string', optional: true, description: '所在位置' },
        profession: { type: 'string', optional: true, description: '职业' },
        company: { type: 'string', optional: true, description: '公司' },
      }),
      description: '个人信息接口',
      exported: true,
    });

    // 社交链接类型
    this.addType('SocialLink', {
      name: 'SocialLink',
      definition: this.generateInterfaceDefinition('SocialLink', {
        platform: { type: 'string', description: '平台名称' },
        label: { type: 'string', description: '显示标签' },
        url: { type: 'string', description: '链接地址' },
        icon: { type: 'string', optional: true, description: '图标' },
        order: { type: 'number', optional: true, description: '排序权重' },
      }),
      description: '社交媒体链接接口',
      exported: true,
    });

    // 品牌颜色类型
    this.addType('BrandColors', {
      name: 'BrandColors',
      definition: this.generateInterfaceDefinition('BrandColors', {
        primary: { type: 'string', description: '主色调' },
        accent: { type: 'string', description: '强调色' },
        secondary: { type: 'string', optional: true, description: '次要色调' },
        background: { type: 'string', optional: true, description: '背景色' },
        text: { type: 'string', optional: true, description: '文本色' },
      }),
      description: '品牌色彩配置接口',
      exported: true,
    });
  }

  /**
   * 生成项目相关类型
   */
  private generateProjectTypes(): void {
    const project = this.options.project;

    // 项目配置类型
    this.addType('ProjectConfig', {
      name: 'ProjectConfig',
      definition: this.generateInterfaceDefinition('ProjectConfig', {
        name: { type: 'string', description: '项目名称' },
        description: { type: 'string', description: '项目描述' },
        type: { 
          type: `'${project.type}'`, 
          description: '项目类型',
          literal: true 
        },
        repository: { type: 'string', optional: true, description: '仓库地址' },
        site: { type: 'string', optional: true, description: '网站地址' },
        keywords: { type: 'string[]', optional: true, description: '关键词' },
        author: { type: 'string', optional: true, description: '作者' },
        version: { type: 'string', optional: true, description: '版本' },
        license: { type: 'string', optional: true, description: '许可证' },
      }),
      description: '项目配置接口',
      exported: true,
    });

    // 页面元数据类型
    this.addType('PageMetadata', {
      name: 'PageMetadata',
      definition: this.generateInterfaceDefinition('PageMetadata', {
        title: { type: 'string', optional: true, description: '页面标题' },
        description: { type: 'string', optional: true, description: '页面描述' },
        keywords: { type: 'string[]', optional: true, description: '关键词' },
        image: { type: 'string', optional: true, description: '社交分享图片' },
        canonicalURL: { type: 'string', optional: true, description: '规范化URL' },
      }),
      description: '页面元数据接口',
      exported: true,
    });
  }

  /**
   * 生成模板相关类型
   */
  private generateTemplateTypes(): void {
    if (!this.options.template) return;

    const template = this.options.template;

    // 模板配置类型
    this.addType('TemplateConfig', {
      name: 'TemplateConfig',
      definition: this.generateInterfaceDefinition('TemplateConfig', {
        name: { type: 'string', description: '模板名称' },
        displayName: { type: 'string', description: '显示名称' },
        description: { type: 'string', description: '模板描述' },
        version: { type: 'string', description: '版本号' },
        author: { type: 'string', description: '作者' },
        category: { type: 'string', description: '分类' },
        tags: { type: 'string[]', description: '标签' },
        features: { type: 'string[]', description: '特性列表' },
      }),
      description: '模板配置接口',
      exported: true,
    });
  }

  /**
   * 生成内容集合类型（博客模板）
   */
  private generateContentCollectionTypes(): void {
    // 博客文章类型
    this.addType('BlogPost', {
      name: 'BlogPost',
      definition: this.generateInterfaceDefinition('BlogPost', {
        title: { type: 'string', description: '文章标题' },
        description: { type: 'string', description: '文章描述' },
        publishDate: { type: 'Date', description: '发布日期' },
        updatedDate: { type: 'Date', optional: true, description: '更新日期' },
        heroImage: { type: 'string', optional: true, description: '主图' },
        category: { type: 'string', description: '分类' },
        tags: { type: 'string[]', description: '标签' },
        draft: { type: 'boolean', description: '是否为草稿' },
        author: { type: 'string', description: '作者' },
        featured: { type: 'boolean', description: '是否精选' },
        readingTime: { type: 'number', optional: true, description: '阅读时间' },
      }),
      description: '博客文章接口',
      exported: true,
    });

    // 分类类型
    this.addType('Category', {
      name: 'Category',
      definition: this.generateInterfaceDefinition('Category', {
        name: { type: 'string', description: '分类名称' },
        description: { type: 'string', description: '分类描述' },
        color: { type: 'string', optional: true, description: '分类颜色' },
        icon: { type: 'string', optional: true, description: '分类图标' },
      }),
      description: '博客分类接口',
      exported: true,
    });
  }

  /**
   * 生成工具配置类型（工具模板）
   */
  private generateToolTypes(): void {
    // 工具配置类型
    this.addType('ToolConfig', {
      name: 'ToolConfig',
      definition: this.generateInterfaceDefinition('ToolConfig', {
        category: { type: 'string', description: '工具分类' },
        tags: { type: 'string[]', description: '工具标签' },
        showUsageStats: { type: 'boolean', description: '显示使用统计' },
        enableFeedback: { type: 'boolean', description: '启用反馈功能' },
        showSourceCode: { type: 'boolean', description: '显示源码链接' },
        features: { type: 'string[]', description: '工具特性' },
      }),
      description: '工具配置接口',
      exported: true,
    });

    // 使用统计类型
    this.addType('UsageStats', {
      name: 'UsageStats',
      definition: this.generateInterfaceDefinition('UsageStats', {
        totalUses: { type: 'number', description: '总使用次数' },
        dailyUses: { type: 'number', description: '今日使用次数' },
        lastUsed: { type: 'Date', description: '最后使用时间' },
        averageSessionTime: { type: 'number', optional: true, description: '平均使用时长' },
      }),
      description: '使用统计接口',
      exported: true,
    });
  }

  /**
   * 添加类型定义
   */
  private addType(name: string, info: GeneratedTypeInfo): void {
    this.generatedTypes.set(name, info);
  }

  /**
   * 生成接口定义
   */
  private generateInterfaceDefinition(
    name: string, 
    properties: Record<string, {
      type: string;
      optional?: boolean;
      description?: string;
      literal?: boolean;
    }>
  ): string {
    const props = Object.entries(properties).map(([key, prop]) => {
      const optional = prop.optional ? '?' : '';
      const comment = this.options.includeComments && prop.description 
        ? `\n  /** ${prop.description} */`
        : '';
      
      return `${comment}\n  ${key}${optional}: ${prop.type};`;
    }).join('\n');

    return `interface ${name} {${props}\n}`;
  }

  /**
   * 构建完整的类型定义文件内容
   */
  private buildTypeDefinitions(): string {
    const header = this.generateFileHeader();
    const imports = this.generateImports();
    const types = Array.from(this.generatedTypes.values())
      .map(type => {
        const comment = this.options.includeComments && type.description 
          ? `/**\n * ${type.description}\n */\n`
          : '';
        const exportKeyword = type.exported ? 'export ' : '';
        
        return `${comment}${exportKeyword}${type.definition}`;
      })
      .join('\n\n');

    const content = [header, imports, types].filter(Boolean).join('\n\n');

    return this.options.formatOutput ? this.formatTypeScript(content) : content;
  }

  /**
   * 生成文件头部注释
   */
  private generateFileHeader(): string {
    if (!this.options.includeComments) return '';

    const timestamp = new Date().toISOString();
    return `/**
 * 自动生成的类型定义文件
 * 
 * 项目: ${this.options.project.name}
 * 类型: ${this.options.project.type}
 * 生成时间: ${timestamp}
 * 
 * 警告: 此文件由 Astro Base Zero 自动生成，请勿手动修改
 */`;
  }

  /**
   * 生成导入语句
   */
  private generateImports(): string {
    const imports: string[] = [];

    // 根据项目类型添加相应的导入
    if (this.options.project.type === 'blog') {
      imports.push(`import type { CollectionEntry } from 'astro:content';`);
    }

    return imports.join('\n');
  }

  /**
   * 格式化 TypeScript 代码
   */
  private formatTypeScript(content: string): string {
    // 简单的格式化，实际项目中可以集成 prettier
    return content
      .replace(/\n{3,}/g, '\n\n') // 移除多余的空行
      .replace(/^\s+$/gm, '') // 移除空白行的空格
      .trim();
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // 忽略目录已存在的错误
      if ((error as any)?.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

// =============================================================================
// 便捷函数
// =============================================================================

/**
 * 生成项目类型定义
 * @param options 生成选项
 * @returns 生成的类型定义内容
 */
export async function generateProjectTypes(options: TypeGeneratorOptions): Promise<string> {
  const generator = new TypeGenerator(options);
  return generator.generate();
}

/**
 * 为模板项目生成类型定义
 * @param projectRoot 项目根目录
 * @param configData 配置数据
 * @returns 生成的类型定义内容
 */
export async function generateTypesForTemplate(
  projectRoot: string,
  configData: {
    brand: Brand;
    project: ProjectInfo;
    template?: TemplateMetadata;
  }
): Promise<string> {
  return generateProjectTypes({
    projectRoot,
    ...configData,
  });
} 