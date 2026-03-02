import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CurrentStatisticalSection from './CurrentStatisticalSection.tsx'
import PredictionIntelligenceSection from './PredictionIntelligenceSection'
import { BarChart3, TrendingUp } from 'lucide-react'

interface OutreachTabsProps {
  selectedBuyerId: string
  buyerOutreachData: any
  isOutreachLoading: boolean
  dynamicWorkflow: any
  buyerLabel: string
}

export default function OutreachTabs({
  selectedBuyerId,
  buyerOutreachData,
  isOutreachLoading,
  dynamicWorkflow,
  buyerLabel,
}: OutreachTabsProps) {
  const [activeTab, setActiveTab] = useState('statistical')

  return (
    <Tabs
      defaultValue="statistical"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 max-w-md gap-2 bg-muted/30 rounded-lg p-1 mb-6">
        <TabsTrigger
          value="statistical"
          className="flex items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground hover:text-foreground"
        >
          <BarChart3 className="h-4 w-4" />
          <span>Statistical Data</span>
        </TabsTrigger>

        <TabsTrigger
          value="prediction"
          className="flex items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:font-semibold data-[state=inactive]:text-muted-foreground hover:text-foreground"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Prediction</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="statistical" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <CurrentStatisticalSection
          buyerOutreachData={buyerOutreachData}
          isOutreachLoading={isOutreachLoading}
          dynamicWorkflow={dynamicWorkflow}
          buyerLabel={buyerLabel}
        />
      </TabsContent>

      <TabsContent value="prediction" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <PredictionIntelligenceSection companyId={selectedBuyerId} />
      </TabsContent>
    </Tabs>
  )
}
