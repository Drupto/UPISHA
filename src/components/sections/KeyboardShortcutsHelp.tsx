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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/* ─── Keyboard Shortcuts Help Dialog ─── */
function KeyboardShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], desc: 'Open command palette / search' },
    { keys: ['?'], desc: 'Toggle this shortcuts help' },
    { keys: ['Esc'], desc: 'Close any open dialog' },
    { keys: ['Home'], desc: 'Scroll to top of page' },
    { keys: ['End'], desc: 'Scroll to bottom of page' },
    { keys: ['g', 'h'], desc: 'Go to Home section' },
    { keys: ['g', 'a'], desc: 'Go to About section' },
    { keys: ['g', 'j'], desc: 'Go to Join section' },
    { keys: ['g', 'c'], desc: 'Go to Contact section' },
    { keys: ['g', 'g'], desc: 'Go to Gallery section' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-upisha-navy dark:text-white">
            <Command className="h-5 w-5 text-upisha-teal" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate the site faster.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    {j > 0 && <span className="text-gray-400 text-xs">+</span>}
                    <kbd className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-200 shadow-sm">
                      {k}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
