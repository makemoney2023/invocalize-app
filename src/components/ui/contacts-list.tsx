'use client'

import { Card } from "./card"
import { LoadingSpinner } from "./loading-spinner"
import type { Database } from '@/lib/supabase/types'

type Contact = Database['public']['Tables']['crm_contacts']['Row']

interface ContactsListProps {
  contacts: Contact[]
  loading?: boolean
  onContactClick?: (contact: Contact) => void
}

export function ContactsList({ 
  contacts, 
  loading = false, 
  onContactClick 
}: ContactsListProps) {
  if (loading) {
    return <LoadingSpinner className="mx-auto" />
  }

  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <Card 
          key={contact.id}
          className="p-4 hover:bg-muted/50 cursor-pointer"
          onClick={() => onContactClick?.(contact)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{contact.name}</h3>
              <p className="text-sm text-muted-foreground">{contact.email}</p>
            </div>
            {contact.company && (
              <span className="text-sm text-muted-foreground">{contact.company}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
