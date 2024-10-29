'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lead } from '@/types/lead'
import { BarChart2, PieChart, TrendingUp } from 'lucide-react'

interface AnalysisTabContentProps {
  leads: Lead[]
}

export function AnalysisTabContent({ leads }: AnalysisTabContentProps) {
  const stats = useMemo(() => {
    const analyzedLeads = leads.filter(lead => 
      lead.call_analyses && lead.call_analyses.length > 0
    )
    
    return {
      totalAnalyzed: analyzedLeads.length,
      averageLength: Math.round(
        analyzedLeads.reduce((acc, lead) => acc + (lead.call_length || 0), 0) / 
        analyzedLeads.length || 0
      ),
      successRate: Math.round((analyzedLeads.length / leads.length) * 100)
    }
  }, [leads])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Analysis Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <BarChart2 className="h-8 w-8 text-muted-foreground" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAnalyzed} of {leads.length} calls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Call Length</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <PieChart className="h-8 w-8 text-muted-foreground" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.averageLength}m</p>
                <p className="text-xs text-muted-foreground">Minutes per call</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Analysis Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalAnalyzed}</p>
                <p className="text-xs text-muted-foreground">Total analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
