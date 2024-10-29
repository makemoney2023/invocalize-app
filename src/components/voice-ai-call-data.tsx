"use client"

import { useVoiceCallData } from '@/hooks/useVoiceCallData'
import { useLeadsData } from '@/hooks/useLeadsData'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RecentCallsList } from '@/components/recent-calls-list'
import { CallDetailsCard } from '@/components/call-details-card'
import { CallTranscriptViewer } from '@/components/call-transcript-viewer'
import { useState } from 'react'

export function VoiceAICallData() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>(undefined);
  const { lead, loading } = useVoiceCallData({ leadId: selectedLeadId });
  const { leads, loading: leadsLoading } = useLeadsData();

  if (loading || leadsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentCallsList 
            leads={leads}
            onSelectLead={setSelectedLeadId}
          />
        </CardContent>
      </Card>

      {lead && (
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
                  transcript={lead.concatenated_transcript || ''}
                  recordingUrl={lead.recording_url}
                />
              </TabsContent>
              
              <TabsContent value="analysis">
                {lead.call_analyses && lead.call_analyses[0] && (
                  <div className="prose max-w-none">
                    <pre>{JSON.stringify(lead.call_analyses[0], null, 2)}</pre>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
