import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
  delay?: number
}

export default function StatCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={cn('rounded-lg p-2', color || 'bg-primary/10')}>
            <Icon className={cn('h-4 w-4', color ? '' : 'text-primary')} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <p className={cn('text-xs', trend.isPositive ? 'text-green-500' : 'text-red-500')}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
