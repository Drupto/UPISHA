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
import { documents, publications } from '@/lib/static-data'

/* ─── Section Navigation Indicator ─── */
export function SectionNavigationIndicator({ activeSection }: { activeSection: string }) {
  const [scrollPercent, setScrollPercent] = useState(0)
  const sections = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'documents', label: 'Documents' },
    { id: 'publications', label: 'Publications' },
    { id: 'professionals', label: 'Professionals' },
    { id: 'join', label: 'Join' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ]

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollPercent(docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const activeLabel = sections.find((s) => s.id === activeSection)?.label || ''

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
      {sections.map((section) => {
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            onClick={() => handleClick(section.id)}
            className="group relative flex items-center justify-center"
            aria-label={`Navigate to ${section.label}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 whitespace-nowrap bg-upisha-navy dark:bg-gray-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {section.label}
              <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-upisha-navy dark:bg-gray-800 rotate-45" />
            </span>
            {/* Dot */}
            <motion.div
              animate={{
                width: isActive ? 12 : 8,
                height: isActive ? 12 : 8,
                backgroundColor: isActive ? '#0d9488' : '#9ca3af',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-full cursor-pointer hover:bg-upisha-teal transition-colors"
            />
            {/* Active section label & percentage */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-5 whitespace-nowrap text-[9px] font-semibold text-upisha-teal bg-upisha-teal/10 px-1.5 py-0.5 rounded pointer-events-none"
              >
                {activeLabel} {scrollPercent}%
              </motion.div>
            )}
          </button>
        )
      })}
    </div>
  )
}

