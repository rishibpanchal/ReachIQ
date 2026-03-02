import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, Send, RefreshCw, User, Zap } from 'lucide-react'
import { useBuyers, useBuyerOutreachData, useGenerateContent } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ContentGenerator() {
  const [selectedBuyerId, setSelectedBuyerId] = useState('BUY_57096')
  const [generatedContent, setGeneratedContent] = useState<{
    linkedin?: string
    email?: string
    whatsapp?: string
  }>({})

  const { data: buyers } = useBuyers()
  const { data: buyerData, isLoading: isBuyerLoading } = useBuyerOutreachData(selectedBuyerId)
  const generateMutation = useGenerateContent()

  const handleGenerate = async (type: 'linkedin' | 'email' | 'whatsapp') => {
    const result = await generateMutation.mutateAsync({ buyerId: selectedBuyerId, type })
    const { content } = result as { content: string }
    setGeneratedContent((prev) => ({ ...prev, [type]: content }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Content Architect
        </h1>
        <p className="text-muted-foreground">
          Generate hyper-personalized outreach using Claude 3.5 Sonnet & Buyer Intent
        </p>
      </div>

      {/* Buyer Selection & Intent Context */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4" />
                Select Target Buyer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-muted/50 border rounded-lg px-4 py-2 shadow-inner">
                  <User className="h-5 w-5 text-primary" />
                  <select
                    value={selectedBuyerId}
                    onChange={(e) => setSelectedBuyerId(e.target.value)}
                    className="bg-transparent text-lg font-bold focus:outline-none w-full cursor-pointer"
                  >
                    <option disabled>Select Buyer</option>
                    {buyers?.map(buyer => (
                      <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                    ))}
                  </select>
                </div>
                {buyerData && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                      {buyerData.channels[0]?.name} Priority
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
                <Zap className="h-4 w-4" />
                Detected Intent Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isBuyerLoading ? (
                <div className="flex h-12 items-center justify-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary/50" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Recently Active</Badge>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">High Engagement</Badge>
                  <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">Intent Score: 92</Badge>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground italic">
                Content will be personalized using these real-time professional triggers.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Generate Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Generate Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                onClick={() => handleGenerate('linkedin')}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate LinkedIn Message
              </Button>
              <Button
                onClick={() => handleGenerate('email')}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Email
              </Button>
              <Button
                onClick={() => handleGenerate('whatsapp')}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate WhatsApp Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Content - LinkedIn */}
      {generatedContent.linkedin && (
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
                    onClick={() => handleGenerate('linkedin')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedContent.linkedin || '')
                    }
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
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">
                {generatedContent.linkedin}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Content - Email */}
      {generatedContent.email && (
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
                    onClick={() => handleGenerate('email')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedContent.email || '')
                    }
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
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">
                {generatedContent.email}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Content - WhatsApp */}
      {generatedContent.whatsapp && (
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
                    onClick={() => handleGenerate('whatsapp')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedContent.whatsapp || '')
                    }
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
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted p-4 rounded-lg">
                {generatedContent.whatsapp}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
