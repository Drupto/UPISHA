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

/* ─── Top Bar ─── */
function TopBar() {
  return (
    <div className="bg-upisha-navy dark:bg-gray-950 text-white text-sm py-2 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a
            href="tel:+915224567890"
            className="flex items-center gap-1.5 hover:text-upisha-gold transition-colors group"
          >
            <PhoneCall className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            +91-522-456-7890
          </a>
          <a
            href="mailto:info@upisha.org"
            className="flex items-center gap-1.5 hover:text-upisha-gold transition-colors group"
          >
            <Mailbox className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            info@upisha.org
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Follow us:</span>
          {[
            { icon: Facebook, label: 'Facebook' },
            { icon: Twitter, label: 'Twitter' },
            { icon: Instagram, label: 'Instagram' },
            { icon: Linkedin, label: 'LinkedIn' },
            { icon: Youtube, label: 'YouTube' },
          ].map((social) => (
            <a
              key={social.label}
              href="#"
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-upisha-gold flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-upisha-navy"
              aria-label={social.label}
            >
              <social.icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
