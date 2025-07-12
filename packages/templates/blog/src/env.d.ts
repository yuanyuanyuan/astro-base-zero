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

// 博客相关类型定义
declare global {
  interface BlogPost {
    slug: string;
    data: {
      title: string;
      description: string;
      publishDate: Date;
      updatedDate?: Date;
      heroImage?: string;
      category: string;
      tags: string[];
      draft: boolean;
      author: string;
      featured: boolean;
      readingTime?: number;
    };
    body: string;
    render: () => Promise<{ Content: any; headings: any[] }>;
  }
}
