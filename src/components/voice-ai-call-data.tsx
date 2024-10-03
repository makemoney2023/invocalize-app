"use client"

import { useState, useMemo, Key, ReactNode, Suspense, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactPortal, SetStateAction } from 'react'
import { ChevronDown, ChevronUp, Phone, Smile, Meh, Frown, List, Grid, X, Calendar as CalendarIcon, Settings, LayoutDashboard, Menu, Clock, Voicemail, PhoneForwarded, BarChart, ChevronLeft, ChevronRight, FileText, Caravan, Truck, Bus, Mail, CheckCircle, DollarSign } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLeadsData } from '@/hooks/useLeadsData'
import { calculateAverageDuration } from '@/utils/calculateAverageDuration'

// Import the Lead type from your hook
import { Lead } from '../hooks/useLeadsData'

// If you need to extend the Lead type, do it like this:
type ExtendedLead = Lead & {
  // Add any additional properties here if needed
};

interface CallData {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  interestedIn: string
  sentimentScore: number
  callSummary: string
  actionsTaken: string[]
  appointmentBooked: string | null
  transcript: { speaker: string; text: string }[]
}

interface Appointment {
  id: string
  date: string
  time: string
  firstName: string
  lastName: string
  interestedIn: string
  phoneNumber: string
}

enum CallStatus {
  Voicemail = 'voicemail',
  Answered = 'answered',
  Transferred = 'transferred',
}

const SentimentIcon = ({ score }: { score: number }) => {
  if (score > 0.66) return <Smile className="w-6 h-6 text-green-500" />
  if (score > 0.33) return <Meh className="w-6 h-6 text-yellow-500" />
  return <Frown className="w-6 h-6 text-red-500" />
}

const RVTypeIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case 'travel trailer':
      return <Caravan className="w-4 h-4 mr-2" aria-label="Travel Trailer" />
    case 'fifth wheel':
      return <Truck className="w-4 h-4 mr-2" aria-label="Fifth Wheel" />
    case 'class a motorhome':
      return <Bus className="w-4 h-4 mr-2" aria-label="Class A Motorhome" />
    default:
      return <Caravan className="w-4 h-4 mr-2" aria-label="RV" />
  }
}

const CallSummary = ({ summary }: { summary: string }) => {
  return (
    <div className="call-summary">
      <h3>Call Summary</h3>
      <p>{summary}</p>
    </div>
  );
};

const CallDuration = ({ duration }: { duration: number }) => {
  const minutes = Math.floor(duration);
  const seconds = Math.round((duration - minutes) * 60);
  return <span>{minutes}m {seconds}s</span>;
};

const FullTranscript = ({ transcript }: { transcript: string }) => {
  return (
    <div className="transcript">
      <h3>Full Transcript</h3>
      <pre>{JSON.stringify(transcript, null, 2)}</pre>
    </div>
  );
};

const MessageList = ({ messages }: { messages?: Array<{
  id: Key | null | undefined;
  user: string;
  text: string;
  created_at: string;
}> }) => {
  // Provide a default value if messages is undefined
  const safeMessages = messages || []

  return (
    <div className="message-list">
      {safeMessages.map((message) => (
        <div key={message.id} className={`message ${message.user}`}>
          <span className="timestamp">{new Date(message.created_at).toLocaleTimeString()}</span>
          <span className="speaker">{message.user}:</span>
          <span className="text">{message.text}</span>
        </div>
      ))}
    </div>
  );
};

