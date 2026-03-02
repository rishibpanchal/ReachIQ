import { useMemo, useEffect, useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type Edge,
  type Node,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  BackgroundVariant,
} from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import '@xyflow/react/dist/style.css'
import type { BuyerOutreachData } from '@/types'
import DecisionNode from './DecisionNode'
import { layoutDecisionTree, type DecisionTreeNodeData } from './workflowLayout'

interface DecisionTreeWorkflowProps {
  buyerOutreachData?: BuyerOutreachData
  isLoading: boolean
  buyerLabel: string
}

const nodeTypes = { decisionNode: DecisionNode } as NodeTypes

const formatPercent = (value: number) => `${Math.round(value)}%`

const buildDecisionTree = (
  buyerLabel: string,
  buyerOutreachData?: BuyerOutreachData
): { nodes: Node<DecisionTreeNodeData>[]; edges: Edge[] } => {
  if (!buyerOutreachData) {
    return { nodes: [], edges: [] }
  }

  const channels = buyerOutreachData.channels ?? []
  const primary = channels[0] ?? { name: 'Email', value: 0, color: '#94a3b8' }
  const secondary = channels[1] ?? { name: 'LinkedIn', value: Math.max(primary.value * 0.7, 10), color: '#94a3b8' }

  const primaryProbability = Math.max(0, primary.value)
  const secondaryProbability = Math.max(0, secondary.value)
  const noResponseProbability = Math.max(0, 100 - primaryProbability)
  const conversionProbability = Math.min(100, (primaryProbability + secondaryProbability) / 2)

  const nodes: Node<DecisionTreeNodeData>[] = [
    {
      id: 'buyer',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: buyerLabel,
        channel: 'Buyer',
        probability: 100,
        status: 'completed',
        stepNumber: 1,
        expectedResponse: `Intent score ${buyerOutreachData.intent_score}/100`,
        marginalGain: `+${Math.round(primaryProbability * 0.12)}%`,
        optimizationInsight: `LinkedIn engagement ${formatPercent(buyerOutreachData.linkedin_engagement * 100)}.`,
      },
    },
    {
      id: 'primary',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: `${primary.name} Message`,
        channel: primary.name,
        probability: primaryProbability,
        status: 'current',
        stepNumber: 2,
        expectedResponse: `Expected response ${formatPercent(primaryProbability)}.`,
        marginalGain: `+${Math.round(primaryProbability * 0.08)}%`,
        optimizationInsight: `Primary channel matches historical ${buyerOutreachData.previous_channel} success.`,
      },
    },
    {
      id: 'followup',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: `${secondary.name} Follow-up`,
        channel: secondary.name,
        probability: secondaryProbability,
        status: 'pending',
        stepNumber: 3,
        expectedResponse: `Second-touch response ${formatPercent(secondaryProbability)}.`,
        marginalGain: `+${Math.round(secondaryProbability * 0.06)}%`,
        optimizationInsight: buyerOutreachData.groups
          ? `Leverage ${buyerOutreachData.groups} intent signals.`
          : 'Leverage secondary channel for coverage.',
      },
    },
    {
      id: 'conversion',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'Meeting Booked',
        channel: 'Conversion',
        probability: conversionProbability,
        status: 'pending',
        stepNumber: 4,
        expectedResponse: `Positive reply probability ${formatPercent(conversionProbability)}.`,
        marginalGain: `+${Math.round(conversionProbability * 0.05)}%`,
        optimizationInsight: 'Prioritize speed-to-meeting and clear next steps.',
      },
    },
    {
      id: 'no-response',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'No Response',
        channel: 'Decision',
        probability: noResponseProbability,
        status: 'pending',
        stepNumber: 3,
        expectedResponse: 'Silence expected.',
        marginalGain: '-2%',
        optimizationInsight: 'Pause to reduce fatigue and preserve brand trust.',
      },
    },
    {
      id: 'stop',
      type: 'decisionNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'Stop Sequence',
        channel: 'Exit',
        probability: noResponseProbability,
        status: 'pending',
        stepNumber: 4,
        expectedResponse: 'Sequence archived.',
        marginalGain: '0%',
        optimizationInsight: 'Re-enter when new intent signals appear.',
      },
    },
  ]

  const edges: Edge[] = [
    {
      id: 'edge-buyer-primary',
      source: 'buyer',
      target: 'primary',
      label: 'Start',
    },
    {
      id: 'edge-primary-followup',
      source: 'primary',
      target: 'followup',
      label: 'Follow-up',
    },
    {
      id: 'edge-primary-no-response',
      source: 'primary',
      target: 'no-response',
      label: 'No Response',
    },
    {
      id: 'edge-followup-conversion',
      source: 'followup',
      target: 'conversion',
      label: 'Responded',
    },
    {
      id: 'edge-no-response-stop',
      source: 'no-response',
      target: 'stop',
      label: 'Stop',
    },
  ].map((edge) => ({
    ...edge,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.8 },
    labelStyle: { fill: '#cbd5f5', fontSize: 11, fontWeight: 600 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 6,
    labelBgStyle: { fill: 'rgba(15, 23, 42, 0.75)' },
  }))

  return { nodes, edges }
}

