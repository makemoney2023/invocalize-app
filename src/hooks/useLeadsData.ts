import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchLeads } from '@/api/leads'

export interface Lead {
  id: string;
  call_id: string;
  name: string;
  email: string;
  phone_number: string;
  company: string;
  role: string;
  use_case: string;
  created_at: string;
  call_status: string;
  call_duration: number;
  call_transcript: Array<{ speaker: string; text: string }>;
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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLeadChange(payload: any) {
    // Handle lead changes
  }

  return { leads, loading, error }
}
