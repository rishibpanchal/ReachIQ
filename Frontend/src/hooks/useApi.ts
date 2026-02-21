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
  mockBuyers,
  mockBuyerOutreachData,
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
    mutationFn: async ({ buyerId, type }: { buyerId: string; type: 'linkedin' | 'email' | 'whatsapp' }) => {
      try {
        const result = await api.generateContent(buyerId, type)
        return result
      } catch {
        // Fallback: Polydeal smart mock — varied, non-templated messages
        const buyer = mockBuyers.find(b => b.id === buyerId) || mockBuyers[0]
        const buyerContext = mockBuyerOutreachData[buyerId] || mockBuyerOutreachData['BUY_57096']
        const primaryChannel = buyerContext.channels[0]?.name || 'Email'
        const engagementPct = (buyerContext.linkedin_engagement * 100).toFixed(0)
        const ind = buyer.industry

        const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

        const linkedinVariants = [
          `Hi ${buyer.name},\n\nThe ${ind} space has been moving fast lately — new entrants, shifting buyer expectations, and a very crowded digital landscape. Brands that get their content and community presence right early tend to pull ahead.\n\nAt Polydeal, we work with companies in exactly this stage — helping them sharpen their social identity, build search visibility, and turn digital noise into real conversations. We're a Maharashtra-based digital marketing agency specialising in data-driven branding and content.\n\nWould love to share what we've seen work in ${ind}. Worth a quick chat?`,

          `Hey ${buyer.name},\n\nNoticed your profile has been showing up more in ${buyerContext.groups || 'industry discussions'} lately — always a sign that a brand is either growing or gearing up for something meaningful.\n\nI'm from Polydeal — we help brands in the ${ind} sector get their online presence to match their ambitions. Whether it's social strategy, visuals, or getting found on search, we make sure the digital side keeps pace with the business.\n\nHappy to share a few ideas specific to your space if you're open to it?`,

          `Hi ${buyer.name},\n\n${ind} brands are facing an interesting challenge right now — standing out digitally while staying relevant to an audience that's seen it all. The ones cutting through are investing in sharper content, stronger visual identity, and smarter community engagement.\n\nThat's what we do at Polydeal. We're a digital marketing agency that helps brands like yours navigate exactly this — from social media campaigns to online reputation and SEO.\n\nCurious if this is something on your radar. Would a quick conversation make sense?`
        ]

        const emailVariants = [
          `Subject: ${ind} brands and the digital gap — worth a conversation?\n\nHi ${buyer.name},\n\nI've been following activity in the ${ind} space and one pattern keeps showing up — brands with strong products often lose ground digitally simply because their online presence doesn't reflect what they actually offer.\n\nI'm [Your Name] from Polydeal, a digital marketing agency based in Maharashtra. We help B2B brands close that gap through strategic social media, data-driven SEO content, and visual branding that builds trust.\n\nYour recent engagement on ${buyerContext.previous_channel} suggests you're already putting effort into visibility — we'd love to build on that momentum with a focused strategy.\n\nWould a 15-minute exploratory call this week be useful?\n\nBest,\n[Your Name] | Polydeal\npolydeal.com`,

          `Subject: Growing your brand's digital presence in ${ind}\n\nHi ${buyer.name},\n\nBrands in the ${ind} sector are at a turning point digitally. The ones that are winning are showing up consistently — on search, on social, and in the right communities. The ones falling behind are those treating digital as an afterthought.\n\nAt Polydeal, we partner with companies to build that consistent presence — through tailored content, social media strategy, and online reputation management that actually drives growth.\n\nGiven your activity in ${buyerContext.groups || 'your industry circles'} (your LinkedIn engagement is in the top tier at ${engagementPct}%), I think there's a real opportunity to amplify what you're already doing.\n\nOpen to a quick call to explore?\n\nWarm regards,\n[Your Name] | Polydeal`,

          `Subject: A thought on your brand's digital strategy\n\nHi ${buyer.name},\n\nSomething we see a lot in the ${ind} world — companies with real expertise and strong offerings, but their digital presence undersells them. Prospects land on their page and leave without understanding what makes them different.\n\nPolydeal exists to fix exactly that. We're a data-centric digital marketing agency that helps brands communicate their value more powerfully — through design, content, and social media that resonates with the right audience.\n\nWe tend to work best with brands that are growing and want their online presence to reflect that ambition. Based on what I've seen, that sounds like it could be you.\n\nWould you be open to a 10-minute chat this week?\n\nBest,\n[Your Name] | Polydeal`
        ]

        const whatsappVariants = [
          `Hi ${buyer.name}! 👋 Came across your activity in the ${ind} space and thought there might be a good fit with what we do at Polydeal — we help brands strengthen their digital presence through social, content & SEO. Worth a 10-min chat? 🙌`,

          `Hey ${buyer.name}! I'm from Polydeal, a digital marketing agency. The ${ind} sector is buzzing right now and we've been helping brands there show up stronger online. Open to a quick call via ${primaryChannel}? 🚀`,

          `Hi ${buyer.name}! Noticed your brand making waves in ${ind} — at Polydeal we help companies like yours turn that momentum into a sharper digital presence. Got a few mins this week? 😊`
        ]

        const mocks = {
          linkedin: pick(linkedinVariants),
          email: pick(emailVariants),
          whatsapp: pick(whatsappVariants)
        }

        await new Promise(resolve => setTimeout(resolve, 900))
        return { content: mocks[type] }
      }
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

// Buyer Hooks
export const useBuyers = () => {
  return useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockBuyers
      }
      return api.getBuyers()
    },
  })
}

export const useBuyerOutreachData = (buyerId: string) => {
  return useQuery({
    queryKey: ['buyerOutreach', buyerId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return mockBuyerOutreachData[buyerId] || mockBuyerOutreachData['BUY_57096']
      }
      return api.getBuyerOutreachData(buyerId)
    },
    enabled: !!buyerId,
  })
}
