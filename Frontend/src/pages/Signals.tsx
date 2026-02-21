import { motion } from 'framer-motion'
import { Radio, TrendingUp, AlertCircle } from 'lucide-react'
import { useSignals } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

const signalTypeIcons = {
  hiring: '💼',
  linkedin: '💼',
  engagement: '📊',
  news: '📰',
}

const signalTypeColors = {
  hiring: 'bg-blue-500/10 text-blue-500 border-blue-500/50',
  linkedin: 'bg-purple-500/10 text-purple-500 border-purple-500/50',
  engagement: 'bg-green-500/10 text-green-500 border-green-500/50',
  news: 'bg-orange-500/10 text-orange-500 border-orange-500/50',
}

export default function Signals() {
  const { data, isLoading } = useSignals()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading signals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Radio className="h-8 w-8 text-primary" />
          Signal Monitor
        </h1>
        <p className="text-muted-foreground">Real-time intelligence signals from target companies</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{data?.total || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Signals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data?.signals.filter((s) => s.strength >= 80).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">High Strength</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <span className="text-2xl">💼</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data?.signals.filter((s) => s.type === 'hiring').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Hiring Signals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                  <span className="text-2xl">📰</span>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data?.signals.filter((s) => s.type === 'news').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">News Signals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Signal Feed */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Live Signal Feed</h2>
        {data?.signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
                    {signalTypeIcons[signal.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{signal.title}</h3>
                        <p className="mt-1 text-muted-foreground">{signal.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={signalTypeColors[signal.type]}>
                          {signal.type}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-semibold">{signal.strength}%</div>
                            <div className="text-xs text-muted-foreground">Strength</div>
                          </div>
                          {signal.strength >= 80 && (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span>Source: {signal.source}</span>
                      <span>{formatDateTime(signal.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
