import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { useConversations } from '@/hooks/useApi'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, cn } from '@/lib/utils'
import ChatWindow from '@/components/chat/ChatWindow'
import CompanyAnalyticsPanel from '@/components/analytics/CompanyAnalyticsPanel'

export default function Conversations() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: conversations, isLoading } = useConversations()

  const selectedConversation = conversations?.find((c) => c.id === selectedConversationId)

  const filteredConversations = conversations?.filter((conv) =>
    conv.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="p-6 border-b border-border bg-background/50 backdrop-blur">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Conversations
        </h1>
        <p className="text-muted-foreground">Manage your outreach conversations with AI-powered analytics</p>
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 grid grid-cols-[320px_1fr_420px] min-h-0">
        {/* LEFT PANEL: Company Chat List */}
        <div className="border-r border-border bg-background/30 backdrop-blur flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredConversations?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              filteredConversations?.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'group relative p-4 border-b border-border/30 cursor-pointer transition-all duration-200',
                    'hover:bg-accent/30',
                    selectedConversationId === conversation.id && 'bg-primary/10 border-l-4 border-l-primary'
                  )}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={cn(
                      'font-semibold truncate transition-colors',
                      selectedConversationId === conversation.id && 'text-primary'
                    )}>
                      {conversation.company_name}
                    </h3>
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-primary text-white text-xs px-2 py-0.5 border-0">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {conversation.last_message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(conversation.last_message_time).split(',')[0]}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANEL: Chat Conversation */}
        <div className="border-r border-border bg-background/20 backdrop-blur">
          <ChatWindow
            conversationId={selectedConversationId}
            companyName={selectedConversation?.company_name || null}
          />
        </div>

        {/* RIGHT PANEL: Company Analytics Panel */}
        <div className="bg-background/30 backdrop-blur overflow-hidden">
          <CompanyAnalyticsPanel
            companyId={selectedConversation?.company_id || null}
          />
        </div>
      </div>
    </div>
  )
}
