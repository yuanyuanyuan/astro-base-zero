import path from 'node:path';
import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import yaml from 'js-yaml';
import { VIRTUAL_MODULE_ID, RESOLVED_VIRTUAL_MODULE_ID } from './constants';
import type { Brand } from './types';

// A simple default brand object to be used as a fallback.
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

interface BrandAssetInjectorOptions {
  cwd?: string;
  /** @internal For testing purposes */
  _readFile?: typeof readFile;
}

/**
 * Astro Base Brand Asset Injector Plugin.
 *
 * This Vite plugin is responsible for injecting brand assets into the Astro
 * application via a virtual module. It reads brand configuration from a
 * `brand.yaml` file in the project root and makes it available as `virtual:brand`.
 *
 * @param {object} [options] - The plugin options.
 * @param {string} [options.cwd=process.cwd()] - The working directory to resolve the brand store from.
 * @returns {Plugin} A Vite plugin object.
 */
export function brandAssetInjector({
  cwd = process.cwd(),
  _readFile = readFile,
}: BrandAssetInjectorOptions = {}): Plugin {
  const brandConfigPath = path.join(cwd, 'brand.yaml');

  return {
    name: 'astro-base:brand-injector',

    async resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      return null;
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        try {
          const fileContent = await _readFile(brandConfigPath, 'utf-8');
          const brandData = yaml.load(fileContent as string) as Partial<Brand>;
          // Deep merge the brand data with defaults
          const mergedBrand: Brand = {
            ...DEFAULT_BRAND,
            ...brandData,
            colors: {
              ...DEFAULT_BRAND.colors,
              ...brandData.colors,
            },
            fonts: {
              ...DEFAULT_BRAND.fonts,
              ...brandData.fonts,
            },
          };
          return `export default ${JSON.stringify(mergedBrand, null, 2)};`;
        } catch (error) {
          // If the file doesn't exist or is invalid, use defaults
          console.warn(`[astro-base:brand-injector] brand.yaml not found or invalid. Using default brand settings.`);
          return `export default ${JSON.stringify(DEFAULT_BRAND, null, 2)};`;
        }
      }
      return null;
    },

    configureServer(server) {
      server.watcher.add(brandConfigPath);
    },

    async handleHotUpdate({ file, server }) {
      if (file === brandConfigPath) {
        const module = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
        if (module) {
          server.moduleGraph.invalidateModule(module);
          server.ws.send({
            type: 'full-reload',
            path: '*',
          });
        }
      }
    },
  };
} 