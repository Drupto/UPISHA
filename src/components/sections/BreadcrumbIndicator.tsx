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
import { navLinks } from '@/lib/static-data'

/* ─── Breadcrumb Indicator (shows current section in navbar) ─── */
function BreadcrumbIndicator({ activeSection }: { activeSection: string }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handler = () => setIsVisible(window.scrollY > 600)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const current = navLinks.find((l) => l.href.slice(1) === activeSection)

  return (
    <AnimatePresence>
      {isVisible && current && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="fixed top-[88px] md:top-[104px] left-1/2 -translate-x-1/2 z-30 hidden md:block pointer-events-none"
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-md border border-gray-200/60 dark:border-gray-700/60 px-4 py-1.5 flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">You are here:</span>
            <span className="text-upisha-teal dark:text-upisha-teal font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-upisha-gold animate-pulse" />
              {current.label}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
