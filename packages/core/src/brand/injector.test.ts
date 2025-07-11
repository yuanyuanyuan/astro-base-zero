import { describe, it, expect, beforeEach } from 'vitest';
import { vol } from 'memfs';
import yaml from 'js-yaml';
import type { readFile } from 'node:fs/promises';
import { brandAssetInjector } from './injector';
import { VIRTUAL_MODULE_ID, RESOLVED_VIRTUAL_MODULE_ID } from './constants';
import type { Brand } from './types';

const CWD = '/test-project';

const MOCK_BRAND_DATA: Partial<Brand> = {
  name: 'AstroBase',
  logo: './logo.svg',
  colors: {
    primary: '#111111',
  },
};

const DEFAULT_BRAND: Brand = {
  name: 'My Astro Site',
  logo: '/logo.svg',
  colors: {
    primary: '#000000',
    secondary: '#FFFFFF',
  },
  fonts: {
    heading: 'sans-serif',
    body: 'sans-serif',
  },
};

const MERGED_BRAND_DATA = {
  ...DEFAULT_BRAND,
  ...MOCK_BRAND_DATA,
  colors: {
    ...DEFAULT_BRAND.colors,
    ...MOCK_BRAND_DATA.colors,
  },
};

// A mock readFile that reads from the virtual file system
const mockReadFile: typeof readFile = async (path, options) => {
    if (typeof path !== 'string') {
        throw new Error('Path must be a string');
    }
    if (vol.existsSync(path)) {
        return vol.readFileSync(path, (options as any)?.encoding || 'utf-8');
    }
    throw new Error(`ENOENT: no such file or directory, open '${path}'`);
};

describe('brandAssetInjector', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should have the correct name', () => {
    const plugin = brandAssetInjector({ cwd: CWD });
    expect(plugin.name).toBe('astro-base:brand-injector');
  });

  describe('resolveId', () => {
    it('should resolve the virtual module ID', async () => {
      const plugin = brandAssetInjector({ cwd: CWD });
      const resolved = await plugin.resolveId?.(VIRTUAL_MODULE_ID, undefined, { ssr: false });
      expect(resolved).toBe(RESOLVED_VIRTUAL_MODULE_ID);
    });

    it('should not resolve other IDs', async () => {
      const plugin = brandAssetInjector({ cwd: CWD });
      const resolved = await plugin.resolveId?.('some-other-id', undefined, { ssr: false });
      expect(resolved).toBeNull();
    });
  });

  describe('load', () => {
    it('should load and merge brand data when brand.yaml exists', async () => {
      const brandYaml = yaml.dump(MOCK_BRAND_DATA);
      vol.fromJSON({ 'brand.yaml': brandYaml }, CWD);

      const plugin = brandAssetInjector({ cwd: CWD, _readFile: mockReadFile });
      const result = await plugin.load?.(RESOLVED_VIRTUAL_MODULE_ID, { ssr: false });

      const expectedModule = `export default ${JSON.stringify(MERGED_BRAND_DATA, null, 2)};`;
      expect(result).toBe(expectedModule);
    });

    it('should return default brand data when brand.yaml does not exist', async () => {
      const plugin = brandAssetInjector({ cwd: CWD, _readFile: mockReadFile });
      const result = await plugin.load?.(RESOLVED_VIRTUAL_MODULE_ID, { ssr: false });
      const expectedModule = `export default ${JSON.stringify(DEFAULT_BRAND, null, 2)};`;
      expect(result).toBe(expectedModule);
    });

    it('should return null for other module IDs', async () => {
      const plugin = brandAssetInjector({ cwd: CWD, _readFile: mockReadFile });
      const result = await plugin.load?.('some-other-id', { ssr: false });
      expect(result).toBeNull();
    });
  });
}); 