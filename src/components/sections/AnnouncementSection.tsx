'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, ArrowRight, MapPin, X, Megaphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Announcement, TimelineEvent } from '@/lib/types'
import { formatShortDate, formatEventDate } from '@/lib/date-utils'

interface SidebarEvent {
  title: string
  date: string
  location: string
}

/* ─── Announcement Section ─── */
interface AnnouncementSectionProps {
  initialAnnouncements?: Announcement[]
  initialEvents?: TimelineEvent[]
}

export function AnnouncementSection({ initialAnnouncements, initialEvents }: AnnouncementSectionProps = {}) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements ?? [])
  const [sidebarEvents, setSidebarEvents] = useState<SidebarEvent[]>(() =>
    (initialEvents ?? []).slice(0, 3).map((e) => ({ title: e.title, date: e.date, location: e.location }))
  )
  const [loading, setLoading] = useState(!(initialAnnouncements && initialEvents))
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    if (initialAnnouncements) return
    let cancelled = false
    fetch('/api/announcements')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled) {
          setAnnouncements(data.announcements || [])
        }
      })
      .catch(() => {
        if (!cancelled) setAnnouncements([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Fetch events for the News & Events sidebar
  useEffect(() => {
    if (initialEvents) return
    let cancelled = false
    fetch('/api/events')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled) {
          const events = data.events || []
          setSidebarEvents(events.slice(0, 3).map((e: TimelineEvent) => ({
            title: e.title,
            date: e.date,
            location: e.location,
          })))
        }
      })
      .catch(() => {
        if (!cancelled) setSidebarEvents([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-900 border-t-2 border-t-upisha-teal/10 section-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Announcements */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-upisha-gold rounded-full" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Announcements</h2>
            </div>
            <div className="space-y-3">
              {loading && announcements.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 border-4 border-upisha-teal border-t-transparent rounded-full animate-spin" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
                  <Megaphone className="h-4 w-4" />
                  No announcements at this time.
                </div>
              ) : announcements.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedAnnouncement(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedAnnouncement(item)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View announcement: ${item.title}`}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-upisha-teal/50"
                >
                  <div className="shrink-0 w-16 text-center">
                    <div className="bg-upisha-teal-light dark:bg-upisha-teal/20 rounded-lg p-2">
                      <Calendar className="h-5 w-5 text-upisha-teal mx-auto" />
                      <div className="text-xs text-upisha-teal font-medium mt-1">
                        {formatShortDate(item.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-upisha-teal transition-colors text-sm md:text-base">
                      {item.title}
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs border-upisha-teal/30 text-upisha-teal"
                  >
                    {item.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <Link href="/announcements">
              <Button
                variant="outline"
                className="mt-4 border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
              >
                View All Announcements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* News & Events Sidebar */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-upisha-teal rounded-full" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-upisha-navy dark:text-white">News & Events</h2>
            </div>
            <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top">
              <CardContent className="p-5 space-y-4">
                {sidebarEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events at this time.</p>
                ) : (
                  sidebarEvents.map((event, i) => (
                    <div key={i}>
                      {i > 0 && <Separator className="dark:bg-gray-700 mb-4" />}
                      <div className="space-y-1">
                        <h4 className="font-semibold text-upisha-navy dark:text-white">{event.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {formatEventDate(event.date)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {event.location}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/events" className="block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
                  >
                    View All Events
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Announcement Detail Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Announcement details</DialogTitle>
          </DialogHeader>
          {selectedAnnouncement && (
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Badge variant="outline" className="text-xs mb-2 border-upisha-teal/30 text-upisha-teal">
                    {selectedAnnouncement.type}
                  </Badge>
                  <h3 className="text-xl font-bold text-upisha-navy dark:text-white">
                    {selectedAnnouncement.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
                  aria-label="Close announcement details"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-upisha-teal" />
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                <Calendar className="h-5 w-5 text-upisha-teal shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {formatEventDate(selectedAnnouncement.date)}
                  </p>
                </div>
              </div>

              {selectedAnnouncement.content && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Link href="/announcements" className="flex-1">
                  <Button className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                    View All Announcements
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}