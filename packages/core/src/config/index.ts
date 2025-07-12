export * from './loader.js';
export * from './schema.js';

// 重新导出 Schema 作为值（用于运行时验证）
export { PlatformConfigSchema, ProjectConfigSchema } from './schema.js';
