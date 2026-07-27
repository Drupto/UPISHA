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
import { Badge } from '@/components/ui/badge'

/* ─── Event Countdown Timer ─── */
export function CountdownTimer() {
  const targetDate = new Date('2026-10-18T09:00:00+05:30').getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, targetDate - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-upisha-teal to-upisha-teal-dark dark:from-gray-800 dark:to-gray-900 relative overflow-hidden border-t-2 border-t-upisha-gold/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-[10%] w-20 h-20 rounded-full border-2 border-white" />
        <div className="absolute bottom-4 right-[15%] w-32 h-32 rounded-full border border-white" />
        <div className="absolute top-1/2 left-[60%] w-16 h-16 rounded-full bg-white/20" />
      </div>
      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="text-center mb-8">
          <Badge className="bg-white/20 text-white mb-3">
            <Timer className="h-3 w-3 mr-1" />
            Save the Date
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">UP ISHACON 2026</h2>
          <p className="text-white/80 mt-2">October 18-20, 2026 • Lucknow, Uttar Pradesh</p>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-5 text-center border border-white/20"
            >
              <div className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm text-white/70 mt-1">{unit.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" className="bg-white text-upisha-teal hover:bg-white/90 font-semibold">
            Register Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}

