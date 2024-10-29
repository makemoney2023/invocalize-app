import OpenAI from 'openai';
import { OpenAIStream } from 'ai';

// Ensure OpenAI client is only initialized server-side
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 30 * 1000, // 30 seconds
});

export type AnalysisResult = {
  sentiment_score: number;
  key_points: string[];
  customer_satisfaction: 'low' | 'medium' | 'high';
  appointment_details: string | null;
  action_items: string[];
};

