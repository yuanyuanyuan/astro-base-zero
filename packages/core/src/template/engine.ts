/**
 * 模板引擎实现
 *
 * 基于 Handlebars 的模板变量替换引擎
 * 支持复杂的数据结构和自定义 Helper 函数
 *
 * @version 1.0
 * @date 2025-01-11
 */

import Handlebars from 'handlebars';
import type { TemplateContext } from './types.js';

// =============================================================================
// 模板引擎类
// =============================================================================

/**
 * 模板引擎主类
 */
export class TemplateEngine {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerBuiltinHelpers();
  }

  /**
   * 渲染模板字符串
   * @param template 模板字符串
   * @param context 模板上下文
   * @returns 渲染后的字符串
   */
  render(template: string, context: TemplateContext): string {
    try {
      const compiledTemplate = this.handlebars.compile(template);
      return compiledTemplate(context);
    } catch (error) {
      throw new Error(
        `模板渲染失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 编译模板（缓存优化）
   * @param template 模板字符串
   * @returns 编译后的模板函数
   */
  compile(template: string): Handlebars.TemplateDelegate {
    return this.handlebars.compile(template);
  }

  /**
   * 注册自定义 Helper
   * @param name Helper 名称
   * @param fn Helper 函数
   */
  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn);
  }

  /**
   * 注册多个 Helper
   * @param helpers Helper 对象
   */
  registerHelpers(helpers: Record<string, Handlebars.HelperDelegate>): void {
    Object.entries(helpers).forEach(([name, fn]) => {
      this.registerHelper(name, fn);
    });
  }

  /**
   * 注册内置 Helper 函数
   */
  private registerBuiltinHelpers(): void {
    // 字符串处理 Helper
    this.handlebars.registerHelper('upperCase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    this.handlebars.registerHelper('lowerCase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    this.handlebars.registerHelper('capitalize', (str: string) => {
      return str
        ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
        : '';
    });

    this.handlebars.registerHelper('kebabCase', (str: string) => {
      return str ? str.replace(/\s+/g, '-').toLowerCase() : '';
    });

    this.handlebars.registerHelper('camelCase', (str: string) => {
      return str
        ? str.replace(/[-_\s]+(.)?/g, (_, char) =>
            char ? char.toUpperCase() : ''
          )
        : '';
    });

    this.handlebars.registerHelper('pascalCase', (str: string) => {
      const camelCase = str
        ? str.replace(/[-_\s]+(.)?/g, (_, char) =>
            char ? char.toUpperCase() : ''
          )
        : '';
      return camelCase
        ? camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
        : '';
    });

    // 数组和对象处理 Helper
    this.handlebars.registerHelper('length', (array: any[]) => {
      return Array.isArray(array) ? array.length : 0;
    });

    this.handlebars.registerHelper('join', (array: any[], separator = ', ') => {
      return Array.isArray(array) ? array.join(separator) : '';
    });

    this.handlebars.registerHelper('pick', (obj: any, key: string) => {
      return obj && typeof obj === 'object' ? obj[key] : '';
    });

    // 条件判断 Helper
    this.handlebars.registerHelper(
      'ifEquals',
      function (this: any, arg1: any, arg2: any, options: any) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      }
    );

    this.handlebars.registerHelper(
      'ifContains',
      function (this: any, array: any[], item: any, options: any) {
        if (Array.isArray(array) && array.includes(item)) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
    );

    this.handlebars.registerHelper(
      'ifEmpty',
      function (this: any, value: any, options: any) {
        const isEmpty =
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0) ||
          (typeof value === 'string' && value.trim() === '');

        return isEmpty ? options.fn(this) : options.inverse(this);
      }
    );

    // 日期处理 Helper
    this.handlebars.registerHelper(
      'formatDate',
      (date: string | Date, format = 'YYYY-MM-DD') => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        // 简单的日期格式化（可以后续集成 date-fns 等库）
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return format
          .replace('YYYY', String(year))
          .replace('MM', month)
          .replace('DD', day);
      }
    );

    this.handlebars.registerHelper('now', (format = 'YYYY-MM-DD') => {
      return this.handlebars.helpers.formatDate(new Date(), format);
    });

    // URL 和路径处理 Helper
    this.handlebars.registerHelper('urlJoin', function (...args: any[]) {
      // 移除最后一个参数（Handlebars 选项对象）
      const paths = args.slice(0, -1);
      return paths
        .map(path => String(path).replace(/^\/+|\/+$/g, ''))
        .filter(Boolean)
        .join('/');
    });

    this.handlebars.registerHelper(
      'absoluteUrl',
      (path: string, baseUrl: string) => {
        if (!path) return baseUrl || '';
        if (path.startsWith('http')) return path;

        const base = (baseUrl || '').replace(/\/+$/, '');
        const normalizedPath = String(path).replace(/^\/+/, '');

        return `${base}/${normalizedPath}`;
      }
    );

    // 编码 Helper
    this.handlebars.registerHelper('encodeURIComponent', (str: string) => {
      return str ? encodeURIComponent(str) : '';
    });

    this.handlebars.registerHelper('decodeURIComponent', (str: string) => {
      try {
        return str ? decodeURIComponent(str) : '';
      } catch {
        return str;
      }
    });

    // JSON 处理 Helper
    this.handlebars.registerHelper('json', (obj: any, indent = 0) => {
      try {
        return JSON.stringify(obj, null, indent);
      } catch {
        return '{}';
      }
    });

    // 数学运算 Helper
    this.handlebars.registerHelper('add', (a: number, b: number) => {
      return (Number(a) || 0) + (Number(b) || 0);
    });

    this.handlebars.registerHelper('subtract', (a: number, b: number) => {
      return (Number(a) || 0) - (Number(b) || 0);
    });

    this.handlebars.registerHelper('multiply', (a: number, b: number) => {
      return (Number(a) || 0) * (Number(b) || 0);
    });

    this.handlebars.registerHelper('divide', (a: number, b: number) => {
      const divisor = Number(b);
      return divisor !== 0 ? (Number(a) || 0) / divisor : 0;
    });

    // 调试 Helper
    this.handlebars.registerHelper('debug', (obj: any) => {
      console.log('Handlebars Debug:', obj);
      return '';
    });

    this.handlebars.registerHelper('typeof', (obj: any) => {
      return typeof obj;
    });
  }
}

// =============================================================================
// 导出默认实例
// =============================================================================

/**
 * 默认模板引擎实例
 */
export const defaultTemplateEngine = new TemplateEngine();

/**
 * 便捷的渲染函数
 * @param template 模板字符串
 * @param context 模板上下文
 * @returns 渲染后的字符串
 */
export function renderTemplate(
  template: string,
  context: TemplateContext
): string {
  return defaultTemplateEngine.render(template, context);
}
