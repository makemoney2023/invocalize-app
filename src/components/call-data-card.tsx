'use client'

import { memo } from 'react'
import { Lead } from '@/types/lead'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Phone, Clock, Building, AlertCircle } from 'lucide-react'
import { RecommendationService } from '@/services/recommendationService'
import { cn } from '@/lib/utils'

interface CallDataCardProps {
  lead: Lead
  onAnalyze: (leadId: string, transcript: string) => Promise<void>
  onSelect: () => void
}

const CallDataCard = memo(function CallDataCard({ lead, onAnalyze, onSelect }: CallDataCardProps) {
  const hasAnalysis = lead.call_analyses && lead.call_analyses.length > 0
  const timeAgo = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">
            {lead.name}
          </CardTitle>
          {hasAnalysis && (
            <PriorityIndicator lead={lead} />
          )}
        </div>
        <Badge variant={hasAnalysis ? "success" : "secondary"}>
          {hasAnalysis ? "Analyzed" : "Pending Analysis"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4" />
            <span>{lead.phone_number}</span>
          </div>
          {lead.company && (
            <div className="flex items-center space-x-2 text-sm">
              <Building className="h-4 w-4" />
              <span>{lead.company}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{timeAgo}</span>
          </div>
          {!hasAnalysis && lead.concatenated_transcript && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze(lead.id, lead.concatenated_transcript!);
              }}
              className="w-full mt-2"
            >
              Analyze Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export { CallDataCard }

function PriorityIndicator({ lead }: { lead: Lead }) {
  const recommendationService = new RecommendationService()
  const recommendation = recommendationService.generateRecommendation(lead)
  
  if (!recommendation) return null
  
  const priorityColors = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-green-500'
  }
  
  return (
    <AlertCircle 
      className={cn(
        "h-4 w-4",
        priorityColors[recommendation.priority]
      )}
      aria-label={`Priority: ${recommendation.priority}`}
    />
  )
}
