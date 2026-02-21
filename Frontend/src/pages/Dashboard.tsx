import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, TrendingUp, Activity, AlertCircle } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useApi'
import StatCard from '@/components/cards/StatCard'
import IntentPieChart from '@/components/charts/IntentPieChart'
import ChannelBarChart from '@/components/charts/ChannelBarChart'
import SuccessLineChart from '@/components/charts/SuccessLineChart'
import MeetingCalendar from '@/components/meeting/MeetingCalendar'
import UpcomingMeetings from '@/components/meeting/UpcomingMeetings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getIntentBadge, getIntentLabel } from '@/lib/utils'
import { useMeetingStore } from '@/store/meetingStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useDashboardStats()
  const meetings = useMeetingStore(state => state.meetings)
  const scheduledMeetings = [...meetings].sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())

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
        <p className="text-muted-foreground">Monitor your PolyDeal outreach intelligence metrics</p>
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

      {/* Meeting Calendar and Upcoming Meetings */}
      <div className="grid gap-4 md:grid-cols-2">
        <MeetingCalendar />
        <UpcomingMeetings />
      </div>

      {/* Upcoming Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              System Meetings
              <Badge variant="outline" className="ml-2 bg-primary/5 text-primary border-primary/20">
                {scheduledMeetings.length} scheduled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduledMeetings.length === 0 ? (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No meetings scheduled. Use the floating + button to schedule one.
                </div>
              ) : (
                scheduledMeetings.map((meeting) => (
                  <Card key={meeting.id} className="bg-accent/30 border-none shadow-none hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm tracking-tight">{meeting.title || "Meeting"}</span>
                        <Badge
                          variant={'default'}
                          className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-green-500/20 text-green-700 hover:bg-green-500/20`}
                        >
                          Scheduled
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="font-medium">{meeting.company || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-primary font-semibold">{meeting.type}</span>
                        </div>
                        <div className="pt-2 border-t border-accent/50 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">
                            {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-foreground font-bold italic">
                            {meeting.startTime} - {meeting.endTime}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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
