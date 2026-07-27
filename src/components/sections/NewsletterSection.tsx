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
import { Input } from '@/components/ui/input'
import { publications } from '@/lib/static-data'

/* ─── Newsletter Section ─── */
export function NewsletterSection() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubscribed(true)
        toast({
          title: 'Subscribed successfully!',
          description: 'Welcome aboard! You will receive our next newsletter soon.',
        })
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
    <section className="py-16 md:py-20 bg-gradient-to-br from-upisha-gold-light via-white to-upisha-teal-light dark:from-upisha-navy dark:to-upisha-navy-light relative overflow-hidden">
      {/* Decorative wave pattern */}
      <div className="absolute inset-0 opacity-[0.07]">
        <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <path d="M0,200 C300,100 600,300 1200,200 L1200,400 L0,400 Z" fill="currentColor" className="text-upisha-gold" />
          <path d="M0,250 C300,150 600,350 1200,250 L1200,400 L0,400 Z" fill="currentColor" className="text-upisha-teal" />
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-upisha-gold/20 text-upisha-gold-dark border border-upisha-gold/30 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wider"
            style={{ color: '#9a6f1f' }}
          >
            <Bell className="h-3.5 w-3.5" />
            Stay Updated
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy dark:text-white mb-3">
            Subscribe to Our Newsletter
          </h2>
          <div className="h-1 w-16 bg-upisha-gold rounded-full mx-auto mb-4" />
          <p className="text-upisha-navy/80 dark:text-gray-200 max-w-xl mx-auto mb-8 text-base font-medium">
            Get the latest updates on conferences, workshops, research publications, and
            professional opportunities delivered directly to your inbox.
          </p>
          {subscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-upisha-navy-light rounded-2xl p-8 shadow-xl max-w-md mx-auto border border-upisha-teal/20"
            >
              <div className="w-16 h-16 bg-upisha-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 text-upisha-teal" />
              </div>
              <h3 className="text-xl font-bold text-upisha-navy dark:text-white mb-2">
                Successfully Subscribed!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Welcome aboard! You&apos;ll receive our next newsletter soon.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-upisha-navy-light rounded-2xl p-6 md:p-8 shadow-xl max-w-xl mx-auto flex flex-col sm:flex-row gap-4 border border-upisha-teal/20"
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 dark:bg-upisha-navy border-gray-200 dark:border-gray-700 input-focus-ring"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white h-12 px-6 shadow-md hover:shadow-lg transition-all glow-teal"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Sparkles className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
          <p className="text-xs text-upisha-navy/60 dark:text-gray-400 mt-5 font-medium flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3" />
            No spam. Unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}

