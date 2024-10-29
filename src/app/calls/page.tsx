'use client'

import { useState } from 'react'
import { useLeadsData } from '@/hooks/useLeadsData'
import { RecentCallsList } from '@/components/recent-calls-list'
import { CallDetailsCard } from '@/components/call-details-card'
import { CallTranscriptViewer } from '@/components/call-transcript-viewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function CallsPage() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const { leads, loading } = useLeadsData()
  
  const selectedLead = leads.find(lead => lead.id === selectedLeadId)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Recent Calls</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentCallsList 
            leads={leads}
            onSelectLead={setSelectedLeadId}
          />
        </div>
        
        {selectedLead && (
          <div className="space-y-6">
            <CallDetailsCard lead={selectedLead} />
            
            <Tabs defaultValue="transcript">
              <TabsList>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transcript">
                <CallTranscriptViewer 
                  transcript={selectedLead.concatenated_transcript || ''}
                  recordingUrl={selectedLead.recording_url}
                />
              </TabsContent>
              
              <TabsContent value="analysis">
                {/* Add Analysis Component Here */}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}

