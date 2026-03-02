import { motion } from 'framer-motion'
import { Building2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SearchResult } from '@/types'

interface SearchResultItemProps {
  result: SearchResult
  isSelected: boolean
  onClick: () => void
}

export default function SearchResultItem({ result, isSelected, onClick }: SearchResultItemProps) {
  const getIntentColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        group flex items-center gap-4 p-4 cursor-pointer transition-all duration-200
        ${isSelected ? 'bg-primary/20' : 'hover:bg-accent/50'}
        border-l-4 ${isSelected ? 'border-primary' : 'border-transparent'}
      `}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Building2 className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm truncate">{result.name}</h4>
          <Badge className={`${getIntentColor(result.intent_score)} text-white text-xs border-0`}>
            {result.intent_score}%
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{result.industry}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{result.location}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
