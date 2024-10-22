import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeTranscript } from '@/utils/analysisUtils';
import { supabase } from '@/lib/supabase';
import { CallAnalysis } from '@/types/lead';

const requestSchema = z.object({
  leadId: z.string().or(z.number()).transform((val) => String(val)),
  transcript: z.string(),
});

export async function POST(req: Request) {
  console.log('Received analyze-transcript POST request');
  try {
    const body = await req.json();
    console.log('Received body:', body);
    const { leadId, transcript } = requestSchema.parse(body);
    console.log('Parsed leadId:', leadId, 'Transcript length:', transcript.length);

    console.log('Calling analyzeTranscript function');
    const analysis = await analyzeTranscript(transcript);
    console.log('Received analysis:', analysis);

    // Validate analysis object
    if (
      typeof analysis.sentiment_score !== 'number' ||
      !Array.isArray(analysis.key_points) ||
      typeof analysis.customer_satisfaction !== 'string' ||
      typeof analysis.appointment_details !== 'string'
    ) {
      throw new Error('Invalid analysis structure');
    }

    // Save analysis results to the database
    console.log('Saving analysis to Supabase:', {
      lead_id: leadId,
      sentiment_score: analysis.sentiment_score,
      key_points: analysis.key_points,
      customer_satisfaction: analysis.customer_satisfaction,
      appointment_details: analysis.appointment_details,
    });

    const { data, error } = await supabase
      .from('call_analyses')
      .insert({
        lead_id: leadId,
        sentiment_score: analysis.sentiment_score,
        key_points: analysis.key_points,
        customer_satisfaction: analysis.customer_satisfaction,
        appointment_details: analysis.appointment_details,
      })
      .select() // Add this line to return the inserted row

    console.log('Supabase insert operation result:', { data, error });

    if (error) {
      console.error('Error storing analysis in Supabase:', error);
      return NextResponse.json({ error: 'Failed to store analysis', details: error }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.error('No data returned from Supabase insert');
      return NextResponse.json({ error: 'Failed to store analysis', details: 'No data returned' }, { status: 500 });
    }

    // If insertion is successful, return success response
    console.log('Analysis stored successfully:', data[0]);
    return NextResponse.json({ message: 'Analysis stored successfully', data: data[0] }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in analyze-transcript API route:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to analyze transcript' }, { status: 500 });
    }
  }
}
