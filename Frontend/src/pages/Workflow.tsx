import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
import { motion } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import { useWorkflow, useSimulateWorkflow } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'

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
  const { companyId } = useParams<{ companyId?: string }>()
  const [selectedCompany, setSelectedCompany] = useState(companyId || '1')

  const { data: workflow, isLoading } = useWorkflow(selectedCompany)
  const simulateMutation = useSimulateWorkflow()

  const initialNodes: Node[] = workflow?.nodes.map((node) => ({
    id: node.id,
    type: node.type === 'decision' ? 'default' : 'default',
    position: node.position,
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">{node.data.label}</div>
          {node.data.timing && (
            <div className="text-xs text-muted-foreground mt-1">{node.data.timing}</div>
          )}
        </div>
      ),
    },
    style: {
      background: nodeColor(node.status),
      color: 'white',
      border: '2px solid',
      borderColor: nodeColor(node.status),
      borderRadius: '8px',
      padding: '10px',
      minWidth: '150px',
    },
  })) || []

  const initialEdges: Edge[] = workflow?.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: edge.animated || false,
    style: { stroke: '#6b7280', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6b7280',
    },
  })) || []

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const handleSimulate = () => {
    if (workflow) {
      simulateMutation.mutate(workflow.id)
    }
  }

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Visualize and manage outreach workflows</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-64"
          >
            <option value="1">Tesla Inc.</option>
            <option value="2">Microsoft</option>
            <option value="3">Stripe</option>
          </Select>
          <Button onClick={handleSimulate} disabled={simulateMutation.isPending}>
            {simulateMutation.isPending ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Simulate Workflow
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Workflow Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Workflow Status</span>
              <Badge variant={workflow?.status === 'active' ? 'default' : 'outline'}>
                {workflow?.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm">
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
              {workflow?.nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{node.data.label}</div>
                    {node.data.description && (
                      <div className="text-sm text-muted-foreground">{node.data.description}</div>
                    )}
                  </div>
                  {node.data.timing && (
                    <div className="text-sm text-muted-foreground">{node.data.timing}</div>
                  )}
                  <Badge
                    variant={node.status === 'completed' ? 'default' : 'outline'}
                    className={
                      node.status === 'completed'
                        ? 'bg-green-500'
                        : node.status === 'active'
                        ? 'bg-blue-500'
                        : ''
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
    </div>
  )
}
