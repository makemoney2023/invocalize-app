'use client';

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useCallback } from 'react'

export function useDatabase() {
  const supabase = useSupabaseClient()

  const query = useCallback(
    async <T>(
      tableName: string,
      queryFn: (queryBuilder: any) => any
    ): Promise<T | null> => {
      try {
        const queryBuilder = supabase.from(tableName)
        const { data, error } = await queryFn(queryBuilder)
        
        if (error) throw error
        return data as T
      } catch (error) {
        console.error(`Database query error:`, error)
        return null
      }
    },
    [supabase]
  )

  return {
    supabase,
    query
  }
}
