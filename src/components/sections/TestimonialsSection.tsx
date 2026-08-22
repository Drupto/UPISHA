'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  Menu, X, Phone, Mail, MapPin, ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Users, BookOpen, FileText, Award, Camera, UserPlus, Ear, MessageSquare,
  Heart, Stethoscope, GraduationCap, Globe, Facebook, Twitter, Instagram,
  Linkedin, Youtube, Send, Clock, Calendar, ArrowRight, CheckCircle2,
  Star, Briefcase, Shield, ExternalLink, Download, Eye, Quote, Loader2,
  Activity, Microscope, HandHeart, TrendingUp, Building2, Newspaper,
  PlayCircle, Sun, Moon, Bell, Timer, Sparkles, Search, AlertCircle,
  Megaphone, Lightbulb, Trophy, MapPinned, Command, Share2, Printer,
  PhoneCall, Building, Mailbox, Zap,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/sections'

/* ─── Testimonials Section ─── */
export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch('/api/testimonials', { cache: 'no-store' })
        const data = await response.json()
        if (data.testimonials && data.testimonials.length > 0) {
          // Only show active testimonials on the landing page
          const active = data.testimonials.filter((t: any) => t.isActive !== false)
          setTestimonials(active)
        }
      } catch (error) {
        console.error('Failed to load testimonials:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTestimonials()
  }, [])

  useEffect(() => {
    if (isPaused || testimonials.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused, testimonials.length])

  const goNext = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const goPrev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-16 md:py-20 bg-upisha-navy dark:bg-gray-950 relative overflow-hidden border-t-2 border-t-upisha-gold/20">
      {/* Decorative quote marks */}
      <Quote className="absolute top-10 left-10 h-32 w-32 text-upisha-teal/10" />
      <Quote className="absolute bottom-10 right-10 h-32 w-32 text-upisha-teal/10 rotate-180" />

      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="text-center mb-10">
          <Badge className="bg-upisha-teal/20 text-upisha-teal mb-3">
            <Star className="h-3 w-3 mr-1" />
            Member Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Our Members Say
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-upisha-teal" />
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-gray-400">No testimonials available yet.</p>
        ) : (
          <div
            className="relative min-h-[260px] md:min-h-[220px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
          {/* Nav arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center px-8"
            >
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-upisha-gold text-upisha-gold" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-gray-200 italic leading-relaxed mb-6 max-w-3xl mx-auto">
                &ldquo;{testimonials[current].content}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-upisha-teal/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-upisha-teal" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">{testimonials[current].name}</div>
                  <div className="text-sm text-upisha-teal">{testimonials[current].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots + pause indicator */}
          <div className="flex justify-center items-center gap-3 mt-8">
            {isPaused && (
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Paused</span>
            )}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-upisha-gold' : 'w-2.5 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  )
}

