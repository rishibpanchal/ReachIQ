import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Network } from 'lucide-react'
import DecisionTreeWorkflow from './DecisionTreeWorkflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CurrentStatisticalSectionProps {
  buyerOutreachData: any
  isOutreachLoading: boolean
  dynamicWorkflow: any
  buyerLabel: string
}

export default function CurrentStatisticalSection({
  buyerOutreachData,
  isOutreachLoading,
  dynamicWorkflow,
  buyerLabel,
}: CurrentStatisticalSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Workflow Status and Top Channels */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Workflow Status</span>
                <Badge variant="default" className="bg-blue-500 border-none px-3">
                  active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span>Failed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                <span>Top Outreach Channels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[120px] w-full">
                {isOutreachLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : buyerOutreachData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buyerOutreachData.channels} layout="vertical" margin={{ left: -20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                      <XAxis type="number" hide domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        className="text-xs font-medium"
                        width={80}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Effectiveness']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {buyerOutreachData.channels.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No data available for this buyer
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Workflow Canvas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="h-[600px]"
      >
        <Card className="h-full">
          <CardContent className="h-full p-4">
            <DecisionTreeWorkflow
              buyerOutreachData={buyerOutreachData}
              isLoading={isOutreachLoading}
              buyerLabel={buyerLabel}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Workflow Steps Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Workflow Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dynamicWorkflow.rawNodes.map((node: any, index: number) => (
                <div
                  key={node.id}
                  className="flex items-center gap-4 rounded-lg border p-3 bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{node.data.label}</div>
                    {node.data.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">{node.data.description}</div>
                    )}
                  </div>
                  {node.data.timing && (
                    <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {node.data.timing}
                    </div>
                  )}
                  <Badge
                    variant={node.status === 'completed' ? 'default' : 'outline'}
                    className={
                      node.status === 'completed'
                        ? 'bg-green-500 border-none px-3'
                        : node.status === 'active'
                          ? 'bg-blue-500 border-none px-3 animate-pulse'
                          : 'px-3'
                    }
                  >
                    {node.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
