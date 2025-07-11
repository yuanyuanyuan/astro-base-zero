/**
 * 品牌资产数据模型
 * 
 * 基于产品需求文档v1-融合版中的数据契约定义
 * 支持个人品牌信息的结构化管理和类型安全
 * 
 * @version 1.0
 * @date 2025-01-11
 */

// =============================================================================
// 基础类型定义
// =============================================================================

/**
 * ISO 8601 日期时间字符串类型
 */
export type ISO8601 = string;

/**
 * URL 字符串类型
 */
export type URLString = string;

/**
 * 颜色值类型 (支持 hex、rgb、hsl 等格式)
 */
export type ColorValue = string;

/**
 * 电子邮件地址类型
 */
export type EmailAddress = string;

// =============================================================================
// 社交媒体链接定义
// =============================================================================

/**
 * 社交媒体平台类型
 */
export type SocialPlatform = 
  | 'github'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'bilibili'
  | 'weibo'
  | 'zhihu'
  | 'juejin'
  | 'csdn'
  | 'email'
  | 'website'
  | 'blog'
  | 'custom';

/**
 * 单个社交媒体链接
 */
export interface SocialLink {
  /** 平台类型 */
  platform: SocialPlatform;
  /** 显示名称 */
  label: string;
  /** 链接地址 */
  url: URLString;
  /** 图标 (可选, 支持 URL 或 icon name) */
  icon?: string;
  /** 是否在新窗口打开 */
  openInNewTab?: boolean;
  /** 排序权重 */
  order?: number;
}

/**
 * 社交媒体链接集合
 */
export interface SocialLinks {
  /** 所有社交链接 */
  links: SocialLink[];
  /** 主要展示的链接数量 */
  primaryCount?: number;
  /** 是否显示"更多"按钮 */
  showMoreButton?: boolean;
}

// =============================================================================
// 个人信息定义
// =============================================================================

/**
 * 个人基本信息
 */
export interface PersonalInfo {
  /** 姓名/昵称 */
  name: string;
  /** 显示名称（用于公开展示，默认使用 name） */
  displayName?: string;
  /** 头像 URL */
  avatar: URLString;
  /** 个人简介/标语 */
  bio: string;
  /** 详细描述 */
  description?: string;
  /** 电子邮件 */
  email: EmailAddress;
  /** 所在位置 */
  location?: string;
  /** 时区 */
  timezone?: string;
  /** 职业/职位 */
  profession?: string;
  /** 公司/组织 */
  company?: string;
  /** 技能标签 */
  skills?: string[];
  /** 兴趣爱好 */
  interests?: string[];
  /** 社交媒体链接 */
  social: SocialLinks;
}

// =============================================================================
// 视觉品牌定义
// =============================================================================

/**
 * 品牌色彩方案
 */
export interface BrandColors {
  /** 主色调 */
  primary: ColorValue;
  /** 强调色 */
  accent: ColorValue;
  /** 次要色调 */
  secondary?: ColorValue;
  /** 背景色 */
  background?: ColorValue;
  /** 文本色 */
  text?: ColorValue;
  /** 边框色 */
  border?: ColorValue;
  /** 成功状态色 */
  success?: ColorValue;
  /** 警告状态色 */
  warning?: ColorValue;
  /** 错误状态色 */
  error?: ColorValue;
}

/**
 * 品牌字体配置
 */
export interface BrandTypography {
  /** 主要字体族 */
  primaryFont?: string;
  /** 次要字体族 */
  secondaryFont?: string;
  /** 代码字体族 */
  codeFont?: string;
  /** 字体大小比例 */
  scale?: number;
  /** 行高比例 */
  lineHeight?: number;
}

/**
 * 品牌图标资产
 */
export interface BrandIcons {
  /** Logo URL */
  logo?: URLString;
  /** Logo (深色模式) */
  logoDark?: URLString;
  /** Favicon URL */
  favicon?: URLString;
  /** 应用图标 URL */
  appIcon?: URLString;
  /** 水印图标 URL */
  watermark?: URLString;
}

/**
 * 视觉品牌配置
 */
