import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Workflow,
  Sparkles,
  Radio,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  Calendar,
} from 'lucide-react'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Outreach Strategy', href: '/workflow', icon: Workflow },
  { name: 'Content Generator', href: '/content-generator', icon: Sparkles },
  { name: 'Signal Monitor', href: '/signals', icon: Radio },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar, theme } = useUIStore()
  const { user } = useUser()

  const logoSrc = theme === 'dark' ? '/polydeal_logo_dark.png' : '/polydeal_logo_light.png'

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card overflow-hidden',
          !sidebarOpen && 'w-0'
        )}
      >
        <div className="flex h-full w-64 flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="PolyDeal Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-lg font-semibold">PolyDeal</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-1 hover:bg-accent lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-hide">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4">
            <SignedIn>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName ?? 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <span>{user?.firstName?.[0] ?? 'U'}</span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{user?.fullName ?? 'Signed in user'}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.emailAddresses?.[0]?.emailAddress ?? ''}
                  </p>
                </div>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-muted-foreground">
                Sign in to view your profile
              </div>
            </SignedOut>
          </div>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
