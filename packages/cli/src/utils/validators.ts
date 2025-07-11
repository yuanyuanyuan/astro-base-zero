/**
 * 验证项目名称是否合法
 * 规则：
 * 1. 必须以小写字母开头
 * 2. 只能包含小写字母、数字和连字符(-)
 * @param name - 项目名称
 * @returns 如果合法则返回 true，否则返回错误信息字符串
 */
export function validateProjectName(name: string): boolean | string {
  const validationRegex = /^[a-z][a-z0-9-]*$/;
  if (validationRegex.test(name)) {
    return true;
  }
  return '项目名称必须以小写字母开头，并且只能包含小写字母、数字和连字符(-)。';
}
