import { describe, it, expect } from 'vitest';
import { validateProjectName } from './validators.js';

describe('validateProjectName', () => {
  // 验证标准 1: 合法输入
  it('should return true for valid project names', () => {
    expect(validateProjectName('my-project')).toBe(true);
    expect(validateProjectName('astro-project')).toBe(true);
    expect(validateProjectName('a123')).toBe(true);
  });

  // 验证标准 2: 数字开头
  it('should return an error message for names starting with a number', () => {
    expect(typeof validateProjectName('123project')).toBe('string');
  });

  // 验证标准 3: 包含空格
  it('should return an error message for names containing spaces', () => {
    expect(typeof validateProjectName('my project')).toBe('string');
  });

  // 其他边界情况测试
  it('should return an error message for names containing uppercase letters', () => {
    expect(typeof validateProjectName('My-Project')).toBe('string');
  });

  it('should return an error message for names containing special characters', () => {
    expect(typeof validateProjectName('my_project!')).toBe('string');
  });

  it('should return an error message for empty names', () => {
    expect(typeof validateProjectName('')).toBe('string');
  });

  it('should return an error message for names starting with a hyphen', () => {
    expect(typeof validateProjectName('-my-project')).toBe('string');
  });
});
