/**
 * Astro Base Zero 核心库
 *
 * 提供项目生成的核心功能，包括：
 * - 配置管理
 * - 品牌资产管理
 * - 项目数据管理
 * - 模板处理引擎
 * - 类型系统工具
 *
 * @version 2.0
 * @date 2025-01-11
 */

// 配置管理
export type { PlatformConfig, ProjectConfig } from './config/index.js';

// 项目数据管理
export type {
  ProjectInfo,
  ProjectDatabase,
  CreateProjectOptions,
  UpdateProjectOptions,
  ProjectFilterOptions,
  ProjectSortOptions,
  ProjectStats,
} from './project/index.js';

export { ProjectStore, projectStore } from './project/index.js';
export {
  PlatformConfigSchema,
  ProjectConfigSchema,
  loadConfig,
  loadConfigWithInheritance,
} from './config/index.js';

// 品牌资产管理
export type {
  Brand,
  PersonalInfo,
  SocialLink,
  VisualBrand,
  BrandDefaults,
} from './brand/index.js';

export {
  BrandStore,
  createBrandStore,
  loadBrandAssets,
  saveBrandAssets,
  brandDataExists,
  getBrandDataSize,
  getAppDataDir,
  getBrandDataPath,
  createDefaultBrandAssets,
  brandAssetInjector,
} from './brand/index.js';

// 模板系统
export type {
  TemplateContext,
  TemplateMetadata,
  ProjectInfo as TemplateProjectInfo,
  // 类型生成器
  TypeGeneratorOptions,
  GeneratedTypeInfo,
  // 内容集合
  CollectionType,
  CollectionDefinition,
  CollectionConfigOptions,
} from './template/index.js';

export {
  // 模板处理引擎
  TemplateEngine,
  renderTemplate,

  // 类型生成器
  TypeGenerator,
  generateProjectTypes,
  generateTypesForTemplate,

  // 类型守卫工具
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
  isSocialLink,
  isPersonalInfo,
  isBrandColors,
  isBrand,
  isProjectType,
  isProjectInfo,
  isTemplateMetadata,
  isBlogPostData,
  isToolConfig,
  isUsageStats,
  isValidConfig,
  safeJSONParse,
  validateWithErrors,
  createTypeAssertion,
  when,

  // 内容集合配置
  CollectionConfigGenerator,
  generateCollectionConfig,
  getCollectionsForProjectType,
  validateCollections,
  BLOG_COLLECTIONS,
  DOCS_COLLECTIONS,
  PORTFOLIO_COLLECTIONS,
} from './template/index.js';
