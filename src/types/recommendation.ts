import { z } from 'zod'

export const followUpPrioritySchema = z.enum(['critical', 'high', 'medium', 'low'])
export type FollowUpPriority = z.infer<typeof followUpPrioritySchema>

export const followUpRecommendationSchema = z.object({
  leadId: z.string(),
  priority: followUpPrioritySchema,
  recommendedTimeFrame: z.object({
    min: z.date(),
    max: z.date()
  }),
  reason: z.string(),
  suggestedTalkingPoints: z.array(z.string()),
  potentialValue: z.number().min(0),
  confidence: z.number().min(0).max(1),
  keyInsights: z.array(z.object({
    type: z.enum(['intent', 'objection', 'interest', 'concern']),
    description: z.string(),
    priority: z.number().min(1).max(5)
  }))
})

export type FollowUpRecommendation = z.infer<typeof followUpRecommendationSchema>

