import { useDatabase } from '@/hooks/useDatabase'
import type { Database } from '@/lib/supabase/types'

type Lead = Database['public']['Tables']['leads']['Row']

export async function createOrUpdateCRMContact(lead: Lead) {
  const { supabase } = useDatabase()
  
  const { data, error } = await supabase
    .from('crm_contacts')
    .upsert({
      lead_id: lead.id,
      name: lead.name,
      email: lead.email,
      phone_number: lead.phone_number,
      last_contact_date: new Date().toISOString()
    }, {
      onConflict: 'lead_id'
    })
    .select()
    .single()

  if (error) throw error
  return data
}
