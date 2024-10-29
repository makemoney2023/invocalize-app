import { z } from 'zod'

export const emailLogSchema = z.object({
  id: z.string(),
  lead_id: z.string(),
  to_emails: z.array(z.string().email()),
  from_email: z.string().email(),
  subject: z.string(),
  html_content: z.string(),
  status: z.enum(['sent', 'failed', 'delivered', 'bounced', 'complained']),
  delivery_status: z.enum(['pending', 'delivered', 'failed']).default('pending'),
  opens: z.number().default(0),
  clicks: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string().optional(),
  last_event: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional()
})

export type EmailLog = z.infer<typeof emailLogSchema>

export const EMAIL_CONFIG = {
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  EMAIL_FROM: process.env.EMAIL_FROM!,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME!
} as const

// Validate on initialization
emailConfigSchema.parse(EMAIL_CONFIG)
