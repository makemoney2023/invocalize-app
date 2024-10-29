import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'

interface CallTranscriptViewerProps {
  transcript: string
  recordingUrl?: string
}

export function CallTranscriptViewer({ transcript, recordingUrl }: CallTranscriptViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const togglePlayback = () => {
    if (!audio && recordingUrl) {
      const newAudio = new Audio(recordingUrl)
      setAudio(newAudio)
      newAudio.play()
      setIsPlaying(true)
    } else if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="space-y-4">
      {recordingUrl && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'} Recording
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <div className="space-y-4">
          {transcript.split('\n').map((line, index) => (
            <p key={index} className="text-sm">
              {line}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
