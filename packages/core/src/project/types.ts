/**
 * 项目数据管理类型定义
 *
 * 定义项目元数据的数据结构和类型
 *
 * @version 1.0
 * @date 2025-01-11
 */

// =============================================================================
// 项目元数据类型
// =============================================================================

/**
 * 项目基础信息
 */
export interface ProjectInfo {
  /** 项目唯一标识 */
  id: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目类型 */
  type: 'demo' | 'tool' | 'showcase' | 'blog' | 'docs' | 'portfolio';
  /** 项目路径 */
  path: string;
  /** 仓库地址 */
  repository?: string;
  /** 网站地址 */
  site?: string;
  /** 项目状态 */
  status: 'active' | 'archived' | 'draft';
  /** 创建时间 */
  createdAt: string;
  /** 最后更新时间 */
  updatedAt: string;
  /** 标签 */
  tags?: string[];
  /** 版本 */
  version?: string;
}

/**
 * 项目数据库结构
 */
export interface ProjectDatabase {
  /** 项目列表 */
  projects: ProjectInfo[];
  /** 元数据 */
  meta: {
    version: string;
    lastUpdated: string;
  };
}

/**
 * 项目创建选项
 */
export interface CreateProjectOptions {
  name: string;
  description: string;
  type: ProjectInfo['type'];
  path: string;
  repository?: string;
  site?: string;
  tags?: string[];
}

/**
 * 项目更新选项
 */
export interface UpdateProjectOptions {
  name?: string;
  description?: string;
  repository?: string;
  site?: string;
  status?: ProjectInfo['status'];
  tags?: string[];
}

// =============================================================================
// 项目统计类型
// =============================================================================

/**
 * 项目统计信息
 */
export interface ProjectStats {
  /** 项目总数 */
  total: number;
  /** 按类型分组统计 */
  byType: Record<ProjectInfo['type'], number>;
  /** 按状态分组统计 */
  byStatus: Record<ProjectInfo['status'], number>;
  /** 最近活跃项目数 */
  recentlyActive: number;
}

// =============================================================================
// 项目过滤和搜索类型
// =============================================================================

/**
 * 项目过滤选项
 */
export interface ProjectFilterOptions {
  /** 按类型过滤 */
  type?: ProjectInfo['type'];
  /** 按状态过滤 */
  status?: ProjectInfo['status'];
  /** 按标签过滤 */
  tags?: string[];
  /** 搜索关键词 */
  search?: string;
}

/**
 * 项目排序选项
 */
export interface ProjectSortOptions {
  /** 排序字段 */
  field: 'name' | 'createdAt' | 'updatedAt' | 'type';
  /** 排序方向 */
  direction: 'asc' | 'desc';
}
