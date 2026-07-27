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
import { ThemeToggle } from '@/components/sections'
import { navLinks } from '@/lib/static-data'

/* ─── Navbar ─── */
export function Navbar({
  activeSection,
  onNavClick,
  onOpenSearch,
}: {
  activeSection: string
  onNavClick: (href: string) => void
  onOpenSearch: () => void
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-upisha-navy/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-upisha-navy shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              onNavClick('#home')
            }}
            className="flex items-center gap-3 shrink-0 group mr-4 lg:mr-10"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all bg-white">
              <img
                src="/images/mainlogo.jpeg"
                alt="UP ISHA logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-upisha-navy dark:text-white text-sm md:text-base leading-tight">
                UP ISHA
              </div>
              <div className="text-[10px] md:text-xs text-upisha-teal font-medium leading-tight">
                Speech & Hearing Association
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavClick(link.href)
                  }}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-upisha-teal font-bold bg-upisha-teal-light dark:bg-upisha-teal/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-upisha-teal hover:bg-upisha-teal-light/50 dark:hover:bg-upisha-teal/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-8 bg-upisha-teal rounded-full"
                    />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTA + Search + Theme Toggle + Mobile Toggle */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-upisha-navy-light dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs transition-colors"
              aria-label="Open search (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <ThemeToggle />
            <Button
              className="hidden md:inline-flex bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-sm hover:shadow-md"
              onClick={() => onNavClick('#join')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Now
            </Button>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white dark:bg-upisha-navy border-t border-gray-100 dark:border-gray-800"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavClick(link.href)
                    setIsMobileOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? 'text-upisha-teal bg-upisha-teal-light dark:bg-upisha-teal/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-upisha-teal hover:bg-gray-50 dark:hover:bg-upisha-navy-light'
                  }`}
                >
                  <ChevronRight className="h-4 w-4 opacity-50" />
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-2 bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                onClick={() => {
                  onNavClick('#join')
                  setIsMobileOpen(false)
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Now
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

