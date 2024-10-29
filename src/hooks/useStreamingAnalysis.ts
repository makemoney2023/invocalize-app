import { useState } from 'react';
import { z } from 'zod';
import { AnalysisResult } from '@/lib/openai/parser';
import { toast } from '@/components/ui/toast';

const StreamResponseSchema = z.object({
  messageId: z.string().uuid(),
  leadId: z.string().uuid(),
  transcript: z.string(),
});

export function useStreamingAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  const analyzeTranscript = async (leadId: string, transcript: string) => {
    setIsAnalyzing(true);
    setProgress([]);

    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          transcript,
          messageId: crypto.randomUUID(),
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setProgress(prev => [...prev, text]);
      }

      toast({
        title: 'Analysis Complete',
        description: 'Transcript analysis has been completed successfully.',
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze transcript. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    progress,
    analyzeTranscript,
  };
}
