import { z } from 'zod';

// 平台级配置，主要包含用户的个人品牌信息
export const PlatformConfigSchema = z.object({
  brand: z.object({
    personal: z.object({
      name: z.string().min(1, '个人姓名不能为空'),
      avatar: z.string().url('头像必须是有效的URL').optional(),
      bio: z.string().optional(),
      email: z.string().email('请输入有效的邮箱地址').optional(),
    }),
    socials: z.record(z.string().url()).optional(),
  }),
});

// 项目级配置
export const ProjectConfigSchema = z.object({
  meta: z.object({
    name: z.string().min(1, '项目名称不能为空'),
    description: z.string().optional(),
    repository: z.string().url('仓库地址必须是有效的URL').optional(),
  }),
  theme: z.object({
    name: z.string().default('default'),
    primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, '颜色必须是十六进制格式').optional(),
  }).default({}),
  features: z.record(z.boolean()).optional(),
});

// 类型推断
export type PlatformConfig = z.infer<typeof PlatformConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>; 