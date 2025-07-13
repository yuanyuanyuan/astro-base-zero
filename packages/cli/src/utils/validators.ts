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

export function validateProjectName(name: string): true | string {
  const validationResult = z
    .string()
    .min(1, 'Project name cannot be empty.')
    .regex(
      /^[a-z][a-z0-9-]*$/,
      'Project name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens.'
    )
    .safeParse(name);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(e => e.message);
    return `Project name "${name}" is invalid. ${errorMessages.join(' ')}`;
  }
  
  return true;
}

/**
 * 验证项目名称并在失败时退出进程
 * @param name - 项目名称
 */
export function validateProjectNameOrExit(name: string): void {
  const result = validateProjectName(name);
  if (result !== true) {
    logger.error(result);
    process.exit(1);
  }
}