export interface VisualBrand {
  /** 品牌色彩 */
  colors: BrandColors;
  /** 字体配置 */
  typography?: BrandTypography;
  /** 图标资产 */
  icons?: BrandIcons;
  /** 品牌样式主题名称 */
  themeName?: string;
  /** 是否支持深色模式 */
  supportDarkMode?: boolean;
  /** 圆角风格 (none, small, medium, large) */
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  /** 阴影风格 (none, subtle, normal, strong) */
  shadowStyle?: 'none' | 'subtle' | 'normal' | 'strong';
}

// =============================================================================
// 品牌默认值定义
// =============================================================================

/**
 * 品牌默认配置
 */
export interface BrandDefaults {
  /** 许可证类型 */
  license: string;
  /** 版权声明文本 */
  copyrightText: string;
  /** 分析服务 ID (Google Analytics 等) */
  analyticsId?: string;
  /** 默认语言 */
  language?: string;
  /** 默认时区 */
  timezone?: string;
  /** SEO 默认关键词 */
  defaultKeywords?: string[];
  /** 默认作者信息 */
  defaultAuthor?: string;
}

// =============================================================================
// 项目适配配置
// =============================================================================

/**
 * 项目类型特定的品牌配置
 */
export interface ProjectTypeBranding {
  /** 项目类型 */
  projectType: 'demo' | 'tool' | 'showcase' | 'blog' | 'docs' | 'portfolio';
  /** 该类型项目的默认配置覆盖 */
  overrides?: Partial<Brand>;
  /** 特定的模板变量 */
  templateVariables?: Record<string, any>;
}

// =============================================================================
// 核心品牌资产接口
// =============================================================================

/**
 * 完整的品牌资产配置
 * 这是系统中品牌管理的核心数据结构
 */
export interface Brand {
  /** 品牌配置版本 (用于配置迁移) */
  version: string;
  /** 配置创建时间 */
  createdAt: ISO8601;
  /** 最后更新时间 */
  updatedAt: ISO8601;
  /** 个人信息 */
  personal: PersonalInfo;
  /** 视觉品牌 */
  visual: VisualBrand;
  /** 品牌默认值 */
  defaults: BrandDefaults;
  /** 项目类型特定配置 */
  projectTypes?: ProjectTypeBranding[];
  /** 自定义字段 (扩展性支持) */
  custom?: Record<string, any>;
}

// =============================================================================
// 品牌配置操作接口
// =============================================================================

/**
 * 品牌配置验证结果
 */
export interface BrandValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 错误信息列表 */
  errors: string[];
  /** 警告信息列表 */
  warnings: string[];
  /** 缺失的必填字段 */
  missingFields: string[];
}

/**
 * 品牌配置更新选项
 */
export interface BrandUpdateOptions {
  /** 是否合并更新（而非完全替换） */
  merge?: boolean;
  /** 是否验证更新后的配置 */
  validate?: boolean;
  /** 是否自动更新 updatedAt 时间戳 */
  updateTimestamp?: boolean;
  /** 是否创建备份 */
  createBackup?: boolean;
}

// =============================================================================
// 模板注入相关类型
// =============================================================================

/**
 * 模板变量上下文
 * 用于模板文件中的占位符替换
 */
export interface TemplateContext {
  /** 品牌资产 */
  brand: Brand;
  /** 项目特定信息 */
  project?: {
    name: string;
    description: string;
    type: string;
    [key: string]: any;
  };
  /** 生成时间戳 */
  generatedAt: ISO8601;
  /** 额外的上下文数据 */
  extra?: Record<string, any>;
}

/**
 * 模板占位符配置
 */
export interface TemplatePlaceholder {
  /** 占位符模式 (如 {{brand.personal.name}}) */
  pattern: string;
  /** 对应的数据路径 */
  path: string;
  /** 默认值 (如果数据不存在) */
  defaultValue?: string;
  /** 是否为必需字段 */
  required?: boolean;
  /** 数据转换函数名 */
  transformer?: string;
}

// =============================================================================
// 所有类型定义已通过 export 关键字导出，无需重复声明
// ============================================================================= 