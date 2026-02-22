import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { useBuyers, useBuyerOutreachData } from '@/hooks/useApi'
import { Select } from '@/components/ui/select'
import OutreachTabs from '@/components/outreach/OutreachTabs'

export default function Workflow() {
  const [selectedBuyerId, setSelectedBuyerId] = useState('BUY_57096')

  const { data: buyers } = useBuyers()
  const { data: buyerOutreachData, isLoading: isOutreachLoading } = useBuyerOutreachData(selectedBuyerId)

  const dynamicWorkflow = useMemo(() => {
    if (!buyerOutreachData) return { rawNodes: [] }

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

    return { rawNodes }
  }, [buyerOutreachData])

  const buyerLabel = buyers?.find((buyer) => buyer.id === selectedBuyerId)?.name ?? selectedBuyerId


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
          <p className="text-muted-foreground">Advanced outreach intelligence and prediction analytics</p>
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

      {/* Tab-based Section Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <OutreachTabs
          selectedBuyerId={selectedBuyerId}
          buyerOutreachData={buyerOutreachData}
          isOutreachLoading={isOutreachLoading}
          dynamicWorkflow={dynamicWorkflow}
          buyerLabel={buyerLabel}
        />
      </motion.div>
    </div>
  )
}
