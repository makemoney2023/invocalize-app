import { Lead } from '@/types/lead'
import { FollowUpEffectiveness, FollowUpOutcome } from '@/types/followup-effectiveness'
import { RecommendationService } from './recommendationService'
import { ErrorHandler } from '@/lib/errorHandling'
import { z } from 'zod'

// Define stricter schemas with validation
const effectivenessFactorSchema = z.object({
  name: z.string().min(1),
  impact: z.number().min(0).max(1),
  suggestion: z.string().min(1)
})

const effectivenessSchema = z.object({
  leadId: z.string().uuid(),
  originalPriority: z.enum(['high', 'medium', 'low']),
  scheduledTime: z.date(),
  actualFollowUpTime: z.date(),
  outcome: z.enum(['successful', 'in_progress', 'no_response', 'not_interested']),
  responseTime: z.number().nonnegative(),
  nextSteps: z.array(z.string().min(1)),
  effectivenessScore: z.number().min(0).max(1),
  factors: z.array(effectivenessFactorSchema).min(1)
})

export class FollowUpEffectivenessService {
  private recommendationService: RecommendationService

  constructor(recommendationService?: RecommendationService) {
    this.recommendationService = recommendationService ?? new RecommendationService()
  }

  async calculateEffectiveness(lead: Lead, followUpDate: Date): Promise<FollowUpEffectiveness> {
    try {
      const recommendation = await this.recommendationService.getRecommendationForLead(lead.id)
      const currentDate = new Date()
      const responseTime = this.calculateResponseTime(followUpDate, currentDate)
      
      const factors = this.analyzeEffectivenessFactors(
        recommendation.priority,
        responseTime,
        lead
      )

      const effectiveness = {
        leadId: lead.id,
        originalPriority: recommendation.priority,
        scheduledTime: followUpDate,
        actualFollowUpTime: currentDate,
        outcome: this.determineOutcome(lead),
        responseTime,
        nextSteps: this.generateNextSteps(factors),
        effectivenessScore: this.calculateScore(factors),
        factors
      }

      // Validate before returning
      return effectivenessSchema.parse(effectiveness)
    } catch (error) {
      ErrorHandler.captureError(
        error instanceof Error ? error : new Error('Unknown error'),
        'high',
        { leadId: lead.id }
      )
      throw error
    }
  }

  private calculateResponseTime(scheduled: Date, actual: Date): number {
    return Math.max(0, Math.abs(actual.getTime() - scheduled.getTime()) / (1000 * 60 * 60))
  }

  private determineOutcome(lead: Lead): FollowUpOutcome {
    if (!lead) throw new Error('Lead is required')
    
    if (lead.status === 'converted') return 'successful'
    if (lead.status === 'lost') return 'not_interested'
    if (lead.last_contact_date) return 'in_progress'
    return 'no_response'
  }

  private analyzeEffectivenessFactors(
    priority: string,
    responseTime: number,
    lead: Lead
  ) {
    const factors = []

    // Timing factor
    factors.push({
      name: 'Timing Alignment',
      impact: this.calculateTimingImpact(priority, responseTime),
      suggestion: this.getTimingSuggestion(responseTime)
    })

    // Interest level factor
    factors.push({
      name: 'Lead Interest Level',
      impact: this.calculateLeadInterestImpact(lead),
      suggestion: this.getLeadInterestSuggestion(lead)
    })

    // Engagement factor
    factors.push({
      name: 'Engagement Quality',
      impact: this.calculateEngagementImpact(lead),
      suggestion: this.getEngagementSuggestion(lead)
    })

    return factors
  }

  private calculateTimingImpact(priority: string, responseTime: number): number {
    const maxAllowedDelay = {
      high: 2, // 2 hours
      medium: 4, // 4 hours
      low: 8 // 8 hours
    }[priority] ?? 4

    return Math.max(0, 1 - (responseTime / maxAllowedDelay))
  }

  private calculateLeadInterestImpact(lead: Lead): number {
    const interactionCount = lead.interactions?.length ?? 0
    const maxInteractions = 5 // Baseline for maximum expected interactions
    return Math.min(interactionCount / maxInteractions, 1)
  }

  private calculateEngagementImpact(lead: Lead): number {
    const hasRecentActivity = lead.last_contact_date && 
      (new Date().getTime() - new Date(lead.last_contact_date).getTime()) < 7 * 24 * 60 * 60 * 1000
    return hasRecentActivity ? 1 : 0.5
  }

  private getTimingSuggestion(responseTime: number): string {
    if (responseTime <= 2) return 'Excellent response time, maintain this level of promptness'
    if (responseTime <= 4) return 'Good response time, try to improve slightly'
    return 'Response time needs improvement, consider setting up automated initial responses'
  }

  private getLeadInterestSuggestion(lead: Lead): string {
    const interactionCount = lead.interactions?.length ?? 0
    if (interactionCount === 0) return 'Initial contact needed - prioritize this lead'
    if (interactionCount < 3) return 'More follow-up needed to gauge interest level'
    return 'Good engagement level, focus on conversion'
  }

  private getEngagementSuggestion(lead: Lead): string {
    if (!lead.last_contact_date) return 'No recent engagement - immediate follow-up required'
    const daysSinceContact = (new Date().getTime() - new Date(lead.last_contact_date).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceContact <= 7 
      ? 'Recent engagement is positive, maintain momentum'
      : 'Re-engagement needed - consider a new approach'
  }

  private generateNextSteps(factors: Array<{ name: string; impact: number; suggestion: string }>): string[] {
    return factors
      .filter(factor => factor.impact < 0.7)
      .map(factor => factor.suggestion)
  }

  private calculateScore(factors: Array<{ impact: number }>): number {
    if (!factors.length) return 0
    const totalImpact = factors.reduce((sum, factor) => sum + factor.impact, 0)
    return totalImpact / factors.length
  }
}
