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
  PhoneCall, Building, Mailbox, Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { announcements } from '@/lib/static-data'

/* ─── Announcement Section ─── */
function AnnouncementSection() {
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
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div className="shrink-0 w-16 text-center">
                    <div className="bg-upisha-teal-light dark:bg-upisha-teal/20 rounded-lg p-2">
                      <Calendar className="h-5 w-5 text-upisha-teal mx-auto" />
                      <div className="text-xs text-upisha-teal font-medium mt-1">
                        {item.date.split(' ').slice(0, 2).join(' ')}
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
            <Button
              variant="outline"
              className="mt-4 border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
            >
              View All Announcements
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
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
    </section>
  )
}
