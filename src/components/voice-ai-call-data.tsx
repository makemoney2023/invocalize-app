"use client"

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Phone, Smile, Meh, Frown, List, Grid, X, Calendar as CalendarIcon, Settings, LayoutDashboard, Menu, Clock, Voicemail, PhoneForwarded, BarChart, ChevronLeft, ChevronRight, FileText, Caravan, Truck, Bus } from 'lucide-react'
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

const TranscriptModal = ({ transcript }: { transcript: { speaker: string; text: string }[] }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          View Transcript
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Call Transcript</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {transcript.map((entry, index) => (
            <div key={index} className={`flex ${entry.speaker === 'AI' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-lg ${entry.speaker === 'AI' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="font-semibold mb-1">{entry.speaker}</p>
                <p>{entry.text}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const CallDataCard = ({ data }: { data: CallData }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {data.firstName} {data.lastName}
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
            <span className="text-sm">{data.phoneNumber}</span>
          </div>
          <div className="flex items-center">
            <RVTypeIcon type={data.interestedIn} />
            <span className="text-sm">{data.interestedIn}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium mr-2">Sentiment Score:</span>
            <SentimentIcon score={data.sentimentScore} />
          </div>
          <Badge variant={data.sentimentScore > 0.66 ? "success" : data.sentimentScore > 0.33 ? "warning" : "destructive"}>
            {(data.sentimentScore * 100).toFixed(0)}%
          </Badge>
        </div>
        <div className="flex items-center mb-4">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {data.appointmentBooked ? `Appointment: ${data.appointmentBooked}` : 'No appointment booked'}
          </span>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Call Summary</h4>
          <p className="text-sm text-muted-foreground">{data.callSummary}</p>
        </div>
        <TranscriptModal transcript={data.transcript} />
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Actions Taken</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {data.actionsTaken.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const CallDetailsModal = ({ data }: { data: CallData }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {data.firstName} {data.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{data.phoneNumber}</span>
            </div>
            <div className="flex items-center">
              <RVTypeIcon type={data.interestedIn} />
              <span className="text-sm">{data.interestedIn}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Sentiment Score:</span>
              <SentimentIcon score={data.sentimentScore} />
            </div>
            <Badge variant={data.sentimentScore > 0.66 ? "success" : data.sentimentScore > 0.33 ? "warning" : "destructive"}>
              {(data.sentimentScore * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {data.appointmentBooked ? `Appointment: ${data.appointmentBooked}` : 'No appointment booked'}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Call Summary</h4>
            <p className="text-sm text-muted-foreground">{data.callSummary}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Actions Taken</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {data.actionsTaken.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          <TranscriptModal transcript={data.transcript} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

const RecentCalls = () => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof CallData>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sampleData: CallData[] = [
    {
      id: "1",
      phoneNumber: "+1 (555) 123-4567",
      firstName: "John",
      lastName: "Doe",
      interestedIn: "Travel Trailer",
      sentimentScore: 0.85,
      callSummary: "Customer inquired about new travel trailer models. Expressed interest in lightweight options for easy towing.",
      actionsTaken: ["Provided information on lightweight travel trailers", "Scheduled follow-up call", "Sent email with product brochures"],
      appointmentBooked: "2023-09-15 10:00 AM",
      transcript: [
        { speaker: "AI", text: "Hello! Thank you for calling our RV dealership. How may I assist you today?" },
        { speaker: "Caller", text: "Hi, I'm interested in learning about your travel trailers, especially lightweight models." },
        { speaker: "AI", text: "We have a great selection of lightweight travel trailers. Are you looking for any specific features or size range?" },
        { speaker: "Caller", text: "I'd like something easy to tow with my SUV, maybe around 20-25 feet long." },
        { speaker: "AI", text: "Great! We have several models that fit that criteria. I'd be happy to email you some brochures and schedule an appointment to view them in person. Would you like that?" },
        { speaker: "Caller", text: "Yes, that would be perfect. Thank you!" },
      ]
    },
    {
      id: "2",
      phoneNumber: "+1 (555) 987-6543",
      firstName: "Jane",
      lastName: "Smith",
      interestedIn: "Fifth Wheel",
      sentimentScore: 0.45,
      callSummary: "Customer reported issues with their recently purchased fifth wheel. Frustration expressed over recurring problems.",
      actionsTaken: ["Logged support ticket", "Escalated to service department", "Offered priority servicing"],
      appointmentBooked: null,
      transcript: [
        { speaker: "AI", text: "Thank you for calling our RV service department. How can I help you today?" },
        { speaker: "Caller", text: "I'm having problems with the fifth wheel I bought from you last month. This is getting really frustrating." },
        { speaker: "AI", text: "I'm very sorry to hear that. Can you please describe the issues you're experiencing?" },
        { speaker: "Caller", text: "The slide-out keeps jamming, and now the water heater isn't working properly." },
        { speaker: "AI", text: "I apologize for these inconveniences. I'm logging a support ticket right now and will escalate this to our service department. We'll offer you priority servicing to resolve these issues as quickly as possible." },
        { speaker: "Caller", text: "Alright, I hope this gets fixed soon." },
      ]
    },
    {
      id: "3",
      phoneNumber: "+1 (555) 246-8135",
      firstName: "Alice",
      lastName: "Johnson",
      interestedIn: "Class A Motorhome",
      sentimentScore: 0.75,
      callSummary: "Potential client requested information on luxury Class A Motorhomes. Showed particular interest in models with high-end amenities.",
      actionsTaken: ["Provided details on luxury Class A models", "Scheduled showroom tour", "Sent virtual tour links"],
      appointmentBooked: "2023-09-20 2:30 PM",
      transcript: [
        { speaker: "AI", text: "Welcome to our luxury RV division. How may I assist you today?" },
        { speaker: "Caller", text: "Hello, I'm looking for information on your top-of-the-line Class A Motorhomes." },
        { speaker: "AI", text: "Excellent! We have a range of luxury Class A Motorhomes with premium features. Are you interested in any specific amenities or size range?" },
        { speaker: "Caller", text: "I'm looking for something with a full kitchen, entertainment system, and maybe even a washer/dryer unit." },
        { speaker: "AI", text: "We have several models that meet those criteria. I'd be happy to schedule a showroom tour for you to see them in person. I can also send you links to virtual tours if you'd like to preview them." },
        { speaker: "Caller", text: "That sounds great. Let's schedule a tour, and yes, please send me those virtual tour links." },
      ]
    },
  ]

  const filteredAndSortedData = useMemo(() => {
    return sampleData
      .filter(call => 
        call.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.interestedIn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.phoneNumber.includes(searchTerm)
      )
      .sort((a, b) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
  }, [sampleData, searchTerm, sortColumn, sortDirection])

  const handleSort = (column: keyof CallData) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedData.map((call) => (
            <CallDataCard key={call.id} data={call} />
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
                    <DropdownMenuItem onClick={() => handleSort('phoneNumber')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Name</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('firstName')}>Sort by First Name</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('lastName')}>Sort by Last Name</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Interested In</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('interestedIn')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center">Sentiment</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('sentimentScore')}>Sort</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((call) => (
              <TableRow key={call.id}>
                <TableCell>{call.phoneNumber}</TableCell>
                <TableCell>{call.firstName} {call.lastName}</TableCell>
                <TableCell>{call.interestedIn}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <SentimentIcon score={call.sentimentScore} />
                    <span className="ml-2">{(call.sentimentScore * 100).toFixed(0)}%</span>
                  </div>
                </TableCell>
                <TableCell>{call.callSummary}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <CallDetailsModal data={call} />
                    <TranscriptModal transcript={call.transcript} />
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
  const totalCalls = 1000
  const averageDuration = "3m 45s"
  const voicemailCalls = 150
  const answeredCalls = 800
  const transferredCalls = 50
  const overallSentiment = 0.75
  const appointmentsBooked = 25

  const calculatePercentage = (value: number) => ((value / totalCalls) * 100).toFixed(1)

  const upcomingAppointments: Appointment[] = [
    { id: '1', date: '2023-09-15', time: '10:00 AM', firstName: 'John', lastName: 'Doe', interestedIn: 'Travel Trailer', phoneNumber: '+1 (555) 123-4567' },
    { id: '2', date: '2023-09-20', time: '2:30 PM', firstName: 'Alice', lastName: 'Johnson', interestedIn: 'Fifth Wheel', phoneNumber: '+1 (555) 246-8135' },
    { id: '3', date: '2023-09-22', time: '11:00 AM', firstName: 'Bob', lastName: 'Smith', interestedIn: 'Class A Motorhome', phoneNumber: '+1 (555) 987-6543' },
  ]

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
              Average Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
              Overall Sentiment Score
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(overallSentiment * 100).toFixed(1)}%</div>
            <div className="flex items-center mt-2">
              <SentimentIcon score={overallSentiment} />
              <span className="ml-2 text-sm text-muted-foreground">
                {overallSentiment > 0.66 ? "Positive" : overallSentiment > 0.33 ? "Neutral" : "Negative"}
              </span>
            </div>
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