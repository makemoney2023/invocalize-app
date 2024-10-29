import { formatDistanceToNow, format } from 'date-fns'
import { Phone, Clock, Building, MapPin } from 'lucide-react'
import { Lead } from '@/types/lead'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDuration } from '@/lib/utils/format'
import { CallStatusBadge } from '@/components/ui/call-status-badge'
import { AudioPlayer } from '@/components/ui/audio-player'

interface RecentCallsListProps {
  leads: Lead[]
  onSelectLead: (leadId: string) => void
}

export function RecentCallsList({ leads, onSelectLead }: RecentCallsListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Caller</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Recording</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow 
            key={lead.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onSelectLead(lead.id)}
          >
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{lead.name}</span>
                {lead.company && (
                  <span className="text-sm text-muted-foreground">{lead.company}</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <a 
                href={`tel:${lead.phone_number}`}
                onClick={(e) => e.stopPropagation()}
                className="text-primary hover:underline flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                {lead.phone_number}
              </a>
            </TableCell>
            <TableCell>{formatDuration(lead.call_length)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {lead.city}, {lead.state}
              </div>
            </TableCell>
            <TableCell>
              <CallStatusBadge status={lead.call_status} />
            </TableCell>
            <TableCell>
              {lead.price ? (
                <span className="font-medium">${lead.price.toFixed(2)}</span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>{formatDistanceToNow(new Date(lead.created_at))} ago</TableCell>
            <TableCell>
              {lead.recording_url && (
                <AudioPlayer url={lead.recording_url} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
