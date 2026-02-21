import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, Send, RefreshCw } from 'lucide-react'
import { useCompany, useGenerateContent } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function ContentGenerator() {
  const [selectedCompany, setSelectedCompany] = useState('1')
  const [generatedContent, setGeneratedContent] = useState<{
    linkedin?: string
    email?: string
    whatsapp?: string
  }>({})

  const { data: company } = useCompany(selectedCompany)
  const generateMutation = useGenerateContent()

  const handleGenerate = async (type: 'linkedin' | 'email' | 'whatsapp') => {
    const result = await generateMutation.mutateAsync({ companyId: selectedCompany, type })
    setGeneratedContent((prev) => ({ ...prev, [type]: result.content }))
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
          Content Generator
        </h1>
        <p className="text-muted-foreground">
          Generate AI-powered outreach content tailored to each company
        </p>
      </div>

      {/* Company Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="flex-1"
              >
                <option value="1">Tesla Inc.</option>
                <option value="2">Microsoft</option>
                <option value="3">Stripe</option>
                <option value="4">Airbnb</option>
                <option value="5">Uber</option>
              </Select>
              {company && (
                <div className="flex items-center gap-2">
                  <Badge>Intent Score: {company.intent_score}</Badge>
                  <Badge variant="outline">{company.industry}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
      {(generatedContent.linkedin || company?.content?.linkedin_message) && (
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
                      copyToClipboard(generatedContent.linkedin || company?.content?.linkedin_message || '')
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
                {generatedContent.linkedin || company?.content?.linkedin_message}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Content - Email */}
      {(generatedContent.email || company?.content?.email_message) && (
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
                      copyToClipboard(generatedContent.email || company?.content?.email_message || '')
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
                {generatedContent.email || company?.content?.email_message}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Content - WhatsApp */}
      {(generatedContent.whatsapp || company?.content?.whatsapp_message) && (
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
                      copyToClipboard(generatedContent.whatsapp || company?.content?.whatsapp_message || '')
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
                {generatedContent.whatsapp || company?.content?.whatsapp_message}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
