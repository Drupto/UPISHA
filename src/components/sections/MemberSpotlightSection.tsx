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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { memberSpotlights } from '@/lib/static-data'
import { AnimatedSection, SectionHeading } from '@/components/sections'

/* ─── Member Spotlight Section ─── */
export function MemberSpotlightSection() {
  return (
    <AnimatedSection className="py-16 md:py-20 bg-gradient-to-br from-upisha-teal-light via-white to-upisha-gold-light dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-upisha-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-upisha-teal/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <SectionHeading
          badge="Member Spotlight"
          badgeIcon={Trophy}
          title="Celebrating Our Members"
          subtitle="Recognizing the outstanding contributions and achievements of UP ISHA members who are advancing the field of speech and hearing in Uttar Pradesh."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {memberSpotlights.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <Card className="h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                {/* Top gradient bar */}
                <div className="h-2 bg-gradient-to-r from-upisha-teal via-upisha-gold to-upisha-teal" />

                {/* Trophy badge */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-upisha-gold/10 flex items-center justify-center group-hover:bg-upisha-gold transition-colors">
                  <Trophy className="h-5 w-5 text-upisha-gold group-hover:text-white transition-colors" />
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-upisha-teal to-upisha-teal-dark flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {member.name.split(' ').slice(-2, -1)[0]?.[0] || member.name[0]}
                      {member.name.split(' ').slice(-1)[0]?.[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-upisha-navy dark:text-white">{member.name}</h4>
                      <p className="text-xs text-upisha-teal font-medium">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <Badge className="bg-upisha-teal/10 text-upisha-teal">
                      <MapPinned className="h-3 w-3 mr-1" />
                      {member.location}
                    </Badge>
                    <Badge className="bg-upisha-gold/10 text-upisha-gold">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {member.years}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700" variant="secondary">
                      {member.specialty}
                    </Badge>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 h-5 w-5 text-upisha-gold/30" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed pl-5">
                      {member.achievement}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

