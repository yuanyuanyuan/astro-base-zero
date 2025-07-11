/**
 * 类型守卫工具集
 * 
 * 提供运行时类型检查函数，确保数据类型安全
 * 支持复杂数据结构的验证和类型收窄
 * 
 * @version 1.0
 * @date 2025-01-11
 */

import type { Brand, PersonalInfo, SocialLink } from '../brand/types.js';
import type { ProjectInfo, TemplateMetadata } from './types.js';

// =============================================================================
// 基础类型守卫
// =============================================================================

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 检查值是否为非空字符串
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 检查值是否为正数
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 检查值是否为数组
 */
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false;
  
  if (itemGuard) {
    return value.every(item => itemGuard(item));
  }
  
  return true;
}

/**
 * 检查值是否为字符串数组
 */
export function isStringArray(value: unknown): value is string[] {
  return isArray(value, isString);
}

/**
 * 检查值是否为对象
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 检查值是否为日期
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * 检查值是否为有效的URL
 */
export function isValidURL(value: unknown): value is string {
  if (!isString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查值是否为有效的邮箱地址
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 检查值是否为有效的颜色值（十六进制）
 */
export function isValidHexColor(value: unknown): value is string {
  if (!isString(value)) return false;
  
  const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;
  return hexColorRegex.test(value);
}

// =============================================================================
// 品牌相关类型守卫
// =============================================================================

/**
 * 检查值是否为有效的社交链接
 */
export function isSocialLink(value: unknown): value is SocialLink {
  if (!isObject(value)) return false;
  
  const link = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(link.platform) &&
    isNonEmptyString(link.label) &&
    isValidURL(link.url) &&
    (link.icon === undefined || isString(link.icon)) &&
    (link.order === undefined || isNumber(link.order))
  );
}

/**
 * 检查值是否为有效的个人信息
 */
export function isPersonalInfo(value: unknown): value is PersonalInfo {
  if (!isObject(value)) return false;
  
  const info = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(info.name) &&
    isValidURL(info.avatar) &&
    isNonEmptyString(info.bio) &&
    isValidEmail(info.email) &&
    (info.displayName === undefined || isString(info.displayName)) &&
    (info.location === undefined || isString(info.location)) &&
    (info.profession === undefined || isString(info.profession)) &&
    (info.company === undefined || isString(info.company)) &&
    (info.skills === undefined || isStringArray(info.skills)) &&
    (info.interests === undefined || isStringArray(info.interests)) &&
    isObject(info.social) &&
    isArray((info.social as any).links, isSocialLink)
  );
}

/**
 * 检查值是否为有效的品牌颜色配置
 */
export function isBrandColors(value: unknown): value is Brand['visual']['colors'] {
  if (!isObject(value)) return false;
  
  const colors = value as Record<string, unknown>;
  
  return (
    isValidHexColor(colors.primary) &&
    isValidHexColor(colors.accent) &&
    (colors.secondary === undefined || isValidHexColor(colors.secondary)) &&
    (colors.background === undefined || isValidHexColor(colors.background)) &&
    (colors.text === undefined || isValidHexColor(colors.text))
  );
}

/**
 * 检查值是否为有效的品牌配置
 */
export function isBrand(value: unknown): value is Brand {
  if (!isObject(value)) return false;
  
  const brand = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(brand.version) &&
    isNonEmptyString(brand.createdAt) &&
    isNonEmptyString(brand.updatedAt) &&
    isPersonalInfo(brand.personal) &&
    isObject(brand.visual) &&
    isBrandColors((brand.visual as any).colors) &&
    isObject(brand.defaults) &&
    isNonEmptyString((brand.defaults as any).license) &&
    isNonEmptyString((brand.defaults as any).copyrightText)
  );
}

// =============================================================================
// 项目相关类型守卫
// =============================================================================

/**
 * 检查值是否为有效的项目类型
 */
export function isProjectType(value: unknown): value is ProjectInfo['type'] {
  const validTypes: ProjectInfo['type'][] = ['demo', 'tool', 'showcase', 'blog', 'docs', 'portfolio'];
  return isString(value) && validTypes.includes(value as ProjectInfo['type']);
}

/**
 * 检查值是否为有效的项目信息
 */
export function isProjectInfo(value: unknown): value is ProjectInfo {
  if (!isObject(value)) return false;
  
  const project = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(project.name) &&
    isNonEmptyString(project.description) &&
    isProjectType(project.type) &&
    (project.repository === undefined || isValidURL(project.repository)) &&
    (project.site === undefined || isValidURL(project.site)) &&
    (project.base === undefined || isString(project.base)) &&
    (project.keywords === undefined || isStringArray(project.keywords)) &&
    (project.author === undefined || isString(project.author)) &&
    (project.version === undefined || isString(project.version)) &&
    (project.license === undefined || isString(project.license))
  );
}

// =============================================================================
// 模板相关类型守卫
// =============================================================================

/**
 * 检查值是否为有效的模板元数据
 */
