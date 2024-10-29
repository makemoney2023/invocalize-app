import { z } from 'zod'

export const revenueMetricsSchema = z.object({
  potentialValue: z.number(),
  probability: z.number(),
  expectedRevenue: z.number(),
  factors: z.array(z.object({
    name: z.string(),
    impact: z.number(),
    description: z.string()
  })),
  timeline: z.enum(['immediate', 'short_term', 'medium_term', 'long_term'])
})

export type RevenueMetrics = z.infer<typeof revenueMetricsSchema>

