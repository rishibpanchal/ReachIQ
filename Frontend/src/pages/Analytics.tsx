import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useApi'
import IntentPieChart from '@/components/charts/IntentPieChart'
import ChannelBarChart from '@/components/charts/ChannelBarChart'
import SuccessLineChart from '@/components/charts/SuccessLineChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Analytics() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground">Comprehensive insights into your outreach performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_companies}</div>
              <p className="text-xs text-green-500 mt-1">+12% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Intent Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(
                  (stats.high_intent_companies * 90 +
                    stats.medium_intent_companies * 70 +
                    stats.low_intent_companies * 50) /
                  stats.total_companies
                ).toFixed(0)}
              </div>
              <p className="text-xs text-green-500 mt-1">+5% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.success_rate_trend[stats.success_rate_trend.length - 1]?.rate || 0}%
              </div>
              <p className="text-xs text-green-500 mt-1">+8% from last month</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Outreach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.channel_effectiveness.reduce((acc, curr) => acc + curr.count, 0)}
              </div>
              <p className="text-xs text-green-500 mt-1">+15% from last month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <IntentPieChart data={stats.intent_distribution} title="Intent Score Distribution" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <ChannelBarChart data={stats.channel_effectiveness} title="Channel Performance" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <SuccessLineChart data={stats.success_rate_trend} title="Outreach Success Rate Over Time" />
      </motion.div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Technology', 'FinTech', 'Healthcare', 'Automotive'].map((industry, index) => (
                  <div key={industry} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{industry}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${85 - index * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{85 - index * 10}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Signal Types Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'Hiring Signals', value: 92 },
                  { type: 'LinkedIn Activity', value: 85 },
                  { type: 'News & Events', value: 78 },
                  { type: 'Engagement', value: 71 },
                ].map((signal) => (
                  <div key={signal.type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{signal.type}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${signal.value}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{signal.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
