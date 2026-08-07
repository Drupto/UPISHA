'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Clock, ArrowLeft, Users, AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedSection } from '@/components/sections'
import { formatEventDate } from '@/lib/date-utils'

interface EventItem {
  id: string
  title: string
  date: string
  location: string
  description?: string | null
  type?: string
  time?: string
  speakers?: string[]
  isActive?: boolean
}

const typeColors: Record<string, string> = {
  Conference: 'bg-upisha-gold/20 text-upisha-gold border-upisha-gold/30',
  Workshop: 'bg-upisha-teal/10 text-upisha-teal border-upisha-teal/30',
  Outreach: 'bg-purple-100 text-purple-700 border-purple-200',
  Webinar: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          setEvents((data.events || []).filter((e: EventItem) => e.isActive !== false))
        } else {
          setError('Failed to load events')
        }
      } catch {
        setError('Failed to load events. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Events</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            All Events
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Stay informed about our upcoming conferences, workshops, webinars, and community outreach programs across Uttar Pradesh.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-upisha-navy dark:text-white mb-2">
              No Events Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no events at this time. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full border-upisha-teal/10 dark:bg-gray-800 dark:border-gray-700 hover:border-upisha-teal/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {event.type && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${typeColors[event.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                          >
                            {event.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-upisha-navy dark:text-white text-lg mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-upisha-teal shrink-0" />
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-upisha-teal shrink-0" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-upisha-teal shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    )}
                    {event.speakers && event.speakers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {event.speakers.map((speaker) => (
                          <Badge key={speaker} variant="outline" className="text-[10px] border-upisha-teal/30 text-upisha-teal">
                            <Users className="h-3 w-3 mr-1" />
                            {speaker}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-upisha-teal transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}