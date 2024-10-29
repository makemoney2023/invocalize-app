import { z } from 'zod'
import type { Database } from '@/lib/supabase/types'

export const contactSchema = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  company: z.string().optional(),
  last_contact_date: z.string(),
  notes: z.string().optional(),
})

export type Contact = Database['public']['Tables']['crm_contacts']['Row']

// Type guard for runtime type checking
export function isContact(value: unknown): value is Contact {
  return contactSchema.safeParse(value).success
}

