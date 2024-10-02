"use client"

import { useState, useMemo, Key, ReactNode, Suspense } from 'react'
import { ChevronDown, ChevronUp, Phone, Smile, Meh, Frown, List, Grid, X, Calendar as CalendarIcon, Settings, LayoutDashboard, Menu, Clock, Voicemail, PhoneForwarded, BarChart, ChevronLeft, ChevronRight, FileText, Caravan, Truck, Bus, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Lead {
  call_transcript: any
  email: ReactNode
  phone_number: ReactNode
  name: ReactNode
  id: Key | null | undefined
  call_duration: number;
  // ... other properties ...
  analysis?: {
    appointment: any // Add this line
    sentiment_score: number; // Add this line if you need sentiment score
  };
  use_case: string; // Add this line
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
          <p className="text-sm text-muted-foreground">{data.analysis?.summary ? data.analysis.summary : 'N/A'}</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <TranscriptModal transcriptData={data.call_transcript ? data.call_transcript : []} />
        </Suspense>
      </CardContent>
    </Card>
  )
}

const CallDetailsModal = ({ data }: { data: Lead }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {data.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{data.phone_number}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">{data.email}</span>
            </div>
            <div className="flex items-center">
              <RVTypeIcon type={data.use_case} />
              <span className="text-sm">{data.use_case}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Sentiment Score:</span>
              <SentimentIcon score={data.analysis?.sentiment_score || 0} />
            </div>
            <Badge variant={
              data.analysis?.sentiment_score ? 
                data.analysis.sentiment_score > 0.66 ? "default" :
                data.analysis.sentiment_score > 0.33 ? "secondary" :
                "destructive" : "destructive"
            }>
              {data.analysis?.sentiment_score ? `${(data.analysis.sentiment_score * 100).toFixed(0)}%` : 'N/A'}
            </Badge>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {data.analysis?.appointment?.booked 
                ? `Appointment: ${data.analysis.appointment.date} at ${data.analysis.appointment.time}` 
                : 'No appointment booked'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Call Summary</h4>
            <p className="text-sm text-muted-foreground">{data.analysis?.summary || 'N/A'}</p>
          </div>
          <TranscriptModal transcriptData={data.call_transcript} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

const RecentCalls = () => {
  const { leads, loading, error } = useLeadsData()
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof Lead>(() => 'created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead: Lead) => 
        lead.name?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.use_case?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: Lead, b: Lead) => {
        const aValue = a[sortColumn as keyof Lead]
        const bValue = b[sortColumn as keyof Lead]
        if (aValue && bValue) {
          if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
          if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        }
        return 0
      })
  }, [leads, searchTerm, sortColumn, sortDirection])

  const handleSort = (column: keyof Lead) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

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
          {filteredAndSortedLeads.map((lead: Lead) => (
            <CallDataCard key={lead.id} data={lead} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Phone Number</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('phone_number')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Name</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('name')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Email</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('email')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Interested In</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('use_case')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Sentiment</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('analysis.sentiment_score' as keyof Lead)}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.phone_number}</TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.use_case}</TableCell>
                <TableCell>{lead.analysis?.summary || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <CallDetailsModal data={lead as Lead} />
                    <TranscriptModal transcriptData={lead.call_transcript} />
                  </div>
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
  if (error) return <div>Error: {error.message}</div>
  const totalCalls = leads.length
  const averageDuration = calculateAverageDuration(leads as Lead[])
  const voicemailCalls = leads.filter(lead => lead.call_status === 'voicemail').length
  const answeredCalls = leads.filter(lead => lead.call_status === 'answered').length
  const transferredCalls = leads.filter(lead => lead.call_status === 'transferred').length
  const appointmentsBooked = leads.filter(lead => lead.analysis?.appointment_booked !== undefined).length

  const calculatePercentage = (value: number) => ((value / totalCalls) * 100).toFixed(1)
  const upcomingAppointments = leads
    .filter(lead => lead.analysis?.appointment_booked) // Ensure this line is correct
    .map(lead => ({
      id: lead.id,
      date: lead.analysis?.appointment_date || 'N/A', // Provide a default value if undefined
      time: lead.analysis?.appointment_time || 'N/A', // Provide a default value if undefined
      firstName: lead.name.split(' ')[0],
      lastName: lead.name.split(' ')[1] || '',
      interestedIn: lead.use_case,
      phoneNumber: lead.phone_number
    }))
    .slice(0, 5); // Show only the next 5 appointments

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Calls Received
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Call Duration // Updated title to reflect the change
            </CardTitle>
            {/* <BarChart className="h-4 w-4 text-muted-foreground" /> // Removed sentiment-related chart */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDuration}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Voicemail
            </CardTitle>
            <Voicemail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{voicemailCalls}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(voicemailCalls)}% of total calls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Answered
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredCalls}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(answeredCalls)}% of total calls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transferred
            </CardTitle>
            <PhoneForwarded className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transferredCalls}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(transferredCalls)}% of total calls
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Appointments Booked
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsBooked}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentage(appointmentsBooked)}% of total calls
            </p>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Appointments</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Interested In</TableHead>
            <TableHead>Phone Number</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcomingAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.date}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.firstName} {appointment.lastName}</TableCell>
              <TableCell>{appointment.interestedIn}</TableCell>
              <TableCell>{appointment.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const CalendarPage = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const appointments: Appointment[] = [
    { id: '1', date: '2023-09-15', time: '10:00 AM', firstName: 'John', lastName: 'Doe', interestedIn: 'Travel Trailer', phoneNumber: '+1 (555) 123-4567' },
    { id: '2', date: '2023-09-20', time: '2:30 PM', firstName: 'Alice', lastName: 'Johnson', interestedIn: 'Fifth Wheel', phoneNumber: '+1 (555) 246-8135' },
    { id: '3', date: '2023-09-22', time: '11:00 AM', firstName: 'Bob', lastName: 'Smith', interestedIn: 'Class A Motorhome', phoneNumber: '+1 (555) 987-6543' },
  ]

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderDayView = () => {
    const dayAppointments = appointments.filter(app => app.date === currentDate.toISOString().split('T')[0])
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{currentDate.toDateString()}</h2>
        </div>
        <div className="divide-y">
          {dayAppointments.map(app => (
            <div key={app.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAppointment(app)}>
              <p className="font-semibold">{app.time}</p>
              <p>{app.firstName} {app.lastName}</p>
              <p className="text-sm text-gray-500">{app.interestedIn}</p>
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
                .filter(app => app.date === day.toISOString().split('T')[0])
                .map(app => (
                  <div key={app.id} className="mt-1 p-1 bg-blue-100 rounded text-xs cursor-pointer" onClick={() => setSelectedAppointment(app)}>
                    {app.time} - {app.firstName} {app.lastName}
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
    const days = daysInMonth(currentDate)
    const firstDay = firstDayOfMonth(currentDate)
    const cells = Array(35).fill(null)

    for (let i = 0; i < days; i++) {
      cells[i + firstDay] = i + 1
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
                      const appDate = new Date(app.date)
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
                          setSelectedAppointment(app)
                        }}
                      >
                        {app.time} - {app.firstName} {app.lastName}
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
                <p>{selectedAppointment.date} at {selectedAppointment.time}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Client</h4>
                <p>{selectedAppointment.firstName} {selectedAppointment.lastName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Interested In</h4>
                <p>{selectedAppointment.interestedIn}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Phone Number</h4>
                <p>{selectedAppointment.phoneNumber}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
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