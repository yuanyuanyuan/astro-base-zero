/**
 * 内容集合类型安全配置生成器
 *
 * 为不同项目模板生成 Astro Content Collections 配置
 * 确保内容的类型安全和开发体验
 *
 * @version 1.0
 * @date 2025-01-11
 */

import type { ProjectInfo } from './types.js';

// =============================================================================
// 内容集合配置类型
// =============================================================================

/**
 * 集合类型
 */
export type CollectionType = 'content' | 'data';

/**
 * 内容集合定义
 */
export interface CollectionDefinition {
  /** 集合名称 */
  name: string;
  /** 集合类型 */
  type: CollectionType;
  /** Zod Schema 定义 */
  schema: string;
  /** 描述 */
  description?: string;
}

/**
 * 内容集合配置生成选项
 */
export interface CollectionConfigOptions {
  /** 项目信息 */
  project: ProjectInfo;
  /** 品牌作者名称 */
  authorName: string;
  /** 自定义集合 */
  customCollections?: CollectionDefinition[];
}

// =============================================================================
// 内容集合配置生成器
// =============================================================================

/**
 * 内容集合配置生成器
 */
export class CollectionConfigGenerator {
  private options: CollectionConfigOptions;
  private collections: Map<string, CollectionDefinition> = new Map();

  constructor(options: CollectionConfigOptions) {
    this.options = options;
  }

  /**
   * 生成完整的内容集合配置
   */
  generate(): string {
    this.collections.clear();

    // 根据项目类型生成对应的集合
    switch (this.options.project.type) {
      case 'blog':
        this.generateBlogCollections();
        break;
      case 'docs':
        this.generateDocsCollections();
        break;
      case 'showcase':
      case 'portfolio':
        this.generateShowcaseCollections();
        break;
      default:
        this.generateBaseCollections();
        break;
    }

    // 添加自定义集合
    if (this.options.customCollections) {
      this.options.customCollections.forEach(collection => {
        this.collections.set(collection.name, collection);
      });
    }

    return this.buildConfigFile();
  }

  /**
   * 生成博客相关集合
   */
  private generateBlogCollections(): void {
    // 博客文章集合
    this.addCollection({
      name: 'blog',
      type: 'content',
      description: '博客文章集合',
      schema: `z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    author: z.string().default('${this.options.authorName}'),
    featured: z.boolean().default(false),
    readingTime: z.number().optional(),
  })`,
    });

    // 作者信息集合
    this.addCollection({
      name: 'authors',
      type: 'data',
      description: '作者信息集合',
      schema: `z.object({
    name: z.string(),
    avatar: z.string().url(),
    bio: z.string(),
    social: z.object({
      website: z.string().url().optional(),
      twitter: z.string().optional(),
      github: z.string().optional(),
      email: z.string().email().optional(),
    }).optional(),
  })`,
    });

    // 分类集合
    this.addCollection({
      name: 'categories',
      type: 'data',
      description: '博客分类集合',
      schema: `z.object({
    name: z.string(),
    description: z.string(),
    color: z.string().optional(),
    icon: z.string().optional(),
  })`,
    });
  }

  /**
   * 生成文档相关集合
   */
  private generateDocsCollections(): void {
    // 文档页面集合
    this.addCollection({
      name: 'docs',
      type: 'content',
      description: '文档页面集合',
      schema: `z.object({
    title: z.string(),
    description: z.string(),
    sidebar: z.object({
      order: z.number().optional(),
      label: z.string().optional(),
      hidden: z.boolean().default(false),
    }).optional(),
    lastUpdated: z.coerce.date().optional(),
    contributors: z.array(z.string()).default([]),
  })`,
    });

    // 导航配置集合
    this.addCollection({
      name: 'navigation',
      type: 'data',
      description: '导航配置集合',
      schema: `z.object({
    label: z.string(),
    link: z.string(),
    order: z.number(),
    children: z.array(z.object({
      label: z.string(),
      link: z.string(),
      order: z.number(),
    })).optional(),
  })`,
    });
  }

  /**
   * 生成作品集相关集合
   */
  private generateShowcaseCollections(): void {
    // 项目展示集合
    this.addCollection({
      name: 'projects',
      type: 'content',
      description: '项目展示集合',
      schema: `z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    link: z.string().url().optional(),
    repository: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['completed', 'in-progress', 'planned']).default('completed'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
  })`,
    });

    // 技能集合
    this.addCollection({
      name: 'skills',
      type: 'data',
      description: '技能集合',
      schema: `z.object({
    name: z.string(),
    category: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    icon: z.string().optional(),
    color: z.string().optional(),
  })`,
    });
  }

  /**
   * 生成基础集合
   */
  private generateBaseCollections(): void {
    // 页面集合
    this.addCollection({
      name: 'pages',
      type: 'content',
      description: '页面内容集合',
      schema: `z.object({
    title: z.string(),
    description: z.string(),
    lastUpdated: z.coerce.date().optional(),
    template: z.string().optional(),
  })`,
    });
  }

