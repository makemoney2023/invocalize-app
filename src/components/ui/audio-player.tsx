import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause } from 'lucide-react'

interface AudioPlayerProps {
  url: string
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex items-center gap-2">
      <audio ref={audioRef} src={url} />
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  )
}