const TranscriptModal = ({ transcriptData }: { transcriptData: any }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View Transcript</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Call Transcript</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CallSummary summary={transcriptData.summary} />
          <FullTranscript transcript={transcriptData.concatenated_transcript} />
          <MessageList messages={transcriptData.transcripts} /> {/* Ensure this is correct */}
          <CallDuration duration={transcriptData.call_length} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CallDataCard = ({ data }: { data: Lead }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {data.name}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{data.phone_number}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{data.email}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm">{data.use_case}</span>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Call Summary</h4>
          <p className="text-sm text-muted-foreground">
            {data.analysis?.summary ?? 'N/A'}
          </p>
        </div>
        {data.analysis && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-1">Analysis Highlights</h4>
            <p className="text-sm text-muted-foreground">
              Sentiment: {data.analysis.sentiment_score?.toFixed(2) || 'N/A'} | 
              Topics: {data.analysis.topics?.slice(0, 3).join(', ') || 'N/A'}
            </p>
          </div>
        )}
        <Suspense fallback={<div>Loading...</div>}>
          <TranscriptModal transcriptData={data.call_transcript ?? []} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

const CallDetailsModal = ({ lead }: { lead: Lead }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Call Details: {lead.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">Phone Number</h4>
              <p>{lead.phone_number}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Email</h4>
              <p>{lead.email}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Company</h4>
              <p>{lead.company}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Role</h4>
              <p>{lead.role}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Use Case</h4>
              <p>{lead.use_case}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Call Status</h4>
              <p>{lead.call_status}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Call Duration</h4>
              <p>{lead.call_length ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Call Type</h4>
              <p>{lead.inbound ? 'Inbound' : 'Outbound'}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">Summary</h4>
            <p>{lead.summary}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Transcript</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-100 p-2 rounded">
              {lead.call_transcript && lead.call_transcript.length > 0 ? (
                lead.call_transcript.map((entry, index) => (
                  <div key={index} className="mb-2">
                    <span className="font-bold">{entry.user}: </span>
                    <span>{entry.text}</span>
                  </div>
                ))
              ) : (
                <p>No transcript available</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const RecentCalls = () => {
  const { leads, loading, error } = useLeadsData()
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Lead>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead: Lead) => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.use_case.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: Lead, b: Lead) => {
        const aValue = a[sortColumn as keyof Lead];
        const bValue = b[sortColumn as keyof Lead];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: keyof Lead) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Recent Calls</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <Grid className="w-4 h-4 mr-2" />
            Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4 mr-2" />
            Table View
          </Button>
        </div>
        <Input
          type="search"
          placeholder="Search calls..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedLeads.map((lead: Lead, _index: number) => (
            <CallCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => handleSort('phone_number')}>Phone Number</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')}>Name</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('use_case')}>Use Case</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('call_status')}>Status</Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('call_length')}>Duration</Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead: Lead, index: number) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.phone_number}</TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.use_case}</TableCell>
                <TableCell>{lead.call_status}</TableCell>
                <TableCell>{lead.call_length ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</TableCell>
                <TableCell>
                  <CallDetailsModal lead={lead} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

const Dashboard = () => {
  const { leads, loading, error } = useLeadsData()
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const totalCalls = leads.length
  const completedCalls = leads.filter(lead => lead.completed).length
  const averageDuration = calculateAverageDuration(leads)
  const totalRevenue = leads.reduce((sum, lead) => sum + lead.price, 0)
  const inboundCalls = leads.filter(lead => lead.inbound).length
  const outboundCalls = totalCalls - inboundCalls

  const topUseCases = leads.reduce((acc, lead) => {
    acc[lead.use_case] = (acc[lead.use_case] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedUseCases = Object.entries(topUseCases)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCalls}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Completed Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCalls}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Average Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageDuration.toFixed(2)} min</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inbound vs Outbound</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="text-lg font-semibold">Inbound</div>
              <div className="text-2xl font-bold">{inboundCalls}</div>
            </div>
            <div>
              <div className="text-lg font-semibold">Outbound</div>
              <div className="text-2xl font-bold">{outboundCalls}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {sortedUseCases.map(([useCase, count]) => (
              <li key={useCase} className="flex justify-between">
                <span>{useCase}</span>
                <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

const CalendarPage = () => {
  const { leads } = useLeadsData()

  const appointments = leads.filter(lead => lead.analysis?.appointment_booked)

  const [view, setView] = useState<'day' | 'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Lead | null>(null)

  const renderDayView = () => {
    const dayAppointments = appointments.filter(app => 
      new Date(app.analysis.appointment_date!).toDateString() === currentDate.toDateString()
    )
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{currentDate.toDateString()}</h2>
        </div>
        <div className="divide-y">
          {dayAppointments.map(app => (
            <div key={app.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAppointment(app as unknown as Lead)}>
              <p className="font-semibold">{app.analysis?.appointment_time}</p>
              <p>{app.name}</p>
              <p className="text-sm text-gray-500">{app.use_case}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      return day
    })

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map(day => (
            <div key={day.toISOString()} className="bg-white p-2">
              <h3 className="text-sm font-semibold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
              <p className="text-xs text-gray-500">{day.getDate()}</p>
              {appointments
                .filter(app => app.analysis?.appointment_date && new Date(app.analysis.appointment_date).toDateString() === day.toDateString())
                .map(app => (
                  <div key={app.id} className="mt-1 p-1 bg-blue-100 rounded text-xs cursor-pointer" onClick={() => setSelectedAppointment(app as unknown as Lead)}>
                    {app.analysis?.appointment_time ? `${app.analysis.appointment_time} - ${app.name}` : `${app.name}`}
                  </div>
                ))
              }
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
    const cells = Array(35).fill(null)

    for (let i = 0; i < daysInMonth; i++) {
      cells[i + firstDayOfMonth] = i + 1
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-100 p-2 text-center text-xs font-semibold">{day}</div>
          ))}
          {cells.map((day, index) => (
            <div
              key={index}
              className={`bg-white p-2 h-24 ${day ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            >
              {day && (
                <>
                  <p className={`text-sm ${selectedDate?.getDate() === day ? 'font-bold' : ''}`}>{day}</p>
                  {appointments
                    .filter(app => {
                      const appDate = new Date(app.analysis.appointment_date!)
                      return appDate.getFullYear() === currentDate.getFullYear() &&
                             appDate.getMonth() === currentDate.getMonth() &&
                             appDate.getDate() === day
                    })
                    .map(app => (
                      <div
                        key={app.id}
                        className="mt-1 p-1 bg-blue-100 rounded text-xs cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAppointment(app as unknown as SetStateAction<Lead | null>)
                        }}
                      >
                        {app.analysis?.appointment_time ? app.analysis.appointment_time : 'No appointment time'} - {app.name}
                      </div>
                    ))
                  }
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <Select value={view} onValueChange={(value: 'day' | 'week' | 'month') => setView(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium">Date and Time</h4>
                <p>{selectedAppointment?.analysis?.appointment?.date} at {selectedAppointment?.analysis?.appointment?.time}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Client</h4>
                <p>{selectedAppointment?.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Use Case</h4>
                <p>{selectedAppointment.use_case}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Phone Number</h4>
                <p>{selectedAppointment.phone_number}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const CallCard = ({ lead }: { lead: Lead }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{lead.name}</CardTitle>
          <Badge variant={lead.completed ? "success" : "secondary"}>
            {lead.completed ? "Completed" : "Incomplete"}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <Phone className="w-4 h-4 mr-2" />
          {lead.phone_number}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Duration</span>
            <span className="text-lg">{lead.call_length ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Cost</span>
            <span className="text-lg">{lead.price ? `$${lead.price.toFixed(2)}` : 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Answered By</span>
            <span className="text-lg">{lead.answered_by || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted-foreground">Use Case</span>
            <span className="text-lg">{lead.use_case || 'N/A'}</span>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Summary</h4>
          <p className="text-sm">{lead.summary || 'No summary available'}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
          {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Call Transcript</h4>
              <div className="max-h-40 overflow-y-auto bg-muted/50 rounded-md p-2">
                {lead.call_transcript && lead.call_transcript.length > 0 ? (
                  lead.call_transcript.map((entry, index) => (
                    <p key={index} className="text-sm mb-1">
                      <strong>{entry.user}:</strong> {entry.text}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transcript available</p>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Analysis</h4>
              {lead.analysis ? (
                <div className="space-y-2">
                  <p><strong>Sentiment Score:</strong> {lead.analysis.sentiment_score?.toFixed(2) || 'N/A'}</p>
                  <p><strong>Summary:</strong> {lead.analysis.summary || 'N/A'}</p>
                  {lead.analysis.topics && (
                    <div>
                      <strong>Topics:</strong>
                      <ul className="list-disc list-inside">
                        {lead.analysis.topics.map((topic, index) => (
                          <li key={index}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lead.analysis.action_items && (
                    <div>
                      <strong>Action Items:</strong>
                      <ul className="list-disc list-inside">
                        {lead.analysis.action_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lead.analysis.questions && (
                    <div>
                      <strong>Questions:</strong>
                      <ul className="list-disc list-inside">
                        {lead.analysis.questions.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No analysis available</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function VoiceAiCallData() {
  const [activeView, setActiveView] = useState('dashboard')

  return (
    <div className="flex h-screen">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-4">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveView('dashboard')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeView === 'recent-calls' ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveView('recent-calls')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Recent Calls
            </Button>
            <Button
              variant={activeView === 'settings' ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveView('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant={activeView === 'calendar' ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveView('calendar')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
      <aside className="hidden lg:flex flex-col w-64 bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <nav className="flex flex-col space-y-4">
          <Button
            variant={activeView === 'dashboard' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeView === 'recent-calls' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => setActiveView('recent-calls')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Recent Calls
          </Button>
          <Button
            variant={activeView === 'settings' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => setActiveView('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant={activeView === 'calendar' ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => setActiveView('calendar')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Calendar
          </Button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-4">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'recent-calls' && <RecentCalls />}
        {activeView === 'settings' && <h1 className="text-2xl font-bold">Settings</h1>}
        {activeView === 'calendar' && <CalendarPage />}
      </main>
    </div>
  )
}