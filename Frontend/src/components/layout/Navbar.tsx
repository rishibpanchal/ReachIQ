import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Bell, HelpCircle, Sun, Moon } from 'lucide-react'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn, formatDateTime } from '@/lib/utils'
import GlobalCompanySearch from '@/components/search/GlobalCompanySearch'
import { useSignals } from '@/hooks/useApi'

export default function Navbar() {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const logoSrc = theme === 'dark' ? '/reachiq_logo_dark.png' : '/reachiq_logo_light.png'
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const { data: signalsData, isLoading: signalsLoading } = useSignals({ limit: 5 })

  const recentSignals = useMemo(() => {
    const signals = signalsData?.signals ?? []
    return [...signals]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
  }, [signalsData])

  const totalSignals = signalsData?.total ?? recentSignals.length

  useEffect(() => {
    if (!isNotifOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotifOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isNotifOpen])

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-6 transition-all duration-300",
        sidebarOpen ? 'left-0 lg:left-64' : 'left-0'
      )}
    >
      {/* Mobile menu button + Logo */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {!sidebarOpen && (
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img
              src={logoSrc}
              alt="ReachIQ Logo"
              className="h-8 w-8 object-contain"
            />
          </Link>
        )}
      </div>

      {/* Global Search */}
      <GlobalCompanySearch />

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Slider */}
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground" />
          <Switch 
            checked={theme === 'light'}
            onCheckedChange={() => toggleTheme()}
            aria-label="Toggle theme"
          />
          <Sun className="h-4 w-4 text-yellow-500" />
        </div>

        {/* Help */}
        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Open signal notifications"
            aria-expanded={isNotifOpen}
            className={cn('relative', isNotifOpen && 'bg-accent text-accent-foreground')}
          >
            <Bell className="h-5 w-5" />
            {totalSignals > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                {totalSignals}
              </Badge>
            )}
          </Button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold">Recent signals</span>
                  <Link
                    to="/signals"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => setIsNotifOpen(false)}
                  >
                    Expand signals
                  </Link>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {signalsLoading && (
                    <div className="px-4 py-6 text-sm text-muted-foreground">Loading signals...</div>
                  )}
                  {!signalsLoading && recentSignals.length === 0 && (
                    <div className="px-4 py-6 text-sm text-muted-foreground">No signals yet.</div>
                  )}
                  {!signalsLoading && recentSignals.length > 0 && (
                    <div className="divide-y divide-border">
                      {recentSignals.map((signal) => (
                        <div key={signal.id} className="px-4 py-3 hover:bg-accent/50">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium">{signal.title}</p>
                                <Badge className="capitalize text-[10px]" variant="secondary">
                                  {signal.type}
                                </Badge>
                              </div>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {signal.source ?? 'Signal Monitor'}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatDateTime(signal.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  )
}
