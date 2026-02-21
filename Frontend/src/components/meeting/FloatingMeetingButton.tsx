import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useMeetingStore } from '@/store/meetingStore'
import { SignedIn } from '@clerk/clerk-react'

export default function FloatingScheduleButton() {
  const [showTooltip, setShowTooltip] = useState(false)
  const openModal = useMeetingStore((state) => state.openModal)

  return (
    <SignedIn>
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.button
          onClick={openModal}
          className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg flex items-center justify-center text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Schedule meeting"
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        {/* Tooltip */}
        <motion.div
          animate={{ opacity: showTooltip ? 1 : 0, y: showTooltip ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          className={`absolute bottom-full right-0 mb-3 px-3 py-2 rounded-md bg-slate-900 text-white text-sm font-medium shadow-lg whitespace-nowrap pointer-events-none ${
            showTooltip ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Schedule a Meeting
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </motion.div>
      </motion.div>
    </SignedIn>
  )
}

