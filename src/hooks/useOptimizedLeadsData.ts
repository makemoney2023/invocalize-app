import { useEffect, useState, useCallback, useRef } from 'react'
import { useDatabase } from '@/hooks/useDatabase'
import { Lead } from '@/types/lead'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

const BATCH_SIZE = 20

export function useOptimizedLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const lastTimestamp = useRef<string | null>(null)
  const { supabase } = useDatabase()

  const loadMoreLeads = useCallback(async () => {
    if (!hasMore) return

    const query = supabase
      .from('leads')
      .select('*, call_analyses(*)')
      .order('created_at', { ascending: false })
      .limit(BATCH_SIZE)

    if (lastTimestamp.current) {
      query.lt('created_at', lastTimestamp.current)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return
    }

    if (data.length < BATCH_SIZE) {
      setHasMore(false)
    }

    if (data.length > 0) {
      lastTimestamp.current = data[data.length - 1].created_at
      setLeads(prev => [...prev, ...data])
    }
  }, [supabase, hasMore])

  // Real-time subscription for new leads only
  useEffect(() => {
    const subscription = supabase
      .channel('new_leads')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      }, payload => {
        setLeads(prev => [payload.new as Lead, ...prev])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    leads,
    isLoading,
    hasMore,
    loadMoreLeads
  }
}
