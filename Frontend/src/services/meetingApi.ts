import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMeetingStore, type Meeting } from '@/store/meetingStore'

const MEETINGS_API = '/api/meetings'
const GOOGLE_CALENDAR_API = '/api/google-calendar'

// Fetch all meetings
export const useFetchMeetings = () => {
  const setMeetings = useMeetingStore((state) => state.setMeetings)

  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const response = await fetch(MEETINGS_API)
      if (!response.ok) throw new Error('Failed to fetch meetings')
      const data = await response.json()
      setMeetings(data)
      return data
    },
    staleTime: 30000,
  })
}

// Create a new meeting with optional Google Calendar sync (falls back to local store when API unavailable)
export const useCreateMeeting = () => {
  const queryClient = useQueryClient()
  const addMeeting = useMeetingStore((state) => state.addMeeting)

  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & { syncWithGoogle?: boolean }) => {
      const { syncWithGoogle, ...meetingData } = meeting
      const now = new Date().toISOString()
      const id = `meeting_${Date.now()}`

      try {
        const response = await fetch(MEETINGS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...meetingData,
            id,
            createdAt: now,
            updatedAt: now,
          }),
        })

        if (!response.ok) throw new Error('API unavailable')
        const data = await response.json()

        if (syncWithGoogle) {
          try {
            const googleResponse = await fetch(`${GOOGLE_CALENDAR_API}/create-event`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                meetingId: data.id,
                title: data.title,
                description: data.description,
                startDateTime: `${data.date}T${data.startTime}:00`,
                endDateTime: `${data.date}T${data.endTime}:00`,
                attendees: data.attendees || [],
                meetingLink: data.meetingLink,
              }),
            })
            if (googleResponse.ok) {
              const googleData = await googleResponse.json()
              data.googleCalendarEventId = googleData.eventId
            }
          } catch {
            /* ignore */
          }
        }
        return data
      } catch {
        // Fallback: add to local store when API unavailable
        return {
          id,
          ...meetingData,
          createdAt: now,
          updatedAt: now,
        }
      }
    },
    onSuccess: (newMeeting) => {
      addMeeting(newMeeting)
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

// Update a meeting
export const useUpdateMeeting = () => {
  const queryClient = useQueryClient()
  const updateMeeting = useMeetingStore((state) => state.updateMeeting)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Meeting> }) => {
      const response = await fetch(`${MEETINGS_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
      })

      if (!response.ok) throw new Error('Failed to update meeting')
      return response.json()
    },
    onSuccess: (updatedMeeting) => {
      updateMeeting(updatedMeeting.id, updatedMeeting)
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

// Delete a meeting
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient()
  const removeMeeting = useMeetingStore((state) => state.removeMeeting)

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${MEETINGS_API}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete meeting')
      return id
    },
    onSuccess: (id) => {
      removeMeeting(id)
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
  })
}

