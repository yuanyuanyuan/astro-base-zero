/**
 * 模板系统入口文件
 * 
 * 导出所有模板相关的功能，包括：
 * - 模板处理引擎
 * - 类型生成器
 * - 类型守卫工具
 * - 内容集合配置
 * 
 * @version 2.0
 * @date 2025-01-11
 */

// 核心模板类型
export type {
  TemplateContext,
  TemplateMetadata,
  ProjectInfo,
  TemplateRenderOptions,
  FileProcessor,
  TemplateValidationResult,
} from './types.js';

// 模板处理引擎
export {
  TemplateEngine,
  renderTemplate,
} from './engine.js';

// 类型生成器
export type {
  TypeGeneratorOptions,
  GeneratedTypeInfo,
} from './generator.js';

export {
  TypeGenerator,
  generateProjectTypes,
  generateTypesForTemplate,
} from './generator.js';

// 类型守卫工具集
export {
  // 基础类型守卫
  isString,
  isNonEmptyString,
  isNumber,
  isPositiveNumber,
  isBoolean,
  isArray,
  isStringArray,
  isObject,
  isDate,
  isValidURL,
  isValidEmail,
  isValidHexColor,
  
  // 品牌相关类型守卫
  isSocialLink,
  isPersonalInfo,
  isBrandColors,
  isBrand,
  
  // 项目相关类型守卫
  isProjectType,
  isProjectInfo,
  
  // 模板相关类型守卫
  isTemplateMetadata,
  
  // 内容集合相关类型守卫
  isBlogPostData,
  
  // 工具相关类型守卫
  isToolConfig,
  isUsageStats,
  
  // 复合类型守卫
  isValidConfig,
  safeJSONParse,
  validateWithErrors,
  
  // 工具函数
  createTypeAssertion,
  when,
} from './guards.js';

// 内容集合配置生成器
export type {
  CollectionType,
  CollectionDefinition,
  CollectionConfigOptions,
} from './collections.js';

export {
  CollectionConfigGenerator,
  generateCollectionConfig,
  getCollectionsForProjectType,
  validateCollections,
  
  // 预定义集合模板
  BLOG_COLLECTIONS,
  DOCS_COLLECTIONS,
  PORTFOLIO_COLLECTIONS,
} from './collections.js'; 