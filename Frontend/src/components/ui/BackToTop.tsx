import { useEffect, useRef } from 'react'
import { ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BackToTop() {
  const scrollContainerRef = useRef<HTMLElement | Window | null>(null)

  // Scroll to top smoothly
  const scrollToTop = () => {
    if (scrollContainerRef.current instanceof Window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } else {
      const container = scrollContainerRef.current as HTMLElement
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    }
  }

  useEffect(() => {
    // Try to find the scrollable container (main element in Layout)
    const findScrollContainer = () => {
      const mainElement = document.querySelector('main')
      if (mainElement && mainElement.scrollHeight > mainElement.clientHeight) {
        return mainElement
      }
      return window
    }

    scrollContainerRef.current = findScrollContainer()
  }, [])

  return (
    <motion.button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </motion.button>
  )
}
