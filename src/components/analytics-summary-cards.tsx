'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead } from '@/types/lead'
import { Phone, BarChart, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { RecommendationService } from '@/services/recommendationService'
import { FollowUpRecommendation, FollowUpPriority } from '@/types/follow-up'
import { RevenueAnalysisCard } from '@/components/revenue-analysis-card'

interface AnalyticsSummaryCardsProps {
  leads: Lead[]
}

export function AnalyticsSummaryCards({ leads }: AnalyticsSummaryCardsProps) {
  const stats = useMemo(() => {
    const recommendationService = new RecommendationService()
    const recommendations = leads
      .filter(lead => lead.call_analyses?.[0])
      .map(lead => recommendationService.generateRecommendation(lead))
      .filter((rec): rec is FollowUpRecommendation => rec !== null)

    const priorityCounts = recommendations.reduce((acc, rec) => ({
      ...acc,
      [rec.priority]: (acc[rec.priority] || 0) + 1
    }), {} as Record<FollowUpPriority, number>)

    const totalPotentialValue = recommendations.reduce((sum, rec) => 
      sum + rec.potentialValue, 0
    )

    const totalCalls = leads.length
    const analyzedCalls = leads.filter(lead => 
      lead.call_analyses && lead.call_analyses.length > 0
    ).length
    const averageCallLength = leads.reduce((acc, lead) => 
      acc + (lead.call_length || 0), 0) / totalCalls
    const lastCallTime = leads[0]?.created_at ? 
      new Date(leads[0].created_at) : new Date()

    return {
      totalCalls,
      analyzedCalls,
      averageCallLength: Math.round(averageCallLength),
      lastCallTime,
      criticalLeads: priorityCounts.critical || 0,
      highPriorityLeads: priorityCounts.high || 0,
      potentialValue: totalPotentialValue
    }
  }, [leads])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
          <p className="text-xs text-muted-foreground">
            Recorded conversations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Analysis Rate</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round((stats.analyzedCalls / stats.totalCalls) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.analyzedCalls} calls analyzed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Call Length</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageCallLength}m</div>
          <p className="text-xs text-muted-foreground">
            Minutes per call
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.lastCallTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.lastCallTime.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Priority Leads</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.criticalLeads + stats.highPriorityLeads}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.criticalLeads} critical, {stats.highPriorityLeads} high priority
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Potential Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(stats.potentialValue / 1000).toFixed(1)}k
          </div>
          <p className="text-xs text-muted-foreground">
            Estimated opportunity value
          </p>
        </CardContent>
      </Card>
    </>
  )
}
