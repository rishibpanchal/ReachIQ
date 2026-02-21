import { motion } from 'framer-motion'
import { Building2, MapPin, Calendar, Users, DollarSign, Lightbulb, Clock, MessageCircle } from 'lucide-react'
import { useCompanyAnalytics, useCompanyNews } from '@/hooks/useApi'
import { Badge } from '@/components/ui/badge'
import IntentGauge from './IntentGauge'
import SignalBarChart from './SignalBarChart'
import EngagementChart from './EngagementChart'
import NewsFeed from './NewsFeed'

interface CompanyAnalyticsPanelProps {
  companyId: string | null
}

export default function CompanyAnalyticsPanel({ companyId }: CompanyAnalyticsPanelProps) {
  const { data: analytics, isLoading: analyticsLoading } = useCompanyAnalytics(companyId || '')
  const { data: news, isLoading: newsLoading } = useCompanyNews(companyId || '')

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Company Selected</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Select a company from the conversation list to view detailed analytics and insights
        </p>
      </div>
    )
  }

  if (analyticsLoading || !analytics) {
    return (
      <div className="space-y-6 p-6">
        {/* Skeleton Loaders */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-muted/20 rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  const { company, intentVisualization, signalBreakdown, strategyInsights, engagementTrend } = analytics

  const getIntentColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="space-y-6 p-6">
        {/* Company Overview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-primary/10 via-card to-card p-6 backdrop-blur border border-primary/20 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">{company.industry}</p>
              </div>
            </div>
            <Badge className={`${getIntentColor(company.intent_score)} text-white border-0`}>
              {company.intent_score}% Intent
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{company.location}</span>
            </div>
            {company.founded_year && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Founded {company.founded_year}</span>
              </div>
            )}
            {company.employee_count && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{company.employee_count}</span>
              </div>
            )}
            {company.revenue && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{company.revenue}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Intent Score Visualization */}
        <IntentGauge
          intentScore={intentVisualization.intent_score}
          confidenceScore={intentVisualization.confidence_score}
        />

        {/* Signal Intelligence Breakdown */}
        <SignalBarChart data={signalBreakdown} />

        {/* AI Strategy Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold">AI Strategy Insights</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-background/50 p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Channel</span>
                </div>
                <p className="font-semibold text-sm">{strategyInsights.recommended_channel}</p>
              </div>
              
              <div className="rounded-lg bg-background/50 p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Timing</span>
                </div>
                <p className="font-semibold text-sm">{strategyInsights.recommended_timing}</p>
              </div>
              
              <div className="rounded-lg bg-background/50 p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Tone</span>
                </div>
                <p className="font-semibold text-sm">{strategyInsights.recommended_tone}</p>
              </div>
            </div>
            
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">AI Reasoning</p>
              <p className="text-sm leading-relaxed">{strategyInsights.ai_reasoning}</p>
            </div>
          </div>
        </motion.div>

        {/* Engagement Analytics */}
        <EngagementChart data={engagementTrend} />

        {/* News & Research Feed */}
        {newsLoading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-muted/20 rounded-xl"></div>
          </div>
        ) : (
          <NewsFeed news={news || []} />
        )}
      </div>
    </div>
  )
}
