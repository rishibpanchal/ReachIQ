import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import type { SignalBreakdown } from '@/types'

interface SignalBarChartProps {
  data: SignalBreakdown[]
}

export default function SignalBarChart({ data }: SignalBarChartProps) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur border border-white/10 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-6">Signal Intelligence Breakdown</h3>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
          <YAxis type="category" dataKey="name" width={140} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            cursor={{ fill: 'hsl(var(--accent))' }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
