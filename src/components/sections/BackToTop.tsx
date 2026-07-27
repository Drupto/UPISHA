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

/* ─── Back to Top Button ─── */
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'join', label: 'Join' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {showMenu && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 min-w-[140px]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 py-1">Quick jump</p>
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
                  setShowMenu(false)
                }}
                className="w-full text-left px-2 py-1.5 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-upisha-teal-light dark:hover:bg-gray-700 hover:text-upisha-teal transition-colors flex items-center gap-1.5"
              >
                <ChevronRight className="h-3 w-3" />
                {link.label}
              </button>
            ))}
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
            <button
              onClick={scrollToTop}
              className="w-full text-left px-2 py-1.5 rounded-md text-xs font-medium text-upisha-teal hover:bg-upisha-teal-light dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
            >
              <ChevronUp className="h-3 w-3" />
              Back to Top
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isVisible && (
          <div className="flex items-center gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={() => setShowMenu(s => !s)}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-upisha-teal shadow-md flex items-center justify-center transition-colors border border-gray-100 dark:border-gray-700"
              aria-label="Quick navigation menu"
              aria-expanded={showMenu}
            >
              <Menu className="h-4 w-4" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-lg flex items-center justify-center transition-colors group"
              aria-label="Back to top"
            >
              <ChevronUp className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

