/**
 * GrowthCurvePrediction Component
 * 
 * Displays dynamic growth curve prediction with optimal stopping point analysis.
 * Uses ML-based probability predictions and mathematical optimization.
 */

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ReferenceDot,
  Cell
} from 'recharts'
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Info,
  ArrowRight,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

interface GrowthStep {
  step: number
  channel: string
  probability: number
  base_probability: number
  decay_adjusted: number
  channel_effectiveness: number
}

interface GrowthCurveData {
  company_id: string
  steps: GrowthStep[]
  optimal_stopping_point: number
  stopping_reason: string
  expected_total_response_probability: number
  roi_score: number
  marginal_gains: number[]
  stopping_threshold: number
  metrics: {
    cumulative_probability: number[]
    optimal_probability: number
    diminishing_returns_rate: number
    wasted_effort_ratio: number
    efficiency_score: number
    total_steps: number
    steps_saved: number
  }
}

interface GrowthCurvePredictionProps {
  companyId: string
}

export default function GrowthCurvePrediction({ companyId }: GrowthCurvePredictionProps) {
  // Fetch growth curve data
  const { data, isLoading, error } = useQuery<{ data: GrowthCurveData }>({
    queryKey: ['growthCurve', companyId],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/growth-curve/${companyId}`
      )
      return response.data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3 text-muted-foreground">Computing growth curve predictions...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data?.data) {
    return (
      <Card className="w-full border-red-500/20 bg-red-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load growth curve prediction</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const curveData = data.data

  // Prepare chart data
  const chartData = curveData.steps.map((step, index) => ({
    step: `Step ${step.step}`,
    stepNumber: step.step,
    channel: step.channel,
    probability: (step.probability * 100).toFixed(2),
    probabilityRaw: step.probability,
    cumulative: curveData.metrics.cumulative_probability?.[index]
      ? (curveData.metrics.cumulative_probability[index] * 100).toFixed(2)
      : 0,
    isOptimal: step.step === curveData.optimal_stopping_point,
    marginalGain: curveData.marginal_gains[index]
      ? (curveData.marginal_gains[index] * 100).toFixed(2)
      : 0,
  }))

  // Prepare marginal gains chart data
  const marginalGainsData = curveData.marginal_gains.map((gain, index) => ({
    step: `${index + 1}→${index + 2}`,
    stepNumber: index + 1,
    gain: (gain * 100).toFixed(2),
    threshold: (curveData.stopping_threshold * 100).toFixed(2),
    isBelowThreshold: gain < curveData.stopping_threshold,
  }))

  const optimalStep = curveData.optimal_stopping_point

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Growth Curve Prediction</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ML-powered optimal outreach sequence analysis
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary text-lg px-4 py-2">
                {(curveData.expected_total_response_probability * 100).toFixed(1)}% Expected
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Optimal Stop Point</p>
                  <p className="text-3xl font-bold text-green-500 mt-1">
                    Step {optimalStep}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chartData[optimalStep - 1]?.channel || 'N/A'}
                  </p>
                </div>
                <Target className="h-10 w-10 text-green-500 opacity-50" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Score</p>
                  <p className="text-3xl font-bold mt-1">
                    {(curveData.roi_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-green-500 mt-1">Efficiency ratio</p>
                </div>
                <Zap className="h-10 w-10 text-yellow-500 opacity-50" />
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Steps Saved</p>
                  <p className="text-3xl font-bold mt-1">
                    {curveData.metrics.steps_saved || 0}
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    of {curveData.metrics.total_steps} total
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Score</p>
                  <p className="text-3xl font-bold mt-1">
                    {(curveData.metrics.efficiency_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Prob per step</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Growth Curve Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Response Probability Curve
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dynamic probability prediction across outreach sequence
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProbability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="step"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'probability') return [`${value}%`, 'Step Probability']
                    if (name === 'cumulative') return [`${value}%`, 'Cumulative Probability']
                    return [value, name]
                  }}
                  labelFormatter={(label) => {
                    const item = chartData.find((d) => d.step === label)
                    return item ? `${label} - ${item.channel}` : label
                  }}
                />
                <Legend />
                <ReferenceLine
                  x={`Step ${optimalStep}`}
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: 'Optimal Stop',
                    fill: '#22c55e',
                    fontSize: 12,
                    position: 'top',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorProbability)"
                  name="Step Probability"
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorCumulative)"
                  name="Cumulative Probability"
                />
                {chartData.map(
                  (entry, index) =>
                    entry.isOptimal && (
                      <ReferenceDot
                        key={index}
                        x={entry.step}
                        y={entry.probability}
                        r={8}
                        fill="#22c55e"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )
                )}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Marginal Gains Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Marginal Gain Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Probability gained by moving to next step
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marginalGainsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="step"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  label={{ value: 'Marginal Gain (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Marginal Gain']}
                />
                <Legend />
                <ReferenceLine
                  y={curveData.stopping_threshold * 100}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Threshold (${(curveData.stopping_threshold * 100).toFixed(1)}%)`,
                    fill: '#ef4444',
                    fontSize: 12,
                    position: 'right',
                  }}
                />
                <Bar
                  dataKey="gain"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  name="Marginal Gain"
                >
                  {marginalGainsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isBelowThreshold ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Insight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Optimization Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Optimal Stopping Point: Step {optimalStep}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {curveData.stopping_reason}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 mt-4">
                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Expected Total Probability</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {(curveData.expected_total_response_probability * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Wasted Effort if Continuing</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">
                    {(curveData.metrics.wasted_effort_ratio * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Diminishing Returns Rate</p>
                  <p className="text-2xl font-bold text-yellow-500 mt-1">
                    {(curveData.metrics.diminishing_returns_rate * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Stopping Threshold</p>
                  <p className="text-2xl font-bold mt-1">
                    {(curveData.stopping_threshold * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Step-by-Step Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed probability analysis for each outreach step
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {curveData.steps.map((step) => (
                <div
                  key={step.step}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all ${
                    step.step === optimalStep
                      ? 'border-green-500 bg-green-500/10'
                      : 'bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        step.step === optimalStep
                          ? 'bg-green-500 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {step.step}
                    </div>
                    <div>
                      <p className="font-medium">{step.channel}</p>
                      <p className="text-xs text-muted-foreground">
                        Channel effectiveness: {(step.channel_effectiveness * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Step Probability</p>
                      <p className="text-xl font-bold text-primary">
                        {(step.probability * 100).toFixed(2)}%
                      </p>
                    </div>

                    {step.step === optimalStep && (
                      <Badge className="bg-green-500 text-white">Optimal Stop</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
