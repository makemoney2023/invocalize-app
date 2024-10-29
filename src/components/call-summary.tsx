'use client'

import { useState } from 'react'
import { useVoiceCallData } from '@/hooks/useVoiceCallData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Phone, Clock, Building, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SmartFollowUpCard } from '@/components/smart-follow-up-card'
import { RevenueAnalysisCard } from '@/components/revenue-analysis-card'
import { FollowUpEffectivenessCard } from '@/components/follow-up-effectiveness-card'
import { FollowUpEffectivenessPreview } from '@/components/follow-up-effectiveness-preview'

interface CallSummaryProps {
  leadId: string
  className?: string
  onScheduleFollowUp: (appointment: {
    leadId: string
    date: string
    time: string
    note: string
  }) => Promise<void>
}

export function CallSummary({ leadId, className, onScheduleFollowUp }: CallSummaryProps) {
  const { lead, loading } = useVoiceCallData({ leadId })
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        Loading call data...
      </div>
    )
  }

  if (!lead) {
    return (
      <div className={`p-4 ${className}`}>
        No call data available
      </div>
    )
  }

  const handleSchedule = async () => {
    if (!date || !time) return

    await onScheduleFollowUp({
      leadId,
      date: format(date, 'yyyy-MM-dd'),
      time,
      note
    })

    // Reset form
    setDate(undefined)
    setTime('')
    setNote('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{lead.phone_number}</span>
          </div>
          
          {/* Add Email */}
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{lead.email}</span>
          </div>

          {/* Add Transcript */}
          {lead.concatenated_transcript && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Call Transcript</h4>
              <div className="bg-muted p-4 rounded-md max-h-48 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">
                  {lead.concatenated_transcript}
                </p>
              </div>
            </div>
          )}

          {lead.company && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{lead.company}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(lead.created_at), 'PPpp')}</span>
          </div>
        </div>

        {/* Analysis Results */}
        {lead.call_analyses?.[0] && (
          <div className="space-y-4">
            <h4 className="font-medium">Analysis Results</h4>
            <div className="space-y-2">
              <p><strong>Sentiment Score:</strong> {lead.call_analyses[0].sentiment_score}</p>
              <div>
                <strong>Key Points:</strong>
                <ul className="list-disc pl-4 mt-2">
                  {lead.call_analyses[0].key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <p><strong>Customer Satisfaction:</strong> {lead.call_analyses[0].customer_satisfaction}</p>
            </div>
          </div>
        )}

        {lead.call_analyses?.[0] && (
          <RevenueAnalysisCard lead={lead} />
        )}

        {/* Schedule Follow-up Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Schedule Follow-up</h4>
          <div className="grid gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  defaultMonth={date}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full"
            />
            
            <Textarea
              placeholder="Add notes about the follow-up..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full"
            />
            
            <Button 
              onClick={handleSchedule}
              disabled={!date || !time}
              className="w-full"
            >
              Schedule Follow-up
            </Button>
          </div>
        </div>

        {lead.call_analyses?.[0] && (
          <>
            <SmartFollowUpCard
              lead={lead}
              onSchedule={async (date) => {
                const timeStr = format(date, 'HH:mm')
                await onScheduleFollowUp({
                  leadId: lead.id,
                  date: format(date, 'yyyy-MM-dd'),
                  time: timeStr,
                  note: 'Auto-scheduled via Smart Follow-up'
                })
                
                // Reset the manual scheduling form
                setDate(undefined)
                setTime('')
                setNote('')
              }}
            />

            {date && (
              <FollowUpEffectivenessCard
                lead={lead}
                followUpDate={date}
              />
            )}
          </>
        )}

        {lead.call_analyses?.[0] && (
          <div className="space-y-6">
            <FollowUpEffectivenessPreview 
              lead={lead} 
              onDateSelect={(selectedDate) => {
                setDate(selectedDate)
                setTime(format(selectedDate, 'HH:mm'))
              }}
            />
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Select Follow-up Date</h4>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              
              {date && (
                <FollowUpEffectivenessCard
                  lead={lead}
                  followUpDate={date}
                />
              )}
            </div>
          </div>
        )}

        {lead.call_analyses?.[0] && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Test Follow-up Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => {
                    const testDate = new Date()
                    setDate(testDate)
                    setTime(format(testDate, 'HH:mm'))
                  }}
                  className="w-full"
                >
                  Show Effectiveness Analysis
                </Button>
              </CardContent>
            </Card>

            {date && (
              <FollowUpEffectivenessCard
                lead={lead}
                followUpDate={date}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
