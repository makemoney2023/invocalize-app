import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  EMAIL_FROM: z.string().email(),
  EMAIL_FROM_NAME: z.string(),
});

export const ENV = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  EMAIL_FROM: process.env.EMAIL_FROM || 'no-reply@yourdomain.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Your App Name',
});

export const isDev = ENV.NODE_ENV === 'development';
export const isProd = ENV.NODE_ENV === 'production';
