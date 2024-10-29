import { z } from 'zod'

export const analysisResponseSchema = z.object({
  summary: z.string(),
  key_points: z.array(z.string()),
  sentiment: z.number().min(-1).max(1),
  customer_satisfaction: z.enum(['satisfied', 'neutral', 'dissatisfied']),
  topics_discussed: z.array(z.string()),
  action_items: z.array(z.string()),
  risk_level: z.enum(['low', 'medium', 'high'])
})

export type CallAnalysis = {
  id: string
  created_at: string
  sentiment_score: number
  key_points: string[]
  customer_satisfaction: "satisfied" | "neutral" | "dissatisfied"
  lead_id: string
  content: string
  topics_discussed: string[]
  action_items: string[]
  risk_level: "low" | "medium" | "high"
}