export function isTemplateMetadata(value: unknown): value is TemplateMetadata {
  if (!isObject(value)) return false;
  
  const template = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(template.name) &&
    isNonEmptyString(template.displayName) &&
    isNonEmptyString(template.description) &&
    isNonEmptyString(template.version) &&
    isNonEmptyString(template.author) &&
    isNonEmptyString(template.category) &&
    isStringArray(template.tags) &&
    isStringArray(template.features) &&
    isObject(template.dependencies) &&
    isObject(template.engines) &&
    isStringArray(template.projectTypes) &&
    isObject(template.scaffolding)
  );
}

// =============================================================================
// 内容集合相关类型守卫（博客）
// =============================================================================

/**
 * 检查值是否为有效的博客文章数据
 */
export function isBlogPostData(value: unknown): value is {
  title: string;
  description: string;
  publishDate: Date;
  category: string;
  tags: string[];
  draft: boolean;
  author: string;
  featured: boolean;
} {
  if (!isObject(value)) return false;
  
  const post = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(post.title) &&
    isNonEmptyString(post.description) &&
    isDate(post.publishDate) &&
    isNonEmptyString(post.category) &&
    isStringArray(post.tags) &&
    isBoolean(post.draft) &&
    isNonEmptyString(post.author) &&
    isBoolean(post.featured) &&
    (post.updatedDate === undefined || isDate(post.updatedDate)) &&
    (post.heroImage === undefined || isValidURL(post.heroImage)) &&
    (post.readingTime === undefined || isPositiveNumber(post.readingTime))
  );
}

// =============================================================================
// 工具相关类型守卫
// =============================================================================

/**
 * 检查值是否为有效的工具配置
 */
export function isToolConfig(value: unknown): value is {
  category: string;
  tags: string[];
  showUsageStats: boolean;
  enableFeedback: boolean;
  showSourceCode: boolean;
  features: string[];
} {
  if (!isObject(value)) return false;
  
  const tool = value as Record<string, unknown>;
  
  return (
    isNonEmptyString(tool.category) &&
    isStringArray(tool.tags) &&
    isBoolean(tool.showUsageStats) &&
    isBoolean(tool.enableFeedback) &&
    isBoolean(tool.showSourceCode) &&
    isStringArray(tool.features)
  );
}

/**
 * 检查值是否为有效的使用统计
 */
export function isUsageStats(value: unknown): value is {
  totalUses: number;
  dailyUses: number;
  lastUsed: Date;
} {
  if (!isObject(value)) return false;
  
  const stats = value as Record<string, unknown>;
  
  return (
    isNumber(stats.totalUses) && stats.totalUses >= 0 &&
    isNumber(stats.dailyUses) && stats.dailyUses >= 0 &&
    isDate(stats.lastUsed) &&
    (stats.averageSessionTime === undefined || isPositiveNumber(stats.averageSessionTime))
  );
}

// =============================================================================
// 复合类型守卫
// =============================================================================

/**
 * 检查值是否为有效的配置对象（通用）
 */
export function isValidConfig<T>(
  value: unknown,
  requiredFields: (keyof T)[],
  fieldValidators: Partial<Record<keyof T, (v: unknown) => boolean>>
): value is T {
  if (!isObject(value)) return false;
  
  const config = value as Record<string, unknown>;
  
  // 检查必需字段
  for (const field of requiredFields) {
    if (!(String(field) in config)) {
      return false;
    }
  }
  
  // 检查字段验证器
  for (const [field, validator] of Object.entries(fieldValidators)) {
    const fieldValue = config[field];
    if (fieldValue !== undefined && typeof validator === 'function' && !validator(fieldValue)) {
      return false;
    }
  }
  
  return true;
}

/**
 * 安全的 JSON 解析，带类型检查
 */
export function safeJSONParse<T>(
  jsonString: string,
  typeGuard: (value: unknown) => value is T
): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    return typeGuard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * 验证数据并提供详细错误信息
 */
export function validateWithErrors<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  fieldName = 'data'
): { isValid: true; data: T } | { isValid: false; errors: string[] } {
  if (typeGuard(value)) {
    return { isValid: true, data: value };
  }
  
  // 这里可以扩展为更详细的错误信息收集
  const errors: string[] = [`${fieldName} 不符合预期的类型结构`];
  
  if (!isObject(value)) {
    errors.push(`${fieldName} 必须是一个对象`);
  }
  
  return { isValid: false, errors };
}

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 创建类型断言函数
 */
export function createTypeAssertion<T>(
  typeGuard: (value: unknown) => value is T,
  errorMessage: string
) {
  return function assertType(value: unknown): asserts value is T {
    if (!typeGuard(value)) {
      throw new TypeError(errorMessage);
    }
  };
}

/**
 * 条件类型检查
 */
export function when<T, R>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  callback: (value: T) => R
): R | undefined {
  return typeGuard(value) ? callback(value) : undefined;
} 