export default function DecisionTreeWorkflow({
  buyerOutreachData,
  isLoading,
  buyerLabel,
}: DecisionTreeWorkflowProps) {
  const [selectedNode, setSelectedNode] = useState<DecisionTreeNodeData | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const tree = useMemo(
    () => buildDecisionTree(buyerLabel, buyerOutreachData),
    [buyerLabel, buyerOutreachData]
  )

  const layoutedTree = useMemo(
    () => layoutDecisionTree(tree.nodes, tree.edges),
    [tree.nodes, tree.edges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<DecisionTreeNodeData>>(layoutedTree.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedTree.edges)

  useEffect(() => {
    setNodes(
      layoutedTree.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNodeId,
          isHovered: false,
        },
      }))
    )
    setEdges(layoutedTree.edges)
  }, [layoutedTree.nodes, layoutedTree.edges, selectedNodeId, setNodes, setEdges])

  const handleNodeClick = useCallback(
    (_: unknown, node: Node<DecisionTreeNodeData>) => {
      setSelectedNode(node.data)
      setSelectedNodeId(node.id)
    },
    []
  )

  const handleNodeMouseEnter = useCallback(
    (_: unknown, node: Node<DecisionTreeNodeData>) => {
      setNodes((current) =>
        current.map((item) => ({
          ...item,
          data: { ...item.data, isHovered: item.id === node.id },
        }))
      )
    },
    [setNodes]
  )

  const handleNodeMouseLeave = useCallback(() => {
    setNodes((current) =>
      current.map((item) => ({
        ...item,
        data: { ...item.data, isHovered: false },
      }))
    )
  }, [setNodes])

  if (isLoading && !buyerOutreachData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    )
  }

  if (!buyerOutreachData) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No workflow data available for this buyer
      </div>
    )
  }

  return (
    <div className="grid h-full gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-slate-900/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnDoubleClick={false}
          panOnScroll
          className="bg-transparent"
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="rgba(148, 163, 184, 0.25)"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <AnimatePresence mode="wait">
        <motion.aside
          key={selectedNode?.label ?? 'empty'}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-md"
        >
          <div className="text-xs uppercase tracking-wide text-slate-300">Decision Context</div>
          <div className="mt-2 text-lg font-semibold text-slate-50">
            {selectedNode?.label ?? 'Select a node'}
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Channel</span>
              <span>{selectedNode?.channel ?? '--'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Probability</span>
              <span>{selectedNode ? formatPercent(selectedNode.probability) : '--'}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-slate-400">Expected response</span>
              <span className="text-right">{selectedNode?.expectedResponse ?? '--'}</span>
            </div>
            <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-slate-400">Marginal gain</span>
              <span className="text-right">{selectedNode?.marginalGain ?? '--'}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-400">Optimization insight</span>
              <span className="text-right">{selectedNode?.optimizationInsight ?? '--'}</span>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    </div>
  )
}
