'use client'

import { useState } from 'react'
import { useDatabase } from '@/hooks/useDatabase'
import { Lead, LeadSchema } from '@/types/lead'
import { toast } from '@/components/ui/toast'
import { showErrorToast } from '@/utils/toast'

export function useLeadManagement() {
  const { supabase } = useDatabase()
  const [loading, setLoading] = useState(false)

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single()

      if (error) throw error
      
      return leadSchema.parse(data)
    } catch (err) {
      showErrorToast(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadDetails = async (leadId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          call_analyses (*),
          transcripts (*)
        `)
        .eq('id', leadId)
        .single()

      if (error) throw error
      
      return leadSchema.parse(data)
    } catch (err) {
      showErrorToast(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    updateLead,
    fetchLeadDetails
  }
}
