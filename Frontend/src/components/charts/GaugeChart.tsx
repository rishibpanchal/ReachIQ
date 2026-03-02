import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

interface GaugeChartProps {
  value: number
  maxValue?: number
}

export default function GaugeChart({ value, maxValue = 100 }: GaugeChartProps) {
  const data = [
    { name: 'Score', value: value },
    { name: 'Remaining', value: maxValue - value },
  ]

  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor(value)} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">Intent Score</div>
        </div>
      </div>
    </div>
  )
}
