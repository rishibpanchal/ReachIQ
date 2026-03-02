/// <reference types="vite/client" />

import axios, { AxiosError } from 'axios'
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
  Buyer,
  BuyerOutreachData,
} from '@/types'

// Validate API URL configuration
const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  const prodUrl = import.meta.env.VITE_API_BASE_URL
  if (!prodUrl) {
    console.error('VITE_API_BASE_URL is not set. Please configure it in .env for production.')
    throw new Error('API_BASE_URL is not configured')
  }
  return prodUrl
}

const API_BASE_URL = getApiBaseUrl()
const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL || ''

// Validate Supabase configuration
const isSupabaseConfigured = (): boolean => {
  return SUPABASE_FUNCTION_URL.trim().length > 0
}

// Helper function to safely extract data from API responses
const extractData = <T>(response: any): T => {
  if (!response?.data) {
    throw new Error('Invalid API response: missing data field')
  }
  return response.data
}

const api = axios.create({
  baseURL: API_BASE_URL,
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    })
    return Promise.reject(error)
  }
)

// Dashboard APIs
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats')
  return extractData<DashboardStats>(response.data)

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
  buyerId: string,
  type: 'linkedin' | 'email' | 'whatsapp'
): Promise<{ content: string }> => {
  // Try to call the real Supabase Edge Function if configured
  if (isSupabaseConfigured()) {
    try {
      const supabaseClient = axios.create({
        baseURL: SUPABASE_FUNCTION_URL,
        timeout: 30000, // Longer timeout for AI generation
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const response = await supabaseClient.post<{ content: string }>(
        '/generate-content',
        { buyer_id: buyerId, type }
      )
      if (response.data?.content) {
        return response.data
      }
    } catch (error) {
      console.warn('Supabase AI generation failed, falling back to backend:', error)
      // Fall through to backend endpoint
    }
  } else {
    console.warn('VITE_SUPABASE_FUNCTION_URL not configured, using backend fallback')
  }

  // Fallback to backend endpoint
  try {
    const response = await api.post<ApiResponse<{ content: string }>>(
      '/content/generate',
      { buyer_id: buyerId, type }
    )
    if (response.data?.data?.content) {
      return response.data.data
    }
    throw new Error('Invalid response format from backend')
  } catch (error) {
    console.error('Content generation failed:', error)
    throw error
  }
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

// Buyer Outreach APIs
export const getBuyers = async (): Promise<Buyer[]> => {
  const response = await api.get<ApiResponse<Buyer[]>>('/buyers')
  return response.data.data
}

export const getBuyerOutreachData = async (buyerId: string): Promise<BuyerOutreachData> => {
  const response = await api.get<ApiResponse<BuyerOutreachData>>(`/buyers/${buyerId}/outreach`)
  return response.data.data
}

// World News (GNews proxy) - for Signal Monitor
export interface WorldNewsArticle {
  id: string
  title: string
  description: string
  url: string
  image?: string
  publishedAt: string
  source: string
  sourceUrl?: string
  category: 'business' | 'technology' | 'industry' | 'world' | 'science' | 'health' | 'entertainment' | 'general'
}

export const getWorldNews = async (): Promise<{
  articles: WorldNewsArticle[]
  total: number
  error?: string
}> => {
  const response = await api.get<
    ApiResponse<{ articles: WorldNewsArticle[]; total: number; error?: string }>
  >('/news/world')
  return response.data.data
}

export default api
