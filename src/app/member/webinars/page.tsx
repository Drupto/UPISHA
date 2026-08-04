'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Monitor, Loader2, Clock, User, Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface WebinarItem {
  id: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  isActive?: boolean
}

export default function MemberWebinarsPage() {
  const [webinars, setWebinars] = useState<WebinarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWebinars() {
      try {
        const res = await fetch('/api/webinars')
        if (!res.ok) throw new Error('Failed to fetch webinars')
        const data = await res.json()
        setWebinars((data.webinars as WebinarItem[]).filter((w) => w.isActive !== false))
      } catch {
        setError('Failed to load webinars')
      } finally {
        setLoading(false)
      }
    }
    fetchWebinars()
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
      <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Webinars</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {webinars.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center text-gray-500">
            <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            No webinars scheduled at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {webinars.map((webinar) => (
            <Card key={webinar.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-upisha-navy dark:text-white">{webinar.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-upisha-teal" />
                  {new Date(webinar.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-upisha-teal" />
                  {webinar.time} ({webinar.duration})
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 text-upisha-teal" />
                  {webinar.speaker}
                </div>
                {webinar.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{webinar.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Link href="/webinars/register">
                    <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                      Register
                    </Button>
                  </Link>
                  {webinar.registrationLink && (
                    <a href={webinar.registrationLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Join
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}