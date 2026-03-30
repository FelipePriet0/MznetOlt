import 'dotenv/config'
import { z } from 'zod'

// Allow flexible configuration:
// - SUPABASE_URL or SUPABASE_PROJECT_ID (to build https://<id>.supabase.co)
const rawEnv = {
  ...process.env,
  SUPABASE_URL:
    process.env.SUPABASE_URL ??
    (process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF
      ? `https://${process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF}.supabase.co`
      : undefined),
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((v) => (v ? Number(v) : 3001))
    .pipe(z.number().int().min(1).max(65535)),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(16),
  SUPABASE_ANON_KEY: z.string().min(16),
  JWT_SECRET: z.string().min(32).default('changeme-use-a-strong-secret-in-production-32chars'),
  // Dev convenience: allow skipping auth for local smoke tests
  ALLOW_UNAUTHENTICATED_MUTATIONS: z
    .string()
    .optional()
    .transform((v) => v === 'true')
    .pipe(z.boolean().default(false)),
  OPENAI_API_KEY: z.string().min(10).optional(),
})

export const env = EnvSchema.parse(rawEnv)
