import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, ArrowLeft, Mail, Linkedin, Zap } from 'lucide-react'
import { mockConversations } from '@/services/mockData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import ChatWindow from '@/components/chat/ChatWindow'
import CompanyAnalyticsPanel from '@/components/analytics/CompanyAnalyticsPanel'

export default function TeslaConversations() {
  const navigate = useNavigate()
  const selectedConversationId = 'c1'

  // Get Tesla conversation
  const teslaConversation = mockConversations.find((c) => c.company_id === '1')
  const selectedConversation = mockConversations.find((c) => c.id === selectedConversationId)

  if (!teslaConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No conversation found for Tesla</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/conversations')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Conversations
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              Tesla Conversation
            </h1>
            <p className="text-muted-foreground mt-2">Manage your outreach with Tesla's AI and autopilot team</p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-600" />
              Recommended: LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Technical, data-driven approach (Tue-Wed, 9-11 AM PST)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Secondary: Email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Highlight autonomous systems and ML infrastructure benefits
            </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Intent Level
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Very High (92/100) - Actively hiring AI engineers
          </CardContent>
        </Card>
      </div>

      {/* Chat Layout */}
      <div className="grid grid-cols-[1fr_400px] gap-6 min-h-[600px]">
        {/* Center: Chat Conversation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border border-border rounded-lg bg-background/50 backdrop-blur overflow-hidden"
        >
          <ChatWindow
            conversationId={selectedConversationId}
            companyName={selectedConversation?.company_name || 'Tesla'}
          />
        </motion.div>

        {/* Right: Company Analytics Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border border-border rounded-lg bg-background/50 backdrop-blur overflow-hidden"
        >
          <CompanyAnalyticsPanel companyId="1" />
        </motion.div>
      </div>

      {/* Conversation Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conversation Details</span>
              {teslaConversation.unread_count > 0 && (
                <Badge className="bg-primary text-white">
                  {teslaConversation.unread_count} Unread
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <p className="text-muted-foreground">{teslaConversation.company_name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Last Message</h3>
              <p className="text-muted-foreground">{teslaConversation.last_message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDateTime(teslaConversation.last_message_time)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Total Messages</h3>
              <p className="text-muted-foreground">{teslaConversation.messages.length} messages</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
