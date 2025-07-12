import fs from 'node:fs';
import YAML from 'yaml';
import { z } from 'zod';

/**
 * Deep merge two objects recursively.
 * @param target The target object to merge into.
 * @param source The source object to merge from.
 * @returns A new object with merged properties.
 */
const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T => {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(targetValue, sourceValue) as T[Extract<
          keyof T,
          string
        >];
      } else if (sourceValue !== undefined) {
        // Override primitive values and arrays
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
};

/**
 * Loads and validates a YAML configuration file.
 * @param schema The Zod schema to validate the configuration against.
 * @param filePath The path to the YAML configuration file.
 * @returns A validated configuration object.
 * @throws If the file does not exist, is not valid YAML, or does not match the schema.
 */
export const loadConfig = <T extends z.ZodTypeAny>(
  schema: T,
  filePath: string
): z.infer<T> => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = YAML.parse(fileContents);
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation error:', error.flatten());
      throw new Error(`Invalid configuration in ${filePath}`);
    }
    if (error instanceof Error) {
      console.error(
        `Error loading configuration file ${filePath}:`,
        error.message
      );
      throw error;
    }
    throw new Error(`An unknown error occurred while loading ${filePath}`);
  }
};

/**
 * Loads and merges configuration files with inheritance chain.
 * @param schema The Zod schema to validate the final configuration against.
 * @param configPaths Array of configuration file paths in order of precedence (lowest to highest).
 * @returns A merged and validated configuration object.
 */
export const loadConfigWithInheritance = <T extends z.ZodTypeAny>(
  schema: T,
  configPaths: string[]
): z.infer<T> => {
  let mergedConfig: any = {};

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const data = YAML.parse(fileContents);
        mergedConfig = deepMerge(mergedConfig, data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error loading configuration file ${configPath}:`,
          error.message
        );
        throw error;
      }
      throw new Error(`An unknown error occurred while loading ${configPath}`);
    }
  }

  try {
    return schema.parse(mergedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation error:', error.flatten());
      throw new Error('Invalid merged configuration');
    }
    throw error;
  }
};
