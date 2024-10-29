import { z } from "zod"

export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone_number: z.string(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  recording_url: z.string().url().optional(),
  concatenated_transcript: z.string().optional(),
  created_at: z.string().datetime(),
  call_analyses: z.array(
    z.object({
      id: z.string().uuid(),
      sentiment_score: z.number(),
      key_points: z.array(z.string()),
      customer_satisfaction: z.enum(["satisfied", "neutral", "dissatisfied"]),
      created_at: z.string().datetime()
    })
  ).optional()
})

export type Lead = z.infer<typeof LeadSchema>

export type CallAnalysis = {
  id: string
  lead_id: string
  summary: string
  created_at: string
  // Add other analysis fields as needed
}
