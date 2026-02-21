import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { useCompanies } from '@/hooks/useApi'
import { useFilterStore } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getIntentBadge, getIntentLabel } from '@/lib/utils'

export default function Companies() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const { search, industry, intentScore, setSearch, setIndustry, setIntentScore, resetFilters } = useFilterStore()

  const { data, isLoading } = useCompanies({
    page,
    limit: 10,
    search,
    industry,
    intentScore,
  })

  const handleRowClick = (companyId: string) => {
    navigate(`/companies/${companyId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage and analyze your target companies</p>
        </div>
        <Button onClick={resetFilters} variant="outline">
          Clear Filters
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search companies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="FinTech">FinTech</option>
                <option value="Automotive">Automotive</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Travel">Travel</option>
                <option value="Transportation">Transportation</option>
              </Select>

              <Select value={intentScore} onChange={(e) => setIntentScore(e.target.value)}>
                <option value="">All Intent Scores</option>
                <option value="high">High Intent (80+)</option>
                <option value="medium">Medium Intent (60-79)</option>
                <option value="low">Low Intent (&lt;60)</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Companies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {data?.total || 0} Companies Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="mt-4 text-muted-foreground">Loading companies...</p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Intent Score</TableHead>
                      <TableHead>Hiring Signal</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.companies.map((company) => (
                      <TableRow
                        key={company.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleRowClick(company.id)}
                      >
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.industry}</TableCell>
                        <TableCell>{company.location}</TableCell>
                        <TableCell>
                          <Badge className={getIntentBadge(company.intent_score)}>
                            {getIntentLabel(company.intent_score)} ({company.intent_score})
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {company.hiring_signal}
                        </TableCell>
                        <TableCell>{company.engagement_score}%</TableCell>
                        <TableCell>{company.recommended_channel}</TableCell>
                        <TableCell>{company.confidence_score}%</TableCell>
                        <TableCell>
                          <Badge variant="outline">{company.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data?.total || 0)} of {data?.total || 0} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data || page * 10 >= data.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
