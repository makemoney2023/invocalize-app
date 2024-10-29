import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'
import { leadSchema } from '@/types/lead'

type Lead = Database['public']['Tables']['leads']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']

export async function fetchLeads(): Promise<Lead[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      call_analyses (*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return z.array(leadSchema).parse(data)
}

export async function fetchLeadWithAnalysis(leadId: string): Promise<Lead> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      call_analyses (*)
    `)
    .eq('id', leadId)
    .single()

  if (error) throw error

  return leadSchema.parse(data)
}
