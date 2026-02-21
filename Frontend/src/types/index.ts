export interface Company {
  id: string
  name: string
  industry: string
  location: string
  intent_score: number
  hiring_signal: string
  engagement_score: number
  recommended_channel: string
  confidence_score: number
  status: string
  last_signal?: string
  signals?: Signal[]
  strategy?: OutreachStrategy
  content?: GeneratedContent
}

export interface Signal {
  id: string
  type: 'hiring' | 'linkedin' | 'engagement' | 'news'
  title: string
  description: string
  strength: number
  timestamp: string
  source?: string
  url?: string
}

export interface OutreachStrategy {
  id: string
  company_id: string
  recommended_channel: string
  recommended_timing: string
  recommended_tone: string
  strategy_explanation: string
  confidence_score: number
  signal_contributions: SignalContribution[]
}

export interface SignalContribution {
  signal_type: string
  contribution_percentage: number
}

export interface GeneratedContent {
  linkedin_message: string
  email_message: string
  whatsapp_message: string
}

export interface WorkflowNode {
  id: string
  type: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    timing?: string
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  animated?: boolean
}

export interface Workflow {
  id: string
  company_id: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  status: string
}

export interface Conversation {
  id: string
  company_name: string
  company_id: string
  last_message: string
  last_message_time: string
  unread_count: number
  messages: Message[]
}

export interface Message {
  id: string
  sender: 'user' | 'ai' | 'contact'
  content: string
  timestamp: string
  status?: 'sent' | 'delivered' | 'read'
}

export interface Meeting {
  id: string
  company_name: string
  contact_name: string
  time: string
  duration: string
  type: 'Video' | 'Call' | 'In-person'
  status: 'Confirmed' | 'Pending' | 'Rescheduled'
}

export interface DashboardStats {
  total_companies: number
  high_intent_companies: number
  medium_intent_companies: number
  low_intent_companies: number
  intent_distribution: IntentDistribution[]
  channel_effectiveness: ChannelEffectiveness[]
  success_rate_trend: SuccessRateTrend[]
  recent_companies: Company[]
  upcoming_meetings: Meeting[]
}

export interface IntentDistribution {
  name: string
  value: number
  color: string
}

export interface ChannelEffectiveness {
  channel: string
  effectiveness: number
  count: number
}

export interface SuccessRateTrend {
  date: string
  rate: number
}

export interface ApiResponse<T> {
  data: T
  status: string
  message?: string
}

// New types for upgraded features
export interface CompanyAnalytics {
  company: CompanyOverview
  intentVisualization: IntentVisualization
  signalBreakdown: SignalBreakdown[]
  strategyInsights: StrategyInsights
  engagementTrend: EngagementTrend[]
}

export interface CompanyOverview {
  id: string
  name: string
  industry: string
  location: string
  founded_year?: number
  employee_count?: string
  revenue?: string
  intent_score: number
  confidence_score: number
}

export interface IntentVisualization {
  intent_score: number
  confidence_score: number
  score_label: string
}

export interface SignalBreakdown {
  name: string
  value: number
  max: number
}

export interface StrategyInsights {
  recommended_channel: string
  recommended_timing: string
  recommended_tone: string
  ai_reasoning: string
}

export interface EngagementTrend {
  date: string
  engagement: number
  intent: number
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  date: string
  sentiment: 'positive' | 'neutral' | 'negative'
  url?: string
}

export interface SearchResult {
  id: string
  name: string
  industry: string
  intent_score: number
  location: string
}

export interface Buyer {
  id: string
  name: string
  industry: string
  company_size?: string
  location?: string
}

export interface BuyerOutreachData {
  buyer_id: string
  intent_score: number
  linkedin_engagement: number
  groups?: string
  previous_channel: string
  channels: {
    name: string
    value: number
    color: string
  }[]
}
