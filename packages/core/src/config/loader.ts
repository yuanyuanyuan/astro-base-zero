import fs from 'node:fs';
import YAML from 'yaml';
import { z } from 'zod';

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
      console.error(`Error loading configuration file ${filePath}:`, error.message);
      throw error;
    }
    throw new Error(`An unknown error occurred while loading ${filePath}`);
  }
}; 