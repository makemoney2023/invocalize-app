'use client'

import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { Lead, leadSchema } from '@/types/lead'
import { showErrorToast } from '@/utils/toast'

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabaseClient
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const validatedLeads = data.map(lead => leadSchema.parse(lead))
        setLeads(validatedLeads)
      } catch (error) {
        console.error('Error fetching leads:', error)
        showErrorToast('Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  return { leads, loading }
}
