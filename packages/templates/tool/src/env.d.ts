/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// 品牌资产类型定义
declare module 'virtual:brand-config' {
  export interface BrandConfig {
    personal: {
      name: string;
      displayName?: string;
      avatar: string;
      bio: string;
      email: string;
      location?: string;
      profession?: string;
      company?: string;
    };
    social: {
      links: Array<{
        platform: string;
        label: string;
        url: string;
        icon?: string;
      }>;
    };
    visual: {
      colors: {
        primary: string;
        accent: string;
        [key: string]: string;
      };
    };
  }

  const brand: BrandConfig;
  export default brand;
}

// 工具相关类型定义
declare global {
  interface ToolConfig {
    category: string;
    tags: string[];
    showUsageStats: boolean;
    enableFeedback: boolean;
    showSourceCode: boolean;
    features: string[];
  }

  interface UsageStats {
    totalUses: number;
    dailyUses: number;
    lastUsed: Date;
  }
}
