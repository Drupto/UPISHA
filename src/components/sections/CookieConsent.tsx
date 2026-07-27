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

/* ─── Cookie Consent Banner ─── */
function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('upisha-cookie-consent')
    if (!consent) {
      const showTimer = setTimeout(() => setIsVisible(true), 1200)
      // Auto-hide after 15 seconds if not interacted with
      const autoHideTimer = setTimeout(() => {
        localStorage.setItem('upisha-cookie-consent', 'auto-dismissed')
        setIsVisible(false)
      }, 15000 + 1200) // 15s after it appears
      return () => {
        clearTimeout(showTimer)
        clearTimeout(autoHideTimer)
      }
    }
  }, [])

  const accept = () => {
    localStorage.setItem('upisha-cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const decline = () => {
    localStorage.setItem('upisha-cookie-consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[40] w-[calc(100%-2rem)] max-w-[400px] translate-y-0"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="glass rounded-xl shadow-lg border border-white/30 dark:border-white/10 px-3.5 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 shrink-0 rounded-full bg-upisha-teal/15 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-upisha-teal" />
            </div>
            <p className="flex-1 text-[11px] text-gray-700 dark:text-gray-200 leading-tight">
              We use cookies to enhance your experience.
            </p>
            <button
              onClick={decline}
              className="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors min-h-[32px]"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-upisha-teal hover:bg-upisha-teal-dark text-white transition-colors shadow-sm min-h-[32px]"
              aria-label="Accept cookies"
            >
              Accept
            </button>
            <button
              onClick={decline}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
