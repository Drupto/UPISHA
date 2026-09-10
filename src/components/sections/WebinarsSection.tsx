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
  PhoneCall, Building, Mailbox, Zap, BadgeCheck, CreditCard,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Webinar } from '@/lib/types'

/* ─── Webinars Section ─── */
interface WebinarsSectionProps {
  initialWebinars?: Webinar[]
}

export function WebinarsSection({ initialWebinars }: WebinarsSectionProps = {}) {
  const [webinars, setWebinars] = useState<Webinar[]>(() => (initialWebinars ?? []).slice(0, 3))
  const [loading, setLoading] = useState(!initialWebinars)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialWebinars) return
    const fetchWebinars = async () => {
      try {
        const res = await fetch('/api/webinars')
        if (res.ok) {
          const data = await res.json()
          // Show only first 3 webinars on landing page
          setWebinars((data.webinars || []).slice(0, 3))
        } else {
          setError('Failed to load webinars')
        }
      } catch {
        setError('Failed to load webinars')
      } finally {
        setLoading(false)
      }
    }
    fetchWebinars()
  }, [])

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-upisha-teal-light via-white to-upisha-gold-light dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t-2 border-t-upisha-teal/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">
              <PlayCircle className="h-3 w-3 mr-1" />
              Upcoming Webinars
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white mb-4">
              Learn from Experts
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join our live webinar series featuring leading experts in audiology and
              speech-language pathology. All webinars are free for UP ISHA members.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Free for UP ISHA members
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Certificate of attendance
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Recorded sessions available
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/webinars">
                <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                  View All Webinars
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/webinars/lookup">
                <Button variant="outline" className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Check Webinar Registration
                </Button>
              </Link>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-upisha-teal border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : webinars.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No upcoming webinars at this time.</p>
              </div>
            ) : (
              webinars.map((webinar, i) => (
                <motion.div
                  key={webinar.id || i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-upisha-teal dark:bg-gray-800 dark:border-gray-700 dark:border-l-upisha-teal shadow-sm hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-14 h-14 bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 dark:from-upisha-teal/20 dark:to-upisha-gold/20 rounded-xl flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                          <PlayCircle className="h-7 w-7 text-upisha-teal group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-upisha-navy dark:text-white mb-1 group-hover:text-upisha-teal transition-colors">
                            {webinar.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Speaker: <span className="font-medium">{webinar.speaker}</span>
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1" suppressHydrationWarning>
                              <Calendar className="h-3.5 w-3.5 text-upisha-gold" />
                              {webinar.date ? new Date(webinar.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-upisha-gold" />
                              {webinar.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3.5 w-3.5 text-upisha-gold" />
                              {webinar.duration}
                            </span>
                            {webinar.type === 'free' ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                <BadgeCheck className="h-3.5 w-3.5" /> Free
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-upisha-gold">
                                <CreditCard className="h-3.5 w-3.5" /> Paid
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/webinars/register?webinarId=${webinar.id || ''}&webinarTitle=${encodeURIComponent(webinar.title)}`}
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
                          >
                            {webinar.type === 'free' ? 'Register Free' : 'Register'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}