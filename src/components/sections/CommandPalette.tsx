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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { navLinks, documents, publications } from '@/lib/static-data'

/* ─── Command Palette / Search Modal ─── */
export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (href: string) => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => {
    return [
      ...navLinks.map((l) => ({ label: l.label, href: l.href, group: 'Pages', icon: ChevronRight })),
      { label: 'Join UP ISHA - Membership', href: '#join', group: 'Actions', icon: UserPlus },
      { label: 'Contact the Association', href: '#contact', group: 'Actions', icon: Mail },
      { label: 'Browse Documents', href: '#documents', group: 'Resources', icon: FileText },
      { label: 'View Publications', href: '#publications', group: 'Resources', icon: BookOpen },
      { label: 'View Gallery', href: '#gallery', group: 'Resources', icon: Camera },
      { label: 'UP ISHACON 2026 Countdown', href: '#home', group: 'Events', icon: Timer },
      { label: 'Upcoming Webinars', href: '#about', group: 'Events', icon: PlayCircle },
    ]
  }, [])

  const filtered = useMemo(() => {
    if (!query) return allItems
    const q = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    )
  }, [query, allItems])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      onNavigate(filtered[activeIndex].href)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = []
      groups[item.group].push(item)
    })
    return groups
  }, [filtered])

  let runningIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-upisha-navy/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, actions, resources..."
                className="flex-1 py-4 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
              <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {group}
                    </div>
                    {items.map((item) => {
                      runningIndex++
                      const idx = runningIndex
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={`${group}-${item.label}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            onNavigate(item.href)
                            onClose()
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                            isActive
                              ? 'bg-upisha-teal-light text-upisha-teal'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">↵</kbd>
                  Select
                </span>
              </div>
              <span className="text-upisha-teal font-medium">UP ISHA</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

