import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { Lead } from '@/types/lead'
import { FollowUpEffectiveness } from '@/types/followup-effectiveness'
import { FollowUpEffectivenessService } from '@/services/followup-effectiveness-service'
import { cn } from '@/lib/utils'

interface FollowUpEffectivenessCardProps {
  lead: Lead
  followUpDate: Date
}

export function FollowUpEffectivenessCard({ lead, followUpDate }: FollowUpEffectivenessCardProps) {
  const service = new FollowUpEffectivenessService()
  const effectiveness = service.calculateEffectiveness(lead, followUpDate)

  if (!effectiveness) return null

  const outcomeIcons = {
    converted: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    lost: <XCircle className="h-4 w-4 text-red-500" />,
    in_progress: <Clock className="h-4 w-4 text-blue-500" />,
    no_response: <AlertCircle className="h-4 w-4 text-yellow-500" />,
    rescheduled: <ArrowRight className="h-4 w-4 text-orange-500" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Follow-up Effectiveness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {outcomeIcons[effectiveness.outcome]}
              <span className="font-medium capitalize">
                {effectiveness.outcome.replace('_', ' ')}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Effectiveness Score: {(effectiveness.effectivenessScore * 100).toFixed(0)}%
            </div>
          </div>
          <Badge variant={effectiveness.originalPriority === 'critical' ? 'destructive' : 'default'}>
            {effectiveness.originalPriority.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Impact Factors</h4>
          {effectiveness.factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{factor.name}</span>
                <span className="text-sm text-muted-foreground">
                  {(factor.impact * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={factor.impact * 100} />
              <p className="text-xs text-muted-foreground">{factor.suggestion}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Next Steps</h4>
          <ul className="space-y-2">
            {effectiveness.nextSteps.map((step, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
