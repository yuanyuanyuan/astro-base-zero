/**
 * 模板处理系统类型定义
 *
 * 支持模板文件的变量替换和动态生成
 *
 * @version 1.0
 * @date 2025-01-11
 */

import type { Brand } from '../brand/types.js';

// =============================================================================
// 模板上下文类型
// =============================================================================

/**
 * 项目信息接口
 */
export interface ProjectInfo {
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 项目类型 */
  type: 'demo' | 'tool' | 'showcase' | 'blog' | 'docs' | 'portfolio';
  /** 项目仓库地址 */
  repository?: string;
  /** 项目网站地址 */
  site?: string;
  /** 基础路径 */
  base?: string;
  /** 项目关键词 */
  keywords?: string[];
  /** 项目作者 */
  author?: string;
  /** 项目版本 */
  version?: string;
  /** 项目许可证 */
  license?: string;
}

/**
 * 模板上下文 - 用于模板变量替换
 */
export interface TemplateContext {
  /** 品牌资产信息 */
  brand: Brand;
  /** 项目信息 */
  project: ProjectInfo;
  /** 生成时间戳 */
  generatedAt: string;
  /** 模板元数据 */
  template?: TemplateMetadata;
  /** 额外的自定义数据 */
  custom?: Record<string, any>;
}

// =============================================================================
// 模板元数据类型
// =============================================================================

/**
 * 模板元数据接口
 */
export interface TemplateMetadata {
  /** 模板名称 */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 模板描述 */
  description: string;
  /** 模板版本 */
  version: string;
  /** 模板作者 */
  author: string;
  /** 模板分类 */
  category: string;
  /** 模板标签 */
  tags: string[];
  /** 预览图片 */
  preview?: string;
  /** 特性列表 */
  features: string[];
  /** 依赖项 */
  dependencies: Record<string, string>;
  /** 引擎要求 */
  engines: Record<string, string>;
  /** 支持的项目类型 */
  projectTypes: string[];
  /** 脚手架配置 */
  scaffolding: ScaffoldingConfig;
}

/**
 * 脚手架配置
 */
export interface ScaffoldingConfig {
  /** 需要处理的文件列表 */
  files: string[];
  /** 需要创建的目录列表 */
  directories: string[];
  /** 需要忽略的文件/目录 */
  ignore?: string[];
  /** 自定义处理规则 */
  rules?: Record<string, any>;
}

// =============================================================================
// 模板处理配置
// =============================================================================

/**
 * 模板处理选项
 */
export interface TemplateRenderOptions {
  /** 源模板目录路径 */
  sourcePath: string;
  /** 目标输出目录路径 */
  outputPath: string;
  /** 模板上下文数据 */
  context: TemplateContext;
  /** 是否覆盖已存在的文件 */
  overwrite?: boolean;
  /** 需要忽略的文件模式 */
  ignore?: string[];
  /** 自定义处理器 */
  processors?: Record<string, FileProcessor>;
  /** 是否在输出前验证 */
  validate?: boolean;
}

/**
 * 文件处理器接口
 */
export interface FileProcessor {
  /** 处理器名称 */
  name: string;
  /** 支持的文件扩展名 */
  extensions: string[];
  /** 处理函数 */
  process: (
    content: string,
    context: TemplateContext,
    filePath: string
  ) => Promise<string>;
}

// =============================================================================
// 模板发现和管理
// =============================================================================

/**
 * 模板源配置
 */
export interface TemplateSource {
  /** 源类型 */
  type: 'local' | 'git' | 'npm' | 'url';
  /** 源地址 */
  url: string;
  /** 本地缓存路径 */
  cachePath?: string;
  /** 认证信息 */
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
}

/**
 * 模板发现结果
 */
export interface TemplateDiscoveryResult {
  /** 可用的模板列表 */
  templates: DiscoveredTemplate[];
  /** 扫描时间 */
  scannedAt: string;
  /** 错误信息 */
  errors?: string[];
}

/**
 * 发现的模板信息
 */
export interface DiscoveredTemplate {
  /** 模板标识符 */
  id: string;
  /** 模板元数据 */
  metadata: TemplateMetadata;
  /** 模板源信息 */
  source: TemplateSource;
  /** 模板路径 */
  path: string;
  /** 是否已缓存 */
  cached: boolean;
}

// =============================================================================
// 模板验证和错误处理
// =============================================================================

/**
 * 模板验证结果
 */
export interface TemplateValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误列表 */
  errors: TemplateValidationError[];
  /** 警告列表 */
  warnings: string[];
  /** 验证的文件数量 */
  filesValidated: number;
}

/**
 * 模板验证错误
 */
export interface TemplateValidationError {
  /** 错误类型 */
  type: 'syntax' | 'reference' | 'dependency' | 'structure';
  /** 错误信息 */
  message: string;
  /** 错误文件路径 */
  file?: string;
  /** 错误行号 */
  line?: number;
  /** 错误列号 */
  column?: number;
}

// =============================================================================
// 渲染状态和进度
// =============================================================================

/**
 * 模板渲染状态
 */
export type TemplateRenderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'error';

/**
 * 模板渲染进度
 */
export interface TemplateRenderProgress {
  /** 当前状态 */
  status: TemplateRenderStatus;
  /** 总文件数 */
  totalFiles: number;
  /** 已处理文件数 */
  processedFiles: number;
  /** 当前处理的文件 */
  currentFile?: string;
  /** 错误信息 */
  error?: string;
  /** 开始时间 */
  startTime: Date;
  /** 结束时间 */
  endTime?: Date;
}

/**
 * 模板渲染回调函数
 */
export type TemplateRenderCallback = (progress: TemplateRenderProgress) => void;
