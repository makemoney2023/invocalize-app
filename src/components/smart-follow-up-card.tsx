import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react'
import { Lead } from '@/types/lead'
import { FollowUpRecommendation } from '@/types/followup'
import { RecommendationService } from '@/services/recommendationService'
import { cn } from '@/lib/utils'

interface SmartFollowUpCardProps {
  lead: Lead
  onSchedule: (date: Date) => Promise<void>
}

const priorityColors = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
}

export function SmartFollowUpCard({ lead, onSchedule }: SmartFollowUpCardProps) {
  const [recommendation, setRecommendation] = useState<FollowUpRecommendation | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  
  useEffect(() => {
    const recommendationService = new RecommendationService()
    const rec = recommendationService.generateRecommendation(lead)
    setRecommendation(rec)
  }, [lead])

  if (!recommendation) return null

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Smart Follow-up</CardTitle>
          <Badge variant={recommendation.priority === 'critical' ? 'destructive' : 'default'}>
            {recommendation.priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className={cn(
              "h-4 w-4",
              priorityColors[recommendation.priority]
            )} />
            <span className="font-medium">{recommendation.reason}</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Recommended timeframe: {format(recommendation.recommendedTimeFrame.min, 'PPp')} 
            - {format(recommendation.recommendedTimeFrame.max, 'PPp')}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Suggested Talking Points:</h4>
          <ul className="list-disc pl-4 space-y-1">
            {recommendation.suggestedTalkingPoints.map((point, i) => (
              <li key={i} className="text-sm">{point}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 mt-4">
          <h4 className="font-medium">Key Insights:</h4>
          <div className="grid gap-2">
            {recommendation.keyInsights.map((insight, i) => (
              <div 
                key={i}
                className={cn(
                  "p-2 rounded-md border",
                  insight.priority >= 4 ? "bg-muted/50" : "bg-background"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="capitalize font-medium">{insight.type}</span>
                  <Badge variant={insight.priority >= 4 ? "destructive" : "secondary"}>
                    P{insight.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => 
              date < recommendation.recommendedTimeFrame.min || 
              date > recommendation.recommendedTimeFrame.max
            }
            className="rounded-md border"
          />
          
          <Button 
            className="w-full mt-4"
            disabled={!selectedDate}
            onClick={() => selectedDate && onSchedule(selectedDate)}
          >
            Schedule Follow-up
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
