import { z } from 'zod'

export const LeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  company: z.string().optional(),
  created_at: z.string(),
  status: z.enum(['new', 'converted', 'lost', 'in_progress']),
  last_contact_date: z.string().optional(),
  concatenated_transcript: z.string().optional(),
  recording_url: z.string().url().optional(),
  call_length: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  price: z.number().optional(),
  call_status: z.string().optional(),
  use_case: z.string().optional(),
  call_analyses: z.array(z.object({
    id: z.string(),
    sentiment_score: z.number(),
    key_points: z.array(z.string()),
    customer_satisfaction: z.enum(['satisfied', 'neutral', 'dissatisfied']),
    created_at: z.string(),
    follow_up_priority: z.enum(["low", "medium", "high", "critical"]),
  })).optional()
})

export type Lead = z.infer<typeof LeadSchema>
