import { useMemo } from 'react'
import { useMeetingStore } from '@/store/meetingStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export default function MeetingCalendar() {
  const meetings = useMeetingStore((state) => state.meetings)
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  // Get meetings for each day
  const meetingsByDay = useMemo(() => {
    const map = new Map<number, typeof meetings>()
    meetings.forEach((meeting) => {
      const meetingDate = new Date(meeting.date)
      if (meetingDate.getMonth() === currentMonth && meetingDate.getFullYear() === currentYear) {
        const day = meetingDate.getDate()
        if (!map.has(day)) map.set(day, [])
        map.get(day)!.push(meeting)
      }
    })
    return map
  }, [meetings, currentMonth, currentYear])

  const getDayClass = (day: number) => {
    const today = new Date()
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
    return isToday ? 'bg-emerald-500/20 border-emerald-500 font-semibold text-emerald-600' : ''
  }

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    if (dayNumber < 1 || dayNumber > daysInMonth) return null
    return dayNumber
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Meeting Calendar - {monthName}</CardTitle>
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
                  className={`min-h-20 p-2 rounded-lg border border-border ${
                    day === null ? 'bg-muted/20' : `bg-card hover:border-primary/50 transition cursor-pointer ${getDayClass(day || 0)}`
                  }`}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <span className="text-xs font-semibold mb-1">{day}</span>
                      <div className="space-y-0.5">
                        {meetingsByDay.get(day)?.slice(0, 2).map((meeting) => (
                          <Badge
                            key={meeting.id}
                            variant="secondary"
                            className="text-[10px] truncate w-full justify-start bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30"
                          >
                            {meeting.title}
                          </Badge>
                        ))}
                        {meetingsByDay.get(day) && meetingsByDay.get(day)!.length > 2 && (
                          <Badge variant="outline" className="text-[8px] w-full justify-center">
                            +{meetingsByDay.get(day)!.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-500/20" />
                <span className="text-muted-foreground">Meeting scheduled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
