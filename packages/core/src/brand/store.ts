/**
 * 品牌资产存储系统
 *
 * 使用 lowdb 实现品牌信息的持久化存储
 * 存储位置: ~/.astro-launcher/brand.json
 *
 * @version 1.0
 * @date 2025-01-11
 */

import { join } from 'node:path';
import { homedir } from 'node:os';
import { mkdir, access, constants, stat } from 'node:fs/promises';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import type {
  Brand,
  BrandUpdateOptions,
  BrandValidationResult,
  PersonalInfo,
  VisualBrand,
  BrandDefaults,
} from './types.js';

// =============================================================================
// 存储配置常量
// =============================================================================

/** 应用数据目录名称 */
const APP_DIR_NAME = '.astro-launcher';

/** 品牌数据文件名 */
const BRAND_DATA_FILE = 'brand.json';

/** 备份文件后缀 */
const BACKUP_SUFFIX = '.backup';

// =============================================================================
// 存储路径管理
// =============================================================================

/**
 * 获取应用数据目录路径
 */
export function getAppDataDir(): string {
  return join(homedir(), APP_DIR_NAME);
}

/**
 * 获取品牌数据文件路径
 */
export function getBrandDataPath(): string {
  return join(getAppDataDir(), BRAND_DATA_FILE);
}

/**
 * 获取品牌数据备份文件路径
 */
export function getBrandBackupPath(): string {
  return join(getAppDataDir(), BRAND_DATA_FILE + BACKUP_SUFFIX);
}

// =============================================================================
// 默认品牌配置
// =============================================================================

/**
 * 创建默认的品牌资产配置
 */
export function createDefaultBrandAssets(): Brand {
  const now = new Date().toISOString();

  return {
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
    personal: {
      name: '',
      avatar: '',
      bio: '',
      email: '',
      social: {
        links: [],
      },
    },
    visual: {
      colors: {
        primary: '#3b82f6',
        accent: '#f59e0b',
      },
    },
    defaults: {
      license: 'MIT',
      copyrightText: `© ${new Date().getFullYear()} {{brand.personal.name}}. All rights reserved.`,
    },
  };
}

// =============================================================================
// 数据库适配器
// =============================================================================

/**
 * 品牌数据存储接口
 */
interface BrandDatabase {
  brand: Brand;
}

/**
 * 品牌存储管理器
 */
export class BrandStore {
  private db: Low<BrandDatabase> | null = null;
  private dataPath: string;
  private appDataDir: string;

  constructor(customDataPath?: string, customAppDataDir?: string) {
    this.appDataDir = customAppDataDir || getAppDataDir();
    this.dataPath = customDataPath || getBrandDataPath();
  }

