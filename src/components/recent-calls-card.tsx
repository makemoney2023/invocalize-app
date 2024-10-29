import { type Lead } from '@/types/lead'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type RecentCallsCardProps = {
  leads: Lead[] | null
  onSelectLead: (id: string) => void
}

export const RecentCallsCard = ({ leads, onSelectLead }: RecentCallsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
      </CardHeader>
      <CardContent>
        <RecentCallsList leads={leads ?? []} onSelectLead={onSelectLead} />
      </CardContent>
    </Card>
  )
}

type RecentCallsListProps = {
  leads: Lead[]
  onSelectLead: (id: string) => void
}

export const RecentCallsList = ({ leads, onSelectLead }: RecentCallsListProps) => {
  return (
    <div className="space-y-2">
      {leads.map((lead) => (
        <button
          key={lead.id}
          onClick={() => onSelectLead(lead.id)}
          className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
        >
          <div className="font-medium">{lead.name}</div>
          <div className="text-sm text-gray-500">
            {new Date(lead.created_at).toLocaleDateString()}
          </div>
        </button>
      ))}
    </div>
  )
}