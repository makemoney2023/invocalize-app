import { z } from 'zod'

export const analysisResponseSchema = z.object({
  summary: z.string(),
  key_points: z.array(z.string()),
  sentiment: z.number().min(-1).max(1),
  customer_satisfaction: z.enum(['satisfied', 'neutral', 'dissatisfied']),
  topics_discussed: z.array(z.string()),
  action_items: z.array(z.string()),
  risk_level: z.enum(['high', 'medium', 'low'])
})

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>

export const callAnalysisSchema = z.object({
  id: z.string(),
  lead_id: z.string(),
  content: z.string(),
  sentiment: z.number(),
  key_points: z.array(z.string()),
  topics_discussed: z.array(z.string()),
  action_items: z.array(z.string()),
  risk_level: z.enum(['high', 'medium', 'low']),
  created_at: z.string()
})

export type CallAnalysis = {
  id: string
  lead_id: string
  content: string
  sentiment: number
  key_points: string[]
  topics_discussed: string[]
  action_items: string[]
  risk_level: 'high' | 'medium' | 'low'
  created_at: string
}
