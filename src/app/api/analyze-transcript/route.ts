import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    console.log('Received transcript:', transcript);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes call transcripts and provides sentiment analysis and action items." },
        { role: "user", content: `Please analyze this transcript and provide key points, customer satisfaction and provide a sentiment analysis score as a number between 0 and 10 and any appointment details:\n\n${transcript}` }
      ],
    });

    const result = completion.choices[0].message.content;
    console.log('OpenAI API response:', completion);
    console.log('Analysis result:', result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in analyze-transcript:', error);
    return NextResponse.json({ error: 'An error occurred while analyzing the transcript' }, { status: 500 });
  }
}
