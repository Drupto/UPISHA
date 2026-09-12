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
import { documents } from '@/lib/static-data'

/* ─── Quick Links ─── */
export function QuickLinks() {
  const links = [
    { icon: Ear, label: 'Audiology', href: '#about', color: 'bg-teal-500' },
    {
      icon: MessageSquare,
      label: 'Speech Language Pathology',
      href: '#about',
      color: 'bg-emerald-600',
    },
    {
      icon: Users,
      label: 'Locate Professional',
      href: '#contact',
      color: 'bg-upisha-gold',
    },
    { icon: Award, label: 'Clinic Accreditation', href: '#documents', color: 'bg-upisha-navy' },
  ]

  return (
    <div className="relative z-20 -mt-16 md:-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {links.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl p-4 md:p-6 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 group border-t-[3px] border-t-transparent hover:border-t-upisha-teal card-gradient-top"
            >
              <div
                className={`${link.color} w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <link.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-upisha-teal transition-colors">
                {link.label}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

