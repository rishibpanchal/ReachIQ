import { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMeetingStore } from '@/store/meetingStore'
import { useCreateMeeting } from '@/services/meetingApi'
import { useBuyers } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const TIME_SLOTS = [
  { label: '09:00 AM', value: '09:00' },
  { label: '09:30 AM', value: '09:30' },
  { label: '10:00 AM', value: '10:00' },
  { label: '10:30 AM', value: '10:30' },
  { label: '11:00 AM', value: '11:00' },
  { label: '11:30 AM', value: '11:30' },
  { label: '12:00 PM', value: '12:00' },
  { label: '12:30 PM', value: '12:30' },
  { label: '01:00 PM', value: '13:00' },
  { label: '01:30 PM', value: '13:30' },
  { label: '02:00 PM', value: '14:00' },
  { label: '02:30 PM', value: '14:30' },
  { label: '03:00 PM', value: '15:00' },
  { label: '03:30 PM', value: '15:30' },
  { label: '04:00 PM', value: '16:00' },
  { label: '04:30 PM', value: '16:30' },
  { label: '05:00 PM', value: '17:00' },
  { label: '05:30 PM', value: '17:30' },
]

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
    syncGoogleCalendar: false,
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
        syncWithGoogle: formData.syncGoogleCalendar,
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
            syncGoogleCalendar: false,
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
                    <label className="block text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date *
                    </label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="bg-slate-900/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">Start Time *</label>
                      <Select
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="bg-slate-900/30"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">End Time *</label>
                      <Select
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="bg-slate-900/30"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </Select>
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

                  {/* Google Calendar Sync */}
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <input
                      type="checkbox"
                      id="syncGoogle"
                      name="syncGoogleCalendar"
                      checked={formData.syncGoogleCalendar}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-emerald-500"
                    />
                    <label htmlFor="syncGoogle" className="text-sm font-medium cursor-pointer flex-1">
                      <div className="font-semibold text-emerald-600">Sync with Google Calendar</div>
                      <div className="text-xs text-muted-foreground">Automatically add this meeting to your Google Calendar</div>
                    </label>
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
