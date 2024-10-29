'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { useVoiceCallData } from '@/hooks/useVoiceCallData'
import { Lead } from '@/types/lead'
import { format } from 'date-fns'

interface TranscriptModalProps {
  isOpen: boolean
  onClose: () => void
  leadId: string | null
}

export function TranscriptModal({ isOpen, onClose, leadId }: TranscriptModalProps) {
  const { lead, loading } = useVoiceCallData()
  const [currentTranscript, setCurrentTranscript] = useState<string[]>([])

  useEffect(() => {
    if (lead?.transcripts) {
      const sortedTranscripts = [...lead.transcripts]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(t => t.text)
      setCurrentTranscript(sortedTranscripts)
    }
  }, [lead])

  if (!leadId || !isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Call Transcript</DialogTitle>
          {lead && (
            <div className="text-sm text-muted-foreground">
              {format(new Date(lead.created_at), 'PPpp')}
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading transcript...
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {currentTranscript.map((text, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    index % 2 === 0 ? 'bg-muted' : 'bg-background'
                  }`}
                >
                  {text}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {lead?.concatenated_transcript && !lead.call_analyses?.length && (
            <Button onClick={() => {
              // Handle analysis trigger
              onClose()
            }}>
              Analyze Call
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

