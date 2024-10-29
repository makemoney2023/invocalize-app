import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  sentiment_score: z.number().min(-1).max(1),
  key_points: z.array(z.string()),
  customer_satisfaction: z.enum(['low', 'medium', 'high']),
  appointment_details: z.string().nullable(),
  action_items: z.array(z.string())
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export function parseOpenAIResponse(content: string): AnalysisResult {
  try {
    const parsed = JSON.parse(content);
    return {
      sentiment_score: Number(parsed.sentiment_score),
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
      customer_satisfaction: parsed.customer_satisfaction?.toLowerCase() || 'medium',
      appointment_details: parsed.appointment_details || null,
      action_items: Array.isArray(parsed.action_items) ? parsed.action_items : []
    };
  } catch (error) {
    throw new Error('Failed to parse OpenAI response');
  }
}
