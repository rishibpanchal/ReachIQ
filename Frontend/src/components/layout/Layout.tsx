import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import FloatingMeetingButton from '@/components/meeting/FloatingMeetingButton'
import MeetingModal from '@/components/meeting/MeetingModal'
import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <Navbar />
      
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 pt-16',
          sidebarOpen ? 'lg:pl-64' : 'pl-0'
        )}
      >
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Meeting System */}
      <FloatingMeetingButton />
      <MeetingModal />
    </div>
  )
}
