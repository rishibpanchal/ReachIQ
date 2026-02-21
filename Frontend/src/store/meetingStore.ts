import { create } from 'zustand'

export interface Meeting {
  id: string
  title: string
  company: string
  date: string
  startTime: string
  endTime: string
  type: 'Online' | 'Offline'
  meetingLink?: string
  description?: string
  attendees?: string[]
  createdAt: string
  updatedAt: string
}

interface MeetingStore {
  meetings: Meeting[]
  isModalOpen: boolean
  isLoading: boolean
  initialMeetingData?: Partial<Meeting>

  // Actions
  openModal: (initialData?: Partial<Meeting>) => void
  closeModal: () => void
  setMeetings: (meetings: Meeting[]) => void
  addMeeting: (meeting: Meeting) => void
  removeMeeting: (id: string) => void
  updateMeeting: (id: string, meeting: Partial<Meeting>) => void
  setLoading: (loading: boolean) => void

  // Filters
  getTodayMeetings: () => Meeting[]
  getThisWeekMeetings: () => Meeting[]
  getThisMonthMeetings: () => Meeting[]
  getMeetingsForDate: (dateStr: string) => Meeting[]
}

const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

const SEED_MEETINGS: Meeting[] = [
  { id: 'seed_1', title: 'Q1 Planning', company: 'Acme Corp', date: yesterday, startTime: '10:00', endTime: '11:00', type: 'Online', meetingLink: 'https://zoom.us/j/123', createdAt: yesterday, updatedAt: yesterday },
  { id: 'seed_2', title: 'Product Review', company: 'TechStart', date: today, startTime: '14:00', endTime: '15:00', type: 'Online', description: 'Review new features', createdAt: today, updatedAt: today },
  { id: 'seed_3', title: 'Client Call', company: 'Global Inc', date: today, startTime: '16:00', endTime: '17:00', type: 'Offline', createdAt: today, updatedAt: today },
  { id: 'seed_4', title: 'Team Sync', company: 'Internal', date: tomorrow, startTime: '09:00', endTime: '09:30', type: 'Online', createdAt: today, updatedAt: today },
  { id: 'seed_5', title: 'Sales Demo', company: 'Enterprise Co', date: nextWeek, startTime: '11:00', endTime: '12:00', type: 'Online', meetingLink: 'https://meet.google.com/abc', createdAt: today, updatedAt: today },
]

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  meetings: SEED_MEETINGS,
  isModalOpen: false,
  isLoading: false,
  initialMeetingData: undefined,

  openModal: (initialData) => set({ isModalOpen: true, initialMeetingData: initialData }),
  closeModal: () => set({ isModalOpen: false, initialMeetingData: undefined }),

  setMeetings: (meetings) => set({ meetings }),

  addMeeting: (meeting) => {
    const state = get()
    const existingIndex = state.meetings.findIndex(m => m.id === meeting.id)
    if (existingIndex >= 0) {
      const updated = [...state.meetings]
      updated[existingIndex] = meeting
      set({ meetings: updated })
    } else {
      set({ meetings: [...state.meetings, meeting] })
    }
  },

  removeMeeting: (id) => {
    const state = get()
    set({ meetings: state.meetings.filter(m => m.id !== id) })
  },

  updateMeeting: (id, updates) => {
    const state = get()
    set({
      meetings: state.meetings.map(m =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    })
  },

  setLoading: (loading) => set({ isLoading: loading }),

  getTodayMeetings: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().meetings.filter(m => m.date === today)
  },

  getThisWeekMeetings: () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    return get().meetings.filter(m => {
      const meetingDate = new Date(m.date)
      return meetingDate >= weekStart && meetingDate <= weekEnd
    })
  },

  getThisMonthMeetings: () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    return get().meetings.filter(m => {
      const meetingDate = new Date(m.date)
      return meetingDate >= monthStart && meetingDate <= monthEnd
    })
  },

  getMeetingsForDate: (dateStr: string) => {
    return get().meetings
      .filter(m => m.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  },
}))
