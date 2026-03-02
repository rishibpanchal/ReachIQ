import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  placeholder?: string
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse value to display formatted date
  const displayDate = value ? format(new Date(value), 'MMM dd, yyyy') : placeholder

  // Get calendar days
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay())
  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()))

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weeks = Array.from({ length: Math.ceil(days.length / 7) }, (_, i) =>
    days.slice(i * 7, (i + 1) * 7)
  )

  const handleSelectDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd')
    onChange(formattedDate)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setViewDate(subMonths(viewDate, 1))
  }

  const handleNextMonth = () => {
    setViewDate(addMonths(viewDate, 1))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-input bg-slate-900/30 cursor-pointer hover:border-emerald-500 transition-colors"
      >
        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {displayDate}
        </span>
      </div>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-semibold text-foreground">
                {format(viewDate, 'MMMM yyyy')}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-accent rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground w-8">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="space-y-1">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1">
                  {week.map((day) => {
                    const isCurrentMonth = isSameMonth(day, viewDate)
                    const isSelected = value && isSameDay(day, new Date(value))
                    const isToday = isSameDay(day, new Date())

                    return (
                      <button
                        type="button"
                        key={day.toString()}
                        onClick={() => handleSelectDate(day)}
                        className={`
                          h-8 w-8 rounded text-xs font-medium transition-colors
                          ${!isCurrentMonth ? 'text-muted-foreground bg-transparent' : ''}
                          ${isCurrentMonth && !isSelected && !isToday ? 'text-foreground hover:bg-accent' : ''}
                          ${isToday && !isSelected ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500' : ''}
                          ${isSelected ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                        `}
                        disabled={!isCurrentMonth}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
