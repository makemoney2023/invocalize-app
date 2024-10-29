import { z } from 'zod'

export const emailStatusSchema = z.enum([
  'sent',
  'delivered',
  'failed',
  'bounced',
  'complained'
])

export type EmailStatus = 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained'

export type EmailResponse = {
  id: string
  from: string
  to: string
  subject: string
  html: string
  status: EmailStatus
  createdAt: string
}

export const emailResponseSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  html: z.string(),
  status: z.enum(['sent', 'delivered', 'failed', 'bounced', 'complained']),
  createdAt: z.string()
})
