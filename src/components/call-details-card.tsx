import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Lead } from '@/types/lead'
import { Phone, Clock, Building, MapPin } from 'lucide-react'
import { formatDuration } from '@/lib/utils/format'
import { CallStatusBadge } from '@/components/ui/call-status-badge'

interface CallDetailsCardProps {
  lead: Lead
}

export function CallDetailsCard({ lead }: CallDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Duration</p>
            <p className="text-2xl">{formatDuration(lead.call_length)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <CallStatusBadge status={lead.call_status} />
          </div>
          <div>
            <p className="text-sm font-medium">Started At</p>
            <p>{lead.started_at ? format(new Date(lead.started_at), 'PPp') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Location</p>
            <p>{[lead.city, lead.state].filter(Boolean).join(', ') || 'N/A'}</p>
          </div>
          {lead.price && (
            <div>
              <p className="text-sm font-medium">Cost</p>
              <p>${lead.price}</p>
            </div>
          )}
          {lead.use_case && (
            <div>
              <p className="text-sm font-medium">Use Case</p>
              <p>{lead.use_case}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
