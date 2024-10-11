import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLeads } from '@/api/leads'
import { sendCallSummaryEmail } from '@/utils/sendemail';
import { updateLeadWithGeoData } from '@/utils/geoUtils';
import OpenAI from 'openai'

export interface Lead {
  state: string;
  city: string;
  status: string;
  country: string; // ISO 3166-1 alpha-2 country code
  id: string;
  name: string;
  email: string;
  phone_number: string;
  company: string;
  role: string;
  use_case: string;
  call_id: string;
  call_status: string;
  call_length: number;
  batch_id: string | null;
  to_number: string;
  from_number: string;
  request_data: string;
  completed: boolean;
  inbound: boolean;
  queue_status: string;
  endpoint_url: string;
  max_duration: number;
  error_message: string | null;
  variables?: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
  };
  answered_by: string;
  record: boolean;
  recording_url: string | null;
  c_id: string;
  metadata: {
    name: string;
    role: string;
    email: string;
    leadId: string;
    company: string;
    useCase: string;
  };
  summary: string;
  price: number;
  started_at: string;
  local_dialing: boolean;
  call_ended_by: string;
  pathway_logs: any;
  analysis_schema: any;
  corrected_duration: number;
  end_at: string;
  call_transcript: Array<{
    id: number;
    text: string;
    user: string;
    created_at: string;
  }> | [];
  concatenated_transcript?: string;
  analysis: {
    key_points: any;
    customer_satisfaction: any;
    appointment: any;
    appointment_date?: string;
    appointment_time?: string;
    appointment_booked?: boolean;
    sentiment_score?: number;
    summary?: string;
    topics?: string[];
    action_items?: string[];
    questions?: string[];
  };
  pathway: any;
  created_at: string;
  updated_at: string;
  transcripts: Array<{
    user: string;
    text: string;
  }>;
  location?: string; // WKB format
  ai_analysis?: string;
  call_analyses?: {
    sentiment_score: number;
    key_points: string[];
    customer_satisfaction: string;
    appointment_details: string;
  }[];
}

async function analyzeTranscript(transcript: string) {
  console.log('Starting transcript analysis');
  try {
    console.log('Sending request to /api/analyze-transcript');
    const response = await fetch('/api/analyze-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    console.log('Received response from /api/analyze-transcript');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', response.status, response.statusText, errorData);
      throw new Error(errorData.error || 'Failed to analyze transcript');
    }

    const analysis = await response.json();
    console.log('Analysis result:', analysis);
    return analysis.result;
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return null;
  }
}

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeadsData()
    const subscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, handleLeadChange)
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchLeadsData() {
    try {
      setLoading(true);
      const leadsData = await fetchLeads();
      setLeads(leadsData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadChange(payload: any) {
    console.log('Lead change detected:', payload);
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const lead = payload.new;
      if (lead.city && lead.state && lead.country) {
        console.log(`Updating geo data for lead ${lead.id}`);
        await updateLeadWithGeoData(lead.id, lead.city, lead.state, lead.country);
      }

      if (lead.concatenated_transcript) {
        const analysis = await analyzeTranscript(lead.concatenated_transcript);
        if (analysis) {
          const { error } = await supabase
            .from('call_analyses')
            .insert({
              lead_id: lead.id,
              sentiment_score: extractSentimentScore(analysis),
              key_points: extractKeyPoints(analysis),
              customer_satisfaction: extractCustomerSatisfaction(analysis),
              appointment_details: extractAppointmentDetails(analysis)
            });

          if (error) {
            console.error('Error inserting call analysis:', error);
          } else {
            console.log('Successfully inserted call analysis');
          }
        }
      }
    }

    if (payload.eventType === 'UPDATE' && payload.new.completed && !payload.old.completed) {
      console.log('Call completed, sending email for lead:', payload.new.id);
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload.new),
        });
        if (!response.ok) {
          throw new Error('Failed to send email');
        }
        console.log('Email sent successfully for lead:', payload.new.id);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    // Refresh leads data
    await fetchLeadsData();
  }

  async function fetchAndUpdateAnalysis(leadId: string) {
    try {
      const response = await fetch(`https://api.bland.ai/v1/calls/${leadId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BLAND_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const analysisData = await response.json();
      console.log('Analysis data:', analysisData);

      // Update the lead in the database with the new analysis data
      const { error } = await supabase
        .from('leads')
        .update({ analysis: analysisData })
        .eq('id', leadId);

      if (error) {
        throw error;
      }

      // Refresh the leads data
      await fetchLeadsData();
    } catch (error) {
      console.error('Error fetching and updating analysis:', error);
    }
  }

  return { leads, loading, error }
}

function extractSentimentScore(analysis: any): any {
  throw new Error('Function not implemented.');
}
function extractKeyPoints(analysis: any): any {
  throw new Error('Function not implemented.');
}

function extractCustomerSatisfaction(analysis: any): any {
  throw new Error('Function not implemented.');
}

function extractAppointmentDetails(analysis: any): any {
  throw new Error('Function not implemented.');
}

