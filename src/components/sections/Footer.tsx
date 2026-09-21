'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Users, BookOpen, FileText, Award, Camera, UserPlus, MessageSquare,
  Heart, Stethoscope, GraduationCap, Globe, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Send, Clock, Calendar, ArrowRight, CheckCircle2,
  Star, Briefcase, Shield, ExternalLink, Download, Eye, Quote,
  Activity, Microscope, HandHeart, TrendingUp, Building2, Newspaper,
  PlayCircle, Sun, Moon, Bell, Timer, Sparkles, Search, AlertCircle,
  Megaphone, Lightbulb, Trophy, MapPinned, Command, Share2, Printer,
  PhoneCall, Building, Mailbox, Zap,
} from 'lucide-react'
import { siteConfig } from '@/lib/seo'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { publications } from '@/lib/static-data'

/* ─── Footer ─── */
export function Footer() {
  const [footerEmail, setFooterEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Real newsletter subscription (same endpoint as NewsletterSection)
  const handleFooterNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!footerEmail || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: footerEmail }),
      })
      if (res.ok) {
        toast({ title: 'Subscribed!', description: 'You have been subscribed to our newsletter.' })
        setFooterEmail('')
      } else {
        toast({
          title: 'Subscription failed',
          description: 'This email may already be subscribed. Please try another.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-upisha-navy dark:bg-gray-950 text-white relative">
      {/* Gradient accent bar at the very top */}
      <div className="h-1.5 bg-gradient-to-r from-upisha-teal via-upisha-gold to-upisha-teal" />

      <div className="footer-pattern">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Logo & About */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shrink-0">
                  <img
                    src="/images/upishalogo.png"
                    alt="UP ISHA Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">UP ISHA</div>
                  <div className="text-xs text-gray-400">Speech & Hearing Association</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                The Uttar Pradesh Speech & Hearing Association is dedicated to advancing audiology and
                speech-language pathology in Uttar Pradesh, India.
              </p>
              {/* Social media icons row */}
              <div className="flex items-center gap-3">
                <a href={siteConfig.links.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-upisha-teal flex items-center justify-center transition-colors social-icon-hover" aria-label="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={siteConfig.links.x} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-upisha-teal flex items-center justify-center transition-colors social-icon-hover" aria-label="X">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-upisha-teal flex items-center justify-center transition-colors social-icon-hover" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={siteConfig.links.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 hover:bg-upisha-teal flex items-center justify-center transition-colors social-icon-hover" aria-label="YouTube">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-upisha-gold mb-4 social-icon-hover inline-block">Quick Links</h4>
              <ul className="space-y-2">
                {['About Us', 'Documents', 'Publications'].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase().replace(/\s/g, '')}`}
                      className="text-sm text-gray-400 hover:text-upisha-teal transition-colors flex items-center gap-1.5"
                    >
                      <ChevronRight className="h-3 w-3 text-upisha-teal/50" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Membership */}
            <div>
              <h4 className="font-semibold text-upisha-gold mb-4 social-icon-hover inline-block">Membership</h4>
              <ul className="space-y-2">
                {['Join UP ISHA', 'Member Benefits', 'Life Membership', 'Student Membership'].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#join"
                        className="text-sm text-gray-400 hover:text-upisha-teal transition-colors flex items-center gap-1.5"
                      >
                        <ChevronRight className="h-3 w-3 text-upisha-teal/50" />
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Quick Actions - New 4th column */}
            <div>
              <h4 className="font-semibold text-upisha-gold mb-4 social-icon-hover inline-block">Quick Actions</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Join Now', href: '#join' },
                  { label: 'Submit Paper', href: '#publications' },
                  { label: 'Contact Us', href: '#contact' },
                  { label: 'Check Webinar Registration', href: '/webinars/lookup' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-gray-400 hover:text-upisha-teal transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight className="h-3 w-3 text-upisha-gold/60" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div>
              <h4 className="font-semibold text-upisha-gold mb-4 social-icon-hover inline-block">Stay Updated</h4>
              <p className="text-xs text-gray-400 mb-3">Subscribe to our newsletter for the latest updates.</p>
              <form onSubmit={handleFooterNewsletter} className="flex gap-2 mb-4">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                  className="h-9 text-xs bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-upisha-teal input-focus-ring"
                />
                <Button type="submit" size="sm" className="h-9 bg-upisha-teal hover:bg-upisha-teal-dark text-white shrink-0 px-3" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </form>
              <div className="space-y-1.5 text-xs text-gray-400">
                <p className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-upisha-teal" />
                  110 Raghu Raj Nagar Patel Nagar Lucknow-226016
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-upisha-teal" />
                  +91-9555155940
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-upisha-teal" />
                  office@upisha.org
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-700" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Uttar Pradesh Speech & Hearing Association. All rights
              reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
              <a href="/privacy-policy" className="hover:text-upisha-teal transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="hover:text-upisha-teal transition-colors">
                Terms of Service
              </a>
              <a href="/refund-policy" className="hover:text-upisha-teal transition-colors">
                Refund Policy
              </a>
              <a href="/cookie-policy" className="hover:text-upisha-teal transition-colors">
                Cookie Policy
              </a>
              <a href="/disclaimer" className="hover:text-upisha-teal transition-colors">
                Disclaimer
              </a>
              <a href="/accessibility" className="hover:text-upisha-teal transition-colors">
                Accessibility
              </a>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="ml-2 text-upisha-teal hover:text-upisha-gold transition-colors flex items-center gap-1 text-xs font-medium"
                aria-label="Back to top"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Back to top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