  /**
   * 初始化存储系统
   */
  async initialize(): Promise<void> {
    try {
      // 确保应用数据目录存在
      await this.ensureAppDataDir();

      // 初始化数据库连接
      const adapter = new JSONFile<BrandDatabase>(this.dataPath);
      this.db = new Low(adapter, { brand: createDefaultBrandAssets() });

      // 检查文件是否存在
      const fileExists = existsSync(this.dataPath);

      if (!fileExists) {
        // 文件不存在，创建默认数据
        this.db.data = { brand: createDefaultBrandAssets() };
        await this.db.write();
      } else {
        // 文件存在，读取数据
        await this.db.read();

        // 如果读取后数据仍为空，写入默认数据
        if (!this.db.data || !this.db.data.brand) {
          this.db.data = { brand: createDefaultBrandAssets() };
          await this.db.write();
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize brand store: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 确保应用数据目录存在
   */
  private async ensureAppDataDir(): Promise<void> {
    try {
      await access(this.appDataDir, constants.F_OK);
    } catch {
      // 目录不存在，创建它
      await mkdir(this.appDataDir, { recursive: true });
    }
  }

  /**
   * 确保数据库已初始化
   */
  private ensureInitialized(): void {
    if (!this.db) {
      throw new Error('Brand store not initialized. Call initialize() first.');
    }
  }

  /**
   * 加载品牌资产数据
   */
  async load(): Promise<Brand> {
    this.ensureInitialized();

    try {
      await this.db!.read();
      return this.db!.data.brand;
    } catch (error) {
      throw new Error(
        `Failed to load brand data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 保存品牌资产数据
   */
  async save(
    brandAssets: Brand,
    options: BrandUpdateOptions = {}
  ): Promise<void> {
    this.ensureInitialized();

    const {
      merge = false,
      validate = true,
      updateTimestamp = true,
      createBackup = true,
    } = options;

    try {
      // 验证数据（如果启用）
      if (validate) {
        const validation = this.validateBrandAssets(brandAssets);
        if (!validation.isValid) {
          throw new Error(
            `Brand assets validation failed: ${validation.errors.join(', ')}`
          );
        }
      }

      // 读取当前数据
      await this.db!.read();

      // 创建备份（如果启用）
      if (createBackup && existsSync(this.dataPath)) {
        await this.createBackup();
      }

      let updatedBrandAssets: Brand;

      if (merge && this.db!.data.brand) {
        // 合并更新
        updatedBrandAssets = this.deepMerge(this.db!.data.brand, brandAssets);
      } else {
        // 完全替换
        updatedBrandAssets = { ...brandAssets };
      }

      // 更新时间戳
      if (updateTimestamp) {
        updatedBrandAssets.updatedAt = new Date().toISOString();
      }

      // 保存数据
      this.db!.data.brand = updatedBrandAssets;
      await this.db!.write();
    } catch (error) {
      throw new Error(
        `Failed to save brand data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 更新品牌资产的特定部分
   */
  async updatePersonal(personalInfo: Partial<PersonalInfo>): Promise<void> {
    const current = await this.load();
    const updated: Brand = {
      ...current,
      personal: { ...current.personal, ...personalInfo },
    };
    await this.save(updated, { merge: true });
  }

  /**
   * 更新视觉品牌配置
   */
  async updateVisual(visualBrand: Partial<VisualBrand>): Promise<void> {
    const current = await this.load();
    const updated: Brand = {
      ...current,
      visual: { ...current.visual, ...visualBrand },
    };
    await this.save(updated, { merge: true });
  }

  /**
   * 更新品牌默认值
   */
  async updateDefaults(defaults: Partial<BrandDefaults>): Promise<void> {
    const current = await this.load();
    const updated: Brand = {
      ...current,
      defaults: { ...current.defaults, ...defaults },
    };
    await this.save(updated, { merge: true });
  }

  /**
   * 重置为默认配置
   */
  async reset(): Promise<void> {
    const defaultAssets = createDefaultBrandAssets();
    await this.save(defaultAssets, {
      merge: false,
      createBackup: true,
    });
  }

  /**
   * 创建数据备份
   */
  async createBackup(): Promise<string> {
    const backupPath = getBrandBackupPath();

    try {
      const currentData = readFileSync(this.dataPath, 'utf-8');
      
      // 添加时间戳到备份文件名以支持多个备份
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackupPath = backupPath.replace('.backup', `.${timestamp}.backup`);
      
      // 写入新备份
      writeFileSync(timestampedBackupPath, currentData, 'utf-8');
      
      // 同时更新主备份文件（保持兼容性）
      writeFileSync(backupPath, currentData, 'utf-8');
      
      // 清理旧备份（保留最近5个）
      await this.cleanupOldBackups();
      
      return backupPath;
    } catch (error) {
      throw new Error(
        `Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 清理旧的备份文件
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const { readdir, unlink } = await import('node:fs/promises');
      const files = await readdir(this.appDataDir);
      
      // 找到所有备份文件
      const backupFiles = files
        .filter(file => file.includes('brand.json.') && file.endsWith('.backup'))
        .filter(file => file !== 'brand.json.backup') // 排除主备份文件
        .map(file => ({
          name: file,
          path: join(this.appDataDir, file),
          timestamp: file.match(/brand\.json\.(.+)\.backup$/)?.[1] || ''
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // 按时间戳倒序排列
      
      // 保留最近5个，删除其余的
      if (backupFiles.length > 5) {
        const filesToDelete = backupFiles.slice(5);
        for (const file of filesToDelete) {
          await unlink(file.path);
        }
      }
    } catch {
      // 清理失败不影响主要功能
    }
  }

  /**
   * 从备份恢复数据
   */
  async restoreFromBackup(): Promise<void> {
    const backupPath = getBrandBackupPath();

    if (!existsSync(backupPath)) {
      throw new Error('No backup file found');
    }

    try {
      const backupData = readFileSync(backupPath, 'utf-8');
      const parsedData = JSON.parse(backupData);

      if (parsedData && parsedData.brand) {
        await this.save(parsedData.brand, {
          merge: false,
          validate: true,
          createBackup: false,
        });
      } else {
        throw new Error('Invalid backup data format');
      }
    } catch (error) {
      throw new Error(
        `Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStats(): Promise<{
    exists: boolean;
    path: string;
    size: number;
    lastModified: Date | null;
    hasBackup: boolean;
  }> {
    const exists = existsSync(this.dataPath);
    let size = 0;
    let lastModified: Date | null = null;

    if (exists) {
      try {
        const stats = await stat(this.dataPath);
        size = stats.size;
        lastModified = stats.mtime;
      } catch {
        // 忽略错误
      }
    }

    // 计算备份文件路径 - 使用当前实例的 dataPath
    const backupPath = this.dataPath + BACKUP_SUFFIX;
    const hasBackup = existsSync(backupPath);

    return {
      exists,
      path: this.dataPath,
      size,
      lastModified,
      hasBackup,
    };
  }

  /**
   * 验证品牌资产数据
   */
  private validateBrandAssets(brandAssets: Brand): BrandValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // 检查必需字段 - 只验证关键的结构性字段
    if (!brandAssets.version) {
      missingFields.push('version');
    }

    if (!brandAssets.visual?.colors?.primary) {
      missingFields.push('visual.colors.primary');
    }

    if (!brandAssets.visual?.colors?.accent) {
      missingFields.push('visual.colors.accent');
    }

    // 检查时间戳格式
    if (brandAssets.createdAt && !this.isValidISODate(brandAssets.createdAt)) {
      errors.push('Invalid createdAt timestamp format');
    }

    if (brandAssets.updatedAt && !this.isValidISODate(brandAssets.updatedAt)) {
      errors.push('Invalid updatedAt timestamp format');
    }

    // 检查个人信息
    if (brandAssets.personal) {
      // 邮箱验证
      if (
        brandAssets.personal.email &&
        brandAssets.personal.email.trim() !== '' &&
        !this.isValidEmail(brandAssets.personal.email)
      ) {
        errors.push('Invalid email format');
      }

      // 头像URL验证
      if (
        brandAssets.personal.avatar &&
        brandAssets.personal.avatar.trim() !== '' &&
        !this.isValidUrl(brandAssets.personal.avatar)
      ) {
        warnings.push('Avatar URL format may not be optimal');
      }

      // 姓名长度检查
      if (brandAssets.personal.name && brandAssets.personal.name.length > 100) {
        warnings.push('Name is quite long (over 100 characters)');
      }

      // Bio长度检查
      if (brandAssets.personal.bio && brandAssets.personal.bio.length > 500) {
        warnings.push('Bio is quite long (over 500 characters)');
      }

      // 社交链接验证
      if (brandAssets.personal.social?.links) {
        brandAssets.personal.social.links.forEach((link, index) => {
          if (!link.url || !this.isValidUrl(link.url)) {
            errors.push(`Social link ${index + 1}: Invalid URL format`);
          }
          if (!link.label || link.label.trim() === '') {
            errors.push(`Social link ${index + 1}: Label is required`);
          }
          if (!link.platform || link.platform.trim() === '') {
            warnings.push(`Social link ${index + 1}: Platform not specified`);
          }
        });

        // 检查重复的社交平台
        const platforms = brandAssets.personal.social.links.map(link => link.platform);
        const duplicates = platforms.filter((platform, index) => platforms.indexOf(platform) !== index);
        if (duplicates.length > 0) {
          warnings.push(`Duplicate social platforms detected: ${duplicates.join(', ')}`);
        }
      }
    }

    // 检查颜色格式
    if (brandAssets.visual?.colors) {
      if (
        brandAssets.visual.colors.primary &&
        !this.isValidColor(brandAssets.visual.colors.primary)
      ) {
        errors.push('Invalid primary color format');
      }

      if (
        brandAssets.visual.colors.accent &&
        !this.isValidColor(brandAssets.visual.colors.accent)
      ) {
        errors.push('Invalid accent color format');
      }

      if (
        brandAssets.visual.colors.secondary &&
        !this.isValidColor(brandAssets.visual.colors.secondary)
      ) {
        errors.push('Invalid secondary color format');
      }

      // 检查颜色对比度（基础检查）
      if (brandAssets.visual.colors.primary === brandAssets.visual.colors.accent) {
        warnings.push('Primary and accent colors are identical - consider using different colors for better contrast');
      }
    }

    // 检查默认设置
    if (brandAssets.defaults) {
      // 许可证验证
      const validLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Unlicense'];
      if (brandAssets.defaults.license && !validLicenses.includes(brandAssets.defaults.license)) {
        warnings.push(`Uncommon license: ${brandAssets.defaults.license}. Consider using a standard license.`);
      }

      // 语言代码验证
      if (brandAssets.defaults.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(brandAssets.defaults.language)) {
        warnings.push('Language code format should be like "en" or "zh-CN"');
      }

      // 时区验证
      if (brandAssets.defaults.timezone) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: brandAssets.defaults.timezone });
        } catch {
          warnings.push(`Invalid timezone: ${brandAssets.defaults.timezone}`);
        }
      }
    }

    return {
      isValid: errors.length === 0 && missingFields.length === 0,
      errors,
      warnings,
      missingFields,
    };
  }

  /**
   * 深度合并对象
   */
  private deepMerge<T extends Record<string, any>>(
    target: T,
    source: Partial<T>
  ): T {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          target[key] !== null &&
          !Array.isArray(target[key])
        ) {
          result[key] = this.deepMerge(target[key], source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }

    return result;
  }

  /**
   * 验证邮箱格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证 URL 格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证颜色格式
   */
  private isValidColor(color: string): boolean {
    // 支持 hex, rgb, rgba, hsl, hsla 格式
    const colorRegex =
      /^(#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\))$/i;
    return colorRegex.test(color);
  }

  /**
   * 验证ISO日期格式
   */
  private isValidISODate(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return date.toISOString() === dateString;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// 便利函数
// =============================================================================

/**
 * 创建品牌存储实例
 */
export async function createBrandStore(): Promise<BrandStore> {
  const store = new BrandStore();
  await store.initialize();
  return store;
}

/**
 * 快速加载品牌资产
 */
export async function loadBrandAssets(): Promise<Brand> {
  const store = await createBrandStore();
  return store.load();
}

/**
 * 快速保存品牌资产
 */
export async function saveBrandAssets(
  brandAssets: Brand,
  options?: BrandUpdateOptions
): Promise<void> {
  const store = await createBrandStore();
  await store.save(brandAssets, options);
}

/**
 * 检查品牌数据是否存在
 */
export function brandDataExists(): boolean {
  return existsSync(getBrandDataPath());
}

/**
 * 获取品牌数据大小（字节）
 */
export async function getBrandDataSize(): Promise<number> {
  try {
    const stats = await stat(getBrandDataPath());
    return stats.size;
  } catch {
    return 0;
  }
}

// =============================================================================
// 导出所有功能
// =============================================================================

export { BrandStore as default, type BrandDatabase };
