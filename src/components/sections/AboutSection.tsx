'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedSection } from '@/components/sections'
import { Badge } from '@/components/ui/badge'
import { executiveCouncil } from '@/lib/static-data'
import { useAutoAdvance } from '@/lib/hooks/useAutoAdvance'

/* ─── Leadership Messages (President & Secretary) ─── */
interface LeadershipSlide {
  id: string
  badge: string
  name: string
  role: string
  image: string
  alt: string
  excerpt: ReactNode
  fullBody?: ReactNode
}

const leadershipMessages: LeadershipSlide[] = [
  {
    id: 'president',
    badge: "President's Message",
    name: 'Mr. Bhupendra Kumar Mishra',
    role: 'President, UP ISHA',
    image: '/images/President.jpeg',
    alt: 'Mr. Bhupendra Kumar Mishra',
    excerpt: (
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-base mb-4">
        &ldquo;It is my privilege to serve as the President of UP ISHA. Our association
        continues to grow and strengthen, uniting professionals across Uttar Pradesh in
        our shared commitment to improving communication health. Together, we can ensure
        that every person with a speech or hearing challenge receives the care they
        deserve. I invite you to join us in this noble mission.&rdquo;
      </p>
    ),
  },
  {
    id: 'secretary',
    badge: "Secretary's Message",
    name: 'Mr. Priyaveer Chauhan',
    role: 'Secretary, UP ISHA',
    image: '/images/Secretary.jpeg',
    alt: 'Mr. Priyaveer Chauhan',
    excerpt: (
      <>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-base mb-4">
          &ldquo;It is my privilege to serve as the Secretary of UP-ISHA and to work
          alongside dedicated professionals committed to advancing the field of Speech
          and Hearing Sciences.&rdquo;
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-4">
          We believe that continuous learning, sharing of expertise, and staying
          updated with scientific advancements are the foundation of excellence.
          Through academic initiatives, professional development, and collaborative
          learning, UP-ISHA strives to create a platform where knowledge translates
          into better clinical decisions and better patient outcomes.
        </p>
      </>
    ),
    fullBody: (
      <>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic text-base mb-4">
          &ldquo;It is my privilege to serve as the Secretary of UP-ISHA and to work
          alongside dedicated professionals committed to advancing the field of Speech
          and Hearing Sciences.&rdquo;
        </p>
        <div className="border-l-4 border-upisha-gold bg-upisha-gold/5 dark:bg-upisha-gold/10 rounded-r-lg px-4 py-3 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-upisha-gold mb-1">Core Motto</p>
          <p className="italic text-gray-600 dark:text-gray-300 text-base">
            &ldquo;Working Together for Excellence in Speech and Hearing Sciences&rdquo;
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-4">
          Our vision is simple yet meaningful — to promote excellence in knowledge,
          clinical practice, and professional collaboration so that every patient
          receives the best possible care and outcomes.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-4">
          We believe that continuous learning, sharing of expertise, and staying
          updated with scientific advancements are the foundation of excellence.
          Through academic initiatives, professional development, and collaborative
          learning, UP-ISHA strives to create a platform where knowledge translates
          into better clinical decisions and better patient outcomes.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-4">
          Our mission becomes even more meaningful when it comes to children with
          special needs. Every child deserves the right intervention, at the right
          time, from a knowledgeable and compassionate professional. By strengthening
          our knowledge and skills, we can make a lasting difference in their
          communication, development, confidence, and quality of life.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-4">
          Together, let us learn, grow, share, and serve — because excellence in
          knowledge today creates excellence in care tomorrow.
        </p>
        <p className="text-sm font-semibold text-upisha-navy dark:text-white mb-1">
          — Secretary, UP-ISHA
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Working Together for Excellence in Speech and Hearing Sciences
        </p>
      </>
    ),
  },
]

