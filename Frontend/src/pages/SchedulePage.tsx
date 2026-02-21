import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMeetingStore } from '@/store/meetingStore'
import { useFetchMeetings } from '@/services/meetingApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Users, ExternalLink } from 'lucide-react'

type ViewType = 'month' | 'week' | 'day'

export default function SchedulePage() {
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  const { isLoading: isMeetingsLoading } = useFetchMeetings()
  const meetings = useMeetingStore((state) => state.meetings)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Get meetings for current view
  const getMeetingsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return meetings.filter((m) => {
      const meetingDate = new Date(m.date)
      return meetingDate.toDateString() === date.toDateString()
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    if (dayNumber < 1 || dayNumber > daysInMonth) return null
    return dayNumber
  })

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isMeetingsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meeting Schedule</h1>
        <p className="text-muted-foreground">View and manage all meetings across your calendar</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>{monthName}</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 transition"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="px-3 py-1 rounded-md text-sm font-medium hover:bg-accent transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={handleNextMonth}
                  className="px-3 py-1 rounded-md text-sm font-medium hover:bg-accent transition"
                >
                  Next →
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => (
                    <div
                      key={index}
                      onClick={() => day && setSelectedMeeting(null)}
                      className={`min-h-24 p-2 rounded-lg border transition cursor-pointer ${
                        day === null
                          ? 'bg-muted/20 border-transparent'
                          : `border-border hover:border-emerald-500 hover:bg-accent/50 ${
                              new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString()
                                ? 'bg-emerald-500/20 border-emerald-500'
                                : 'bg-card'
                            }`
                      }`}
                    >
                      {day && (
                        <div className="h-full flex flex-col">
                          <span className="text-xs font-semibold mb-1 text-foreground">{day}</span>
                          <div className="space-y-0.5 flex-1">
                            {getMeetingsForDay(day).slice(0, 2).map((meeting) => (
                              <div
                                key={meeting.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedMeeting(meeting)
                                }}
                                className="text-[10px] truncate bg-emerald-500/20 text-emerald-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-emerald-500/30 transition"
                              >
                                {meeting.title}
                              </div>
                            ))}
                            {getMeetingsForDay(day).length > 2 && (
                              <div className="text-[8px] text-muted-foreground px-1.5 py-0.5">
                                +{getMeetingsForDay(day).length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Meeting Details Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedMeeting ? 'Meeting Details' : 'No Meeting Selected'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMeeting ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-base text-foreground mb-2">{selectedMeeting.title}</h3>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 mb-4">
                      {selectedMeeting.type}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Company:</span>
                      <span>{selectedMeeting.company}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">{new Date(selectedMeeting.date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {formatTime(selectedMeeting.startTime)} - {formatTime(selectedMeeting.endTime)}
                        </div>
                      </div>
                    </div>

                    {selectedMeeting.meetingLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <a
                          href={selectedMeeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline truncate text-sm"
                        >
                          Join meeting
                        </a>
                      </div>
                    )}

                    {selectedMeeting.attendees && selectedMeeting.attendees.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{selectedMeeting.attendees.length} Attendee{selectedMeeting.attendees.length > 1 ? 's' : ''}</div>
                          <div className="text-muted-foreground text-xs space-y-1 mt-1">
                            {selectedMeeting.attendees.map((email: string, idx: number) => (
                              <div key={idx}>{email}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedMeeting.description && (
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Description</h4>
                        <p className="text-muted-foreground text-sm bg-accent/30 rounded p-2">{selectedMeeting.description}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border text-xs text-muted-foreground">
                    <div>Created: {new Date(selectedMeeting.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Click on a meeting to see details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* All Meetings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Meetings ({meetings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {meetings
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition"
                    >
                      <div>
                        <div className="font-medium">{meeting.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {meeting.company} • {new Date(meeting.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-emerald-600">{formatTime(meeting.startTime)}</div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No meetings scheduled yet</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

import { Calendar } from 'lucide-react'
