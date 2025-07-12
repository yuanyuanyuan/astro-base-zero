/**
 * 项目数据存储系统
 *
 * 使用 lowdb 实现项目元数据的持久化存储
 * 存储位置: ~/.astro-launcher/projects.json
 *
 * @version 1.0
 * @date 2025-01-11
 */

import { join } from 'node:path';
import { homedir } from 'node:os';
import { mkdir, access, constants } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type {
  ProjectInfo,
  ProjectDatabase,
  CreateProjectOptions,
  UpdateProjectOptions,
  ProjectFilterOptions,
  ProjectSortOptions,
  ProjectStats,
} from './types.js';

// =============================================================================
// 存储配置常量
// =============================================================================

/** 应用数据目录名称 */
const APP_DIR_NAME = '.astro-launcher';

/** 项目数据文件名 */
const PROJECT_DATA_FILE = 'projects.json';

// =============================================================================
// 默认数据
// =============================================================================

/**
 * 创建默认的项目数据库
 */
function createDefaultProjectDatabase(): ProjectDatabase {
  return {
    projects: [],
    meta: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
    },
  };
}

// =============================================================================
// 项目存储类
// =============================================================================

/**
 * 项目数据存储管理器
 *
 * 提供项目元数据的增删改查功能
 */
export class ProjectStore {
  private db: Low<ProjectDatabase> | null = null;
  private readonly dataPath: string;
  private readonly appDataDir: string;

  constructor() {
    this.appDataDir = join(homedir(), APP_DIR_NAME);
    this.dataPath = join(this.appDataDir, PROJECT_DATA_FILE);
  }

  /**
   * 确保应用数据目录存在
   */
  private async ensureAppDataDir(): Promise<void> {
    try {
      await access(this.appDataDir, constants.F_OK);
    } catch {
      await mkdir(this.appDataDir, { recursive: true });
    }
  }

  /**
   * 确保存储已初始化
   */
  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('ProjectStore not initialized. Call initialize() first.');
    }
  }

  /**
   * 获取应用数据目录路径
   */
  getAppDataDir(): string {
    return this.appDataDir;
  }

  /**
   * 获取项目数据文件路径
   */
  getDataPath(): string {
    return this.dataPath;
  }

  /**
   * 初始化存储系统
   */
  async initialize(): Promise<void> {
    try {
      // 确保应用数据目录存在
      await this.ensureAppDataDir();

      // 初始化数据库连接
      const adapter = new JSONFile<ProjectDatabase>(this.dataPath);
      this.db = new Low(adapter, createDefaultProjectDatabase());

      // 检查文件是否存在
      const fileExists = existsSync(this.dataPath);

      if (!fileExists) {
        // 文件不存在，创建默认数据
        this.db.data = createDefaultProjectDatabase();
        await this.db.write();
      } else {
        // 文件存在，读取数据
        await this.db.read();

        // 如果读取后数据仍为空，写入默认数据
        if (!this.db.data || !this.db.data.projects) {
          this.db.data = createDefaultProjectDatabase();
          await this.db.write();
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize project store: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 获取所有项目
   */
  async getAllProjects(): Promise<ProjectInfo[]> {
    this.ensureInitialized();

    try {
      await this.db!.read();
      return this.db!.data.projects;
    } catch (error) {
      throw new Error(
        `Failed to load projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 根据ID获取项目
   */
  async getProjectById(id: string): Promise<ProjectInfo | null> {
    const projects = await this.getAllProjects();
    return projects.find(project => project.id === id) || null;
  }

  /**
   * 创建新项目
   */
  async createProject(options: CreateProjectOptions): Promise<ProjectInfo> {
    this.ensureInitialized();

    const now = new Date().toISOString();
    const project: ProjectInfo = {
      id: this.generateProjectId(options.name),
      name: options.name,
      description: options.description,
      type: options.type,
      path: options.path,
      repository: options.repository,
      site: options.site,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      tags: options.tags || [],
    };

    try {
      await this.db!.read();
      this.db!.data.projects.push(project);
      this.db!.data.meta.lastUpdated = now;
      await this.db!.write();

      return project;
    } catch (error) {
      throw new Error(
        `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 更新项目
   */
  async updateProject(
    id: string,
    options: UpdateProjectOptions
  ): Promise<ProjectInfo | null> {
    this.ensureInitialized();

    try {
      await this.db!.read();
      const projectIndex = this.db!.data.projects.findIndex(p => p.id === id);

      if (projectIndex === -1) {
        return null;
      }

      const project = this.db!.data.projects[projectIndex];
      const updatedProject: ProjectInfo = {
        ...project,
        ...options,
        updatedAt: new Date().toISOString(),
      };

      this.db!.data.projects[projectIndex] = updatedProject;
      this.db!.data.meta.lastUpdated = new Date().toISOString();
      await this.db!.write();

      return updatedProject;
    } catch (error) {
      throw new Error(
        `Failed to update project: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(id: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      await this.db!.read();
      const initialLength = this.db!.data.projects.length;
      this.db!.data.projects = this.db!.data.projects.filter(p => p.id !== id);

      if (this.db!.data.projects.length < initialLength) {
        this.db!.data.meta.lastUpdated = new Date().toISOString();
        await this.db!.write();
        return true;
      }

      return false;
    } catch (error) {
      throw new Error(
        `Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 过滤和搜索项目
   */
  async filterProjects(
    filter: ProjectFilterOptions = {},
    sort: ProjectSortOptions = { field: 'updatedAt', direction: 'desc' }
  ): Promise<ProjectInfo[]> {
    let projects = await this.getAllProjects();

    // 应用过滤
    if (filter.type) {
      projects = projects.filter(p => p.type === filter.type);
    }

    if (filter.status) {
      projects = projects.filter(p => p.status === filter.status);
    }

    if (filter.tags && filter.tags.length > 0) {
      projects = projects.filter(p =>
        filter.tags!.some(tag => p.tags?.includes(tag))
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      projects = projects.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 应用排序
    projects.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sort.direction === 'asc' ? comparison : -comparison;
      }

      return 0;
    });

    return projects;
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(): Promise<ProjectStats> {
    const projects = await this.getAllProjects();

    const stats: ProjectStats = {
      total: projects.length,
      byType: {
        demo: 0,
        tool: 0,
        showcase: 0,
        blog: 0,
        docs: 0,
        portfolio: 0,
      },
      byStatus: {
        active: 0,
        archived: 0,
        draft: 0,
      },
      recentlyActive: 0,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    projects.forEach(project => {
      stats.byType[project.type]++;
      stats.byStatus[project.status]++;

      if (new Date(project.updatedAt) > thirtyDaysAgo) {
        stats.recentlyActive++;
      }
    });

    return stats;
  }

  /**
   * 生成项目ID
   */
  private generateProjectId(name: string): string {
    const safeName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const timestamp = Date.now().toString(36);
    return `${safeName}-${timestamp}`;
  }
}

/**
 * 默认项目存储实例
 */
export const projectStore = new ProjectStore();
