/**
 * 验证项目名称是否合法
 * 规则：
 * 1. 必须以小写字母开头
 * 2. 只能包含小写字母、数字和连字符(-)
 * @param name - 项目名称
 * @returns 如果合法则返回 true，否则返回错误信息字符串
 */
import { z } from 'zod';
import { logger } from './logger.js';

export const SocialPlatformSchema = z.enum([
  'github',
  'twitter',
  'linkedin',
  'youtube',
  'bilibili',
  'weibo',
  'zhihu',
  'juejin',
  'csdn',
  'email',
  'website',
  'blog',
  'custom',
]);

export function validateProjectName(name: string): void {
  const validationResult = z
    .string()
    .min(1, 'Project name cannot be empty.')
    .regex(
      /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
      'Project name must be a valid npm package name.'
    )
    .safeParse(name);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map((e) => e.message);
    logger.error(`Project name "${name}" is invalid. ${errorMessages.join(' ')}`);
    process.exit(1);
  }
}
