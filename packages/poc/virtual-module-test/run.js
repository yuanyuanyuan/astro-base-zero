import { createServer } from 'vite';
import { createVirtualConfigPlugin } from './vite-plugin.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

async function runTest() {
  console.log('--- 启动虚拟模块验证测试 ---');

  // 创建一个临时的测试入口文件
  const testEntryContent = `
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
  `;
  const testEntryPath = path.resolve(process.cwd(), 'packages/poc/virtual-module-test/_test-runner.js');
  fs.writeFileSync(testEntryPath, testEntryContent);


  const server = await createServer({
    server: { middlewareMode: true },
    plugins: [createVirtualConfigPlugin()],
  });

  try {
    await server.ssrLoadModule(testEntryPath);
  } catch (e) {
    console.error('❌ 测试执行出错:', e);
    process.exit(1);
  } finally {
    await server.close();
    fs.unlinkSync(testEntryPath); // 清理临时文件
    console.log('\n--- 测试结束 ---');
  }
}

runTest(); 