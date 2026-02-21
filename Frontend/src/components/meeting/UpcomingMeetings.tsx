import { useState, useMemo } from 'react'
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMeetingStore } from '@/store/meetingStore'
import { useUIStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'

type FilterType = 'today' | 'week' | 'month'

export default function UpcomingMeetings() {
  const [filter, setFilter] = useState<FilterType>('week')

  const { selectedCompanyId } = useUIStore()
  const openModal = useMeetingStore((state) => state.openModal)

  const handleOpenSchedule = () => {
    openModal({
      company: selectedCompanyId || undefined
    })
  }

  const getTodayMeetings = useMeetingStore((state) => state.getTodayMeetings)
  const getThisWeekMeetings = useMeetingStore((state) => state.getThisWeekMeetings)
  const getThisMonthMeetings = useMeetingStore((state) => state.getThisMonthMeetings)

  const filteredMeetings = useMemo(() => {
    switch (filter) {
      case 'today':
        return getTodayMeetings().sort((a, b) => a.startTime.localeCompare(b.startTime))
      case 'week':
        return getThisWeekMeetings().sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
          return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime)
        })
      case 'month':
        return getThisMonthMeetings().sort((a, b) => {
          const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
          return dateCompare !== 0 ? dateCompare : a.startTime.localeCompare(b.startTime)
        })
      default:
        return []
    }
  }, [filter, getTodayMeetings, getThisWeekMeetings, getThisMonthMeetings])

  const getFilterLabel = () => {
    switch (filter) {
      case 'today':
        return 'Today'
      case 'week':
        return 'This Week'
      case 'month':
        return 'This Month'
      default:
        return 'Upcoming'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Upcoming Meetings</CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="w-40"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            <button
              onClick={handleOpenSchedule}
              className="flex items-center justify-center h-10 w-10 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              aria-label="Schedule meeting"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card/50 p-4 hover:bg-card hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm truncate">{meeting.title}</h3>
                        <Badge
                          variant="outline"
                          className={meeting.type === 'Online' ? 'bg-blue-500/10 text-blue-700' : 'bg-purple-500/10 text-purple-700'}
                        >
                          {meeting.type}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">{meeting.company}</p>

                      <div className="space-y-2">
                        {/* Date & Time */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {formatDate(meeting.date)} • {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                          </span>
                        </div>

                        {/* Meeting Link */}
                        {meeting.meetingLink && (
                          <div className="flex items-center gap-2 text-xs">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline truncate"
                            >
                              Join meeting
                            </a>
                          </div>
                        )}

                        {/* Attendees */}
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span>{meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {/* Description */}
                        {meeting.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border/50 mt-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right section - Time indicator */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-emerald-600">
                          {formatTime(meeting.startTime)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatDate(meeting.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No meetings {getFilterLabel().toLowerCase()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
