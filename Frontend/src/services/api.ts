import axios from 'axios'
import type {
  Company,
  DashboardStats,
  Signal,
  Workflow,
  Conversation,
  Message,
  ApiResponse,
  CompanyAnalytics,
  NewsItem,
  SearchResult,
} from '@/types'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Dashboard APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return response.data.data
}

// Company APIs
export const getCompanies = async (params?: {
  page?: number
  limit?: number
  search?: string
  industry?: string
  intentScore?: string
}): Promise<{ companies: Company[]; total: number }> => {
  const response = await api.get<ApiResponse<{ companies: Company[]; total: number }>>(
    '/companies',
    { params }
  )
  return response.data.data
}

export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await api.get<ApiResponse<Company>>(`/company/${id}`)
  return response.data.data
}

// Signal APIs
export const getSignals = async (params?: {
  page?: number
  limit?: number
  type?: string
}): Promise<{ signals: Signal[]; total: number }> => {
  const response = await api.get<ApiResponse<{ signals: Signal[]; total: number }>>(
    '/signals',
    { params }
  )
  return response.data.data
}

// Workflow APIs
export const getWorkflow = async (companyId: string): Promise<Workflow> => {
  const response = await api.get<ApiResponse<Workflow>>(`/workflow/${companyId}`)
  return response.data.data
}

export const simulateWorkflow = async (workflowId: string): Promise<{ status: string }> => {
  const response = await api.post<ApiResponse<{ status: string }>>(
    `/workflow/${workflowId}/simulate`
  )
  return response.data.data
}

// Content Generator APIs
export const generateContent = async (
  companyId: string,
  type: 'linkedin' | 'email' | 'whatsapp'
): Promise<{ content: string }> => {
  const response = await api.post<ApiResponse<{ content: string }>>(
    `/content/generate`,
    { company_id: companyId, type }
  )
  return response.data.data
}

// Conversation APIs
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get<ApiResponse<Conversation[]>>('/conversations')
  return response.data.data
}

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`)
  return response.data.data
}

export const sendMessage = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  const response = await api.post<ApiResponse<Message>>(
    `/conversations/${conversationId}/messages`,
    { content }
  )
  return response.data.data
}

// New Analytics APIs
export const getCompanyAnalytics = async (companyId: string): Promise<CompanyAnalytics> => {
  const response = await api.get<ApiResponse<CompanyAnalytics>>(`/company/${companyId}/analytics`)
  return response.data.data
}

export const getCompanyNews = async (companyId: string): Promise<NewsItem[]> => {
  const response = await api.get<ApiResponse<NewsItem[]>>(`/company/${companyId}/news`)
  return response.data.data
}

export const searchCompanies = async (query: string): Promise<SearchResult[]> => {
  const response = await api.get<ApiResponse<SearchResult[]>>('/companies/search', {
    params: { q: query }
  })
  return response.data.data
}

export default api
