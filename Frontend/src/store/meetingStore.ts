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
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  meetings: [],
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
}))