/* ─── About Section ─── */
export function AboutSection() {
  const [isPaused, setIsPaused] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [current, setCurrent] = useAutoAdvance(leadershipMessages.length, {
    intervalMs: 4000,
    isPaused: isPaused || expanded,
  })

  // Collapse the expanded message when the carousel moves to another slide
  useEffect(() => {
    setExpanded(false)
  }, [current])

  // Hover-pause should only apply on devices with a real mouse/trackpad.
  // On touch screens a tap synthesizes mouseenter without a matching
  // mouseleave, which would latch the carousel in a permanently paused state.
  const canHover = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(hover: hover)').matches : false),
    []
  )

  // ── Executive Council carousel ──
  const goNext = () => setCurrent((prev) => (prev + 1) % leadershipMessages.length)
  const goPrev = () => setCurrent((prev) => (prev - 1 + leadershipMessages.length) % leadershipMessages.length)

  const [councilIsPaused, setCouncilIsPaused] = useState(false)
  const [perView, setPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setPerView(width < 640 ? 1 : width < 1024 ? 2 : 3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalCouncilPages = Math.ceil(executiveCouncil.length / perView)
  const [councilPage, setCouncilPage] = useAutoAdvance(totalCouncilPages, { intervalMs: 4000, isPaused: councilIsPaused })

  // Keep the page index valid when the number of cards per view changes on resize
  useEffect(() => {
    setCouncilPage((prev) => (prev >= totalCouncilPages ? 0 : prev))
  }, [totalCouncilPages])

  const goCouncilNext = () => setCouncilPage((prev) => (prev + 1) % totalCouncilPages)
  const goCouncilPrev = () => setCouncilPage((prev) => (prev - 1 + totalCouncilPages) % totalCouncilPages)

  return (
    <AnimatedSection id="about" className="py-16 md:py-20 bg-white dark:bg-gray-900 section-pattern">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/about-illustration.png"
                alt="About UP ISHA"
                loading="lazy"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Stats overlay - improved dark mode */}
            <div className="absolute -bottom-6 -right-6 md:right-6 bg-upisha-teal text-white rounded-xl p-5 shadow-lg ring-4 ring-white/20 dark:ring-gray-900/20">
              <div className="text-3xl font-bold">1+</div>
              <div className="text-sm opacity-90">Years of Service</div>
            </div>
            <div className="absolute -top-4 -left-4 md:left-6 bg-upisha-gold text-white rounded-xl p-4 shadow-lg ring-4 ring-white/20 dark:ring-gray-900/20">
              <div className="text-2xl font-bold">550+</div>
              <div className="text-xs opacity-90">Members</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">About Us</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white mb-6">
              Uttar Pradesh Indian Speech & Hearing Association
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-upisha-teal to-upisha-gold rounded-full mb-6" />
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
              The Uttar Pradesh Indian Speech & Hearing Association (UP ISHA) is the premier professional
              body representing audiologists and speech-language pathologists in Uttar Pradesh,
              India. Established in 2025, UP ISHA has been at the forefront of advancing the
              professions of audiology and speech-language pathology in the state.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
              Our mission is to promote the highest standards of professional practice, foster
              research and education, advocate for persons with communication disorders, and serve
              as a unified voice for speech and hearing professionals across Uttar Pradesh.
            </p>

            {/* Mission & Vision - enhanced cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-upisha-teal-light to-white dark:from-upisha-teal/20 dark:to-gray-800 rounded-xl p-5 border border-upisha-teal/10 dark:border-upisha-teal/20 card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-upisha-teal/15 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-upisha-teal" />
                  </div>
                  <h4 className="font-bold text-upisha-navy dark:text-white">Our Mission</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  To advance the science and practice of audiology and speech-language pathology,
                  and to advocate for individuals with communication disorders.
                </p>
              </div>
              <div className="bg-gradient-to-br from-upisha-gold-light to-white dark:from-upisha-gold/15 dark:to-gray-800 rounded-xl p-5 border border-upisha-gold/10 dark:border-upisha-gold/20 card-lift">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-upisha-gold/15 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-upisha-gold" />
                  </div>
                  <h4 className="font-bold text-upisha-navy dark:text-white">Our Vision</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Every individual in Uttar Pradesh has access to quality speech and hearing
                  healthcare services provided by qualified professionals.
                </p>
              </div>
             </div>
           </div>
        </div>

        {/* Leadership Messages Carousel */}
        <div
          className="mt-16 md:mt-20 relative"
          onMouseEnter={() => canHover && setIsPaused(true)}
          onMouseLeave={() => canHover && setIsPaused(false)}
        >
          {/* Prev arrow */}
          <button
            onClick={goPrev}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-upisha-teal/40 shadow-lg text-upisha-teal hover:bg-upisha-teal hover:text-white flex items-center justify-center transition-colors"
            aria-label="Previous leadership message"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {/* Next arrow */}
          <button
            onClick={goNext}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-upisha-teal/40 shadow-lg text-upisha-teal hover:bg-upisha-teal hover:text-white flex items-center justify-center transition-colors"
            aria-label="Next leadership message"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <Card className="border-upisha-teal/20 dark:bg-gray-800 dark:border-gray-700 card-gradient-top overflow-hidden">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={leadershipMessages[current].id}
                  initial={{ opacity: 0, x: 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -60 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row"
                >
                  {/* Left: Avatar area with gradient bg */}
                  <div className="md:w-64 shrink-0 bg-gradient-to-br from-upisha-teal/10 to-upisha-gold/10 dark:from-upisha-teal/20 dark:to-upisha-gold/15 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg mb-3">
                      <img
                        src={leadershipMessages[current].image}
                        alt={leadershipMessages[current].alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <h4 className="font-bold text-upisha-navy dark:text-white text-sm">
                      {leadershipMessages[current].name}
                    </h4>
                    <p className="text-xs text-upisha-teal font-medium flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-upisha-gold text-upisha-gold" />
                      {leadershipMessages[current].role}
                    </p>
                    <a
                      href={`mailto:${leadershipMessages[current].id === 'president' ? 'pres.up@upisha.org' : 'secretary@upisha.org'}`}
                      className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-upisha-teal dark:hover:text-upisha-teal transition-colors flex items-center gap-1 mt-2"
                    >
                      <Mail className="h-3 w-3" />
                      {leadershipMessages[current].id === 'president' ? 'pres.up@upisha.org' : 'secretary@upisha.org'}
                    </a>
                  </div>
                  {/* Right: Message content */}
                  <div className="flex-1 p-6 md:p-8">
                    <Badge className="bg-upisha-gold text-white mb-4">
                      {leadershipMessages[current].badge}
                    </Badge>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35 }}
                    >
                      {expanded && leadershipMessages[current].fullBody
                        ? leadershipMessages[current].fullBody
                        : leadershipMessages[current].excerpt}
                    </motion.div>
                    {leadershipMessages[current].fullBody && (
                      <div className="mb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-expanded={expanded}
                          aria-controls={`leadership-message-${leadershipMessages[current].id}`}
                          onClick={() => setExpanded((e) => !e)}
                          className="border-upisha-teal/40 text-upisha-teal hover:bg-upisha-teal hover:text-white dark:border-upisha-teal/60 dark:text-upisha-teal dark:hover:bg-upisha-teal dark:hover:text-white transition-colors"
                        >
                          {expanded ? 'Show Less' : 'Read Full Message'}
                          {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-upisha-teal/20 to-transparent" />
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Est. 2025</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slide dots */}
              <div className="flex justify-center gap-2 pt-6 pb-1">
                {leadershipMessages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-upisha-gold' : 'w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-upisha-teal'
                    }`}
                    aria-label={`Go to message ${i + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Council */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10">
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Leadership</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-upisha-navy dark:text-white">Executive Council</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Meet the dedicated professionals leading UP ISHA
            </p>
          </div>
          <div
            className="relative"
            onMouseEnter={() => canHover && setCouncilIsPaused(true)}
            onMouseLeave={() => canHover && setCouncilIsPaused(false)}
          >
            {/* Prev arrow */}
            {totalCouncilPages > 1 && (
              <button
                onClick={goCouncilPrev}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-upisha-teal/40 shadow-lg text-upisha-teal hover:bg-upisha-teal hover:text-white flex items-center justify-center transition-colors"
                aria-label="Previous council page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {/* Next arrow */}
            {totalCouncilPages > 1 && (
              <button
                onClick={goCouncilNext}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-upisha-teal/40 shadow-lg text-upisha-teal hover:bg-upisha-teal hover:text-white flex items-center justify-center transition-colors"
                aria-label="Next council page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={councilPage}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {executiveCouncil
                    .slice(councilPage * perView, councilPage * perView + perView)
                    .map((member) => (
                      <Card key={member.name} className="text-center hover:shadow-lg transition-all duration-300 group overflow-hidden dark:bg-gray-800 dark:border-gray-700 card-gradient-top card-gradient-border card-lift">
                        <CardContent className="pt-6 pb-6">
                          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-upisha-teal/10 group-hover:border-upisha-teal transition-colors shadow-sm">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full gradient-avatar text-2xl">
                                {member.name.split(' ').filter(w => w.length > 1).slice(-2).map(w => w[0]).join('')}
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-upisha-navy dark:text-white">{member.name}</h4>
                          <p className="text-upisha-teal font-medium text-sm">{member.role}</p>
                          <Badge variant="outline" className="mt-2 text-xs dark:border-gray-600 dark:text-gray-300">
                            {member.speciality}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Page dots */}
            {totalCouncilPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalCouncilPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCouncilPage(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === councilPage ? 'w-8 bg-upisha-gold' : 'w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-upisha-teal'
                    }`}
                    aria-label={`Go to council page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

