'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Lead, LeadSchema } from '@/types/lead'
import { showErrorToast } from '@/utils/toast'

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const validatedLeads = data.map(lead => LeadSchema.parse(lead))
      setLeads(validatedLeads)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      showErrorToast('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    leads,
    loading,
    refresh
  }
}
