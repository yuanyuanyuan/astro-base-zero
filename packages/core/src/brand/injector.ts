import path from 'node:path';
import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import yaml from 'js-yaml';
import { VIRTUAL_MODULE_ID, RESOLVED_VIRTUAL_MODULE_ID } from './constants.js';
import { createDefaultBrandAssets } from './store.js';
import type { Brand } from './types.js';

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
  const DEFAULT_BRAND = createDefaultBrandAssets();

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

          // Deep merge with structured data
          const mergedBrand: Brand = {
            ...DEFAULT_BRAND,
            ...brandData,
            personal: {
              ...DEFAULT_BRAND.personal,
              ...(brandData.personal || {}),
              social: {
                ...DEFAULT_BRAND.personal.social,
                ...((brandData.personal && brandData.personal.social) || {}),
                links: [
                  ...DEFAULT_BRAND.personal.social.links,
                  ...((brandData.personal &&
                    brandData.personal.social &&
                    brandData.personal.social.links) ||
                    []),
                ],
              },
            },
            visual: {
              ...DEFAULT_BRAND.visual,
              ...(brandData.visual || {}),
              colors: {
                ...DEFAULT_BRAND.visual.colors,
                ...((brandData.visual && brandData.visual.colors) || {}),
              },
              typography: {
                ...DEFAULT_BRAND.visual.typography,
                ...((brandData.visual && brandData.visual.typography) || {}),
              },
              icons: {
                ...DEFAULT_BRAND.visual.icons,
                ...((brandData.visual && brandData.visual.icons) || {}),
              },
            },
            defaults: {
              ...DEFAULT_BRAND.defaults,
              ...(brandData.defaults || {}),
            },
          };

          return `export default ${JSON.stringify(mergedBrand, null, 2)};`;
        } catch (error) {
          // If the file doesn't exist or is invalid, use defaults
          console.warn(
            `[astro-base:brand-injector] brand.yaml not found or invalid. Using default brand settings.`
          );
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
        const module = server.moduleGraph.getModuleById(
          RESOLVED_VIRTUAL_MODULE_ID
        );
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
