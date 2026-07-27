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
import { Badge } from '@/components/ui/badge'

/* ─── Reusable Section Heading ─── */
export function SectionHeading({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  light = false,
  align = 'center',
}: {
  badge: string
  badgeIcon?: React.ElementType
  title: string
  subtitle?: string
  light?: boolean
  align?: 'center' | 'left'
}) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`inline-flex items-center gap-1.5 badge-float ${
          light ? 'bg-white/10 text-white' : 'bg-upisha-teal/10 text-upisha-teal'
        } px-3 py-1.5 rounded-full text-xs font-semibold mb-4`}
      >
        {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
        {badge}
      </motion.div>
      <div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        {align === 'center' && (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`heading-decorative-left shrink-0 ${light ? 'opacity-30' : ''}`}
          />
        )}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`text-3xl md:text-4xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-upisha-navy dark:text-white'}`}
        >
          {title}
        </motion.h2>
        {align === 'center' && (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className={`heading-decorative-right shrink-0 ${light ? 'opacity-30' : ''}`}
          />
        )}
      </div>
      <div className={`shimmer-line w-20 mx-auto mt-3 mb-4`} style={{ marginLeft: align === 'center' ? 'auto' : undefined, marginRight: align === 'center' ? 'auto' : undefined }} />
      {subtitle && (
        <p
          className={`max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } text-lg ${light ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

