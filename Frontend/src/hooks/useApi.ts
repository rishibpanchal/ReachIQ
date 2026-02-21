import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/services/api'
import {
  mockDashboardStats,
  mockCompaniesList,
  mockCompanyDetail,
  mockSignals,
  mockWorkflow,
  mockConversations,
  mockCompanyAnalytics,
  mockCompanyNews,
  mockSearchResults,
} from '@/services/mockData'

// Flag to use mock data when API is not available
const USE_MOCK_DATA = true

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockDashboardStats
      }
      return api.getDashboardStats()
    },
  })
}

// Company Hooks
export const useCompanies = (params?: {
  page?: number
  limit?: number
  search?: string
  industry?: string
  intentScore?: string
}) => {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { companies: mockCompaniesList, total: mockCompaniesList.length }
      }
      return api.getCompanies(params)
    },
  })
}

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { ...mockCompanyDetail, id }
      }
      return api.getCompanyById(id)
    },
    enabled: !!id,
  })
}

// Signal Hooks
export const useSignals = (params?: { page?: number; limit?: number; type?: string }) => {
  return useQuery({
    queryKey: ['signals', params],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return { signals: mockSignals, total: mockSignals.length }
      }
      return api.getSignals(params)
    },
  })
}

// Workflow Hooks
export const useWorkflow = (companyId: string) => {
  return useQuery({
    queryKey: ['workflow', companyId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockWorkflow
      }
      return api.getWorkflow(companyId)
    },
    enabled: !!companyId,
  })
}

export const useSimulateWorkflow = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.simulateWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow'] })
    },
  })
}

// Content Generator Hooks
export const useGenerateContent = () => {
  return useMutation({
    mutationFn: ({ companyId, type }: { companyId: string; type: 'linkedin' | 'email' | 'whatsapp' }) => {
      if (USE_MOCK_DATA) {
        const mockContent = mockCompanyDetail.content
        const contentMap = {
          linkedin: mockContent?.linkedin_message || '',
          email: mockContent?.email_message || '',
          whatsapp: mockContent?.whatsapp_message || '',
        }
        return Promise.resolve({ content: contentMap[type] })
      }
      return api.generateContent(companyId, type)
    },
  })
}

// Conversation Hooks
export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockConversations
      }
      return api.getConversations()
    },
  })
}

export const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['conversation', conversationId, 'messages'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        const conversation = mockConversations.find((c) => c.id === conversationId)
        return conversation?.messages || []
      }
      return api.getConversationMessages(conversationId)
    },
    enabled: !!conversationId,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      api.sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId, 'messages'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

// New Analytics Hooks
export const useCompanyAnalytics = (companyId: string) => {
  return useQuery({
    queryKey: ['companyAnalytics', companyId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockCompanyAnalytics[companyId] || mockCompanyAnalytics['1']
      }
      return api.getCompanyAnalytics(companyId)
    },
    enabled: !!companyId,
  })
}

export const useCompanyNews = (companyId: string) => {
  return useQuery({
    queryKey: ['companyNews', companyId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockCompanyNews[companyId] || mockCompanyNews['1']
      }
      return api.getCompanyNews(companyId)
    },
    enabled: !!companyId,
  })
}

export const useSearchCompanies = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['searchCompanies', query],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        if (!query) return []
        const lowerQuery = query.toLowerCase()
        // Search through mock results for matches
        for (const [key, results] of Object.entries(mockSearchResults)) {
          if (lowerQuery.includes(key)) {
            return results
          }
        }
        // Return tech companies if no specific match
        return mockSearchResults['tech']
      }
      return api.searchCompanies(query)
    },
    enabled: enabled && query.length > 0,
  })
}
