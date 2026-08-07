'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Megaphone, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedSection } from '@/components/sections'
import { formatEventDate } from '@/lib/date-utils'

interface AnnouncementItem {
  id: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(10)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok) {
          const data = await res.json()
          setAnnouncements((data.announcements || []).filter((a: AnnouncementItem) => a.isActive !== false))
        } else {
          setError('Failed to load announcements')
        }
      } catch {
        setError('Failed to load announcements. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  return (
    <AnimatedSection className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Announcements</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">
            All Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Stay informed with the latest news and announcements from UP ISHA.
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
        ) : announcements.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-upisha-navy dark:text-white mb-2">
              No Announcements Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no announcements at this time. Please check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.slice(0, visibleCount).map((announcement, index) => (
              <motion.div
                key={announcement.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-upisha-teal/10 dark:bg-gray-800 dark:border-gray-700 hover:border-upisha-teal/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg text-upisha-navy dark:text-white">
                        {announcement.title}
                      </CardTitle>
                      <Badge variant="outline" className="shrink-0 text-xs border-upisha-teal/30 text-upisha-teal">
                        {announcement.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4 text-upisha-teal" />
                      <span>
                        {formatEventDate(announcement.date)}
                      </span>
                    </div>
                    {announcement.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          {visibleCount < announcements.length && (
            <Button
              variant="outline"
              className="mb-6 border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
              onClick={() => setVisibleCount(prev => prev + 10)}
            >
              Load More Announcements
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          <Link href="/" className="text-sm text-gray-500 hover:text-upisha-teal transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}