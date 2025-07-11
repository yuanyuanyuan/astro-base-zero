/**
 * 模板文件渲染器
 * 
 * 处理整个模板目录的文件生成和变量替换
 * 支持文件过滤、路径映射和进度回调
 * 
 * @version 1.0
 * @date 2025-01-11
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import type {
  TemplateRenderOptions,
  TemplateContext,
  FileProcessor,
  TemplateRenderProgress,
  TemplateRenderCallback,
  TemplateValidationResult,
  TemplateValidationError,
} from './types.js';
import { defaultTemplateEngine, TemplateEngine } from './engine.js';

// =============================================================================
// 文件处理器
// =============================================================================

/**
 * 默认文件处理器
 */
const defaultProcessors: Record<string, FileProcessor> = {
  // 文本文件处理器（支持模板变量）
  text: {
    name: 'text',
    extensions: ['.md', '.txt', '.yml', '.yaml', '.json', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.html', '.css', '.scss', '.sass', '.less'],
    process: async (content: string, context: TemplateContext) => {
      return defaultTemplateEngine.render(content, context);
    },
  },

  // 二进制文件处理器（直接复制）
  binary: {
    name: 'binary',
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar.gz'],
    process: async (content: string) => {
      return content; // 二进制文件不做处理
    },
  },
};

// =============================================================================
// 模板文件渲染器类
// =============================================================================

/**
 * 模板文件渲染器
 */
export class TemplateRenderer {
  private engine: TemplateEngine;
  private processors: Record<string, FileProcessor>;

  constructor(engine?: TemplateEngine) {
    this.engine = engine || defaultTemplateEngine;
    this.processors = { ...defaultProcessors };
  }

  /**
   * 渲染整个模板目录
   * @param options 渲染选项
   * @param callback 进度回调
   * @returns 渲染结果
   */
  async renderTemplate(
    options: TemplateRenderOptions,
    callback?: TemplateRenderCallback
  ): Promise<TemplateRenderProgress> {
    const progress: TemplateRenderProgress = {
      status: 'pending',
      totalFiles: 0,
      processedFiles: 0,
      startTime: new Date(),
    };

    try {
      // 更新状态
      progress.status = 'processing';
      callback?.(progress);

      // 确保输出目录存在
      await fs.mkdir(options.outputPath, { recursive: true });

      // 获取所有需要处理的文件
      const files = await this.getFiles(options.sourcePath, options.ignore);
      progress.totalFiles = files.length;
      callback?.(progress);

      // 处理每个文件
      for (const file of files) {
        progress.currentFile = file;
        callback?.(progress);

        await this.processFile(file, options);
        
        progress.processedFiles++;
        callback?.(progress);
      }

      // 完成
      progress.status = 'completed';
      progress.endTime = new Date();
      callback?.(progress);

      return progress;

    } catch (error) {
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : String(error);
      progress.endTime = new Date();
      callback?.(progress);
      throw error;
    }
  }

  /**
   * 处理单个文件
   * @param relativePath 相对路径
   * @param options 渲染选项
   */
  private async processFile(relativePath: string, options: TemplateRenderOptions): Promise<void> {
    const sourcePath = path.join(options.sourcePath, relativePath);
    const outputPath = path.join(options.outputPath, this.processPath(relativePath, options.context));

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // 检查是否需要覆盖
    if (!options.overwrite && await this.fileExists(outputPath)) {
      return;
    }

    // 获取文件处理器
    const processor = this.getProcessor(relativePath);
    const stats = await fs.stat(sourcePath);

    if (stats.isDirectory()) {
      // 创建目录
      await fs.mkdir(outputPath, { recursive: true });
    } else {
      // 处理文件
      if (this.isBinaryFile(relativePath)) {
        // 二进制文件直接复制
        await fs.copyFile(sourcePath, outputPath);
      } else {
        // 文本文件进行模板处理
        const content = await fs.readFile(sourcePath, 'utf-8');
        const processedContent = await processor.process(content, options.context, relativePath);
        await fs.writeFile(outputPath, processedContent, 'utf-8');
      }
    }
  }

  /**
   * 处理路径模板变量
   * @param filePath 文件路径
   * @param context 模板上下文
   * @returns 处理后的路径
   */
  private processPath(filePath: string, context: TemplateContext): string {
    // 处理路径中的模板变量
    return this.engine.render(filePath, context);
  }

  /**
   * 获取所有需要处理的文件
   * @param sourcePath 源目录
   * @param ignore 忽略模式
   * @returns 文件列表
   */
  private async getFiles(sourcePath: string, ignore: string[] = []): Promise<string[]> {
    const defaultIgnore = [
      'node_modules/**',
      '.git/**',
      '.DS_Store',
      'Thumbs.db',
      '*.log',
      '.env*',
      'dist/**',
      'build/**',
      '.turbo/**',
    ];

    const allIgnore = [...defaultIgnore, ...ignore];
    
    const files = await glob('**/*', {
      cwd: sourcePath,
      ignore: allIgnore,
      dot: true,
    });

    return files;
  }

  /**
   * 获取文件处理器
   * @param filePath 文件路径
   * @returns 文件处理器
   */
  private getProcessor(filePath: string): FileProcessor {
    const ext = path.extname(filePath).toLowerCase();
    
    // 查找匹配的处理器
    for (const processor of Object.values(this.processors)) {
      if (processor.extensions.includes(ext)) {
        return processor;
      }
    }

    // 默认使用文本处理器
    return this.processors.text;
  }

  /**
   * 判断是否为二进制文件
   * @param filePath 文件路径
   * @returns 是否为二进制文件
   */
  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return this.processors.binary.extensions.includes(ext);
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 注册自定义文件处理器
   * @param processor 文件处理器
   */
  registerProcessor(processor: FileProcessor): void {
    this.processors[processor.name] = processor;
  }

  /**
   * 验证模板
   * @param templatePath 模板路径
   * @param context 模板上下文
   * @returns 验证结果
   */
  async validateTemplate(templatePath: string, context: TemplateContext): Promise<TemplateValidationResult> {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      filesValidated: 0,
    };

    try {
      const files = await this.getFiles(templatePath);
      
      for (const file of files) {
        const filePath = path.join(templatePath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile() && !this.isBinaryFile(file)) {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            
            // 尝试编译模板
            this.engine.compile(content);
            
            // 尝试渲染模板
            this.engine.render(content, context);
            
            result.filesValidated++;
          } catch (error) {
            result.isValid = false;
            result.errors.push({
              type: 'syntax',
              message: error instanceof Error ? error.message : String(error),
              file,
            });
          }
        }
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push({
        type: 'structure',
        message: `模板目录验证失败: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return result;
  }
}

// =============================================================================
// 导出默认实例和便捷函数
// =============================================================================

/**
 * 默认模板渲染器实例
 */
export const defaultTemplateRenderer = new TemplateRenderer();

/**
 * 便捷的模板渲染函数
 * @param options 渲染选项
 * @param callback 进度回调
 * @returns 渲染结果
 */
export async function renderTemplate(
  options: TemplateRenderOptions,
  callback?: TemplateRenderCallback
): Promise<TemplateRenderProgress> {
  return defaultTemplateRenderer.renderTemplate(options, callback);
} 