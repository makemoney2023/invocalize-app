import { Lead, CallAnalysis } from '@/types/lead'
import { Logger } from '@/utils/logger'
import { z } from 'zod'

export const recommendationSchema = z.object({
  leadId: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  recommendedTimeFrame: z.string(),
  reason: z.string(),
  suggestedTalkingPoints: z.array(z.string()),
  potentialValue: z.number(),
  confidence: z.number(),
  nextSteps: z.array(z.string()),
  created_at: z.string()
})

export type FollowUpRecommendation = z.infer<typeof recommendationSchema>

export interface Recommendation {
  priority: 'high' | 'medium' | 'low'
  recommendedActions: string[]
}

export class RecommendationService {
  generateRecommendation(analysis: CallAnalysis): FollowUpRecommendation {
    try {
      const priority = this.calculatePriority(analysis)
      const timeFrame = this.getTimeFrame(priority)
      
      return recommendationSchema.parse({
        leadId: analysis.lead_id,
        priority,
        recommendedTimeFrame: timeFrame,
        reason: this.generateReason(priority, analysis),
        suggestedTalkingPoints: this.generateTalkingPoints(analysis),
        potentialValue: this.calculatePotentialValue(analysis),
        confidence: analysis.sentiment,
        nextSteps: this.generateNextSteps(priority, analysis),
        created_at: new Date().toISOString()
      })
    } catch (error) {
      Logger.log('Failed to generate recommendation', 'error', { showToast: true })
      throw error
    }
  }

  private calculatePriority(analysis: CallAnalysis): 'high' | 'medium' | 'low' {
    if (analysis.risk_level === 'high') return 'high'
    if (analysis.sentiment >= 0.7) return 'high'
    if (analysis.sentiment >= 0.4) return 'medium'
    return 'low'
  }

  private getTimeFrame(priority: string): string {
    switch (priority) {
      case 'high': return '24 hours'
      case 'medium': return '3 days'
      case 'low': return '1 week'
      default: return '1 week'
    }
  }

  private generateReason(priority: 'high' | 'medium' | 'low', analysis: CallAnalysis): string {
    const reasons = {
      high: `High-value opportunity - Strong buying signals detected`,
      medium: `Follow-up recommended - Moderate interest shown`,
      low: `Routine follow-up - Positive interaction`
    }
    return reasons[priority]
  }

  private generateTalkingPoints(analysis: CallAnalysis): string[] {
    const points: string[] = []

    analysis.key_points.forEach((point: string) => {
      if (point.toLowerCase().includes('price')) {
        points.push(`Discuss pricing options - ${point}`)
      } else if (point.toLowerCase().includes('feature')) {
        points.push(`Highlight key features - ${point}`)
      } else {
        points.push(`Follow up on - ${point}`)
      }
    })

    return [...new Set(points)]
  }

  private calculatePotentialValue(analysis: CallAnalysis): number {
    let baseValue = 1000
    
    if (analysis.sentiment >= 0.7) baseValue *= 1.5
    if (analysis.sentiment >= 0.4) baseValue *= 0.8

    return Math.round(baseValue)
  }

  private generateNextSteps(priority: 'high' | 'medium' | 'low', analysis: CallAnalysis): string[] {
    const nextSteps: string[] = []

    switch (priority) {
      case 'high':
        nextSteps.push('Discuss specific pricing options and packages')
        nextSteps.push('Present ROI calculations')
        break
      case 'medium':
        nextSteps.push('Address previous pricing concerns')
        nextSteps.push('Highlight competitive advantages')
        break
      case 'low':
        nextSteps.push('Address specific concerns raised')
        nextSteps.push('Share relevant case studies/testimonials')
        break
    }

    return nextSteps
  }

  async getRecommendationForLead(leadId: string): Promise<Recommendation> {
    // Implementation here
    return {
      priority: 'medium',
      recommendedActions: []
    }
  }
}
