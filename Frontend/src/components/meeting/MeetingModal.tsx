import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMeetingStore } from '@/store/meetingStore'
import { useCreateMeeting } from '@/services/meetingApi'
import { useBuyers } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import DatePicker from './DatePicker'
import TimePicker from './TimePicker'

// Helper function to add 1 hour to a time string
const addOneHour = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const newHours = (hours + 1) % 24
  return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export default function ScheduleMeetingModal() {
  const isModalOpen = useMeetingStore((state) => state.isModalOpen)
  const closeModal = useMeetingStore((state) => state.closeModal)
  const { mutate: createMeeting, isPending } = useCreateMeeting()
  const { data: buyers } = useBuyers()

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    date: '',
    startTime: '10:00',
    endTime: '11:00',
    type: 'Online' as 'Online' | 'Offline',
    meetingLink: '',
    description: '',
    attendees: '',
  })

  const initialMeetingData = useMeetingStore((state) => state.initialMeetingData)

  useEffect(() => {
    if (isModalOpen && initialMeetingData) {
      setFormData(prev => ({
        ...prev,
        title: initialMeetingData.title || prev.title,
        company: initialMeetingData.company || prev.company,
        date: initialMeetingData.date || prev.date,
        startTime: initialMeetingData.startTime || prev.startTime,
        endTime: initialMeetingData.endTime || prev.endTime,
        type: initialMeetingData.type || prev.type,
        meetingLink: initialMeetingData.meetingLink || prev.meetingLink,
        description: initialMeetingData.description || prev.description,
        attendees: initialMeetingData.attendees ? initialMeetingData.attendees.join(', ') : prev.attendees,
      }))
    }
  }, [isModalOpen, initialMeetingData])

  const handleStartTimeChange = (newStartTime: string) => {
    const newEndTime = addOneHour(newStartTime)
    setFormData(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const attendeesList = formData.attendees
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)

    createMeeting(
      {
        title: formData.title,
        company: formData.company,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        meetingLink: formData.meetingLink || undefined,
        description: formData.description || undefined,
        attendees: attendeesList.length > 0 ? attendeesList : undefined,
      },
      {
        onSuccess: () => {
          setFormData({
            title: '',
            company: '',
            date: '',
            startTime: '10:00',
            endTime: '11:00',
            type: 'Online',
            meetingLink: '',
            description: '',
            attendees: '',
          })
          closeModal()
        },
      }
    )
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              className="w-full max-w-2xl max-h-[85vh] rounded-2xl border border-border bg-background shadow-2xl flex flex-col pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            >
              <div className="flex items-center justify-between border-b border-border p-6 flex-shrink-0">
                <div>
                  <h2 className="text-2xl font-bold">Schedule a Meeting</h2>
                  <p className="text-sm text-muted-foreground mt-1">Create a new meeting with your team</p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg p-1 hover:bg-accent transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="space-y-5 p-6 overflow-y-auto">
                  {/* Meeting Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Meeting Title *</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Q1 Planning Session"
                      required
                      className="bg-slate-900/30"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Company *</label>
                    <Select
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="bg-slate-900/30"
                    >
                      <option value="">Select company</option>
                      {buyers?.map((buyer) => (
                        <option key={buyer.id} value={buyer.name}>
                          {buyer.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Date *
                    </label>
                    <DatePicker
                      value={formData.date}
                      onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                      placeholder="Select a date"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">Start Time *</label>
                      <TimePicker
                        value={formData.startTime}
                        onChange={handleStartTimeChange}
                        placeholder="Select start time"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">End Time *</label>
                      <TimePicker
                        value={formData.endTime}
                        onChange={(endTime) => setFormData(prev => ({ ...prev, endTime }))}
                        placeholder="Select end time"
                      />
                    </div>
                  </div>

                  {/* Meeting Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Meeting Type *</label>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="bg-slate-900/30"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </Select>
                  </div>

                  {/* Meeting Link */}
                  {formData.type === 'Online' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">Meeting Link</label>
                      <Input
                        name="meetingLink"
                        type="url"
                        value={formData.meetingLink}
                        onChange={handleChange}
                        placeholder="https://zoom.us/j/..."
                        className="bg-slate-900/30"
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add meeting notes, agenda, or important details..."
                      rows={3}
                      className="w-full rounded-lg border border-input bg-slate-900/30 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Attendees */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">Attendees</label>
                    <Input
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleChange}
                      placeholder="user1@example.com, user2@example.com"
                      className="bg-slate-900/30"
                    />
                  </div>


                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-4 border-t border-border bg-background flex-shrink-0 mt-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isPending ? 'Scheduling...' : 'Schedule Meeting'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
