import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_PRIVATE_KEY: z.string().min(1),
    REFRESH_TOKEN_PUBLIC_KEY: z.string().min(1),
    REDIS_URL: z.string().min(1),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_USER: z.string().min(1).default(''),
    SMTP_PASSWORD: z.string().min(1).default(''),
    SMTP_FROM: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
