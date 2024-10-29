import { Lead } from '@/types/lead'
import { CallAnalysis } from '@/types/analysis'
import { Logger } from '@/utils/logger'
import { z } from 'zod'

export const recommendationSchema = z.object({
  leadId: z.string().uuid(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  recommendedTimeFrame: z.string(),
  reason: z.string(),
  suggestedTalkingPoints: z.array(z.string()),
  potentialValue: z.number(),
  confidence: z.number().min(0).max(1),
  nextSteps: z.array(z.string()),
  created_at: z.string()
})

export type FollowUpRecommendation = z.infer<typeof recommendationSchema>

export class RecommendationService {
  generateRecommendation(lead: Lead, analysis: CallAnalysis): FollowUpRecommendation {
    const priority = this.calculatePriority(analysis)
    const timeFrame = this.getRecommendedTimeFrame(priority)
    const talkingPoints = this.generateTalkingPoints(lead, analysis)

    return {
      leadId: lead.id,
      priority: priority,
      recommendedTimeFrame: timeFrame,
      reason: this.generateReason(analysis),
      suggestedTalkingPoints: Array.from(talkingPoints),
      potentialValue: this.calculatePotentialValue(lead),
      confidence: this.calculateConfidence(analysis),
      nextSteps: this.generateNextSteps(analysis),
      created_at: new Date().toISOString()
    }
  }

  private calculatePriority(analysis: CallAnalysis): 'critical' | 'high' | 'medium' | 'low' {
    if (analysis.customer_satisfaction === 'dissatisfied') {
      return 'critical'
    }
    if (analysis.sentiment_score < 0.3) {
      return 'high'
    } else if (analysis.sentiment_score < 0.7) {
      return 'medium'
    }
    return 'low'
  }

  private getRecommendedTimeFrame(priority: string): string {
    switch (priority) {
      case 'critical': return '12 hours'
      case 'high': return '24 hours'
      case 'medium': return '3 days'
      case 'low': return '1 week'
      default: return '1 week'
    }
  }

  private generateTalkingPoints(lead: Lead, analysis: CallAnalysis): Set<string> {
    const points = new Set<string>()
    
    analysis.key_points.forEach(point => points.add(point))
    
    if (analysis.customer_satisfaction === 'dissatisfied') {
      points.add('Address previous concerns')
    }
    
    return points
  }

  private generateReason(analysis: CallAnalysis): string {
    if (analysis.customer_satisfaction === 'dissatisfied') {
      return 'Customer showed signs of dissatisfaction'
    }
    return 'Regular follow-up recommended'
  }

  private calculatePotentialValue(lead: Lead): number {
    return lead.price || 0
  }

  private calculateConfidence(analysis: CallAnalysis): number {
    return (analysis.sentiment_score + 1) / 2
  }

  private generateNextSteps(analysis: CallAnalysis): string[] {
    const steps = ['Schedule follow-up call']
    
    if (analysis.customer_satisfaction === 'dissatisfied') {
      steps.push('Prepare resolution plan')
    }
    
    return steps
  }
}
