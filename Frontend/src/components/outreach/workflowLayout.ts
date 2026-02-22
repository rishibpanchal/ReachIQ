import dagre from 'dagre'
import { Edge, Node, Position } from '@xyflow/react'

export type DecisionTreeStatus = 'completed' | 'current' | 'pending'

export interface DecisionTreeNodeData extends Record<string, unknown> {
  label: string
  channel: string
  probability: number
  status: DecisionTreeStatus
  stepNumber: number
  expectedResponse?: string
  marginalGain?: string
  optimizationInsight?: string
  isHovered?: boolean
  isSelected?: boolean
}

const NODE_WIDTH = 240
const NODE_HEIGHT = 120

export const layoutDecisionTree = (
  nodes: Node<DecisionTreeNodeData>[],
  edges: Edge[]
) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 120, nodesep: 200 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    }
  })

  return { nodes: layoutedNodes, edges }
}
