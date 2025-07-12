/**
 * 项目数据管理模块
 *
 * 提供项目元数据的存储和管理功能
 *
 * @version 1.0
 * @date 2025-01-11
 */

// 类型定义
export type {
  ProjectInfo,
  ProjectDatabase,
  CreateProjectOptions,
  UpdateProjectOptions,
  ProjectFilterOptions,
  ProjectSortOptions,
  ProjectStats,
} from './types.js';

// 项目存储
export { ProjectStore, projectStore } from './store.js';
