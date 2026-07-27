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
import { partners } from '@/lib/static-data'

/* ─── Partners Section ─── */
export function PartnersSection() {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Affiliated & Collaborating Organizations
          </p>
        </div>
      </div>
      {/* Marquee container */}
      <div className="relative group">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none" />
        {/* Scrolling track */}
        <div className="flex animate-marquee-partners group-hover:[animation-play-state:paused]">
          {[...partners, ...partners].map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex flex-col items-center gap-2 text-center shrink-0 w-[180px] md:w-[220px] py-5 px-4 group/item cursor-pointer"
            >
              <div className="partner-card rounded-xl p-4 flex flex-col items-center gap-3 w-full bg-white dark:bg-gray-800/50">
                <div className="w-12 h-12 rounded-full bg-upisha-teal/10 flex items-center justify-center group-hover/item:bg-upisha-teal transition-colors">
                  <partner.icon className="h-6 w-6 text-upisha-teal group-hover/item:text-white transition-colors" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-tight">
                  {partner.name}
                </span>
                {/* Verified Partner badge */}
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-upisha-teal bg-upisha-teal/8 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Verified Partner
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

