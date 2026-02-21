import { Clock, MapPin, Users, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMeetingStore, type Meeting } from '@/store/meetingStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format, isToday } from 'date-fns'

function isMeetingPast(meeting: Meeting): boolean {
  const meetingEnd = new Date(`${meeting.date}T${meeting.endTime}`)
  return meetingEnd < new Date()
}

function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

interface MeetingLogPanelProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export default function MeetingLogPanel({ selectedDate, onSelectDate }: MeetingLogPanelProps) {
  const getMeetingsForDate = useMeetingStore((state) => state.getMeetingsForDate)
  const displayDate = selectedDate || new Date()
  const dateStr = format(displayDate, 'yyyy-MM-dd')
  const meetings = getMeetingsForDate(dateStr)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (v) onSelectDate(new Date(v))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="h-full border-border/80">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Meeting Log</h3>
          <div className="flex items-center gap-2 mt-2">
            <Input
              type="date"
              value={dateStr}
              onChange={handleDateChange}
              className="h-9 text-sm"
            />
            <span className="text-xs text-muted-foreground">
              {isToday(displayDate) ? 'Today' : format(displayDate, 'EEEE, MMM d')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {meetings.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No meetings on this date
              </div>
            ) : (
              meetings.map((meeting, i) => {
                const past = isMeetingPast(meeting)
                return (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`
                      rounded-lg border p-4 transition-colors
                      ${past ? 'border-border/60 bg-muted/20' : 'border-emerald-500/20 bg-emerald-500/5'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{meeting.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          past ? 'bg-slate-500/10 text-slate-500' : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {past ? 'Completed' : 'Scheduled'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{meeting.company}</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {meeting.type}
                        </Badge>
                      </div>
                      {meeting.meetingLink && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
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
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {meeting.description && (
                        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
                          <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <p className="text-muted-foreground line-clamp-2">{meeting.description}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
