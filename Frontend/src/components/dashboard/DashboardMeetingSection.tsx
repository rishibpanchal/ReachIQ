import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useMeetingStore } from '@/store/meetingStore'
import { Button } from '@/components/ui/button'
import DashboardCalendar from './DashboardCalendar'
import MeetingLogPanel from './MeetingLogPanel'
import { format } from 'date-fns'

export default function DashboardMeetingSection() {
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const openModal = useMeetingStore((state) => state.openModal)

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date)
    setViewDate(date)
  }, [])

  const handleViewDateChange = useCallback((date: Date) => {
    setViewDate(date)
    if (!selectedDate || format(date, 'yyyy-MM') !== format(selectedDate, 'yyyy-MM')) {
      setSelectedDate(null)
    }
  }, [selectedDate])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meetings</h2>
        <Button
          onClick={() => openModal()}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,380px]">
        <DashboardCalendar
          viewDate={viewDate}
          onViewDateChange={handleViewDateChange}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
        <MeetingLogPanel
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>
    </div>
  )
}
