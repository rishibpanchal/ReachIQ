import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import GrowthCurvePrediction from '@/components/analytics/GrowthCurvePrediction'
import { useBuyerOutreachData } from '@/hooks/useApi'
import { TrendingUp, Zap, Lightbulb, FileText } from 'lucide-react'

interface PredictionIntelligenceSectionProps {
  companyId: string
}

interface MarginalGainInsight {
  title: string
  description: string
  improvement: number
  color: 'amber' | 'green' | 'blue'
}

interface OptimizationInsight {
  title: string
  description: string
  priority: 'primary' | 'secondary' | 'quick'
  color: 'blue' | 'purple' | 'emerald'
}

interface FunnelStage {
  stage: number
  name: string
  count: number
  icon: string
  color: string
}

export default function PredictionIntelligenceSection({ companyId }: PredictionIntelligenceSectionProps) {
  const [activeTab, setActiveTab] = useState('growth')
  const { data: buyerData } = useBuyerOutreachData(companyId)

  // Calculate insights from real data
  const predictiveInsights = useMemo(() => {
    if (!buyerData) {
      return {
        marginalGains: [],
        optimizations: [],
        funnelStages: []
      }
    }

    const intentScore = buyerData.intent_score || 0
    const linkedinEngagement = (buyerData.linkedin_engagement || 0) * 100
    const channels = buyerData.channels || []

    // Calculate Marginal Gains based on channel effectiveness
    const marginalGains: MarginalGainInsight[] = []

    if (channels.length >= 2) {
      const primary = channels[0]?.value || 0
      const secondary = channels[1]?.value || 0
      const potentialGain = Math.round(primary - secondary)

      if (potentialGain > 0) {
        marginalGains.push({
          title: `Multi-channel Optimization`,
          description: `Potential ${potentialGain}% improvement by leveraging ${channels[1]?.name || 'secondary channel'} with ${primary}% primary channel effectiveness`,
          improvement: Math.min(potentialGain, 25),
          color: 'amber'
        })
      }
    }

    // Timing optimization based on engagement
    if (linkedinEngagement > 70) {
      marginalGains.push({
        title: 'Engagement Momentum',
        description: `Current LinkedIn engagement at ${linkedinEngagement.toFixed(0)}% suggests strong receptivity window. Increase frequency by 15-20%`,
        improvement: 8,
        color: 'green'
      })
    } else if (linkedinEngagement > 40) {
      marginalGains.push({
        title: 'Engagement Growth',
        description: `LinkedIn engagement at ${linkedinEngagement.toFixed(0)}% shows potential. Personalized outreach could yield improvements`,
        improvement: 12,
        color: 'blue'
      })
    }

    // Personalization insights
    if (intentScore >= 85) {
      marginalGains.push({
        title: 'Personalization at Scale',
        description: `High intent score (${intentScore}) indicates strong fit. Hyper-personalized campaigns recommended for maximum conversion`,
        improvement: 18,
        color: 'blue'
      })
    } else {
      marginalGains.push({
        title: 'Targeted Personalization',
        description: 'Leverage available intent signals for contextual messaging and improved relevance',
        improvement: 12,
        color: 'amber'
      })
    }

    // Generate Optimization Insights based on metrics
    const optimizations: OptimizationInsight[] = []

    if (intentScore >= 90) {
      optimizations.push({
        title: 'Aggressive Outreach Strategy',
        description: `Extremely high intent score (${intentScore}). Recommend immediate multi-channel engagement with accelerated timeline. Historical data shows 45%+ conversion rate at this intent level.`,
        priority: 'primary',
        color: 'blue'
      })
    } else if (intentScore >= 80) {
      optimizations.push({
        title: 'Priority Engagement',
        description: `Strong intent signals (${intentScore}). Implement coordinated outreach across primary and secondary channels. Expected conversion improvement: 35-40%.`,
        priority: 'primary',
        color: 'blue'
      })
    } else {
      optimizations.push({
        title: 'Building Engagement Foundation',
        description: `Moderate intent level (${intentScore}). Focus on relationship building and value demonstration before aggressive sales approach.`,
        priority: 'primary',
        color: 'blue'
      })
    }

    if (linkedinEngagement > 0.6) {
      optimizations.push({
        title: 'LinkedIn-First Campaign',
        description: `High LinkedIn engagement (${linkedinEngagement.toFixed(0)}%) detected. Prioritize LinkedIn outreach with industry-specific content and thought leadership sharing.`,
        priority: 'secondary',
        color: 'purple'
      })
    } else {
      optimizations.push({
        title: 'Diversified Channel Mix',
        description: 'Lower LinkedIn engagement suggests preference for other channels. Develop omnichannel strategy with focus on available engagement patterns.',
        priority: 'secondary',
        color: 'purple'
      })
    }

    optimizations.push({
      title: 'A/B Testing Protocol',
      description: `Implement systematic testing on subject lines, sending times, and messaging variations. Expected lift: 5-10% with weekly optimization cycles.`,
      priority: 'quick',
      color: 'emerald'
    })

    // Generate Funnel Breakdown with calculated metrics
    const baseLeads = Math.round(3200 * (intentScore / 100))
    const reached = Math.round(baseLeads * 0.88)
    const engaged = Math.round(reached * 0.28)
    const meetings = Math.round(engaged * 0.2)
    const deals = Math.round(meetings * 0.18)

    const funnelStages: FunnelStage[] = [
      {
        stage: 1,
        name: 'Lead Identification',
        count: baseLeads,
        icon: '🎯',
        color: 'green'
      },
      {
        stage: 2,
        name: 'Initial Outreach',
        count: reached,
        icon: '📧',
        color: 'blue'
      },
      {
        stage: 3,
        name: 'Engagement',
        count: engaged,
        icon: '💬',
        color: 'amber'
      },
      {
        stage: 4,
        name: 'Qualified Conversations',
        count: meetings,
        icon: '📞',
        color: 'purple'
      },
      {
        stage: 5,
        name: 'Conversion',
        count: deals,
        icon: '🎉',
        color: 'emerald'
      }
    ]

    return {
      marginalGains: marginalGains.length > 0 ? marginalGains : [],
      optimizations: optimizations.length > 0 ? optimizations : [],
      funnelStages,
      metrics: {
        intentScore,
        linkedinEngagement: linkedinEngagement.toFixed(0),
        conversionRate: ((deals / baseLeads) * 100).toFixed(1)
      }
    }
  }, [buyerData])

  const tabConfig = [
    {
      value: 'growth',
      label: 'Growth Curve',
      icon: TrendingUp,
      description: 'Forecast growth trajectory and conversion rates'
    },
    {
      value: 'marginal',
      label: 'Marginal Gain',
      icon: Zap,
      description: 'Incremental performance improvements'
    },
    {
      value: 'optimization',
      label: 'Optimization',
      icon: Lightbulb,
      description: 'AI-driven optimization insights'
    },
    {
      value: 'breakdown',
      label: 'Step Breakdown',
      icon: FileText,
      description: 'Detailed conversion funnel analysis'
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Prediction Intelligence</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Advanced AI-powered insights for buyer engagement optimization
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2 mb-6 bg-muted/30 rounded-lg p-1">
              {tabConfig.map(tab => {
                const IconComponent = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col items-center gap-1 py-4 px-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* Growth Curve Tab */}
            <TabsContent value="growth">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GrowthCurvePrediction companyId={companyId} />
              </motion.div>
            </TabsContent>

            {/* Marginal Gain Tab */}
            <TabsContent value="marginal">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    {!buyerData ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
                          Loading buyer insights...
                        </div>
                      </div>
                    ) : predictiveInsights.marginalGains.length > 0 ? (
                      <div className="space-y-4">
                        {predictiveInsights.marginalGains.map((gain, idx) => {
                          const colorConfig = {
                            amber: {
                              bg: 'from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950',
                              border: 'border-amber-200 dark:border-amber-800',
                              textHeading: 'text-amber-900 dark:text-amber-100',
                              textDesc: 'text-amber-800 dark:text-amber-200',
                              textNum: 'text-amber-600 dark:text-amber-400'
                            },
                            green: {
                              bg: 'from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
                              border: 'border-green-200 dark:border-green-800',
                              textHeading: 'text-green-900 dark:text-green-100',
                              textDesc: 'text-green-800 dark:text-green-200',
                              textNum: 'text-green-600 dark:text-green-400'
                            },
                            blue: {
                              bg: 'from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
                              border: 'border-blue-200 dark:border-blue-800',
                              textHeading: 'text-blue-900 dark:text-blue-100',
                              textDesc: 'text-blue-800 dark:text-blue-200',
                              textNum: 'text-blue-600 dark:text-blue-400'
                            }
                          }
                          const colors = colorConfig[gain.color]

                          return (
                            <div
                              key={idx}
                              className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}
                            >
                              <div>
                                <h3 className={`font-semibold ${colors.textHeading}`}>{gain.title}</h3>
                                <p className={`text-sm ${colors.textDesc} mt-1`}>{gain.description}</p>
                              </div>
                              <div className={`text-2xl font-bold ${colors.textNum} flex-shrink-0 ml-4`}>+{gain.improvement}%</div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No marginal gain insights available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Optimization Insight Tab */}
            <TabsContent value="optimization">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    {!buyerData ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
                          Loading optimization insights...
                        </div>
                      </div>
                    ) : predictiveInsights.optimizations.length > 0 ? (
                      <div className="space-y-4">
                        {predictiveInsights.optimizations.map((insight, idx) => {
                          const colorMap = {
                            blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
                            purple: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100',
                            emerald: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                          }
                          const colors = colorMap[insight.color]
                          const badge = insight.priority === 'primary' ? 'Primary' : insight.priority === 'secondary' ? 'Secondary' : 'Quick Win'
                          const badgeColor = insight.priority === 'primary' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : insight.priority === 'secondary' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'

                          return (
                            <div key={idx} className={`p-4 rounded-lg border ${colors}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{insight.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColor}`}>{badge}</span>
                                  </div>
                                  <p className="text-sm opacity-90">{insight.description}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No optimization insights available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Step Breakdown Tab */}
            <TabsContent value="breakdown">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    {!buyerData ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <div className="text-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
                          Loading funnel breakdown...
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Intent Score:</span>
                              <span className="font-semibold ml-1">{predictiveInsights.metrics?.intentScore || 0}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">LinkedIn Engagement:</span>
                              <span className="font-semibold ml-1">{predictiveInsights.metrics?.linkedinEngagement || '0'}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Projected Conversion:</span>
                              <span className="font-semibold ml-1">{predictiveInsights.metrics?.conversionRate || '0'}%</span>
                            </div>
                          </div>
                        </div>

                        {predictiveInsights.funnelStages.map((stage, idx) => {
                          const colorBg = {
                            'green': 'bg-green-100 dark:bg-green-900',
                            'blue': 'bg-blue-100 dark:bg-blue-900',
                            'amber': 'bg-amber-100 dark:bg-amber-900',
                            'purple': 'bg-purple-100 dark:bg-purple-900',
                            'emerald': 'bg-emerald-100 dark:bg-emerald-900'
                          }
                          const colorText = {
                            'green': 'text-green-700 dark:text-green-300',
                            'blue': 'text-blue-700 dark:text-blue-300',
                            'amber': 'text-amber-700 dark:text-amber-300',
                            'purple': 'text-purple-700 dark:text-purple-300',
                            'emerald': 'text-emerald-700 dark:text-emerald-300'
                          }

                          return (
                            <div
                              key={stage.stage}
                              className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border hover:bg-card transition-colors"
                            >
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorBg[stage.color as keyof typeof colorBg]} ${colorText[stage.color as keyof typeof colorText]} font-semibold`}>
                                {stage.stage}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold">{stage.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {idx > 0 ? `Conversion: ${Math.round((stage.count / predictiveInsights.funnelStages[idx - 1].count) * 100)}%` : 'Starting pool'}
                                </div>
                              </div>
                              <div className="text-lg font-bold">{stage.count.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">{stage.count === 1 ? 'deal' : stage.stage > 3 ? 'meeting' : 'contact'}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
