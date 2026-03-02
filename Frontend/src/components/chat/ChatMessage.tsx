import { motion } from 'framer-motion'
import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: Message
  index: number
}

export default function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.sender === 'user'
  const isContact = message.sender === 'contact'
  
  const getStatusIcon = () => {
    if (!message.status || !isUser) return null
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={cn(
        'flex flex-col max-w-[70%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Sender Name (for non-user messages) */}
        {!isUser && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {isContact ? 'Contact' : 'AI Assistant'}
          </span>
        )}
        
        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border rounded-bl-sm'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </motion.div>
        
        {/* Timestamp and Status */}
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  )
}
