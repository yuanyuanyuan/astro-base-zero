import { describe, it, expect } from 'vitest';
import { PlatformConfigSchema, ProjectConfigSchema } from './schema.js';

describe('Configuration Schemas', () => {
  describe('PlatformConfigSchema', () => {
    it('should parse a valid platform config', () => {
      const validConfig = {
        brand: {
          personal: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: 'https://example.com/avatar.png',
          },
          socials: {
            github: 'https://github.com/johndoe',
          },
        },
      };
      const result = PlatformConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should fail parsing when required fields are missing', () => {
      const invalidConfig = {
        brand: {
          personal: {
            // name is missing
            email: 'john.doe@example.com',
          },
        },
      };
      const result = PlatformConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });
  });

  describe('ProjectConfigSchema', () => {
    it('should parse a valid project config', () => {
      const validConfig = {
        meta: {
          name: 'My Awesome Project',
          repository: 'https://github.com/me/awesome-project',
        },
        theme: {
          name: 'custom',
          primaryColor: '#ff0000',
        },
        features: {
          blog: true,
          newsletter: false,
        },
      };
      const result = ProjectConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should fail parsing with an invalid URL', () => {
      const invalidConfig = {
        meta: {
          name: 'My Awesome Project',
          repository: 'not-a-valid-url',
        },
      };
      const result = ProjectConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const configWithDefaults = {
        meta: {
          name: 'My Project',
        },
      };
      const result = ProjectConfigSchema.parse(configWithDefaults);
      expect(result.theme.name).toBe('default');
    });
  });
}); 