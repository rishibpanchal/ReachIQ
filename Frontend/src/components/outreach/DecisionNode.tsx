import { Handle, NodeProps, Position } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { DecisionTreeNodeData } from './workflowLayout'

const statusStyles: Record<DecisionTreeNodeData['status'], string> = {
  completed: 'border-green-500/70 text-slate-100',
  current: 'border-blue-500 bg-blue-500/10 text-slate-100',
  pending: 'border-white/10 text-slate-200/80',
}

const statusDot: Record<DecisionTreeNodeData['status'], string> = {
  completed: 'bg-green-500',
  current: 'bg-blue-500',
  pending: 'bg-slate-400',
}

// @ts-ignore - NodeProps type compatibility
export default function DecisionNode({ data }: NodeProps) {
  const nodeData = data as DecisionTreeNodeData
  return (
    <div
      className={cn(
        'min-w-[220px] max-w-[240px] rounded-xl border bg-white/5 px-4 py-3 shadow-md transition',
        statusStyles[nodeData.status],
        nodeData.isHovered && 'ring-2 ring-blue-400/60',
        nodeData.isSelected && 'ring-2 ring-blue-500/90'
      )}
    >
      <Handle type="target" position={Position.Top} className="h-2 w-2 border-none bg-slate-300" />
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
        <span className="rounded-full border border-white/10 px-2 py-0.5">Step {nodeData.stepNumber}</span>
        <span className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', statusDot[nodeData.status])} />
          {nodeData.status}
        </span>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-50">{nodeData.label}</div>
      <div className="mt-1 text-xs text-slate-300/80">{nodeData.channel}</div>
      <div className="mt-3 text-xs font-medium text-slate-200">
        Probability: {Math.round(nodeData.probability)}%
      </div>
      <Handle type="source" position={Position.Bottom} className="h-2 w-2 border-none bg-slate-300" />
    </div>
  )
}
