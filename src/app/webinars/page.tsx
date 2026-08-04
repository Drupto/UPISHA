'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Monitor, ArrowRight, AlertCircle, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedSection } from '@/components/sections'
import type { Webinar } from '@/lib/types'

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/webinars')
        if (res.ok) {
          const data = await res.json()
          setWebinars(data.webinars || [])
        } else {
          setError('Failed to load webinars')
        }
      } catch {
        setError('Failed to load webinars. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchWebinars()
  }, [])

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Webinars</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            Upcoming Webinars
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Stay updated with the latest professional development webinars from UP ISHA.
            Register for free to secure your spot.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-4 border-upisha-teal border-t-transparent rounded-full animate-spin" />
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
        ) : webinars.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-upisha-navy dark:text-white mb-2">
              No Webinars Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no upcoming webinars at this time. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {webinars.map((webinar, index) => (
              <motion.div
                key={webinar.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col border-upisha-teal/10 dark:bg-gray-800 dark:border-gray-700 hover:border-upisha-teal/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg text-upisha-navy dark:text-white">
                        {webinar.title}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 text-xs border-upisha-teal/30 text-upisha-teal">
                        {webinar.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-upisha-teal" />
                      <span>{webinar.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 text-upisha-teal" />
                      <span>{webinar.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4 text-upisha-teal" />
                      <span>{webinar.speaker}</span>
                    </div>
                    {webinar.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
                        {webinar.description}
                      </p>
                    )}
                    {webinar.maxAttendees && (
                      <div className={`flex items-center gap-2 text-sm ${(webinar.registrationCount ?? 0) >= webinar.maxAttendees ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Users className="h-4 w-4 text-upisha-teal" />
                        {(webinar.registrationCount ?? 0) >= webinar.maxAttendees
                          ? 'Registration full'
                          : `${webinar.maxAttendees - (webinar.registrationCount ?? 0)} seats remaining`}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Link
                      href={`/webinars/register?webinarId=${webinar.id || ''}&webinarTitle=${encodeURIComponent(webinar.title)}`}
                      className="w-full"
                    >
                      <Button
                        className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white glow-teal"
                        disabled={webinar.maxAttendees ? (webinar.registrationCount ?? 0) >= webinar.maxAttendees : false}
                      >
                        {webinar.maxAttendees && (webinar.registrationCount ?? 0) >= webinar.maxAttendees ? 'Full' : 'Register Now'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-upisha-teal transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}