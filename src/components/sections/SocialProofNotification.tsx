'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Calendar, UserPlus, Sparkles } from 'lucide-react'

/* ─── Social Proof Notification ─── */
export function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ icon: string; text: string; emoji: string }>>([])

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/social-proof')

        if (!response.ok) {
          throw new Error('Failed to fetch social proof data')
        }

        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error('Failed to load social proof data:', error)
        // Fallback notifications on error
        setNotifications([
          { icon: 'users', text: 'Join our growing community', emoji: '🎉' },
          { icon: 'calendar', text: 'Check out our upcoming events', emoji: '📅' },
        ])
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (dismissed || notifications.length === 0) return

    const showInterval = setInterval(() => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 5000)
      setCurrentIndex((prev) => (prev + 1) % notifications.length)
    }, 18000)

    const initialTimeout = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 5000)
    }, 6000)

    return () => {
      clearInterval(showInterval)
      clearTimeout(initialTimeout)
    }
  }, [dismissed, notifications])

  if (dismissed) return null

  const msg = notifications[currentIndex] || { icon: 'users', text: '', emoji: '' }

  // Map icon strings to Lucide components
  const iconMap: Record<string, any> = {
    users: Users,
    calendar: Calendar,
    'user-plus': UserPlus,
    sparkles: Sparkles,
  }

  const IconComponent = iconMap[msg.icon] || Users

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 left-4 z-40 hidden md:block max-w-[300px]"
        >
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-upisha-teal/15 to-upisha-gold/15 flex items-center justify-center shrink-0">
              <IconComponent className="h-4 w-4 text-upisha-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-upisha-navy dark:text-white leading-relaxed">
                <span className="mr-1">{msg.emoji}</span>
                {msg.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Just now</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}