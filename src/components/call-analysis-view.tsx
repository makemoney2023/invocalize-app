import { type CallAnalysis } from '@/types/voice-call'
import { Card, CardContent } from '@/components/ui/card'

type CallAnalysisViewProps = {
  analysis: CallAnalysis
}

export const CallAnalysisView = ({ analysis }: CallAnalysisViewProps) => {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Summary</h3>
          <p className="text-gray-600">{analysis.summary}</p>
        </div>
        {/* Add more analysis sections as needed */}
      </CardContent>
    </Card>
  )
}
