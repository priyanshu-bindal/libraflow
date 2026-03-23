import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid PostgreSQL connection URL'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // OAuth (Google)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // File Uploads (UploadThing)
  UPLOADTHING_SECRET: z.string().min(1, 'UPLOADTHING_SECRET is required'),
  UPLOADTHING_APP_ID: z.string().min(1, 'UPLOADTHING_APP_ID is required'),

  // Email Sending (Resend)
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),

  // Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'UPSTASH_REDIS_REST_TOKEN is required'),

  // Connection Pooling (Prisma Accelerate - optional)
  PRISMA_ACCELERATE_URL: z.string().url().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

type Environment = z.infer<typeof envSchema>;

let env: Environment;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.issues
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n  ');

    console.error(
      '\n❌ Environment validation failed:\n\n  ' +
        missingVars +
        '\n\nPlease check your .env.local file and ensure all required variables are set.\n'
    );

    process.exit(1);
  }

  throw error;
}

export const getEnv = (): Environment => env;

// Export individual variables for convenience
export const {
  DATABASE_URL,
  DIRECT_URL,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  UPLOADTHING_SECRET,
  UPLOADTHING_APP_ID,
  RESEND_API_KEY,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  PRISMA_ACCELERATE_URL,
  NODE_ENV,
} = env;