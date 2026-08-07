'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Timer, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CountdownEvent {
  id?: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
  countdownEnabled?: boolean
  countdownDate?: string | null
  badgeLabel?: string | null
  registrationLink?: string | null
  registrationLabel?: string | null
}

const DEFAULT_COUNTDOWN = {
  title: 'UP ISHACON 2026',
  subtitle: 'October 18-20, 2026 • Lucknow, Uttar Pradesh',
  badgeLabel: 'Save the Date',
  countdownDate: '2026-10-18T09:00:00+05:30',
  registrationLink: '#join',
  registrationLabel: 'Register Now',
}

function formatSubtitle(event: CountdownEvent): string {
  if (event.date && event.location) {
    return `${event.date} • ${event.location}`
  }
  if (event.date) return event.date
  if (event.location) return event.location
  return ''
}

export function CountdownTimer() {
  const [countdownEvent, setCountdownEvent] = useState<CountdownEvent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          const events: CountdownEvent[] = data.events || []
          const active = events.find(
            (e) => e.isActive !== false && e.countdownEnabled && e.countdownDate
          )
          if (!cancelled && active) {
            setCountdownEvent(active)
          }
        }
      } catch {
        // Fall back to default below
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const config = countdownEvent
    ? {
        title: countdownEvent.title,
        subtitle: formatSubtitle(countdownEvent),
        badgeLabel: countdownEvent.badgeLabel || DEFAULT_COUNTDOWN.badgeLabel,
        countdownDate: countdownEvent.countdownDate || DEFAULT_COUNTDOWN.countdownDate,
        registrationLink: countdownEvent.registrationLink || DEFAULT_COUNTDOWN.registrationLink,
        registrationLabel: countdownEvent.registrationLabel || DEFAULT_COUNTDOWN.registrationLabel,
      }
    : DEFAULT_COUNTDOWN

  const targetDate = new Date(config.countdownDate).getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, targetDate - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  const handleRegister = () => {
    const link = config.registrationLink
    if (link.startsWith('#')) {
      document.getElementById(link.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-r from-upisha-teal to-upisha-teal-dark dark:from-gray-800 dark:to-gray-900 relative overflow-hidden border-t-2 border-t-upisha-gold/20">
        <div className="max-w-5xl mx-auto px-4 relative flex justify-center py-8">
          <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-upisha-teal to-upisha-teal-dark dark:from-gray-800 dark:to-gray-900 relative overflow-hidden border-t-2 border-t-upisha-gold/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-[10%] w-20 h-20 rounded-full border-2 border-white" />
        <div className="absolute bottom-4 right-[15%] w-32 h-32 rounded-full border border-white" />
        <div className="absolute top-1/2 left-[60%] w-16 h-16 rounded-full bg-white/20" />
      </div>
      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="text-center mb-8">
          <Badge className="bg-white/20 text-white mb-3">
            <Timer className="h-3 w-3 mr-1" />
            {config.badgeLabel}
          </Badge>
          <motion.h2
            key={config.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            {config.title}
          </motion.h2>
          {config.subtitle && (
            <p className="text-white/80 mt-2">{config.subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-5 text-center border border-white/20"
            >
              <div className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm text-white/70 mt-1">{unit.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button
            size="lg"
            className="bg-white text-upisha-teal hover:bg-white/90 font-semibold"
            onClick={handleRegister}
          >
            {config.registrationLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}