/**
 * 模板上下文管理器
 *
 * 负责构建和管理模板渲染所需的上下文数据
 * 整合品牌资产、项目信息和其他相关数据
 *
 * @version 1.0
 * @date 2025-01-11
 */

import type { Brand } from '../brand/types.js';
import type {
  TemplateContext,
  ProjectInfo,
  TemplateMetadata,
} from './types.js';

// =============================================================================
// 上下文构建器选项
// =============================================================================

/**
 * 上下文构建选项
 */
export interface ContextBuilderOptions {
  /** 品牌资产信息 */
  brand: Brand;
  /** 项目信息 */
  project: ProjectInfo;
  /** 模板元数据 */
  template?: TemplateMetadata;
  /** 自定义数据 */
  custom?: Record<string, any>;
  /** 是否包含调试信息 */
  includeDebug?: boolean;
}

// =============================================================================
// 模板上下文构建器
// =============================================================================

/**
 * 模板上下文构建器
 */
export class TemplateContextBuilder {
  private options: ContextBuilderOptions;

  constructor(options: ContextBuilderOptions) {
    this.options = options;
  }

  /**
   * 构建完整的模板上下文
   * @returns 模板上下文对象
   */
  build(): TemplateContext {
    const context: TemplateContext = {
      brand: this.buildBrandContext(),
      project: this.buildProjectContext(),
      generatedAt: new Date().toISOString(),
      template: this.options.template,
      custom: this.options.custom || {},
    };

    // 添加调试信息
    if (this.options.includeDebug) {
      context.custom = {
        ...context.custom,
        debug: {
          timestamp: context.generatedAt,
          templateName: this.options.template?.name,
          projectType: this.options.project.type,
          brandName: this.options.brand.personal.name,
        },
      };
    }

    return context;
  }

  /**
   * 构建品牌上下文
   */
  private buildBrandContext(): Brand {
    const brand = { ...this.options.brand };

    // 确保必要的默认值
    if (!brand.personal.displayName) {
      brand.personal.displayName = brand.personal.name;
    }

    // 处理社交链接排序
    if (brand.personal.social?.links) {
      brand.personal.social.links.sort(
        (a, b) => (a.order || 999) - (b.order || 999)
      );
    }

    // 添加计算属性
    const computed = {
      // 主要社交链接（前N个）
      primarySocialLinks:
        brand.personal.social?.links?.slice(
          0,
          brand.personal.social.primaryCount || 4
        ) || [],

      // 完整的显示名称
      fullDisplayName: brand.personal.company
        ? `${brand.personal.displayName} @ ${brand.personal.company}`
        : brand.personal.displayName,

      // CSS 变量友好的颜色名称
      cssVariables: this.generateCssVariables(brand.visual.colors),
    };

    return {
      ...brand,
      computed,
    } as Brand & { computed: typeof computed };
  }

  /**
   * 构建项目上下文
   */
  private buildProjectContext(): ProjectInfo {
    const project = { ...this.options.project };

    // 自动生成一些属性
    if (!project.author) {
      project.author = this.options.brand.personal.name;
    }

    if (!project.license) {
      project.license = this.options.brand.defaults.license;
    }

    if (!project.version) {
      project.version = '0.1.0';
    }

    // 处理站点 URL
    if (!project.site && project.repository) {
      project.site = this.inferSiteFromRepository(project.repository);
    }

    // 生成关键词
    if (!project.keywords || project.keywords.length === 0) {
      project.keywords = this.generateKeywords(project);
    }

    // 添加计算属性
    const computed = {
      // 安全的项目名称（用于文件名等）
      safeName: project.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),

      // 类名友好的名称
      className: this.toPascalCase(project.name),

      // 包名友好的名称
      packageName: project.name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),

      // 是否为开源项目
      isOpenSource: Boolean(project.repository),

      // 项目类型的显示名称
      typeDisplayName: this.getTypeDisplayName(project.type),
    };

    return {
      ...project,
      computed,
    } as ProjectInfo & { computed: typeof computed };
  }

  /**
   * 生成 CSS 变量
   */
  private generateCssVariables(
    colors: Brand['visual']['colors']
  ): Record<string, string> {
    const cssVars: Record<string, string> = {};

    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        cssVars[`--color-${this.toKebabCase(key)}`] = value;
      }
    });

    return cssVars;
  }

  /**
   * 从仓库地址推断站点地址
   */
  private inferSiteFromRepository(repository: string): string {
    // GitHub Pages 推断
    const githubMatch = repository.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (githubMatch) {
      const [, owner, repo] = githubMatch;
      return `https://${owner}.github.io/${repo.replace(/\.git$/, '')}`;
    }

    return repository;
  }

  /**
   * 生成项目关键词
   */
  private generateKeywords(project: ProjectInfo): string[] {
    const keywords: string[] = [];

    // 基于项目名称
    keywords.push(project.name.toLowerCase());

    // 基于项目类型
    keywords.push(project.type);

    // 基于品牌名称
    keywords.push(this.options.brand.personal.name.toLowerCase());

    // 通用关键词
    const typeKeywords: Record<string, string[]> = {
      demo: ['演示', 'demo', 'showcase'],
      tool: ['工具', 'tool', 'utility'],
      showcase: ['作品集', 'portfolio', 'showcase'],
      blog: ['博客', 'blog', 'article'],
      docs: ['文档', 'documentation', 'docs'],
      portfolio: ['作品集', 'portfolio', 'resume'],
    };

    if (typeKeywords[project.type]) {
      keywords.push(...typeKeywords[project.type]);
    }

    // 技术栈关键词
    keywords.push('astro', 'typescript', 'web');

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 获取项目类型的显示名称
   */
  private getTypeDisplayName(type: ProjectInfo['type']): string {
    const typeMap: Record<ProjectInfo['type'], string> = {
      demo: '演示项目',
      tool: '实用工具',
      showcase: '展示项目',
      blog: '博客网站',
      docs: '文档站点',
      portfolio: '个人作品集',
    };

    return typeMap[type] || type;
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
      .replace(/^(.)/, char => char.toUpperCase());
  }

  /**
   * 转换为 kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }

  /**
   * 更新品牌信息
   */
  updateBrand(brand: Brand): TemplateContextBuilder {
    return new TemplateContextBuilder({
      ...this.options,
      brand,
    });
  }

  /**
   * 更新项目信息
   */
  updateProject(project: ProjectInfo): TemplateContextBuilder {
    return new TemplateContextBuilder({
      ...this.options,
      project,
    });
  }

  /**
   * 添加自定义数据
   */
  addCustom(key: string, value: any): TemplateContextBuilder {
    return new TemplateContextBuilder({
      ...this.options,
      custom: {
        ...this.options.custom,
        [key]: value,
      },
    });
  }
}

// =============================================================================
// 便捷函数
// =============================================================================

/**
 * 创建模板上下文
 * @param options 构建选项
 * @returns 模板上下文
 */
export function createTemplateContext(
  options: ContextBuilderOptions
): TemplateContext {
  return new TemplateContextBuilder(options).build();
}

/**
 * 从现有上下文创建新的上下文构建器
 * @param context 现有上下文
 * @returns 上下文构建器
 */
export function fromTemplateContext(
  context: TemplateContext
): TemplateContextBuilder {
  return new TemplateContextBuilder({
    brand: context.brand,
    project: context.project,
    template: context.template,
    custom: context.custom,
  });
}
