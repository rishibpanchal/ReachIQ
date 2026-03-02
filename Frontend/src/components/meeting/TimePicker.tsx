import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  placeholder?: string
}

export default function TimePicker({ value, onChange, placeholder = 'Select time' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(parseInt(value?.split(':')[0] || '09'))
  const [minutes, setMinutes] = useState(parseInt(value?.split(':')[1] || '00'))
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse value for display
  const displayTime = value ? `${String(parseInt(value.split(':')[0])).padStart(2, '0')}:${value.split(':')[1]}` : placeholder

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
    setHours(newHours)
    updateTime(newHours, minutes)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
    setMinutes(newMinutes)
    updateTime(hours, newMinutes)
  }

  const updateTime = (h: number, m: number) => {
    const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    onChange(formattedTime)
  }

  const handleHourClick = (hour: number) => {
    setHours(hour)
    updateTime(hour, minutes)
  }

  const handleMinuteClick = (minute: number) => {
    setMinutes(minute)
    updateTime(hours, minute)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-input bg-slate-900/30 cursor-pointer hover:border-emerald-500 transition-colors"
      >
        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className={value ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
          {displayTime}
        </span>
      </div>

      {/* Clock Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="space-y-4 w-80">
              {/* Clock Display */}
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64 rounded-full border-8 border-emerald-500/30 bg-slate-950/50 flex items-center justify-center">
                  {/* Center dot */}
                  <div className="absolute w-3 h-3 bg-emerald-600 rounded-full z-10" />

                  {/* Hour markers and numbers */}
                  {Array.from({ length: 24 }, (_, i) => {
                    const angle = (i * 360) / 24 - 90
                    const isSelected = i === hours
                    const radius = 100
                    const x = Math.cos((angle * Math.PI) / 180) * radius
                    const y = Math.sin((angle * Math.PI) / 180) * radius

                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => handleHourClick(i)}
                        className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white scale-125 shadow-lg'
                            : 'text-foreground hover:bg-slate-800 hover:scale-110'
                        }`}
                        style={{
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          left: '50%',
                          top: '50%',
                        }}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    )
                  })}

                  {/* Hour hand */}
                  <div
                    className="absolute w-1 h-20 bg-emerald-500 origin-bottom rounded-full"
                    style={{
                      transform: `rotate(${(hours * 360) / 24 - 90}deg)`,
                      bottom: '50%',
                    }}
                  />
                </div>
              </div>

              {/* Time Display and Input */}
              <div className="flex items-center justify-center gap-2 bg-slate-800/50 rounded-lg p-3">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={String(hours).padStart(2, '0')}
                  onChange={handleHourChange}
                  className="w-12 bg-slate-900 border border-emerald-500/30 rounded px-2 py-1 text-center font-semibold text-foreground focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xl font-bold text-foreground">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={String(minutes).padStart(2, '0')}
                  onChange={handleMinuteChange}
                  className="w-12 bg-slate-900 border border-emerald-500/30 rounded px-2 py-1 text-center font-semibold text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Minute selector */}
              <div className="grid grid-cols-6 gap-2">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => (
                  <button
                    type="button"
                    key={minute}
                    onClick={() => handleMinuteClick(minute)}
                    className={`py-2 rounded text-xs font-semibold transition-all ${
                      minutes === minute
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-foreground hover:bg-slate-700'
                    }`}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
