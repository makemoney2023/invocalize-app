import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StreamingAnalysis } from '@/components/streaming-analysis'
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis'

jest.mock('@/hooks/useStreamingAnalysis')

describe('StreamingAnalysis', () => {
  const mockAnalyzeTranscript = jest.fn()
  
  beforeEach(() => {
    (useStreamingAnalysis as jest.Mock).mockReturnValue({
      isAnalyzing: false,
      progress: [],
      analyzeTranscript: mockAnalyzeTranscript
    })
  })

  it('handles analysis correctly', async () => {
    render(
      <StreamingAnalysis
        leadId="123"
        transcript="Test transcript"
        onComplete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByText('Start Analysis'))

    await waitFor(() => {
      expect(mockAnalyzeTranscript).toHaveBeenCalledWith(
        '123',
        'Test transcript'
      )
    })
  })
})
