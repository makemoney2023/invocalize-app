"use client"

import { memo, useState, useMemo } from 'react'
import { useVoiceCallData } from '@/hooks/useVoiceCallData'
import { useLeadsData } from '@/hooks/useLeadsData'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RecentCallsCard } from './recent-calls-card'
import { CallDetailsCard } from '@/components/call-details-card'
import { CallTranscriptViewer } from '@/components/call-transcript-viewer'
import { CallAnalysisView } from './call-analysis-view'
import { ErrorBoundary } from '@/components/error-boundary'
import { toast } from '@/components/ui/use-toast'
import type { Lead } from '@/types/lead'

interface VoiceAICallDataProps {
  initialLeadId?: string
}

export const VoiceAICallData = memo(function VoiceAICallData({ 
  initialLeadId 
}: VoiceAICallDataProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(initialLeadId)
  const { 
    lead, 
    loading: leadLoading,
    refresh: refreshLead
  } = useVoiceCallData({ leadId: selectedLeadId })
  
  const { 
    leads, 
    loading: leadsLoading,
    refresh: refreshLeads
  } = useLeadsData()

  const sortedLeads = useMemo(() => {
    if (!leads) return []
    return [...leads].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [leads])

  const handleError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to load call data. Please try again.",
      variant: "destructive"
    } as const)
    refreshLead()
    refreshLeads()
  }

  if (leadsLoading || leadLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error }: { error: Error }) => (
        <div className="text-center p-4">
          <h2 className="text-lg font-semibold text-red-600">
            {error.message || "Something went wrong"}
          </h2>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        <RecentCallsCard 
          leads={sortedLeads} 
          onSelectLead={setSelectedLeadId}
        />

        {lead && (
          <SelectedCallCard lead={lead} />
        )}
      </div>
    </ErrorBoundary>
  )
})

const SelectedCallCard = memo(function SelectedCallCard({ 
  lead 
}: { 
  lead: Lead 
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <CallDetailsCard lead={lead} />
        
        <Tabs defaultValue="transcript" className="mt-6">
          <TabsList>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcript">
            <CallTranscriptViewer 
              transcript={lead.concatenated_transcript ?? ''}
              recordingUrl={lead.recording_url}
            />
          </TabsContent>
          
          <TabsContent value="analysis">
            {lead.call_analyses?.[0] && (
              <CallAnalysisView analysis={lead.call_analyses[0]} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
})
