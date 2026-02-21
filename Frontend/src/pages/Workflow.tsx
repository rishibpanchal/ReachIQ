import { useState, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
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
import { motion } from 'framer-motion'
import { Network, User } from 'lucide-react'
import { useBuyers, useBuyerOutreachData } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import GrowthCurvePrediction from '@/components/analytics/GrowthCurvePrediction'

const nodeColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10b981'
    case 'active':
      return '#3b82f6'
    case 'failed':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

export default function Workflow() {
  const [selectedBuyerId, setSelectedBuyerId] = useState('BUY_57096')

  const { data: buyers } = useBuyers()
  const { data: buyerOutreachData, isLoading: isOutreachLoading } = useBuyerOutreachData(selectedBuyerId)

  const dynamicWorkflow = useMemo(() => {
    if (!buyerOutreachData) return { nodes: [], edges: [], rawNodes: [] }

    const channels = buyerOutreachData.channels
    const primary = channels[0] || { name: 'Email', value: 0, color: '#6b7280' }
    const secondary = channels[1] || { name: 'LinkedIn', value: 0, color: '#6b7280' }

    const rawNodes = [
      {
        id: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Lead Identified', description: 'Target signals detected in real-time', timing: 'Instant' },
        status: 'completed'
      },
      {
        id: 'primary',
        position: { x: 250, y: 180 },
        data: {
          label: `${primary.name} Outreach`,
          description: `Executing primary high-intent ${primary.name} sequence`,
          timing: 'Day 1'
        },
        status: 'active'
      },
      {
        id: 'secondary',
        position: { x: 250, y: 310 },
        data: {
          label: `${secondary.name} Follow-up`,
          description: `Secondary automated touch-point via ${secondary.name}`,
          timing: 'Day 3'
        },
        status: 'pending'
      },
      {
        id: 'end',
        position: { x: 250, y: 440 },
        data: { label: 'Conversion Goal', description: 'Meeting booked / Intent confirmed', timing: 'Day 7+' },
        status: 'pending'
      }
    ]

    const nodes: Node[] = rawNodes.map((node) => ({
      id: node.id,
      type: 'default',
      position: node.position,
      data: {
        label: (
          <div className="text-center p-1">
            <div className="font-bold text-sm">{node.data.label}</div>
            <div className="text-[10px] opacity-90 mt-1">{node.data.timing}</div>
          </div>
        ),
        fullData: node.data,
        status: node.status
      },
      style: {
        background: nodeColor(node.status),
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px',
        minWidth: '180px',
        boxShadow: node.status === 'active' ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
      },
    }))

    const edges: Edge[] = [
      { id: 'e1-2', source: 'start', target: 'primary', animated: true },
      { id: 'e2-3', source: 'primary', target: 'secondary', animated: true },
      { id: 'e3-4', source: 'secondary', target: 'end', animated: false }
    ].map(edge => ({
      ...edge,
      style: { stroke: '#6b7280', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
    }))

    return { nodes, edges, rawNodes }
  }, [buyerOutreachData])

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Sync ReactFlow state with dynamic generation
  useMemo(() => {
    setNodes(dynamicWorkflow.nodes)
    setEdges(dynamicWorkflow.edges)
  }, [dynamicWorkflow, setNodes, setEdges])


  if (isOutreachLoading && !buyerOutreachData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outreach Strategy</h1>
          <p className="text-muted-foreground">Visualize and manage outreach workflows for selected buyers</p>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <Select
            value={selectedBuyerId}
            onChange={(e) => setSelectedBuyerId(e.target.value)}
          >
            <option disabled>Select Buyer</option>
            {buyers?.map(buyer => (
              <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
            ))}
          </Select>
        </div>
      </div>

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
                        {buyerOutreachData.channels.map((entry, index) => (
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
          <CardContent className="h-full p-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              className="bg-background"
            >
              <Background />
              <Controls />
            </ReactFlow>
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
              {dynamicWorkflow.rawNodes.map((node, index) => (
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

      {/* Growth Curve Prediction - Dynamic per Buyer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6"
      >
        <GrowthCurvePrediction companyId={selectedBuyerId} />
      </motion.div>
    </div>
  )
}
