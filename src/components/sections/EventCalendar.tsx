'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Users, BookOpen, FileText, Award, Camera, UserPlus, Ear, MessageSquare,
  Heart, Stethoscope, GraduationCap, Globe, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Send, Clock, Calendar, ArrowRight, CheckCircle2,
  Star, Briefcase, Shield, ExternalLink, Download, Eye, Quote,
  Activity, Microscope, HandHeart, TrendingUp, Building2, Newspaper,
  PlayCircle, Sun, Moon, Bell, Timer, Sparkles, Search, AlertCircle,
  Megaphone, Lightbulb, Trophy, MapPinned, Command, Share2, Printer,
  PhoneCall, Building, Mailbox, Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { eventsTimeline } from '@/lib/static-data'

/* ─── Event Calendar Mini-View ─── */
function parseEventDates(dateStr: string): { year: number; month: number; days: number[] }[] {
  // Parse formats like '18-20 Oct 2026', '25 Mar 2026', '03 Mar 2026'
  const results: { year: number; month: number; days: number[] }[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Try matching "DD-DD Mon YYYY" (range)
  const rangeMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})\s+(\w{3})\s+(\d{4})$/)
  if (rangeMatch) {
    const startDay = parseInt(rangeMatch[1])
    const endDay = parseInt(rangeMatch[2])
    const monthIdx = monthNames.indexOf(rangeMatch[3])
    const year = parseInt(rangeMatch[4])
    if (monthIdx !== -1) {
      const days: number[] = []
      for (let d = startDay; d <= endDay; d++) days.push(d)
      results.push({ year, month: monthIdx, days })
    }
    return results
  }

  // Try matching "DD Mon YYYY"
  const singleMatch = dateStr.match(/^(\d{1,2})\s+(\w{3})\s+(\d{4})$/)
  if (singleMatch) {
    const day = parseInt(singleMatch[1])
    const monthIdx = monthNames.indexOf(singleMatch[2])
    const year = parseInt(singleMatch[3])
    if (monthIdx !== -1) {
      results.push({ year, month: monthIdx, days: [day] })
    }
  }

  return results
}

function EventCalendar({ onEventClick }: { onEventClick: (event: typeof eventsTimeline[0]) => void }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [tooltipEvents, setTooltipEvents] = useState<typeof eventsTimeline>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  // Build event map: key = "YYYY-MM-DD" → events[]
  const eventMap = useMemo(() => {
    const map: Record<string, typeof eventsTimeline> = {}
    eventsTimeline.forEach((event) => {
      const parsed = parseEventDates(event.date)
      parsed.forEach((p) => {
        p.days.forEach((day) => {
          const key = `${p.year}-${String(p.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          if (!map[key]) map[key] = []
          map[key].push(event)
        })
      })
    })
    return map
  }, [])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleDayHover = (day: number, e: React.MouseEvent) => {
    const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const events = eventMap[key]
    if (events && events.length > 0) {
      setHoveredDay(day)
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const calendarRect = (e.target as HTMLElement).closest('.calendar-container')?.getBoundingClientRect()
      if (calendarRect) {
        setTooltipPos({ x: rect.left - calendarRect.left + rect.width / 2, y: rect.top - calendarRect.top })
      }
      setTooltipEvents(events)
    } else {
      setHoveredDay(null)
      setTooltipPos(null)
      setTooltipEvents([])
    }
  }

  const handleDayLeave = () => {
    setHoveredDay(null)
    setTooltipPos(null)
    setTooltipEvents([])
  }

  // Build calendar cells
  const cells: { day: number; isCurrentMonth: boolean; dateKey: string }[] = []
  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const prevM = month === 0 ? 11 : month - 1
    const prevY = month === 0 ? year - 1 : year
    cells.push({ day, isCurrentMonth: false, dateKey: `${prevY}-${String(prevM).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true, dateKey: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  // Next month padding
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1
    const nextY = month === 11 ? year + 1 : year
    cells.push({ day: d, isCurrentMonth: false, dateKey: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
          <h4 className="text-sm font-bold text-upisha-navy dark:text-white">
            {monthNames[month]} {year}
          </h4>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-container relative grid grid-cols-7 gap-1">
          {cells.slice(0, 35).map((cell, i) => {
            const events = eventMap[cell.dateKey]
            const hasEvents = cell.isCurrentMonth && events && events.length > 0
            const todayHighlight = cell.isCurrentMonth && isToday(cell.day)

            return (
              <button
                key={i}
                className={`
                  relative h-8 md:h-9 rounded-md text-xs font-medium flex items-center justify-center transition-all
                  ${!cell.isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : ''}
                  ${todayHighlight ? 'bg-upisha-gold text-white font-bold ring-2 ring-upisha-gold/30' : ''}
                  ${hasEvents && !todayHighlight ? 'bg-upisha-teal/15 text-upisha-teal font-semibold hover:bg-upisha-teal/25' : ''}
                  ${!hasEvents && !todayHighlight && cell.isCurrentMonth ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                `}
                onMouseEnter={hasEvents ? (e) => handleDayHover(cell.day, e) : undefined}
                onMouseLeave={hasEvents ? handleDayLeave : undefined}
                onClick={hasEvents ? () => onEventClick(events[0]) : undefined}
                disabled={!hasEvents && !cell.isCurrentMonth}
                aria-label={hasEvents ? `${events.length} event(s) on ${monthNames[month]} ${cell.day}` : `Day ${cell.day}`}
              >
                {cell.day}
                {hasEvents && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-upisha-teal" />
                )}
              </button>
            )
          })}

          {/* Tooltip */}
          {hoveredDay !== null && tooltipPos && tooltipEvents.length > 0 && (
            <div
              className="absolute z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 p-3 min-w-[200px] max-w-[260px] pointer-events-none"
              style={{ left: Math.min(tooltipPos.x, 200), top: tooltipPos.y - 10, transform: 'translate(-50%, -100%)' }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-600 rotate-45" />
              {tooltipEvents.map((ev, i) => (
                <div key={i} className="text-xs">
                  <p className="font-semibold text-upisha-navy dark:text-white leading-tight">{ev.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">{ev.date} • {ev.location}</p>
                  {i < tooltipEvents.length - 1 && <Separator className="my-1.5" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-upisha-gold" />
            Today
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-upisha-teal/25" />
            Event
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
