'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Loader2, MapPin } from 'lucide-react'

interface EventItem {
  id: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
}

export default function MemberEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
        if (!res.ok) throw new Error('Failed to fetch events')
        const data = await res.json()
        setEvents((data.events as EventItem[]).filter((e) => e.isActive !== false))
      } catch {
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Events</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {events.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            No upcoming events at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-upisha-navy dark:text-white">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-upisha-teal" />
                  {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-upisha-teal" />
                  {event.location}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{event.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}