import { motion } from 'framer-motion'
import { ExternalLink, TrendingUp, Minus, TrendingDown } from 'lucide-react'
import type { NewsItem } from '@/types'

interface NewsFeedProps {
  news: NewsItem[]
}

export default function NewsFeed({ news }: NewsFeedProps) {
  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'neutral':
        return <Minus className="h-4 w-4 text-yellow-500" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500'
      case 'neutral':
        return 'bg-yellow-500'
      case 'negative':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur border border-white/10 shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">News & Research Feed</h3>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
        {news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <ExternalLink className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No news found</p>
          </div>
        ) : (
          news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-lg bg-background/50 p-4 hover:bg-accent/50 transition-all duration-200 border border-border/50 hover:border-primary/30"
            >
              {/* Sentiment Indicator */}
              <div className="absolute top-4 left-0 w-1 h-16 rounded-r-full bg-gradient-to-b from-transparent via-current to-transparent opacity-80"
                   style={{ color: getSentimentColor(item.sentiment).replace('bg-', '#') }}>
              </div>
              
              <div className="pl-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSentimentIcon(item.sentiment)}
                      <span className="text-xs text-muted-foreground">{item.source}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                      {item.headline}
                    </h4>
                    
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Read more
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
