/**
 * 品牌资产存储系统测试
 * 验证 save 和 load 方法的正确性以及数据持久化功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { vol } from 'memfs';

import {
  BrandStore,
  createDefaultBrandAssets
} from './store.js';

import type { Brand } from './types.js';

// 创建临时测试目录
let tempDir: string;

describe('Brand Assets Storage System', () => {
  beforeEach(async () => {
    // 创建临时目录作为测试目录
    tempDir = await mkdtemp(join(tmpdir(), 'astro-brand-test-'));
  });

  afterEach(async () => {
    // 清理临时目录
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('Default Brand Assets', () => {
    it('should create valid default brand assets', () => {
      const defaultAssets = createDefaultBrandAssets();
      
      expect(defaultAssets.version).toBe('1.0.0');
      expect(defaultAssets.createdAt).toBeDefined();
      expect(defaultAssets.updatedAt).toBeDefined();
      expect(defaultAssets.personal.name).toBe('');
      expect(defaultAssets.personal.email).toBe('');
      expect(defaultAssets.personal.social.links).toEqual([]);
      expect(defaultAssets.visual.colors.primary).toBe('#3b82f6');
      expect(defaultAssets.visual.colors.accent).toBe('#f59e0b');
      expect(defaultAssets.defaults.license).toBe('MIT');
    });

    it('should include current year in copyright text', () => {
      const defaultAssets = createDefaultBrandAssets();
      const currentYear = new Date().getFullYear();
      expect(defaultAssets.defaults.copyrightText).toContain(currentYear.toString());
    });
  });

  describe('BrandStore Core Functionality', () => {
    let store: BrandStore;
    let customDataPath: string;

    beforeEach(async () => {
      // 创建自定义数据路径用于测试
      customDataPath = join(tempDir, 'test-brand.json');
      
      // 创建一个测试用的 BrandStore 实例
      store = new (class extends BrandStore {
        constructor() {
          super();
          // 重写路径方法以使用临时目录
          (this as any).dataPath = customDataPath;
          (this as any).appDataDir = tempDir;
        }
      })();
      
      await store.initialize();
    });

    it('should initialize and create default data', async () => {
      expect(store).toBeDefined();
      // 数据文件应该存在
      expect(existsSync(customDataPath)).toBe(true);
    });

    it('should load default data after initialization', async () => {
      const data = await store.load();
      
      expect(data.version).toBe('1.0.0');
      expect(data.personal.name).toBe('');
      expect(data.visual.colors.primary).toBe('#3b82f6');
    });

    it('should save and load brand assets correctly', async () => {
      // 准备测试数据
      const testBrandAssets: Brand = {
        version: '1.0.0',
        createdAt: '2025-01-11T12:00:00Z',
        updatedAt: '2025-01-11T12:00:00Z',
        personal: {
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
          bio: 'Full-stack developer',
          email: 'john@example.com',
          location: 'Beijing, China',
          social: {
            links: [
              {
                platform: 'github',
                label: 'GitHub',
                url: 'https://github.com/johndoe'
              }
            ]
          }
        },
        visual: {
          colors: {
            primary: '#8b5cf6',
            accent: '#ec4899'
          }
        },
        defaults: {
          license: 'MIT',
          copyrightText: '© 2025 John Doe. All rights reserved.'
        }
      };

      // 保存数据
      await store.save(testBrandAssets);

      // 加载数据
      const loadedData = await store.load();

      // 验证数据一致性
      expect(loadedData.personal.name).toBe('John Doe');
      expect(loadedData.personal.email).toBe('john@example.com');
      expect(loadedData.visual.colors.primary).toBe('#8b5cf6');
      expect(loadedData.defaults.license).toBe('MIT');
      expect(loadedData.personal.social.links).toHaveLength(1);
      expect(loadedData.personal.social.links[0].platform).toBe('github');
    });

    it('should update timestamp when saving', async () => {
      const originalData = await store.load();
      const originalTimestamp = originalData.updatedAt;

      // 等待一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      // 更新数据
      const updatedData = { ...originalData };
      updatedData.personal.name = 'Updated Name';

      await store.save(updatedData);
      const newData = await store.load();

      expect(newData.updatedAt).not.toBe(originalTimestamp);
      expect(new Date(newData.updatedAt).getTime()).toBeGreaterThan(new Date(originalTimestamp).getTime());
    });

    it('should validate brand assets before saving', async () => {
      const invalidData: Brand = {
        version: '1.0.0',
        createdAt: '2025-01-11T12:00:00Z',
        updatedAt: '2025-01-11T12:00:00Z',
        personal: {
          name: 'Test User',
          avatar: '',
          bio: '',
          email: 'invalid-email',  // 无效邮箱格式
          social: {
            links: []
          }
        },
        visual: {
          colors: {
            primary: 'invalid-color',  // 无效颜色格式
            accent: '#ff0000'
          }
        },
        defaults: {
          license: 'MIT',
          copyrightText: '© 2025'
        }
      };

      // 尝试保存无效数据，应该抛出错误
      await expect(store.save(invalidData)).rejects.toThrow('Brand assets validation failed');
    });

    it('should update personal info partially', async () => {
      const originalData = await store.load();
      
      await store.updatePersonal({
        name: 'Updated Name',
        location: 'Shanghai, China'
      });

      const updatedData = await store.load();
      expect(updatedData.personal.name).toBe('Updated Name');
      expect(updatedData.personal.location).toBe('Shanghai, China');
      expect(updatedData.personal.email).toBe(originalData.personal.email); // 应该保留
    });

    it('should get storage statistics', async () => {
      const stats = await store.getStats();

      expect(stats.exists).toBe(true);
      expect(stats.path).toBe(customDataPath);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.lastModified).toBeInstanceOf(Date);
      expect(typeof stats.hasBackup).toBe('boolean');
    });

    it('should persist data across instances', async () => {
      // 保存一些数据
      const testData = createDefaultBrandAssets();
      testData.personal.name = 'Persistent User';
      await store.save(testData);

      // 创建新实例
      const store2 = new (class extends BrandStore {
        constructor() {
          super();
          (this as any).dataPath = customDataPath;
          (this as any).appDataDir = tempDir;
        }
      })();
      
      await store2.initialize();
      const loadedData = await store2.load();

      expect(loadedData.personal.name).toBe('Persistent User');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when calling methods before initialization', async () => {
      const store = new BrandStore();
      
      await expect(store.load()).rejects.toThrow('Brand store not initialized');
      await expect(store.save(createDefaultBrandAssets())).rejects.toThrow('Brand store not initialized');
    });
  });
}); 