  /**
   * 添加集合定义
   */
  private addCollection(collection: CollectionDefinition): void {
    this.collections.set(collection.name, collection);
  }

  /**
   * 构建配置文件内容
   */
  private buildConfigFile(): string {
    const imports = this.generateImports();
    const collections = this.generateCollectionDefinitions();
    const exports = this.generateExports();

    return `${imports}\n\n${collections}\n\n${exports}`;
  }

  /**
   * 生成导入语句
   */
  private generateImports(): string {
    return `import { defineCollection, z } from 'astro:content';`;
  }

  /**
   * 生成集合定义
   */
  private generateCollectionDefinitions(): string {
    const definitions = Array.from(this.collections.values()).map(
      collection => {
        const comment = collection.description
          ? `// ${collection.description}\n`
          : '';

        return `${comment}const ${collection.name} = defineCollection({
  type: '${collection.type}',
  schema: ${collection.schema},
});`;
      }
    );

    return definitions.join('\n\n');
  }

  /**
   * 生成导出语句
   */
  private generateExports(): string {
    const collectionNames = Array.from(this.collections.keys());
    const exports = collectionNames.map(name => `  ${name},`).join('\n');

    return `export const collections = {\n${exports}\n};`;
  }
}

// =============================================================================
// 预定义集合模板
// =============================================================================

/**
 * 博客集合模板
 */
export const BLOG_COLLECTIONS: CollectionDefinition[] = [
  {
    name: 'blog',
    type: 'content',
    description: '博客文章集合',
    schema: `z.object({
      title: z.string(),
      description: z.string(),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z.string().optional(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      author: z.string(),
      featured: z.boolean().default(false),
      readingTime: z.number().optional(),
    })`,
  },
  {
    name: 'categories',
    type: 'data',
    description: '博客分类集合',
    schema: `z.object({
      name: z.string(),
      description: z.string(),
      color: z.string().optional(),
      icon: z.string().optional(),
    })`,
  },
];

/**
 * 文档集合模板
 */
export const DOCS_COLLECTIONS: CollectionDefinition[] = [
  {
    name: 'docs',
    type: 'content',
    description: '文档页面集合',
    schema: `z.object({
      title: z.string(),
      description: z.string(),
      sidebar: z.object({
        order: z.number().optional(),
        label: z.string().optional(),
        hidden: z.boolean().default(false),
      }).optional(),
      lastUpdated: z.coerce.date().optional(),
      contributors: z.array(z.string()).default([]),
    })`,
  },
];

/**
 * 作品集集合模板
 */
export const PORTFOLIO_COLLECTIONS: CollectionDefinition[] = [
  {
    name: 'projects',
    type: 'content',
    description: '项目展示集合',
    schema: `z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      link: z.string().url().optional(),
      repository: z.string().url().optional(),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      status: z.enum(['completed', 'in-progress', 'planned']).default('completed'),
      startDate: z.coerce.date(),
      endDate: z.coerce.date().optional(),
    })`,
  },
];

// =============================================================================
// 便捷函数
// =============================================================================

/**
 * 为项目生成内容集合配置
 * @param options 配置选项
 * @returns 配置文件内容
 */
export function generateCollectionConfig(
  options: CollectionConfigOptions
): string {
  const generator = new CollectionConfigGenerator(options);
  return generator.generate();
}

/**
 * 根据项目类型获取预定义集合
 * @param projectType 项目类型
 * @returns 集合定义数组
 */
export function getCollectionsForProjectType(
  projectType: ProjectInfo['type']
): CollectionDefinition[] {
  switch (projectType) {
    case 'blog':
      return BLOG_COLLECTIONS;
    case 'docs':
      return DOCS_COLLECTIONS;
    case 'showcase':
    case 'portfolio':
      return PORTFOLIO_COLLECTIONS;
    default:
      return [];
  }
}

/**
 * 验证集合配置的完整性
 * @param collections 集合定义数组
 * @returns 验证结果
 */
export function validateCollections(collections: CollectionDefinition[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const names = new Set<string>();

  for (const collection of collections) {
    // 检查名称唯一性
    if (names.has(collection.name)) {
      errors.push(`重复的集合名称: ${collection.name}`);
    } else {
      names.add(collection.name);
    }

    // 检查必需字段
    if (!collection.name.trim()) {
      errors.push('集合名称不能为空');
    }

    if (!collection.schema.trim()) {
      errors.push(`集合 ${collection.name} 的 schema 不能为空`);
    }

    // 检查名称格式
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(collection.name)) {
      errors.push(
        `集合名称 ${collection.name} 格式不正确，应以字母开头，只含字母、数字和下划线`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
