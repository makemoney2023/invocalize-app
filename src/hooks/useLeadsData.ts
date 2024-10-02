import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLeads } from '@/api/leads'

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  company: string;
  role: string;
  use_case: string;
  created_at: string;
  call_id: string;
  call_duration: number; // Keep this for compatibility
  call_length: number; // New property from Bland API
  batch_id: string | null;
  to: string;
  from: string;
  request_data: {
    phone_number: string;
    wait: boolean;
    language: string;
  };
  completed: boolean;
  inbound: boolean;
  queue_status: string;
  endpoint_url: string;
  max_duration: number;
  error_message: string | null;
  variables: {
    now: string;
    now_utc: string;
    short_from: string;
    short_to: string;
    from: string;
    to: string;
    call_id: string;
    phone_number: string;
    city: string;
    country: string;
    state: string;
    zip: string;
    input: Record<string, any>;
  };
  answered_by: string;
  record: boolean;
  recording_url: string | null;
  c_id: string;
  metadata: Record<string, any>;
  summary: string;
  price: number;
  started_at: string;
  local_dialing: boolean;
  call_ended_by: string;
  pathway_logs: any;
  analysis_schema: any;
  analysis: {
    appointment: any;
    sentiment_score: number;
    summary?: string;
    appointment_booked?: boolean;
    appointment_date?: string;
    appointment_time?: string;
  };
  concatenated_transcript: string;
  call_transcript: Array<{
    id: number;
    created_at: string;
    text: string;
    user: string;
    c_id: string;
    status: string | null;
    transcript_id: string | null;
  }>;
  status: string;
  corrected_duration: string;
  end_at: string;
  call_status: string; // Keep this for compatibility
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

  function handleLeadChange(payload: any) {
    // Handle lead changes
  }

  return { leads, loading, error }
}
