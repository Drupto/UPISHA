'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, ArrowRight, Share2, MapPinned, Users, Clock, MapPin,
  Trophy, Microscope, Megaphone, PlayCircle, GraduationCap, Bell,
  BookOpen, FileText, Award, Camera, UserPlus, Ear, MessageSquare,
  Heart, Stethoscope, Globe, Shield, Activity, Building, Mailbox,
  PhoneCall, Timer, Sparkles, Search, AlertCircle, Lightbulb, Newspaper,
  TrendingUp, HandHeart, Star, Briefcase, ExternalLink, Download, Eye, Quote,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { eventsTimeline as staticEvents } from '@/lib/static-data'
import { AnimatedSection } from '@/components/sections/AnimatedSection'
import { SectionHeading } from '@/components/sections/SectionHeading'
import { EventCalendar } from '@/components/sections/EventCalendar'
import { isEventLive } from '@/lib/date-utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, Microscope, Megaphone, PlayCircle, GraduationCap, Calendar, Bell,
  Users, BookOpen, FileText, Award, Camera, UserPlus, Ear, MessageSquare,
  Heart, Stethoscope, Globe, Shield, Activity, MapPinned, Building, Mailbox,
  PhoneCall, Timer, Sparkles, Search, AlertCircle, Lightbulb, Newspaper,
  TrendingUp, HandHeart, Star, Briefcase, ExternalLink, Download, Eye, Quote,
}

const resolveIcon = (icon: unknown): React.ComponentType<{ className?: string }> => {
  if (!icon) return Calendar
  if (typeof icon === 'function') return icon as React.ComponentType<{ className?: string }>
  if (typeof icon === 'string') return iconMap[icon] || Calendar
  return Calendar
}

/* ─── Events Timeline Section ─── */
export default function EventsTimelineSection() {
  const [events, setEvents] = useState<typeof staticEvents>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<typeof staticEvents[0] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/events')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled) {
          // Use real data if available, otherwise fall back to static
          setEvents(data.events?.length ? data.events : staticEvents)
        }
      })
      .catch(() => {
        if (!cancelled) setEvents(staticEvents)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])
  const { toast } = useToast()
  const typeColors: Record<string, string> = {
    Conference: 'bg-upisha-gold/20 text-upisha-gold border-upisha-gold/30',
    Workshop: 'bg-upisha-teal/10 text-upisha-teal border-upisha-teal/30',
    Outreach: 'bg-purple-100 text-purple-700 border-purple-200',
    Webinar: 'bg-blue-100 text-blue-700 border-blue-200',
  }


  const handleShareEvent = (event: typeof staticEvents[0]) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title} on ${event.date} at ${event.location}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: 'Link copied!', description: 'Event link has been copied to clipboard.' })
    }
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-white dark:bg-gray-900 relative border-t-2 border-t-upisha-gold/10">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="What's Coming Up"
          badgeIcon={Calendar}
          title="Events & Activities Timeline"
          subtitle="Stay informed about our upcoming conferences, workshops, webinars, and community outreach programs across Uttar Pradesh."
        />

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Timeline - main content */}
          <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-upisha-teal via-upisha-gold to-upisha-teal opacity-30 md:-translate-x-1/2" />

          <div className="space-y-8">
            {loading && events.length === 0 ? (
              <div className="flex justify-center py-16">
                <div className="h-10 w-10 border-4 border-upisha-teal border-t-transparent rounded-full animate-spin" />
              </div>
            ) : events.map((event, i) => {
              const EventIcon = resolveIcon(event.icon)
              return (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`relative flex items-start gap-6 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot marker */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 mt-6">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-upisha-teal shadow-md" />
                </div>

                {/* Content card */}
                <div className={`flex-1 ml-12 md:ml-0 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 group hover:border-upisha-teal/40 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer card-gradient-border" onClick={() => setSelectedEvent(event)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 dark:from-upisha-teal/20 dark:to-upisha-gold/20 flex items-center justify-center group-hover:bg-upisha-teal transition-colors shrink-0">
                            <EventIcon className="h-5 w-5 text-upisha-teal group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${typeColors[event.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                              >
                                {event.type}
                              </Badge>
                              {isEventLive(event.date) && (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[9px] animate-pulse flex items-center gap-1" variant="outline">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-upisha-gold font-semibold flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShareEvent(event) }}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          aria-label="Share event"
                        >
                          <Share2 className="h-4 w-4 text-gray-400 hover:text-upisha-teal" />
                        </button>
                      </div>
                      <h4 className="font-bold text-upisha-navy dark:text-white text-lg mb-2 group-hover:text-upisha-teal transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <MapPinned className="h-3.5 w-3.5 text-upisha-gold" />
                          <span>{event.location}</span>
                        </div>
                        <span className="text-xs text-upisha-teal font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Spacer for alternating layout on desktop */}
                <div className="hidden md:block flex-1" />
              </motion.div>
              )
            })}
          </div>
        </div>

        {/* Calendar Sidebar */}
        <div className="space-y-6">
          <EventCalendar events={events} onEventClick={(event) => setSelectedEvent(event)} />

          {/* Upcoming count */}
          <Card className="border-upisha-gold/20 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-upisha-gold/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-upisha-gold" />
                </div>
                <div>
                  <p className="text-lg font-bold text-upisha-navy dark:text-white">{events.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming Events</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                  {Object.entries(
                    events.reduce<Record<string, number>>((acc, e) => {
                    const eventType = e.type || 'Other'
                    acc[eventType] = (acc[eventType] || 0) + 1
                    return acc
                  }, {})
                ).map(([type, count]) => (
                  <Badge key={type} variant="outline" className={`text-[10px] ${typeColors[type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {type} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/events" className="inline-block">
            <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-sm hover:shadow-md">
              <Calendar className="h-4 w-4 mr-2" />
              View Full Calendar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="sr-only">Event details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 flex items-center justify-center shrink-0">
                  {(() => { const DialogIcon = resolveIcon(selectedEvent.icon); return React.createElement(DialogIcon, { className: 'h-6 w-6 text-upisha-teal' }) })()}
                </div>
                <div>
                  <Badge variant="outline" className={`text-[10px] mb-1.5 ${typeColors[selectedEvent.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {selectedEvent.type}
                  </Badge>
                  <h3 className="text-xl font-bold text-upisha-navy dark:text-white">{selectedEvent.title}</h3>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="h-5 w-5 text-upisha-teal shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedEvent.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="h-5 w-5 text-upisha-teal shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedEvent.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MapPin className="h-5 w-5 text-upisha-teal shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5">
                {selectedEvent.description}
              </p>

              {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                <div className="mb-5 p-4 bg-upisha-teal-light/50 dark:bg-upisha-teal/10 rounded-lg">
                  <p className="text-xs font-semibold text-upisha-teal uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Speakers / Facilitators
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.speakers.map((speaker) => (
                      <Badge key={speaker} variant="outline" className="border-upisha-teal/30 text-upisha-teal text-xs">
                        {speaker}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                  onClick={() => {
                    document.getElementById(selectedEvent.registrationLink.slice(1))?.scrollIntoView({ behavior: 'smooth' })
                    setSelectedEvent(null)
                  }}
                >
                  Register Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
                  onClick={() => handleShareEvent(selectedEvent)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}