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

/* ─── Social Proof Notification ─── */
function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const messages = [
    { icon: Users, text: 'Dr. Priya from Lucknow just joined UP ISHA', emoji: '🎉' },
    { icon: Calendar, text: '3 new events added this week', emoji: '📅' },
    { icon: UserPlus, text: '12 professionals registered this month', emoji: '👥' },
    { icon: Sparkles, text: 'UP ISHACON 2026 registration is now open!', emoji: '🏆' },
  ]

  useEffect(() => {
    if (dismissed) return
    const showInterval = setInterval(() => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 5000)
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 18000)

    // Show first notification after 6 seconds
    const initialTimeout = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 5000)
    }, 6000)

    return () => {
      clearInterval(showInterval)
      clearTimeout(initialTimeout)
    }
  }, [dismissed, messages.length])

  if (dismissed) return null

  const msg = messages[currentIndex]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 left-4 z-40 hidden md:block max-w-[300px]"
        >
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-3.5 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-upisha-teal/15 to-upisha-gold/15 flex items-center justify-center shrink-0">
              <msg.icon className="h-4 w-4 text-upisha-teal" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-upisha-navy dark:text-white leading-relaxed">
                <span className="mr-1">{msg.emoji}</span>
                {msg.text}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Just now</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
