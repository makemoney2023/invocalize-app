import { z } from 'zod'

export const followUpOutcomeSchema = z.enum([
  'converted',
  'in_progress',
  'no_response',
  'lost',
  'rescheduled'
])

export type FollowUpOutcome = 'successful' | 'in_progress' | 'no_response' | 'not_interested'

export interface EffectivenessFactor {
  name: string
  impact: number
  suggestion: string
}

export interface FollowUpEffectiveness {
  leadId: string
  originalPriority: 'high' | 'medium' | 'low'
  scheduledTime: Date
  actualFollowUpTime: Date
  outcome: FollowUpOutcome
  responseTime: number
  nextSteps: string[]
  effectivenessScore: number
  factors: EffectivenessFactor[]
}
