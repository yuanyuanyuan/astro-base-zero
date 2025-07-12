import { defineCollection, z } from 'astro:content';

// 博客文章集合
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    author: z.string().default('test-project-store'),
    featured: z.boolean().default(false),
    readingTime: z.number().optional(),
  }),
});

// 作者信息集合
const authors = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    avatar: z.string().url(),
    bio: z.string(),
    social: z
      .object({
        website: z.string().url().optional(),
        twitter: z.string().optional(),
        github: z.string().optional(),
        email: z.string().email().optional(),
      })
      .optional(),
  }),
});

// 分类集合
const categories = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const collections = {
  blog,
  authors,
  categories,
};
