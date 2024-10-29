import { z } from 'zod'

export const analysisResultSchema = z.object({
  sentiment_score: z.number(),
  key_points: z.array(z.string()),
  customer_satisfaction: z.string(),
  appointment_details: z.string().optional()
})

export type AnalysisResult = z.infer<typeof analysisResultSchema>

