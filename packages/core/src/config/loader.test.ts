import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { loadConfig, loadConfigWithInheritance } from './loader.js';
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

describe('loadConfigWithInheritance', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR);
    }
  });

  afterAll(() => {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('should merge multiple configuration files in order', () => {
    // Platform default config
    const platformConfigPath = path.join(TEST_DIR, 'platform.yaml');
    const platformConfig = `
meta:
  name: Default Project
theme:
  name: default
  primaryColor: '#000000'
features:
  blog: false
`;
    fs.writeFileSync(platformConfigPath, platformConfig);

    // Template config
    const templateConfigPath = path.join(TEST_DIR, 'template.yaml');
    const templateConfig = `
meta:
  description: Template description
theme:
  primaryColor: '#ff0000'
features:
  blog: true
  newsletter: false
`;
    fs.writeFileSync(templateConfigPath, templateConfig);

    // Project config
    const projectConfigPath = path.join(TEST_DIR, 'project.yaml');
    const projectConfig = `
meta:
  name: My Project
  repository: https://github.com/me/project
theme:
  primaryColor: '#00ff00'
`;
    fs.writeFileSync(projectConfigPath, projectConfig);

    const mergedConfig = loadConfigWithInheritance(ProjectConfigSchema, [
      platformConfigPath,
      templateConfigPath,
      projectConfigPath,
    ]);

    // Verify merged results
    expect(mergedConfig.meta.name).toBe('My Project'); // Overridden by project
    expect(mergedConfig.meta.description).toBe('Template description'); // From template
    expect(mergedConfig.meta.repository).toBe('https://github.com/me/project'); // From project
    expect(mergedConfig.theme.name).toBe('default'); // From platform
    expect(mergedConfig.theme.primaryColor).toBe('#00ff00'); // Overridden by project
    expect(mergedConfig.features?.blog).toBe(true); // From template
    expect(mergedConfig.features?.newsletter).toBe(false); // From template
  });

  it('should handle missing configuration files gracefully', () => {
    const existingConfigPath = path.join(TEST_DIR, 'existing.yaml');
    const existingConfig = `
meta:
  name: Existing Project
`;
    fs.writeFileSync(existingConfigPath, existingConfig);

    const nonExistentPath = path.join(TEST_DIR, 'non_existent.yaml');

    const mergedConfig = loadConfigWithInheritance(ProjectConfigSchema, [
      nonExistentPath, // This file doesn't exist, should be ignored
      existingConfigPath,
    ]);

    expect(mergedConfig.meta.name).toBe('Existing Project');
    expect(mergedConfig.theme.name).toBe('default'); // Default value should be applied
  });

  it('should validate the merged configuration against the schema', () => {
    const invalidConfigPath = path.join(TEST_DIR, 'invalid_merged.yaml');
    const invalidConfig = `
meta:
  name: Valid Project
  repository: invalid-url
`;
    fs.writeFileSync(invalidConfigPath, invalidConfig);

    expect(() =>
      loadConfigWithInheritance(ProjectConfigSchema, [invalidConfigPath])
    ).toThrow(/Invalid merged configuration/);
  });
}); 