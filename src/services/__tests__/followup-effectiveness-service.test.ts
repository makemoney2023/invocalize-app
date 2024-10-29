import { FollowUpEffectivenessService } from '../followup-effectiveness-service'
import { RecommendationService } from '../recommendationService'
import { Lead } from '@/types/lead'
import '@testing-library/jest-dom'

jest.mock('../recommendationService')

describe('FollowUpEffectivenessService', () => {
  let service: FollowUpEffectivenessService
  let mockRecommendationService: jest.Mocked<RecommendationService>

  beforeEach(() => {
    mockRecommendationService = {
      getRecommendationForLead: jest.fn().mockResolvedValue({
        priority: 'high',
        recommendedActions: []
      })
    } as any

    service = new FollowUpEffectivenessService(mockRecommendationService)
  })

  describe('calculateEffectiveness', () => {
    it('should calculate effectiveness correctly for a converted lead', async () => {
      const lead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        status: 'converted',
        last_contact_date: new Date().toISOString(),
        interactions: [{ 
          id: '1', 
          type: 'call', 
          date: new Date().toISOString() 
        }]
      } satisfies Lead

      const followUpDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago

      const result = await service.calculateEffectiveness(lead, followUpDate)

      expect(result).toMatchObject({
        leadId: lead.id,
        originalPriority: 'high',
        outcome: 'successful',
        effectivenessScore: expect.any(Number)
      })
      expect(result.effectivenessScore).toBeGreaterThanOrEqual(0)
      expect(result.effectivenessScore).toBeLessThanOrEqual(1)
    })

    it('should handle missing lead data gracefully', async () => {
      const lead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        status: 'new'
      } satisfies Lead

      const followUpDate = new Date()

      const result = await service.calculateEffectiveness(lead, followUpDate)

      expect(result.outcome).toBe('no_response')
      expect(result.factors).toHaveLength(3)
      expect(result.nextSteps.length).toBeGreaterThan(0)
    })

    it('should throw error for invalid lead', async () => {
      await expect(
        service.calculateEffectiveness(null as any, new Date())
      ).rejects.toThrow()
    })
  })
})
