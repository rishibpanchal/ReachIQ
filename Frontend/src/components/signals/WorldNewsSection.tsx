import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe, Globe2, ExternalLink, Building2, Cpu, BarChart3, FlaskConical, Heart, Film, Newspaper } from 'lucide-react'
import { useWorldNews } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import type { WorldNewsArticle } from '@/services/api'

type NewsCategory =
  | 'all'
  | 'general'
  | 'business'
  | 'technology'
  | 'industry'
  | 'world'
  | 'science'
  | 'health'
  | 'entertainment'

const categoryConfig: Record<
  Exclude<NewsCategory, 'all'>,
  { icon: typeof Building2; label: string; class: string }
> = {
  business: { icon: Building2, label: 'Business', class: 'bg-blue-500/10 text-blue-500 border-blue-500/50' },
  technology: { icon: Cpu, label: 'Technology', class: 'bg-purple-500/10 text-purple-500 border-purple-500/50' },
  industry: { icon: BarChart3, label: 'Industry', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' },
  world: { icon: Globe2, label: 'World', class: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/50' },
  science: { icon: FlaskConical, label: 'Science', class: 'bg-amber-500/10 text-amber-500 border-amber-500/50' },
  health: { icon: Heart, label: 'Health', class: 'bg-rose-500/10 text-rose-500 border-rose-500/50' },
  entertainment: { icon: Film, label: 'Entertainment', class: 'bg-pink-500/10 text-pink-500 border-pink-500/50' },
  general: { icon: Newspaper, label: 'General', class: 'bg-slate-500/10 text-slate-500 border-slate-500/50' },
}

const DOMAIN_OPTIONS: { value: NewsCategory; label: string }[] = [
  { value: 'all', label: 'All Domains' },
  { value: 'general', label: 'General' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'industry', label: 'Industry' },
  { value: 'world', label: 'World' },
  { value: 'science', label: 'Science' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
]

function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  } catch {
    return ''
  }
}

export default function WorldNewsSection() {
  const [selectedDomain, setSelectedDomain] = useState<NewsCategory>('all')
  const { data, isLoading, error } = useWorldNews()

  const filteredArticles = useMemo(() => {
    if (!data?.articles) return []
    if (selectedDomain === 'all') return data.articles
    return data.articles.filter((a) => a.category === selectedDomain)
  }, [data?.articles, selectedDomain])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">World News & Market Intelligence</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3 text-muted-foreground">Loading recent headlines...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data?.articles?.length) {
    const errorMsg = error
      ? 'Unable to reach backend. Ensure it is running (npm run dev starts both).'
      : (data as { error?: string })?.error ||
        'No headlines available. Add GNEWS_API_KEY to Frontend/.env and restart the backend.'
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">World News & Market Intelligence</h2>
          </div>
          <p className="text-muted-foreground py-8 text-center">{errorMsg}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">World News & Market Intelligence</h2>
              <p className="text-sm text-muted-foreground">
                Recent activities and trends relevant to Polydeal decision-making
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground">Domain:</span>
            <Select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value as NewsCategory)}
              className="w-[180px] bg-muted/50"
            >
              {DOMAIN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article: WorldNewsArticle, index: number) => {
            const config =
              categoryConfig[article.category as keyof typeof categoryConfig] || categoryConfig.industry
            const Icon = config.icon

            return (
              <motion.a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="block"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 group">
                  <CardContent className="p-4">
                    {article.image && (
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-3">
                        <img
                          src={article.image}
                          alt=""
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="outline" className={config.class}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground truncate">{article.source}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            )
          })}
        </div>
        {filteredArticles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No headlines in this domain. Try another category.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
