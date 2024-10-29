'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from "@clerk/nextjs"
import { useDatabase } from '@/providers/database-provider'
import { Lead, leadSchema } from '@/types/lead'
import { showErrorToast } from '@/utils/toast'
import { Logger } from '@/utils/logger'

export function useVoiceCallData({ leadId }: { leadId?: string } = {}) {
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const { userId } = useAuth()
  const supabase = useDatabase()

  const fetchLead = useCallback(async () => {
    if (!leadId || !userId) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          call_analyses (*)
        `)
        .eq('id', leadId)
        .eq('user_id', userId)
        .single()

      if (error) throw error
      
      const validatedLead = leadSchema.parse(data)
      setLead(validatedLead)
    } catch (error) {
      showErrorToast(error)
      setLead(null)
    } finally {
      setLoading(false)
    }
  }, [leadId, userId, supabase])

  useEffect(() => {
    fetchLead()
  }, [fetchLead])

  const refresh = async () => {
    await fetchLead()
  }

  return {
    lead,
    loading,
    refresh
  }
}
