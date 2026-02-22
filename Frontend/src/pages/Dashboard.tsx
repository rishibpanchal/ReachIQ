import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useApi'
import StatCard from '@/components/cards/StatCard'
import IntentPieChart from '@/components/charts/IntentPieChart'
import ChannelBarChart from '@/components/charts/ChannelBarChart'
import SuccessLineChart from '@/components/charts/SuccessLineChart'
import DashboardMeetingSection from '@/components/dashboard/DashboardMeetingSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getIntentBadge, getIntentLabel } from '@/lib/utils'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your ReachIQ outreach intelligence metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Companies"
          value={stats.total_companies}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="High Intent"
          value={stats.high_intent_companies}
          icon={TrendingUp}
          color="bg-green-500/10"
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Medium Intent"
          value={stats.medium_intent_companies}
          icon={Activity}
          color="bg-yellow-500/10"
          trend={{ value: 5, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Low Intent"
          value={stats.low_intent_companies}
          icon={AlertCircle}
          color="bg-red-500/10"
          trend={{ value: -3, isPositive: false }}
          delay={0.3}
        />
      </div>

      {/* Calendar + Meeting Log Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <DashboardMeetingSection />
      </motion.div>
      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <IntentPieChart data={stats.intent_distribution} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <ChannelBarChart data={stats.channel_effectiveness} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <SuccessLineChart data={stats.success_rate_trend} />
      </motion.div>

      {/* Recent Companies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Intent Score</TableHead>
                  <TableHead>Recommended Channel</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Signal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recent_companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>
                      <Badge className={getIntentBadge(company.intent_score)}>
                        {getIntentLabel(company.intent_score)} ({company.intent_score})
                      </Badge>
                    </TableCell>
                    <TableCell>{company.recommended_channel}</TableCell>
                    <TableCell>{company.confidence_score}%</TableCell>
                    <TableCell className="text-muted-foreground">{company.last_signal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div >
  )
}
