import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { Lead } from '@/types/lead'
import { FollowUpEffectivenessService } from '@/services/followup-effectiveness-service'
import { cn } from '@/lib/utils'
import { addDays, addWeeks } from 'date-fns'

interface FollowUpEffectivenessPreviewProps {
  lead: Lead
  onDateSelect?: (date: Date) => void
}

export function FollowUpEffectivenessPreview({ 
  lead, 
  onDateSelect 
}: FollowUpEffectivenessPreviewProps) {
  const service = new FollowUpEffectivenessService()
  
  const timeframes = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: addDays(new Date(), 1) },
    { label: 'Next Week', date: addWeeks(new Date(), 1) }
  ]

  const effectivenessScores = timeframes.map(timeframe => ({
    ...timeframe,
    effectiveness: service.calculateEffectiveness(lead, timeframe.date)
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recommended Follow-up Times</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {effectivenessScores.map((score, index) => (
          <button
            key={index}
            className={cn(
              "w-full p-4 rounded-lg border transition-colors",
              "hover:bg-muted/50 cursor-pointer",
              score.effectiveness?.effectivenessScore >= 0.7 && "border-primary"
            )}
            onClick={() => onDateSelect?.(score.date)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{score.label}</span>
              </div>
              <Badge variant={
                score.effectiveness?.effectivenessScore >= 0.7 ? "success" : "secondary"
              }>
                {score.effectiveness ? 
                  `${(score.effectiveness.effectivenessScore * 100).toFixed(0)}%` : 
                  'Not Recommended'
                }
              </Badge>
            </div>
            {score.effectiveness && (
              <Progress 
                value={score.effectiveness.effectivenessScore * 100} 
                className="h-2"
              />
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
