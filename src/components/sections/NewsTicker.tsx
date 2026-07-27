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
import { newsTickerItems } from '@/lib/static-data'

/* ─── News Ticker ─── */
function NewsTicker() {
  return (
    <div className="bg-upisha-navy dark:bg-gray-950 text-white py-2.5 overflow-hidden border-b border-upisha-teal/30">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 bg-upisha-gold text-upisha-navy px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
          <Megaphone className="h-3.5 w-3.5" />
          Latest
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...newsTickerItems, ...newsTickerItems].map((item, i) => (
              <span key={i} className="text-sm text-gray-200 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-upisha-gold" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
