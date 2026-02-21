import { Menu, Bell, HelpCircle, Sun, Moon } from 'lucide-react'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { useUIStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import GlobalCompanySearch from '@/components/search/GlobalCompanySearch'

export default function Navbar() {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const logoSrc = theme === 'dark' ? '/polydeal_logo_dark.png' : '/polydeal_logo_light.png'

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
          <img
            src={logoSrc}
            alt="PolyDeal Logo"
            className="h-8 w-8 object-contain"
          />
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  )
}
