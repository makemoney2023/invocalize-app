import OpenAI from 'openai';
import { z } from 'zod';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in the environment variables. Please set it in your .env.local file.');
}

let openai: OpenAI | null = null;

if (typeof window === 'undefined') {
  // Server-side initialization
  openai = new OpenAI({
    apiKey: apiKey || '',
  });
} else {
  console.warn('OpenAI client is not initialized in the browser environment for security reasons.');
}

const AnalysisSchema = z.object({
  sentiment_score: z.number().min(0).max(1),
  key_points: z.array(z.string()),
  customer_satisfaction: z.string(),
  appointment_details: z.string(),
});

export async function analyzeTranscript(
  transcript: string | null
): Promise<z.infer<typeof AnalysisSchema>> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized.');
  }

  if (!transcript) {
    console.warn('No transcript provided for analysis');
    return {
      sentiment_score: 0,
      key_points: [],
      customer_satisfaction: 'Unknown',
      appointment_details: 'No appointment details',
    };
  }

  try {
    console.log('Sending request to OpenAI');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI assistant that analyzes call transcripts. Provide a JSON response with the following structure: {"sentiment_score": number from 0 to 1, "key_points": [array of strings], "customer_satisfaction": string, "appointment_details": string}',
        },
        {
          role: 'user',
          content: `Analyze the following transcript and provide the requested JSON structure:

Transcript:
${transcript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('Received response from OpenAI:', response);
    const analysisText = response.choices[0]?.message?.content;

    console.log('Analysis text:', analysisText);

    if (!analysisText) {
      console.error('No analysis text received from OpenAI');
      return {
        sentiment_score: 0,
        key_points: [],
        customer_satisfaction: 'Unknown',
        appointment_details: 'No appointment details',
      };
    }

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      throw new Error('Failed to parse analysis JSON');
    }

    const validatedAnalysis = AnalysisSchema.safeParse(parsedAnalysis);

    if (!validatedAnalysis.success) {
      console.error('Analysis validation failed:', validatedAnalysis.error);
      throw new Error('Analysis validation failed');
    }

    return validatedAnalysis.data;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

export function parseAnalysisResult(result: string) {
  const sentimentScoreMatch = result.match(/Sentiment Score:\s*(\d+(\.\d+)?)/);
  const keyPointsMatch = result.match(/Key Points:([\s\S]*?)(?=\n\n|$)/);
  const customerSatisfactionMatch = result.match(/Customer Satisfaction:\s*(.*)/);
  const appointmentDetailsMatch = result.match(/Appointment Details:\s*(.*)/);

  return {
    sentimentScore: sentimentScoreMatch ? parseFloat(sentimentScoreMatch[1]) : 0,
    keyPoints: keyPointsMatch
      ? keyPointsMatch[1]
          .split('\n')
          .map((point) => point.trim())
          .filter(Boolean)
      : [],
    customerSatisfaction: customerSatisfactionMatch ? customerSatisfactionMatch[1].trim() : 'Unknown',
    appointmentDetails: appointmentDetailsMatch ? appointmentDetailsMatch[1].trim() : 'No appointment details',
  };
}
