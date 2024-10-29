import { withRetry } from '@/utils/retry'
import { Logger } from '@/utils/logger'
import { EmailService } from './emailService'
import { OpenAI } from 'openai'
import { createClient } from '@/lib/supabase/client'
import { ENV } from '@/lib/env'
import { randomUUID } from 'crypto'
import { RecommendationService } from './recommendationService'
import { analysisResponseSchema } from '@/types/analysis'
import { AppError } from '@/utils/errors'
import type { CallAnalysis } from '@/types/analysis'
import type { FollowUpRecommendation } from './recommendationService'

export class AnalysisService {
  private supabase = createClient()
  private openai = new OpenAI({ apiKey: ENV.OPENAI_API_KEY })
  private emailService = new EmailService()
  private recommendationService = new RecommendationService()

  async analyzeTranscript(
    leadId: string,
    transcript: string,
    onProgress?: (progress: string) => void
  ): Promise<{ analysis: CallAnalysis; recommendation: FollowUpRecommendation }> {
    return withRetry(
      async () => {
        const analysis = await this.performAnalysis(transcript, leadId)
        const savedAnalysis = await this.saveAnalysis(leadId, analysis)
        const recommendation = await this.recommendationService.generateRecommendation(savedAnalysis)
        
        await Promise.all([
          this.sendEmailIfPossible(leadId, savedAnalysis),
          this.saveRecommendation(recommendation)
        ])

        return { analysis: savedAnalysis, recommendation }
      },
      {
        maxAttempts: 3,
        onRetry: (attempt, error) => {
          Logger.log(`Retry attempt ${attempt} for analysis: ${error.message}`, 'warn', 
            { showToast: true })
          onProgress?.(`Retrying analysis (attempt ${attempt})...`)
        }
      }
    )
  }

  private async performAnalysis(transcript: string, leadId: string): Promise<CallAnalysis> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analyze the following call transcript. Provide:
            - A concise summary
            - Key discussion points
            - Customer satisfaction indicators
            - Topics discussed
            - Action items
            - Risk level assessment`
        },
        { role: "user", content: transcript }
      ],
      functions: [{
        name: "processAnalysis",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            sentiment: { type: "number", minimum: -1, maximum: 1 },
            customer_satisfaction: { type: "string", enum: ["satisfied", "neutral", "dissatisfied"] },
            topics_discussed: { type: "array", items: { type: "string" } },
            action_items: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: ["summary", "key_points", "sentiment", "customer_satisfaction", "topics_discussed", "action_items", "risk_level"]
        }
      }],
      function_call: { name: "processAnalysis" }
    })

    try {
      const result = JSON.parse(completion.choices[0]?.message?.function_call?.arguments || '{}')
      const validatedResult = analysisResponseSchema.parse(result)

      return {
        id: randomUUID(),
        lead_id: leadId,
        content: validatedResult.summary,
        sentiment: validatedResult.sentiment,
        key_points: validatedResult.key_points,
        topics_discussed: validatedResult.topics_discussed,
        action_items: validatedResult.action_items,
        risk_level: validatedResult.risk_level,
        created_at: new Date().toISOString()
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError('Failed to generate analysis', error.message)
      }
      throw new AppError('Failed to generate analysis', 'Unknown error occurred')
    }
  }

  private async saveAnalysis(leadId: string, analysis: CallAnalysis) {
    const { data, error } = await this.supabase
      .from('call_analyses')
      .insert(analysis)
      .select()
      .single()

    if (error) throw new Error('Failed to save analysis')
    return data
  }

  private async sendEmailIfPossible(leadId: string, analysis: CallAnalysis) {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .select('*, call_analyses(*)')
      .eq('id', leadId)
      .single()

    if (!error && lead?.email) {
      await this.emailService.sendCallSummaryEmail(lead, analysis)
        .catch(error => console.error('Failed to send email:', error))
    }
  }

  private async saveRecommendation(recommendation: FollowUpRecommendation) {
    const { error } = await this.supabase
      .from('recommendations')
      .insert(recommendation)

    if (error) {
      Logger.log('Failed to save recommendation', 'error')
      throw error
    }
  }
}
