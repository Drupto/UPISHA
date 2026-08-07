'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, ArrowRight, Megaphone, MapPin, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { announcements as staticAnnouncements } from '@/lib/static-data'
import type { Announcement } from '@/lib/types'

/* ─── Announcement Section ─── */
export function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState(staticAnnouncements)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/announcements')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (!cancelled && data.announcements?.length) {
          setAnnouncements(data.announcements)
        }
      })
      .catch(() => {})
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
              {announcements.map((item, i) => (
                <motion.div
                  key={item.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div className="shrink-0 w-16 text-center">
                    <div className="bg-upisha-teal-light dark:bg-upisha-teal/20 rounded-lg p-2">
                      <Calendar className="h-5 w-5 text-upisha-teal mx-auto" />
                      <div className="text-xs text-upisha-teal font-medium mt-1">
                        {String(item.date).split(' ').slice(0, 2).join(' ')}
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
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy dark:text-white">UP ISHACON 2026</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> October 18-20, 2026
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Lucknow, UP
                  </p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy dark:text-white">World Hearing Day 2026</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> March 3, 2026
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Across UP
                  </p>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy dark:text-white">Pediatric SLP Workshop</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> April 12, 2026
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Varanasi, UP
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
                >
                  View All Events
                </Button>
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
                    {new Date(selectedAnnouncement.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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

