import Handlebars from 'handlebars';
import fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

// 注册Handlebars helpers
Handlebars.registerHelper('default', (value: any, defaultValue: any) => {
  return value || defaultValue;
});

Handlebars.registerHelper('if_exists', (value: any, options: any) => {
  if (value && value !== '') {
    return options.fn({});
  }
  return options.inverse({});
});

Handlebars.registerHelper('json', (context: any) => {
  return JSON.stringify(context);
});

export interface TemplateData {
  project: {
    name: string;
    description: string;
    type: string;
    repository: string;
  };
  brand: {
    personal: {
      name: string;
      displayName: string;
      avatar?: string;
      bio?: string;
      email: string;
      location?: string;
      profession?: string;
      company?: string;
      social?: {
        links: Array<{
          platform: string;
          label: string;
          url: string;
          icon: string;
        }>;
      };
    };
    visual: {
      colors: {
        primary: string;
        accent: string;
        secondary: string;
        background: string;
        text: string;
      };
      typography: {
        primaryFont: string;
        codeFont: string;
      };
      icons: {
        logo?: string;
        favicon?: string;
      };
    };
    defaults: {
      language: string;
      timezone: string;
    };
  };
}

/**
 * 编译模板字符串
 */
export function compileTemplate(
  templateContent: string,
  data: TemplateData
): string {
  try {
    const template = Handlebars.compile(templateContent);
    return template(data);
  } catch (error) {
    console.error('模板编译失败:', error);
    throw new Error(
      `模板编译失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 处理单个文件的模板替换
 */
export async function processTemplateFile(
  filePath: string,
  data: TemplateData
): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const processedContent = compileTemplate(content, data);
    await fs.writeFile(filePath, processedContent, 'utf-8');
  } catch (error) {
    console.error(`处理文件 ${filePath} 失败:`, error);
    throw error;
  }
}

/**
 * 获取需要处理的文件模式
 */
const TEMPLATE_FILE_PATTERNS = [
  '**/*.astro',
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.md',
  '**/*.mdx',
  '**/*.yaml',
  '**/*.yml',
  '**/*.json',
  '**/*.html',
  '**/*.css',
  '**/README.md',
  '**/package.json',
];

/**
 * 需要排除的目录和文件
 */
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.astro/**',
  '**/coverage/**',
  '**/.git/**',
  '**/*.min.js',
  '**/*.min.css',
];

/**
 * 处理整个项目目录的模板替换
 */
export async function processProjectTemplates(
  projectPath: string,
  data: TemplateData
): Promise<void> {
  console.log('开始处理项目模板...');

  try {
    // 获取所有需要处理的文件
    const files: string[] = [];

    for (const pattern of TEMPLATE_FILE_PATTERNS) {
      const matchedFiles = await glob(pattern, {
        cwd: projectPath,
        ignore: EXCLUDE_PATTERNS,
        absolute: true,
      });
      files.push(...matchedFiles);
    }

    // 去重
    const uniqueFiles = [...new Set(files)];

    console.log(`找到 ${uniqueFiles.length} 个文件需要处理`);

    // 处理每个文件
    for (const filePath of uniqueFiles) {
      try {
        await processTemplateFile(filePath, data);
        console.log(`✓ 处理完成: ${path.relative(projectPath, filePath)}`);
      } catch (error) {
        console.warn(
          `⚠ 跳过文件 ${path.relative(projectPath, filePath)}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log('✅ 项目模板处理完成');
  } catch (error) {
    console.error('处理项目模板失败:', error);
    throw error;
  }
}

/**
 * 创建模板数据
 */
export function createTemplateData(
  projectConfig: {
    name: string;
    description: string;
    type: string;
    repository?: string;
  },
  brandConfig: any
): TemplateData {
  return {
    project: {
      name: projectConfig.name,
      description: projectConfig.description,
      type: projectConfig.type,
      repository:
        projectConfig.repository ||
        `https://github.com/your-username/${projectConfig.name}`,
    },
    brand: {
      personal: {
        name: brandConfig?.personal?.name || projectConfig.name,
        displayName:
          brandConfig?.personal?.displayName ||
          brandConfig?.personal?.name ||
          projectConfig.name,
        avatar: brandConfig?.personal?.avatar || '',
        bio: brandConfig?.personal?.bio || '',
        email: brandConfig?.personal?.email || 'hello@example.com',
        location: brandConfig?.personal?.location || '',
        profession: brandConfig?.personal?.profession || '',
        company: brandConfig?.personal?.company || '',
        social: brandConfig?.personal?.social || { links: [] },
      },
      visual: {
        colors: {
          primary: brandConfig?.visual?.colors?.primary || '#3B82F6',
          accent: brandConfig?.visual?.colors?.accent || '#F59E0B',
          secondary: brandConfig?.visual?.colors?.secondary || '#6B7280',
          background: brandConfig?.visual?.colors?.background || '#FFFFFF',
          text: brandConfig?.visual?.colors?.text || '#1F2937',
        },
        typography: {
          primaryFont:
            brandConfig?.visual?.typography?.primaryFont ||
            'Inter, system-ui, sans-serif',
          codeFont:
            brandConfig?.visual?.typography?.codeFont ||
            'JetBrains Mono, Consolas, monospace',
        },
        icons: {
          logo: brandConfig?.visual?.icons?.logo || '',
          favicon: brandConfig?.visual?.icons?.favicon || '',
        },
      },
      defaults: {
        language: brandConfig?.defaults?.language || 'zh-CN',
        timezone: brandConfig?.defaults?.timezone || 'Asia/Shanghai',
      },
    },
  };
}
