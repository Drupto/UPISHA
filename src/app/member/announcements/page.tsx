'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Loader2, Calendar } from 'lucide-react'

interface AnnouncementItem {
  id: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
}

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements')
        if (!res.ok) throw new Error('Failed to fetch announcements')
        const data = await res.json()
        setAnnouncements((data.announcements as AnnouncementItem[]).filter((a) => a.isActive !== false))
      } catch {
        setError('Failed to load announcements')
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
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
      <h1 className="text-2xl font-bold text-upisha-navy dark:text-white mb-6">Announcements</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {announcements.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center text-gray-500">
            <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            No announcements at this time.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-upisha-navy dark:text-white">{announcement.title}</CardTitle>
                  <Badge className="bg-upisha-teal/10 text-upisha-teal shrink-0">{announcement.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {new Date(announcement.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {announcement.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{announcement.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}