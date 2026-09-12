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
import { heroSlides } from '@/lib/static-data'
import { useAutoAdvance } from '@/lib/hooks/useAutoAdvance'

/* ─── Hero Section ─── */
export function HeroSection() {
  const [isPaused, setIsPaused] = useState(false)
  const [current, setCurrent] = useAutoAdvance(heroSlides.length, { intervalMs: 6000, isPaused })
  const { toast } = useToast()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()

  // Hover-pause should only apply on devices with a real mouse/trackpad.
  // On touch screens a tap synthesizes mouseenter without a matching
  // mouseleave, which would latch the carousel in a permanently paused state.
  const canHover = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : false),
    []
  )

  // Parallax-like scroll effect
  const heroTranslateY = useTransform(scrollY, [0, 700], [0, 80])

  const goTo = (index: number) => setCurrent(index)
  const goPrev = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  const goNext = () => setCurrent((prev) => (prev + 1) % heroSlides.length)

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
      onMouseEnter={() => canHover && setIsPaused(true)}
      onMouseLeave={() => canHover && setIsPaused(false)}
    >
      {/* Parallax container */}
      <motion.div style={{ y: heroTranslateY }} className="absolute inset-0">
      {/* Decorative geometric shapes */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] right-[10%] w-20 h-20 md:w-32 md:h-32 border-2 border-white/10 rounded-full" />
        <div className="absolute bottom-[20%] left-[5%] w-16 h-16 md:w-24 md:h-24 border border-upisha-gold/20 rounded-full" />
        <div className="absolute top-[40%] right-[25%] w-3 h-3 bg-upisha-gold/30 rounded-full" />
        <div className="absolute top-[25%] left-[30%] w-2 h-2 bg-white/20 rounded-full" />
        <div className="absolute bottom-[35%] right-[15%] w-4 h-4 border border-white/15 rotate-45" />
        <div className="absolute top-[60%] left-[15%] w-6 h-6 border border-upisha-teal/20 rounded-full" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-20px] left-[8%] w-2 h-2 bg-upisha-gold/25 rounded-full floating-particle" style={{ '--particle-duration': '10s', '--particle-delay': '0s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[22%] w-3 h-3 bg-upisha-teal/20 rounded-full floating-particle" style={{ '--particle-duration': '12s', '--particle-delay': '1.5s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[40%] w-1.5 h-1.5 bg-white/20 rounded-full floating-particle" style={{ '--particle-duration': '9s', '--particle-delay': '3s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[55%] w-2.5 h-2.5 bg-upisha-gold/15 rounded-full floating-particle" style={{ '--particle-duration': '11s', '--particle-delay': '2s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[70%] w-2 h-2 bg-upisha-teal/15 rounded-full floating-particle" style={{ '--particle-duration': '13s', '--particle-delay': '4s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[85%] w-1.5 h-1.5 bg-upisha-gold/20 rounded-full floating-particle" style={{ '--particle-duration': '8s', '--particle-delay': '0.5s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[15%] w-3.5 h-3.5 bg-white/10 rounded-full floating-particle" style={{ '--particle-duration': '14s', '--particle-delay': '5s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[48%] w-2 h-2 bg-upisha-teal/10 rounded-full floating-particle" style={{ '--particle-duration': '10s', '--particle-delay': '6s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[62%] w-1 h-1 bg-upisha-gold/30 rounded-full floating-particle" style={{ '--particle-duration': '7s', '--particle-delay': '1s' } as React.CSSProperties} />
        <div className="absolute bottom-[-20px] left-[35%] w-2.5 h-2.5 bg-white/8 rounded-full floating-particle" style={{ '--particle-duration': '15s', '--particle-delay': '7s' } as React.CSSProperties} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroSlides[current].image})` }}
          />
          {/* More dramatic diagonal gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-upisha-navy/95 via-upisha-navy/75 to-upisha-teal/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-upisha-navy/90 via-transparent to-upisha-navy/40" />
          {/* Diagonal accent gradient sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-upisha-teal/20 via-transparent to-upisha-gold/10" />
          {/* Teal-to-gold accent gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-upisha-teal/40 via-upisha-gold/15 to-transparent" />
        </motion.div>
      </AnimatePresence>
      </motion.div>{/* end parallax container */}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1.5 bg-white/10 text-upisha-gold border border-upisha-gold/40 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-semibold mb-5 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 fill-upisha-gold text-upisha-gold" />
                Serving Since 2025
              </motion.div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-[1.1] text-shadow-hero">
                {heroSlides[current].title}
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-upisha-gold to-upisha-teal rounded-full mb-6" />
              <p className="text-base md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl drop-shadow-md typewriter-cursor">
                {heroSlides[current].subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <Button
                  size="lg"
                  className="bg-upisha-gold hover:bg-upisha-gold/90 text-white shadow-xl hover:shadow-2xl transition-all glow-gold text-base px-8 h-12"
                  onClick={() =>
                    document
                      .getElementById(heroSlides[current].ctaLink.slice(1))
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  {heroSlides[current].cta}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  className="border-white/50 text-white/90 hover:bg-white/15 hover:border-white/70 backdrop-blur-sm bg-white/5 h-10 px-5"
                  onClick={() =>
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Learn More
                </Button>
                <button
                  className="w-9 h-9 rounded-full border border-white/30 text-white/70 hover:text-white hover:bg-white/15 hover:border-white/50 flex items-center justify-center transition-all backdrop-blur-sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Uttar Pradesh Speech & Hearing Association',
                        text: 'Learn about UP ISHA - dedicated to excellence in audiology & speech-language pathology.',
                        url: window.location.href,
                      }).catch(() => {})
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      toast({ title: 'Link copied!', description: 'UP ISHA link has been copied to clipboard.' })
                    }
                  }}
                  aria-label="Share this page"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/35 backdrop-blur-md border border-white/20 rounded-full p-2.5 text-white transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/15 hover:bg-white/35 backdrop-blur-md border border-white/20 rounded-full p-2.5 text-white transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-upisha-gold shadow-md shadow-upisha-gold/40' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1 text-white/60 pointer-events-none"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}

