import { useDatabase } from './useDatabase'
import { EmailLog } from '@/services/emailService'
import { useState, useEffect } from 'react'

export function useEmailHistory(leadId: string) {
  const { supabase } = useDatabase()
  const [emails, setEmails] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmails = async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setEmails(data)
      }
      setLoading(false)
    }

    fetchEmails()
  }, [leadId, supabase])

  return { emails, loading }
}

