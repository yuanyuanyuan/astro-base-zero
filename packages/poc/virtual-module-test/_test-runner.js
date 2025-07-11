
    import { config } from 'virtual:config';
    import fs from 'fs';
    import path from 'path';
    import yaml from 'js-yaml';

    console.log('成功从虚拟模块加载配置:', config);

    const originalConfigPath = path.resolve(process.cwd(), 'packages/poc/virtual-module-test/config.yaml');
    const originalConfigContent = fs.readFileSync(originalConfigPath, 'utf8');
    const originalConfig = yaml.load(originalConfigContent);

    if (JSON.stringify(config) === JSON.stringify(originalConfig)) {
      console.log('✅ 验证成功：加载的配置与源文件内容一致。');
      process.exit(0);
    } else {
      console.error('❌ 验证失败：加载的配置与源文件不匹配。');
      process.exit(1);
    }
  