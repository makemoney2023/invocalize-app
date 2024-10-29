import { useVirtualizer } from '@tanstack/react-virtual'
import { useLeadsData } from '@/hooks/useLeadsData'
import { Lead } from '@/types/lead'
import { useRef, useCallback } from 'react'
import { CallDataCard } from '@/components/call-data-card'
import { showErrorToast, showSuccessToast } from '@/utils/toast'
import { analyzeLead } from '@/lib/analysis'

interface VirtualizedLeadListProps {
  pageSize?: number
  onLeadSelect: (lead: Lead) => void
  className?: string
}

export function VirtualizedLeadList({
  pageSize = 20,
  onLeadSelect,
  className
}: VirtualizedLeadListProps) {
  const { leads, loading, refresh } = useLeadsData({ pageSize })
  const parentRef = useRef<HTMLDivElement>(null)

  const handleAnalyze = useCallback(async (leadId: string, transcript: string) => {
    try {
      await analyzeLead(leadId, transcript)
      showSuccessToast("Call analyzed successfully")
      refresh()
    } catch (error) {
      showErrorToast(error)
    }
  }, [refresh])

  const virtualizer = useVirtualizer({
    count: leads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Adjusted for card height
    overscan: 5,
  })

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <p>Loading leads...</p>
      </div>
    )
  }

  return (
    <div 
      ref={parentRef} 
      className={`h-[600px] overflow-auto ${className}`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const lead = leads[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                padding: '0.5rem',
              }}
            >
              <CallDataCard
                lead={lead}
                onAnalyze={handleAnalyze}
                onSelect={() => onLeadSelect(lead)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
