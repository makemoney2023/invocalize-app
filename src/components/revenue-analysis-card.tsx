'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import { Lead } from '@/types/lead'
import { RevenueMetrics } from '@/types/revenue'
import { cn } from '@/lib/utils'

type RevenueMetrics = {
  potentialValue: number
  expectedRevenue: number
  timeline: 'immediate' | 'short-term' | 'long-term'
  confidence: 'high' | 'medium' | 'low'
}

interface RevenueAnalysisCardProps {
  lead: Lead
}

export function RevenueAnalysisCard({ lead }: RevenueAnalysisCardProps) {
  const calculateMetrics = (): RevenueMetrics | null => {
    const analysis = lead.call_analyses?.[0]
    if (!analysis) return null

    const potentialValue = analysis.potential_value || 0
    
    const confidenceMultiplier = {
      high: 0.8,
      medium: 0.5,
      low: 0.2
    }[analysis.confidence_level || 'medium']

    const expectedRevenue = potentialValue * confidenceMultiplier

    return {
      potentialValue,
      expectedRevenue,
      timeline: analysis.timeline || 'short-term',
      confidence: analysis.confidence_level || 'medium'
    }
  }

  const metrics = calculateMetrics()
  if (!metrics) return null

  const timelineColor = {
    immediate: 'success',
    'short-term': 'secondary',
    'long-term': 'default'
  } as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Revenue Impact Analysis
          <Badge variant={timelineColor[metrics.timeline]}>
            {metrics.timeline}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Potential Value</p>
              <p className="text-2xl font-bold">
                ${(metrics.potentialValue / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Expected Revenue</p>
              <p className="text-2xl font-bold">
                ${(metrics.expectedRevenue / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Confidence</p>
              <p className="text-2xl font-bold capitalize">
                {metrics.confidence}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
