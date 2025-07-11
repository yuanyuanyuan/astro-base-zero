import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function createVirtualConfigPlugin() {
  const virtualModuleId = 'virtual:config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-virtual-config',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const configPath = path.resolve(process.cwd(), 'packages/poc/virtual-module-test/config.yaml');
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(configContent);
        
        return `export const config = ${JSON.stringify(config)};`;
      }
    },
  };
} 