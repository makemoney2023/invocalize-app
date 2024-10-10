"use client"

import { useState, useMemo, Key, ReactNode, Suspense, AwaitedReactNode, JSXElementConstructor, ReactElement, ReactPortal, SetStateAction, useEffect } from 'react'
import { ChevronDown, ChevronUp, Phone, Smile, Meh, Frown, List, Grid, X, Calendar as CalendarIcon, Settings, LayoutDashboard, Menu, Clock, Voicemail, PhoneForwarded, BarChart, ChevronLeft, ChevronRight, FileText, Caravan, Truck, Bus, Mail, CheckCircle, DollarSign, Building } from 'lucide-react'
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
import GeographicalHeatMap from './GeographicalHeatMap'
import DarkModeToggle from '@/components/DarkModeToggle'

import { Lead } from '@/hooks/useLeadsData'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogFooter } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase'
import { fetchAppointments } from '@/api/leads'
import { format, addDays, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns'

// If you need to extend the Lead type, do it like this:
type ExtendedLead = Lead & {
  // Add any additional properties here if needed
}

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
  name: string
  use_case: string
  phone_number: string
  note?: string
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
          <MessageList messages={transcriptData.transcripts} />
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
              {Array.isArray(lead.transcripts) && lead.transcripts.length > 0 ? (
                lead.transcripts.map((entry, index) => (
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
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedLeads = useMemo(() => {
    return leads
      .filter((lead: Lead) => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.use_case.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: Lead, b: Lead) => {
        let aValue: any = a;
        let bValue: any = b;

        // Handle nested properties
        sortColumn.split('.').forEach(key => {
          aValue = aValue?.[key];
          bValue = bValue?.[key];
        });

        if (aValue === undefined) aValue = null;
        if (bValue === undefined) bValue = null;

        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc' ? (aValue < bValue ? -1 : 1) : (bValue < aValue ? -1 : 1);
      });
  }, [leads, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('analysis.sentiment_score')}>Sentiment</Button>
              </TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedLeads.map((lead: Lead) => (
              <TableRow key={lead.id}>
                <TableCell>{lead.phone_number}</TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.use_case}</TableCell>
                <TableCell>{lead.call_status}</TableCell>
                <TableCell>{lead.call_length ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</TableCell>
                <TableCell>{lead.analysis?.sentiment_score ? `${(lead.analysis.sentiment_score * 100).toFixed(0)}%` : 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      // Implement a modal or tooltip to show the full summary
                      alert(lead.summary || 'No summary available');
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <CallDetailsModal lead={lead} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

const Dashboard = () => {
  const { leads, loading, error } = useLeadsData();
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const totalCalls = leads.length;
  const completedCalls = leads.filter(lead => lead.completed).length;
  const averageDuration = calculateAverageDuration(leads);
  const totalRevenue = leads.reduce((sum, lead) => sum + lead.price, 0);
  const inboundCalls = leads.filter(lead => lead.inbound).length;
  const outboundCalls = totalCalls - inboundCalls;

  const topUseCases = leads.reduce((acc, lead) => {
    acc[lead.use_case] = (acc[lead.use_case] || 0) + 1;
    return acc as Record<string, number>
  }, {} as Record<string, number>);

  const sortedUseCases = Object.entries(topUseCases)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageDuration.toFixed(2)} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inbound Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inboundCalls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outbound Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outboundCalls}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Card className="h-[500px]">
          <CardHeader>
            <CardTitle>Geographical Heat Map</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <GeographicalHeatMap leads={leads} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const daysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    fetchAppointmentsData()
  }, [])

  const fetchAppointmentsData = async () => {
    try {
      const appointmentsData = await fetchAppointments();
      setAppointments((prevAppointments) => [
        ...prevAppointments,
        ...appointmentsData.map((appointment) => ({
          ...appointment,
          name: appointment.name || '',
          use_case: appointment.use_case || '',
          phone_number: appointment.phone_number || '',
        })),
      ]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div>
          <Button onClick={handlePrevMonth} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-bold">
            {day}
          </div>
        ))}
        {Array.from({ length: startDate.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const date = addDays(startDate, index)
          const appointmentsForDay = appointments.filter(
            (appointment) => appointment.date === format(date, 'yyyy-MM-dd')
          )
          return (
            <div
              key={date.toString()}
              className={`border p-2 ${
                isSameMonth(date, currentDate) ? '' : 'text-gray-300'
              }`}
            >
              <div className="text-right">{format(date, 'd')}</div>
              {appointmentsForDay.map((appointment) => (
                <Button
                  key={appointment.id}
                  variant="outline"
                  size="sm"
                  className="mt-1 w-full text-left"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  {appointment.time} - {appointment.name}
                </Button>
              ))}
            </div>
          )
        })}
      </div>
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4">
              <div>
                <h4 className="text-sm font-medium">Date and Time</h4>
                <p>{`${selectedAppointment.date} at ${selectedAppointment.time}`}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Name</h4>
                <p>{selectedAppointment.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Use Case</h4>
                <p>{selectedAppointment.use_case}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Phone Number</h4>
                <p>{selectedAppointment.phone_number}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Note</h4>
                <p>{selectedAppointment.note}</p>
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
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const callDate = new Date(lead.created_at).toLocaleString()

  const handleFollowUp = () => {
    setShowFollowUpModal(true)
  }

  const handlePhoneClick = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  }

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">
            {lead.name || 'Unknown'}
          </CardTitle>
          <CardDescription>{callDate}</CardDescription>
        </div>
        <Badge variant={lead.call_status === 'completed' ? 'success' : 'secondary'}>
          {lead.call_status || 'Unknown'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-blue-500 hover:underline"
              onClick={() => handlePhoneClick(lead.phone_number) }
            >
              {lead.phone_number || 'N/A'}
            </Button>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-blue-500 hover:underline"
              onClick={() => handleEmailClick(lead.email) }
            >
              {lead.email || 'N/A'}
            </Button>
          </div>
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2" />
            <span className="text-sm">{lead.company || 'N/A'}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Duration</h4>
            <p>{lead.call_length != null ? `${lead.call_length.toFixed(2)} min` : 'N/A'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Cost</h4>
            <p>${lead.price != null ? lead.price.toFixed(4) : 'N/A'}</p>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">
            {lead.summary ? (isExpanded ? lead.summary : `${lead.summary.slice(0, 100)}...`) : 'N/A'}
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show More"}
            {isExpanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFollowUp}
          >
            Follow Up
          </Button>
        </div>
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Use Case</h4>
              <p className="text-sm">{lead.use_case || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Location</h4>
              <p className="text-sm">{`${lead.city || 'Unknown'}, ${lead.state || 'Unknown'}, ${lead.country || 'Unknown'}`}</p>
            </div>
            {lead.recording_url && (
              <div>
                <h4 className="text-sm font-medium mb-2">Call Recording</h4>
                <audio controls className="w-full">
                  <source src={lead.recording_url} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium mb-2">Transcript</h4>
              <div className="max-h-60 overflow-y-auto bg-gray-100 p-2 rounded">
                {lead.concatenated_transcript ? (
                  <p className="text-sm whitespace-pre-wrap">{lead.concatenated_transcript}</p>
                ) : (
                  <p>No transcript available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        lead={lead}
      />
    </Card>
  )
}

const FollowUpModal = ({ isOpen, onClose, lead }: { isOpen: boolean; onClose: () => void; lead: Lead }) => {
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState('')
  const [followUpNote, setFollowUpNote] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await addFollowUpToCalendar(lead, followUpDate, followUpTime, followUpNote)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow Up for {lead.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="followup-date" className="text-right">
                Follow-up Date
              </Label>
              <Input
                id="followup-date"
                type="date"
                className="col-span-3"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="followup-time" className="text-right">
                Follow-up Time
              </Label>
              <Input
                id="followup-time"
                type="time"
                className="col-span-3"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="followup-note" className="text-right">
                Note
              </Label>
              <Textarea
                id="followup-note"
                className="col-span-3"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Schedule Follow Up</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const addFollowUpToCalendar = async (lead: Lead, date: string, time: string, note: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        lead_id: lead.id,
        date: date,
        time: time,
        note: note,
        name: lead.name,
        email: lead.email,
        phone_number: lead.phone_number,
        use_case: lead.use_case
      })

    if (error) throw error

    console.log('Follow-up added to calendar:', data)
  } catch (error) {
    console.error('Error adding follow-up to calendar:', error)
  }
}

export function VoiceAiCallData() {
  const [activeView, setActiveView] = useState('dashboard');

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