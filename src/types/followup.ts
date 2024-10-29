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
  potentialValue: z.number(),
  confidence: z.number()
})

export type FollowUpRecommendation = z.infer<typeof followUpRecommendationSchema>

