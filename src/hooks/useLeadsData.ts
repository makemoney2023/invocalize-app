import { useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLeads } from '@/api/leads'
import { sendCallSummaryEmail } from '@/utils/sendemail';

export interface Lead {
  state: string;
  city: string;
  status: string;
  location: string;
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