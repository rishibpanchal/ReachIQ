import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, ArrowLeft, Linkedin, CreditCard, Zap } from 'lucide-react'
import { mockConversations } from '@/services/mockData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import ChatWindow from '@/components/chat/ChatWindow'
import CompanyAnalyticsPanel from '@/components/analytics/CompanyAnalyticsPanel'

export default function StripeConversations() {
  const navigate = useNavigate()
  const selectedConversationId = 'c3'

  // Get Stripe conversation
  const stripeConversation = mockConversations.find((c) => c.company_id === '3')
  const selectedConversation = mockConversations.find((c) => c.id === selectedConversationId)

  if (!stripeConversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No conversation found for Stripe</p>
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
              Stripe Conversation
            </h1>
            <p className="text-muted-foreground mt-2">Manage your outreach with Stripe's engineering and payments team</p>
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
            Technical content resonates best (Tue-Thu, 10 AM-12 PM PT)
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Secondary: Email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Highlight payment infrastructure and transaction optimization
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-500" />
              Focus Area
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Backend infrastructure and payments scaling (14,000+ employees)
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
            companyName={selectedConversation?.company_name || 'Stripe'}
          />
        </motion.div>

        {/* Right: Company Analytics Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border border-border rounded-lg bg-background/50 backdrop-blur overflow-hidden"
        >
          <CompanyAnalyticsPanel companyId="3" />
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
              {stripeConversation.unread_count > 0 && (
                <Badge className="bg-primary text-white">
                  {stripeConversation.unread_count} Unread
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <p className="text-muted-foreground">{stripeConversation.company_name}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Last Message</h3>
              <p className="text-muted-foreground">{stripeConversation.last_message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDateTime(stripeConversation.last_message_time)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Total Messages</h3>
              <p className="text-muted-foreground">{stripeConversation.messages.length} messages</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
