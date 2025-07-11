/**
 * @astro-base-zero/core
 *
 * This is the core package for the Astro Quick Launch Platform.
 * It contains the main business logic, configuration management,
 * and brand asset management.
 */

// Export configuration schemas
export { PlatformConfigSchema, ProjectConfigSchema } from './config/schema.js';
export type { PlatformConfig, ProjectConfig } from './config/schema.js';

// Export configuration loaders
export { loadConfig, loadConfigWithInheritance } from './config/loader.js';

// Export brand management
export type {
  Brand,
  PersonalInfo,
  SocialLink,
  SocialLinks,
  VisualBrand,
  BrandColors,
  BrandDefaults,
  BrandUpdateOptions,
  BrandValidationResult,
  TemplateContext
} from './brand/types.js';

export {
  BrandStore,
  createBrandStore,
  loadBrandAssets,
  saveBrandAssets,
  brandDataExists,
  getBrandDataSize,
  getAppDataDir,
  getBrandDataPath,
  createDefaultBrandAssets
} from './brand/store.js'; 