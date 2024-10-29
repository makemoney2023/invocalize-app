import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import { withRetry } from '@/lib/utils/retry';
import { ErrorBoundary } from '@/components/error-boundary';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

type StreamingAnalysisProps = {
  leadId: string;
  transcript: string;
  onComplete?: (analysis: AnalysisResult) => void;
};

export function StreamingAnalysis({ leadId, transcript, onComplete }: StreamingAnalysisProps) {
  const [retryCount, setRetryCount] = useState(0);
  const { isAnalyzing, progress, analyzeTranscript } = useStreamingAnalysis();

  const handleAnalysis = async () => {
    try {
      await withRetry(
        () => analyzeTranscript(leadId, transcript),
        {
          maxAttempts: 3,
          delayMs: 1000,
          backoff: true,
        }
      );
    } catch (error) {
      setRetryCount(prev => prev + 1);
      throw error; // Let error boundary handle it
    }
  };

  return (
    <ErrorBoundary>
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analysis Progress</h3>
          {retryCount > 0 && (
            <span className="text-sm text-muted-foreground">
              Retry attempt: {retryCount}/3
            </span>
          )}
        </div>
        
        {isAnalyzing && (
          <Progress value={(progress.length / 10) * 100} className="w-full" />
        )}

        <div className="space-y-2">
          {progress.map((text, index) => (
            <p key={index} className="text-sm text-gray-600">
              {text}
            </p>
          ))}
        </div>

        <button
          onClick={handleAnalysis}
          disabled={isAnalyzing}
          className="btn btn-primary w-full"
        >
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </Card>
    </ErrorBoundary>
  );
}
