import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMeetingStore, type Meeting } from '@/store/meetingStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

function isMeetingPast(meeting: Meeting): boolean {
  const meetingEnd = new Date(`${meeting.date}T${meeting.endTime}`)
  return meetingEnd < new Date()
}

interface DashboardCalendarProps {
  viewDate: Date
  onViewDateChange: (date: Date) => void
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export default function DashboardCalendar({
  viewDate,
  onViewDateChange,
  selectedDate,
  onSelectDate,
}: DashboardCalendarProps) {
  const meetings = useMeetingStore((state) => state.meetings)

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay())
  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()))

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>()
    meetings.forEach((meeting) => {
      if (!map.has(meeting.date)) map.set(meeting.date, [])
      map.get(meeting.date)!.push(meeting)
    })
    map.forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)))
    return map
  }, [meetings])

  const formatTime = (time: string) => {
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${m} ${ampm}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Meetings Calendar</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewDateChange(subMonths(viewDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-medium">
                {format(viewDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewDateChange(addMonths(viewDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayMeetings = meetingsByDate.get(dateStr) || []
              const inMonth = isSameMonth(day, viewDate)
              const selected = selectedDate && isSameDay(day, selectedDate)
              const today = isToday(day)

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(day)}
                  className={`
                    min-h-[72px] p-1.5 rounded-lg text-left transition-all
                    ${!inMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                    ${selected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-background bg-emerald-500/10' : ''}
                    ${today && !selected ? 'bg-emerald-500/15 border border-emerald-500/40' : ''}
                    ${!selected && inMonth ? 'hover:bg-accent' : ''}
                  `}
                >
                  <span className={`text-xs font-medium block mb-1 ${today ? 'text-emerald-600' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {dayMeetings.slice(0, 2).map((m) => {
                      const past = isMeetingPast(m)
                      return (
                        <div
                          key={m.id}
                          className={`
                            text-[10px] px-1.5 py-0.5 rounded truncate
                            ${past
                              ? 'bg-slate-500/20 text-slate-500'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            }
                          `}
                        >
                          {formatTime(m.startTime)} {m.title}
                        </div>
                      )
                    })}
                    {dayMeetings.length > 2 && (
                      <div className="text-[9px] text-muted-foreground">+{dayMeetings.length - 2}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="flex gap-4 mt-4 pt-3 border-t border-border text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-emerald-500/30" />
              <span className="text-muted-foreground">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-slate-500/30" />
              <span className="text-muted-foreground">Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
