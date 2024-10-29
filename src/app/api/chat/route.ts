import { createAuthApiHandler } from '@/lib/auth/api'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/server'
import { StreamingTextResponse, OpenAIStream } from 'ai'

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })),
  temperature: z.number().optional()
})

export async function POST(req: Request) {
  const auth = await createAuthApiHandler(chatRequestSchema)(req)
  
  if (auth instanceof NextResponse) {
    return auth
  }

  const { supabase, session, data } = auth

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: data.messages,
      temperature: data.temperature ?? 0.7,
      stream: true
    })

    // Log the chat in the database
    await supabase.from('chats').insert({
      user_id: session.user.id,
      messages: data.messages,
      created_at: new Date().toISOString()
    })

    // Convert OpenAI stream to Web standard ReadableStream
    const stream = OpenAIStream(completion)
    
    // Return streaming response
    return new StreamingTextResponse(stream)

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
