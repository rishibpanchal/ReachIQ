import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Building2, Copy, Send } from 'lucide-react'
import { useCompany } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import GaugeChart from '@/components/charts/GaugeChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getIntentBadge, getIntentLabel, formatDateTime } from '@/lib/utils'

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const { data: company, isLoading } = useCompany(id!)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (!company) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/companies')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{company.industry}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{company.location}</span>
              </div>
            </div>
          </div>
          <Badge className={getIntentBadge(company.intent_score)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {getIntentLabel(company.intent_score)} ({company.intent_score})
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" active={activeTab === 'overview'}>
            Intelligence Overview
          </TabsTrigger>
          <TabsTrigger value="signals" active={activeTab === 'signals'}>
            Signals
          </TabsTrigger>
          <TabsTrigger value="strategy" active={activeTab === 'strategy'}>
            AI Strategy
          </TabsTrigger>
          <TabsTrigger value="content" active={activeTab === 'content'}>
            Generated Content
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Intelligence Overview */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Intent Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <GaugeChart value={company.intent_score} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Signal Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={company.strategy?.signal_contributions} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="signal_type" type="category" className="text-xs" width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="contribution_percentage" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Channel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{company.strategy?.recommended_channel}</div>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {company.confidence_score}%
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Timing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold mb-2">{company.strategy?.recommended_timing}</div>
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-1">Recommended Tone:</div>
                    <p className="text-sm text-muted-foreground">{company.strategy?.recommended_tone}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Tab 2: Signals */}
        <TabsContent value="signals">
          <div className="space-y-4">
            {company.signals?.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{signal.title}</CardTitle>
                        <CardDescription>{signal.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{signal.type}</Badge>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{signal.strength}%</div>
                          <div className="text-xs text-muted-foreground">Strength</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Source: {signal.source}</span>
                      <span>{formatDateTime(signal.timestamp)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: AI Strategy */}
        <TabsContent value="strategy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI-Generated Outreach Strategy</CardTitle>
                  <Badge variant="outline">
                    Confidence: {company.strategy?.confidence_score}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Strategy Explanation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {company.strategy?.strategy_explanation}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium mb-1">Recommended Channel</div>
                    <div className="text-lg font-bold text-primary">{company.strategy?.recommended_channel}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium mb-1">Optimal Timing</div>
                    <div className="text-sm">{company.strategy?.recommended_timing}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-sm font-medium mb-1">Tone</div>
                    <div className="text-sm">{company.strategy?.recommended_tone}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tab 4: Generated Content */}
        <TabsContent value="content">
          <div className="space-y-4">
            {/* LinkedIn Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>LinkedIn Message</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(company.content?.linkedin_message || '')}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {company.content?.linkedin_message}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>

            {/* Email Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Email Message</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(company.content?.email_message || '')}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {company.content?.email_message}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>

            {/* WhatsApp Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>WhatsApp Message</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(company.content?.whatsapp_message || '')}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>
                      <Button size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {company.content?.whatsapp_message}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
