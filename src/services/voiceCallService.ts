import { createClient } from '@/lib/supabase/client'
import { Lead, leadSchema, CallAnalysis } from '@/types/lead'
import { z } from 'zod'
import { toast } from '@/components/ui/toast'
import { Logger } from '@/utils/logger'
import { AppError } from '@/utils/errors'
import { AnalysisService } from './analysisService'
import { EmailService } from './emailService'

const appointmentSchema = z.object({
  leadId: z.string(),
  date: z.string(),
  time: z.string(),
  note: z.string()
})

export class VoiceCallService {
  private supabase = createClient()
  private analysisService = new AnalysisService()
  private emailService = new EmailService()

  async analyzeTranscript(
    leadId: string, 
    transcript: string, 
    userId: string
  ): Promise<CallAnalysis> {
    try {
      const { analysis } = await this.analysisService.analyzeTranscript(
        leadId,
        transcript,
        userId
      );

      // Add user tracking to the analysis
      const completeAnalysis: CallAnalysis = {
        ...analysis,
        analyzed_by: userId,
        sentiment_score: analysis.sentiment,
        customer_satisfaction: this.determineCustomerSatisfaction(analysis.sentiment)
      };

      await this.updateCallStatus(leadId, 'analyzed', userId);
      
      return completeAnalysis;
    } catch (error) {
      Logger.log(
        error instanceof Error ? error.message : 'Failed to analyze transcript',
        'error',
        { 
          showToast: true,
          metadata: { userId }
        }
      );
      throw error;
    }
  }

  private determineCustomerSatisfaction(sentiment: number): string {
    if (sentiment >= 0.7) return 'satisfied'
    if (sentiment >= 0.4) return 'neutral'
    return 'dissatisfied'
  }

  async updateCallStatus(leadId: string, status: string, userId: string): Promise<Lead> {
    const { data, error } = await this.supabase
      .from('leads')
      .update({ call_status: status })
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      toast.error('Failed to update call status')
      throw error
    }

    return leadSchema.parse(data)
  }

  async scheduleFollowUp(appointment: z.infer<typeof appointmentSchema>) {
    const validatedData = appointmentSchema.parse(appointment)
    
    const { data, error } = await this.supabase
      .from('appointments')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      toast.error('Failed to schedule follow-up')
      throw error
    }

    return data
  }
}

export const voiceCallService = new VoiceCallService()
