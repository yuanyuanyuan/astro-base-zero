import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from './loader.js';
import { ProjectConfigSchema } from './schema.js';

const TEST_DIR = path.join(__dirname, 'test_configs');

describe('loadConfig', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR);
    }
  });

  afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should load and validate a correct YAML file', () => {
    const validConfigPath = path.join(TEST_DIR, 'valid.yaml');
    const yamlContent = `
meta:
  name: Test Project
  repository: https://github.com/test/project
theme:
  primaryColor: '#aabbcc'
`;
    fs.writeFileSync(validConfigPath, yamlContent);

    const config = loadConfig(ProjectConfigSchema, validConfigPath);
    expect(config.meta.name).toBe('Test Project');
    expect(config.theme.name).toBe('default'); // Default value should be applied
  });

  it('should throw an error for a file with schema violations', () => {
    const invalidSchemaPath = path.join(TEST_DIR, 'invalid_schema.yaml');
    const yamlContent = `
meta:
  name: Test Project
  repository: not-a-url 
`;
    fs.writeFileSync(invalidSchemaPath, yamlContent);

    expect(() => loadConfig(ProjectConfigSchema, invalidSchemaPath)).toThrow(
      /Invalid configuration/
    );
  });

  it('should throw an error for a file with invalid YAML syntax', () => {
    const invalidSyntaxPath = path.join(TEST_DIR, 'invalid_syntax.yaml');
    const yamlContent = `
meta:
  name: 'Unclosed Quote
`;
    fs.writeFileSync(invalidSyntaxPath, yamlContent);

    expect(() => loadConfig(ProjectConfigSchema, invalidSyntaxPath)).toThrow();
  });

  it('should throw an error for a non-existent file', () => {
    const nonExistentPath = path.join(TEST_DIR, 'non_existent.yaml');
    expect(() => loadConfig(ProjectConfigSchema, nonExistentPath)).toThrow(
      /no such file or directory/
    );
  });
}); 