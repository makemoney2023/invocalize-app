import { OpenAI } from 'openai'
import { env } from '@/env.mjs'

export const openai = new OpenAI({ 
  apiKey: env.OPENAI_API_KEY,
  organization: env.OPENAI_ORG_ID, // Add organization for better tracking
  maxRetries: 3,
  timeout: 30000,
})
