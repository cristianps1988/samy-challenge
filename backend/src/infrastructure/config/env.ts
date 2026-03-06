import { config } from 'dotenv';
import { z } from 'zod';
import { join } from 'node:path';

const rootDir = process.cwd();

if (rootDir.includes('backend')) {
  config({ path: join(rootDir, '../.env') });
} else {
  config();
}

const envSchema = z.object({
  DATABASE_URL: z.url(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('24h'),

  REQRES_BASE_URL: z.url(),
  REQRES_API_KEY: z.string().min(1, 'REQRES_API_KEY is required'),

  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.union([z.literal('*'), z.url()]),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingOrInvalid = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`Invalid environment configuration:\n${missingOrInvalid}`);
    }
    throw error;
  }
}

export const env = validateEnv();
