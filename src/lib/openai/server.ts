import OpenAI from 'openai'

// Create a single instance for server-side operations
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Type-safe wrapper for chat completions
export async function createChatCompletion(messages: Array<{
  role: 'system' | 'user' | 'assistant'
  content: string
}>, options: {
  temperature?: number
  response_format?: { type: 'json_object' }
} = {}) {
  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    ...options,
  })
}

export { openai }

