import OpenAI from 'openai'
import { ENV } from '../env'

let openai: OpenAI | undefined;

if (ENV.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 30 * 1000, // 30 seconds
  });
}

export { openai };

// Function to check if OpenAI is configured
export function requireOpenAI(): OpenAI {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  return openai;
}
