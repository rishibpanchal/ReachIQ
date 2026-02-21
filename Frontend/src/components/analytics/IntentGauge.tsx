import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface IntentGaugeProps {
  intentScore: number
  confidenceScore: number
}

export default function IntentGauge({ intentScore, confidenceScore }: IntentGaugeProps) {
  const intentData = [
    { value: intentScore },
    { value: 100 - intentScore }
  ]
  
  const confidenceData = [
    { value: confidenceScore },
    { value: 100 - confidenceScore }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Very High'
    if (score >= 60) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur border border-white/10 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-6">Intent Visualization</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Intent Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={getScoreColor(intentScore)} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: getScoreColor(intentScore) }}>
                {intentScore}%
              </span>
              <span className="text-xs text-muted-foreground mt-1">{getScoreLabel(intentScore)}</span>
            </div>
          </div>
          <p className="text-sm font-medium mt-4">Intent Score</p>
        </div>

        {/* Confidence Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={getScoreColor(confidenceScore)} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: getScoreColor(confidenceScore) }}>
                {confidenceScore}%
              </span>
              <span className="text-xs text-muted-foreground mt-1">{getScoreLabel(confidenceScore)}</span>
            </div>
          </div>
          <p className="text-sm font-medium mt-4">Confidence</p>
        </div>
      </div>
    </motion.div>
  )
}
