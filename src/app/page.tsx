'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useSpring } from 'framer-motion'
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Users,
  BookOpen,
  FileText,
  Award,
  Camera,
  UserPlus,
  Ear,
  MessageSquare,
  Heart,
  Stethoscope,
  GraduationCap,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Star,
  Briefcase,
  Shield,
  ExternalLink,
  Download,
  Eye,
  Quote,
  Activity,
  Microscope,
  HandHeart,
  TrendingUp,
  Building2,
  Newspaper,
  PlayCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ─── Data ─── */

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Documents', href: '#documents' },
  { label: 'Publications', href: '#publications' },
  { label: 'Professionals', href: '#professionals' },
  { label: 'Join UP ISHA', href: '#join' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact Us', href: '#contact' },
]

const heroSlides = [
  {
    image: '/images/hero-1.png',
    title: 'Uttar Pradesh Speech & Hearing Association',
    subtitle: 'Dedicated to Excellence in Audiology & Speech-Language Pathology',
    cta: 'Join UP ISHA',
    ctaLink: '#join',
  },
  {
    image: '/images/hero-2.png',
    title: 'Empowering Communication',
    subtitle: 'Supporting professionals who transform lives through speech and hearing care',
    cta: 'Find a Professional',
    ctaLink: '#professionals',
  },
  {
    image: '/images/hero-3.png',
    title: 'Together We Advance',
    subtitle: 'Building a stronger community of speech and hearing professionals across UP',
    cta: 'Learn More',
    ctaLink: '#about',
  },
]

const announcements = [
  {
    date: '15 Mar 2025',
    title: 'UP ISHA Annual Conference 2025 - Registration Open',
    type: 'Event',
  },
  {
    date: '28 Feb 2025',
    title: 'Call for Papers - UP Journal of Speech & Hearing',
    type: 'Publication',
  },
  {
    date: '10 Feb 2025',
    title: 'Workshop on Pediatric Audiology - Lucknow Chapter',
    type: 'Workshop',
  },
  {
    date: '25 Jan 2025',
    title: 'New Membership Benefits for 2025 Announced',
    type: 'Announcement',
  },
  {
    date: '15 Jan 2025',
    title: 'Republic Day Special Webinar on Hearing Health',
    type: 'Webinar',
  },
]

const features = [
  {
    icon: BookOpen,
    title: 'UP ISHA Newsletter',
    description:
      'Stay updated with activities, events, and developments from the Uttar Pradesh Speech & Hearing Association.',
  },
  {
    icon: Users,
    title: 'Executive Council',
    description:
      'Meet the dedicated team of professionals governing UP ISHA and guiding its mission forward.',
  },
  {
    icon: GraduationCap,
    title: 'Webinars & Workshops',
    description:
      'Access recordings and schedules of professional development webinars and hands-on workshops.',
  },
  {
    icon: Globe,
    title: 'Regional Chapters',
    description:
      'UP ISHA has chapters across Lucknow, Varanasi, Agra, Kanpur, and other major cities in Uttar Pradesh.',
  },
]

const executiveCouncil = [
  {
    name: 'Dr. Rajesh Kumar Sharma',
    role: 'President',
    image: null,
    speciality: 'Audiology',
  },
  {
    name: 'Dr. Sunita Verma',
    role: 'Vice President',
    image: null,
    speciality: 'Speech-Language Pathology',
  },
  {
    name: 'Dr. Amit Mishra',
    role: 'Secretary',
    image: null,
    speciality: 'Audiology',
  },
  {
    name: 'Dr. Priya Singh',
    role: 'Treasurer',
    image: null,
    speciality: 'Speech-Language Pathology',
  },
  {
    name: 'Dr. Vikram Pandey',
    role: 'Joint Secretary',
    image: null,
    speciality: 'Neuro-Audiology',
  },
  {
    name: 'Dr. Ananya Gupta',
    role: 'Executive Member',
    image: null,
    speciality: 'Pediatric Audiology',
  },
]

const documents = [
  {
    title: 'UP ISHA Constitution & Bye-Laws',
    description: 'Official constitution and bye-laws governing the association',
    category: 'Governance',
    icon: Shield,
  },
  {
    title: 'Scope of Practice - Audiology',
    description: 'Defined scope of practice for audiologists in Uttar Pradesh',
    category: 'Practice',
    icon: Stethoscope,
  },
  {
    title: 'Scope of Practice - Speech-Language Pathology',
    description: 'Defined scope of practice for SLPs in Uttar Pradesh',
    category: 'Practice',
    icon: MessageSquare,
  },
  {
    title: 'Code of Ethics',
    description: 'Professional code of ethics for all UP ISHA members',
    category: 'Governance',
    icon: Award,
  },
  {
    title: 'RCI Guidelines & Notifications',
    description: 'Rehabilitation Council of India regulatory mandates',
    category: 'Regulatory',
    icon: FileText,
  },
  {
    title: 'Clinical Practice Guidelines',
    description: 'Evidence-based guidelines for clinical practice',
    category: 'Practice',
    icon: BookOpen,
  },
]

const publications = [
  {
    title: 'UP Journal of Speech & Hearing',
    description:
      'The official peer-reviewed journal of UP ISHA featuring research articles, case studies, and reviews.',
    type: 'Journal',
    icon: BookOpen,
  },
  {
    title: 'Clinical Monograph Series',
    description:
      'Focused monographs on specialized topics in audiology and speech-language pathology.',
    type: 'Monograph',
    icon: FileText,
  },
  {
    title: 'Research in Uttar Pradesh',
    description:
      'Directory of ongoing and completed research projects in speech and hearing across UP.',
    type: 'Research',
    icon: GraduationCap,
  },
]

const professionalCategories = [
  {
    title: 'Audiology',
    description: 'Find qualified audiologists across Uttar Pradesh',
    icon: Ear,
    count: '250+',
  },
  {
    title: 'Speech-Language Pathology',
    description: 'Connect with certified speech-language pathologists',
    icon: MessageSquare,
    count: '300+',
  },
  {
    title: 'Clinic Accreditation',
    description: 'Locate accredited speech and hearing clinics',
    icon: Briefcase,
    count: '100+',
  },
  {
    title: 'Academic Programs',
    description: 'Universities offering ASLP programs in UP',
    icon: GraduationCap,
    count: '15+',
  },
]

const membershipBenefits = [
  'Access to professional development webinars and workshops',
  'Subscription to UP Journal of Speech & Hearing',
  'Networking opportunities with professionals across UP',
  'Discounted registration for UP ISHA conferences',
  'Access to clinical practice guidelines and resources',
  'Voting rights in association elections',
  'Professional liability insurance guidance',
  'Career advancement and job opportunity notifications',
]

const membershipTypes = [
  {
    type: 'Life Member',
    price: '₹5,000',
    description: 'One-time payment for lifetime membership',
    features: ['All standard benefits', 'Voting rights', 'Conference discounts', 'Journal access'],
    popular: true,
  },
  {
    type: 'Annual Member',
    price: '₹500/year',
    description: 'Annual renewable membership',
    features: ['Standard benefits', 'Journal access', 'Webinar access', 'Networking'],
    popular: false,
  },
  {
    type: 'Student Member',
    price: '₹200/year',
    description: 'For current ASLP students in UP',
    features: ['Student benefits', 'Mentorship program', 'Workshop access', 'Career guidance'],
    popular: false,
  },
]

const galleryImages = [
  { src: '/images/hero-1.png', title: 'Annual Conference 2024', category: 'Events' },
  { src: '/images/hero-2.png', title: 'Pediatric Workshop', category: 'Workshops' },
  { src: '/images/hero-3.png', title: 'Executive Council Meeting', category: 'Meetings' },
  { src: '/images/professionals.png', title: 'World Hearing Day 2024', category: 'Events' },
  { src: '/images/about-illustration.png', title: 'Audiology Awareness Camp', category: 'Outreach' },
  { src: '/images/gallery-cover.png', title: 'SLP Training Session', category: 'Training' },
]

const faqItems = [
  {
    question: 'Who can join UP ISHA?',
    answer:
      'Any professional with a recognized qualification in Audiology and/or Speech-Language Pathology, registered with RCI, and residing or working in Uttar Pradesh is eligible for membership. Students currently enrolled in recognized ASLP programs can apply for student membership.',
  },
  {
    question: 'What are the benefits of UP ISHA membership?',
    answer:
      'UP ISHA members enjoy access to professional development webinars, subscription to our journal, networking opportunities, conference discounts, clinical guidelines, voting rights, and career support among many other benefits.',
  },
  {
    question: 'How do I find a qualified audiologist or SLP in UP?',
    answer:
      'Use our "Locate a Professional" directory to search for RCI-registered audiologists and speech-language pathologists in Uttar Pradesh. You can search by city, speciality, and practice setting.',
  },
  {
    question: 'Does UP ISHA organize continuing education programs?',
    answer:
      'Yes, UP ISHA regularly organizes webinars, workshops, and conferences for continuing education. Check our events calendar and announcements section for upcoming programs.',
  },
  {
    question: 'How can I contribute to the UP Journal of Speech & Hearing?',
    answer:
      'We welcome research articles, case studies, and reviews. Please refer to our "Guidelines to Authors" section in the Publications tab for detailed submission guidelines.',
  },
]

const stats = [
  { value: 550, suffix: '+', label: 'Active Members', icon: Users },
  { value: 20, suffix: '+', label: 'Years of Service', icon: Activity },
  { value: 15, suffix: '+', label: 'Regional Chapters', icon: Globe },
  { value: 50, suffix: '+', label: 'Annual Events', icon: Calendar },
]

const testimonials = [
  {
    name: 'Dr. Meera Tiwari',
    role: 'Senior Audiologist, Lucknow',
    content:
      'UP ISHA has been instrumental in my professional growth. The webinars and conferences have kept me updated with the latest advancements in audiology. The networking opportunities are invaluable.',
    rating: 5,
  },
  {
    name: 'Dr. Sanjay Gupta',
    role: 'Speech-Language Pathologist, Varanasi',
    content:
      'Being a member of UP ISHA has connected me with a wonderful community of professionals. The journal provides excellent research insights, and the workshops are truly enriching.',
    rating: 5,
  },
  {
    name: 'Dr. Kavita Rathore',
    role: 'Pediatric SLP, Kanpur',
    content:
      'The association has given me a platform to contribute to the field. The mentoring program and clinical guidelines have significantly improved my practice. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Dr. Rakesh Pandey',
    role: 'Academic Researcher, Agra',
    content:
      'UP ISHA publications are of exceptional quality. The peer-review process is rigorous, and the journal has helped me share my research with a wider audience across the state.',
    rating: 5,
  },
]

const partners = [
  { name: 'Rehabilitation Council of India', icon: Shield },
  { name: 'All India Institute of Speech & Hearing', icon: Ear },
  { name: 'King George\'s Medical University', icon: Building2 },
  { name: 'AIIMS Delhi', icon: Stethoscope },
  { name: 'Indian Speech-Language & Hearing Association', icon: Globe },
  { name: 'WHO India', icon: Heart },
]

const upcomingWebinars = [
  {
    title: 'Advanced Audiological Assessment in Pediatric Population',
    date: 'March 25, 2025',
    time: '4:00 PM IST',
    speaker: 'Dr. Anita Deshpande',
    duration: '90 min',
  },
  {
    title: 'Tele-Practice in Speech-Language Pathology',
    date: 'April 8, 2025',
    time: '5:00 PM IST',
    speaker: 'Dr. Manoj Kumar',
    duration: '60 min',
  },
  {
    title: 'Cochlear Implant Rehabilitation: Best Practices',
    date: 'April 22, 2025',
    time: '4:30 PM IST',
    speaker: 'Dr. Sunita Verma',
    duration: '75 min',
  },
]

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({
  children,
  className = '',
  id = '',
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─── Top Bar ─── */
function TopBar() {
  return (
    <div className="bg-upisha-navy text-white text-sm py-2">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a
            href="tel:+915224567890"
            className="flex items-center gap-1.5 hover:text-upisha-gold transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            +91-522-456-7890
          </a>
          <a
            href="mailto:info@upisha.org"
            className="flex items-center gap-1.5 hover:text-upisha-gold transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            info@upisha.org
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-upisha-gold transition-colors" aria-label="Facebook">
            <Facebook className="h-4 w-4" />
          </a>
          <a href="#" className="hover:text-upisha-gold transition-colors" aria-label="Twitter">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="#" className="hover:text-upisha-gold transition-colors" aria-label="Instagram">
            <Instagram className="h-4 w-4" />
          </a>
          <a href="#" className="hover:text-upisha-gold transition-colors" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href="#" className="hover:text-upisha-gold transition-colors" aria-label="YouTube">
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar({
  activeSection,
  onNavClick,
}: {
  activeSection: string
  onNavClick: (href: string) => void
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault()
              onNavClick('#home')
            }}
            className="flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-upisha-teal rounded-lg flex items-center justify-center">
              <Ear className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-upisha-navy text-sm md:text-base leading-tight">
                UP ISHA
              </div>
              <div className="text-[10px] md:text-xs text-upisha-teal font-medium leading-tight">
                Speech & Hearing Association
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  onNavClick(link.href)
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeSection === link.href.slice(1)
                    ? 'text-upisha-teal bg-upisha-teal-light'
                    : 'text-gray-600 hover:text-upisha-teal hover:bg-upisha-teal-light/50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Button
              className="hidden md:inline-flex bg-upisha-teal hover:bg-upisha-teal-dark text-white"
              onClick={() => onNavClick('#join')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Now
            </Button>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-white border-t"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavClick(link.href)
                    setIsMobileOpen(false)
                  }}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? 'text-upisha-teal bg-upisha-teal-light'
                      : 'text-gray-600 hover:text-upisha-teal hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-2 bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                onClick={() => {
                  onNavClick('#join')
                  setIsMobileOpen(false)
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Now
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ─── Hero Section ─── */
function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index: number) => setCurrent(index)
  const goPrev = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  const goNext = () => setCurrent((prev) => (prev + 1) % heroSlides.length)

  return (
    <section id="home" className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-upisha-navy/90 via-upisha-navy/70 to-upisha-navy/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-upisha-navy/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

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
                className="inline-flex items-center gap-2 bg-upisha-gold/90 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 fill-white" />
                Serving Since 2005
              </motion.div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {heroSlides[current].title}
              </h1>
              <div className="h-1 w-20 bg-upisha-gold rounded-full mb-6" />
              <p className="text-base md:text-xl text-gray-100 mb-8 leading-relaxed max-w-xl">
                {heroSlides[current].subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={() =>
                    document
                      .getElementById(heroSlides[current].ctaLink.slice(1))
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  {heroSlides[current].cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/70 text-white hover:bg-white/10 backdrop-blur-sm bg-white/5"
                  onClick={() =>
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Learn More
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 text-white transition-all"
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
              i === current ? 'w-8 bg-upisha-gold' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Quick Links ─── */
function QuickLinks() {
  const links = [
    { icon: Ear, label: 'Audiology', href: '#professionals', color: 'bg-teal-500' },
    {
      icon: MessageSquare,
      label: 'Speech Language Pathology',
      href: '#professionals',
      color: 'bg-emerald-600',
    },
    {
      icon: Users,
      label: 'Locate Professional',
      href: '#professionals',
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
              className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 md:p-6 flex flex-col items-center gap-3 text-center transition-all duration-300 hover:-translate-y-1 group"
            >
              <div
                className={`${link.color} w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <link.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-upisha-teal transition-colors">
                {link.label}
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Announcement Section ─── */
function AnnouncementSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Announcements */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-upisha-gold rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-upisha-navy">Announcements</h2>
            </div>
            <div className="space-y-3">
              {announcements.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="shrink-0 w-16 text-center">
                    <div className="bg-upisha-teal-light rounded-lg p-2">
                      <Calendar className="h-5 w-5 text-upisha-teal mx-auto" />
                      <div className="text-xs text-upisha-teal font-medium mt-1">
                        {item.date.split(' ').slice(0, 2).join(' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 group-hover:text-upisha-teal transition-colors text-sm md:text-base">
                      {item.title}
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-xs border-upisha-teal/30 text-upisha-teal"
                  >
                    {item.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mt-4 border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
            >
              View All Announcements
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* News & Events Sidebar */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-8 bg-upisha-teal rounded-full" />
              <h2 className="text-2xl md:text-3xl font-bold text-upisha-navy">News & Events</h2>
            </div>
            <Card className="border-upisha-teal/20">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy">UP ISHACON 2025</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> October 18-20, 2025
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Lucknow, UP
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy">World Hearing Day 2025</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> March 3, 2025
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Across UP
                  </p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-semibold text-upisha-navy">Pediatric SLP Workshop</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> April 12, 2025
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Varanasi, UP
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light"
                >
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Features Section ─── */
function FeaturesSection() {
  return (
    <section className="py-16 md:py-20 bg-upisha-teal-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">What We Offer</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">
            UP ISHA Features
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Discover the resources, services, and community that make UP ISHA the leading
            association for speech and hearing professionals in Uttar Pradesh.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-upisha-teal/10 rounded-2xl flex items-center justify-center group-hover:bg-upisha-teal group-hover:text-white transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-upisha-teal group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-upisha-navy mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                  <Button
                    variant="link"
                    className="mt-3 text-upisha-teal p-0 h-auto font-semibold"
                  >
                    Read More <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── About Section ─── */
function AboutSection() {
  return (
    <AnimatedSection id="about" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/about-illustration.png"
                alt="About UP ISHA"
                className="w-full h-[400px] object-cover"
              />
            </div>
            {/* Stats overlay */}
            <div className="absolute -bottom-6 -right-6 md:right-6 bg-upisha-teal text-white rounded-xl p-5 shadow-lg">
              <div className="text-3xl font-bold">20+</div>
              <div className="text-sm opacity-90">Years of Service</div>
            </div>
            <div className="absolute -top-4 -left-4 md:left-6 bg-upisha-gold text-white rounded-xl p-4 shadow-lg">
              <div className="text-2xl font-bold">550+</div>
              <div className="text-xs opacity-90">Members</div>
            </div>
          </div>

          {/* Content */}
          <div>
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">About Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy mb-6">
              Uttar Pradesh Speech & Hearing Association
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Uttar Pradesh Speech & Hearing Association (UP ISHA) is the premier professional
              body representing audiologists and speech-language pathologists in Uttar Pradesh,
              India. Established in 2005, UP ISHA has been at the forefront of advancing the
              professions of audiology and speech-language pathology in the state.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our mission is to promote the highest standards of professional practice, foster
              research and education, advocate for persons with communication disorders, and serve
              as a unified voice for speech and hearing professionals across Uttar Pradesh.
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-upisha-teal-light rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-upisha-teal" />
                  <h4 className="font-bold text-upisha-navy">Our Mission</h4>
                </div>
                <p className="text-sm text-gray-600">
                  To advance the science and practice of audiology and speech-language pathology,
                  and to advocate for individuals with communication disorders.
                </p>
              </div>
              <div className="bg-upisha-gold-light rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-5 w-5 text-upisha-gold" />
                  <h4 className="font-bold text-upisha-navy">Our Vision</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Every individual in Uttar Pradesh has access to quality speech and hearing
                  healthcare services provided by qualified professionals.
                </p>
              </div>
            </div>

            <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
              Learn More <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* President's Message */}
        <div className="mt-16 md:mt-20">
          <Card className="border-upisha-teal/20 bg-gradient-to-r from-upisha-teal-light to-white">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="w-24 h-24 rounded-full bg-upisha-teal/20 flex items-center justify-center">
                    <Users className="h-12 w-12 text-upisha-teal" />
                  </div>
                </div>
                <div>
                  <Badge className="bg-upisha-gold text-white mb-3">President&apos;s Message</Badge>
                  <h3 className="text-xl font-bold text-upisha-navy mb-3">
                    Dr. Rajesh Kumar Sharma
                  </h3>
                  <p className="text-gray-600 leading-relaxed italic mb-4">
                    &ldquo;It is my privilege to serve as the President of UP ISHA. Our association
                    continues to grow and strengthen, uniting professionals across Uttar Pradesh in
                    our shared commitment to improving communication health. Together, we can ensure
                    that every person with a speech or hearing challenge receives the care they
                    deserve. I invite you to join us in this noble mission.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 text-upisha-teal font-medium">
                    <Star className="h-4 w-4" />
                    President, UP ISHA
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Council */}
        <div className="mt-16 md:mt-20">
          <div className="text-center mb-10">
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Leadership</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">Executive Council</h2>
            <p className="text-gray-500 mt-3">
              Meet the dedicated professionals leading UP ISHA
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {executiveCouncil.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="pt-6 pb-6">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                      <Users className="h-10 w-10 text-upisha-teal group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="font-bold text-upisha-navy">{member.name}</h4>
                    <p className="text-upisha-teal font-medium text-sm">{member.role}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {member.speciality}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Documents Section ─── */
function DocumentsSection() {
  return (
    <AnimatedSection id="documents" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Resources</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">
            Documents & Resources
          </h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Access official documents, practice guidelines, regulatory mandates, and professional
            resources for speech and hearing practitioners.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border-l-4 border-l-upisha-teal">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                      <doc.icon className="h-6 w-6 text-upisha-teal group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="text-xs border-upisha-gold/30 text-upisha-gold mb-2"
                      >
                        {doc.category}
                      </Badge>
                      <h4 className="font-bold text-upisha-navy mb-1 group-hover:text-upisha-teal transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-sm text-gray-500">{doc.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    className="mt-4 text-upisha-teal p-0 h-auto font-semibold"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Publications Section ─── */
function PublicationsSection() {
  return (
    <AnimatedSection id="publications" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-gold/10 text-upisha-gold mb-3">Research & Knowledge</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">Publications</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Explore our journal, monographs, and research contributions that advance the field of
            speech and hearing sciences.
          </p>
        </div>

        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="mx-auto flex w-fit bg-upisha-teal-light">
            <TabsTrigger
              value="journal"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Journal
            </TabsTrigger>
            <TabsTrigger
              value="monograph"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Monograph
            </TabsTrigger>
            <TabsTrigger
              value="research"
              className="data-[state=active]:bg-upisha-teal data-[state=active]:text-white"
            >
              Research
            </TabsTrigger>
          </TabsList>
          <TabsContent value="journal" className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-upisha-teal/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-8 w-8 text-upisha-teal" />
                    <div>
                      <h3 className="font-bold text-upisha-navy text-lg">
                        UP Journal of Speech & Hearing
                      </h3>
                      <p className="text-sm text-gray-500">Official Peer-Reviewed Journal</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    The UP Journal of Speech & Hearing is the official peer-reviewed publication of
                    UP ISHA, featuring original research, case studies, clinical reports, and review
                    articles in audiology and speech-language pathology.
                  </p>
                  <div className="space-y-2 mb-4">
                    <h4 className="font-semibold text-upisha-navy text-sm">Current Issue Highlights:</h4>
                    <ul className="space-y-1.5">
                      <li className="text-sm text-gray-600 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Effectiveness of Tele-Audiology in Rural UP
                      </li>
                      <li className="text-sm text-gray-600 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Language Development in Hindi-Speaking Children
                      </li>
                      <li className="text-sm text-gray-600 flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-upisha-teal shrink-0 mt-0.5" />
                        Cochlear Implant Outcomes: A 5-Year Review
                      </li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" className="bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                      <Eye className="h-4 w-4 mr-1" />
                      Current Issue
                    </Button>
                    <Button size="sm" variant="outline" className="border-upisha-teal text-upisha-teal">
                      <FileText className="h-4 w-4 mr-1" />
                      Previous Issues
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-upisha-gold/20 bg-upisha-gold-light/30">
                <CardContent className="p-6">
                  <h3 className="font-bold text-upisha-navy mb-4">Call for Papers</h3>
                  <p className="text-gray-600 mb-4">
                    We invite researchers, clinicians, and academicians to submit original research
                    articles, case studies, and reviews for publication in the UP Journal of Speech
                    & Hearing.
                  </p>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-upisha-gold" />
                      Submission Deadline: June 30, 2025
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4 text-upisha-gold" />
                      Follow APA 7th Edition formatting
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Send className="h-4 w-4 text-upisha-gold" />
                      Submit to: editor@upisha.org
                    </div>
                  </div>
                  <Button size="sm" className="bg-upisha-gold hover:bg-upisha-gold/90 text-white">
                    <Download className="h-4 w-4 mr-1" />
                    Author Guidelines
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="monograph" className="mt-8">
            <Card className="border-upisha-teal/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-8 w-8 text-upisha-teal" />
                  <div>
                    <h3 className="font-bold text-upisha-navy text-lg">Clinical Monograph Series</h3>
                    <p className="text-sm text-gray-500">Specialized Topic Publications</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Our monograph series provides in-depth coverage of specialized topics in audiology
                  and speech-language pathology, authored by leading experts in the field.
                </p>
                <div className="space-y-3">
                  {[
                    'Pediatric Audiology Assessment in Hindi-Speaking Populations',
                    'Neurogenic Communication Disorders: Clinical Management',
                    'Aural Rehabilitation for Adult Cochlear Implant Users',
                  ].map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-upisha-teal-light/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{title}</span>
                      <Button variant="ghost" size="sm" className="text-upisha-teal">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="research" className="mt-8">
            <Card className="border-upisha-teal/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="h-8 w-8 text-upisha-teal" />
                  <div>
                    <h3 className="font-bold text-upisha-navy text-lg">
                      Research in Uttar Pradesh
                    </h3>
                    <p className="text-sm text-gray-500">Ongoing & Completed Research</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Browse the directory of research projects being conducted in the field of speech
                  and hearing across Uttar Pradesh. Submit your research for inclusion.
                </p>
                <div className="space-y-3">
                  {[
                    'Prevalence of Hearing Loss in School Children of Lucknow District',
                    'Effectiveness of Early Intervention for Speech Sound Disorders',
                    'Tele-Practice Feasibility Study for Rural Communities in UP',
                  ].map((title, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-upisha-teal-light/50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{title}</span>
                      <Button variant="ghost" size="sm" className="text-upisha-teal">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedSection>
  )
}

/* ─── Professionals Section ─── */
function ProfessionalsSection() {
  return (
    <AnimatedSection id="professionals" className="py-16 md:py-20 bg-upisha-navy">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/20 text-upisha-teal mb-3">Find Experts</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Professionals Directory</h2>
          <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
            Locate qualified audiologists, speech-language pathologists, and accredited clinics
            across Uttar Pradesh.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {professionalCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-upisha-navy-light border-upisha-navy-light hover:border-upisha-teal transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-upisha-teal/20 rounded-2xl flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                    <cat.icon className="h-8 w-8 text-upisha-teal group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{cat.description}</p>
                  <div className="text-3xl font-bold text-upisha-teal">{cat.count}</div>
                  <p className="text-xs text-gray-500">Professionals Listed</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
                  >
                    Search <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Locate Professional Search */}
        <Card className="mt-12 bg-upisha-navy-light border-upisha-navy-light">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-upisha-teal" />
              Locate a Professional
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">City</label>
                <Input
                  placeholder="Enter city name..."
                  className="bg-upisha-navy border-upisha-navy-light text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Speciality</label>
                <Input
                  placeholder="Audiology / SLP"
                  className="bg-upisha-navy border-upisha-navy-light text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedSection>
  )
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/* ─── Join UP ISHA Section ─── */
function JoinSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    rciNumber: '',
    membershipType: '',
    city: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.membershipType) {
      alert('Please select a membership type')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatedSection id="join" className="py-16 md:py-20 bg-upisha-teal-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Membership</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">Join UP ISHA</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Become a member of the leading professional body for speech and hearing professionals in
            Uttar Pradesh.
          </p>
        </div>

        {/* Membership Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {membershipTypes.map((plan, i) => (
            <motion.div
              key={plan.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`h-full relative ${
                  plan.popular
                    ? 'border-upisha-teal shadow-lg scale-[1.02]'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-upisha-teal text-white">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-upisha-navy text-lg">{plan.type}</h3>
                  <div className="my-4">
                    <span className="text-3xl font-bold text-upisha-teal">{plan.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <ul className="space-y-2 text-left mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-upisha-teal shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-upisha-teal hover:bg-upisha-teal-dark text-white'
                        : 'bg-white border-upisha-teal text-upisha-teal hover:bg-upisha-teal-light'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Membership Benefits */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold text-upisha-navy mb-6">Membership Benefits</h3>
            <div className="space-y-3">
              {membershipBenefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <Card className="border-upisha-teal/20">
            <CardHeader>
              <CardTitle className="text-upisha-navy flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-upisha-teal" />
                Membership Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-upisha-teal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-upisha-navy mb-2">
                    Application Submitted!
                  </h3>
                  <p className="text-gray-500">
                    Thank you for your interest in joining UP ISHA. We will review your application
                    and get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Full Name *
                      </label>
                      <Input
                        required
                        placeholder="Dr. Your Name"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Phone *
                      </label>
                      <Input
                        required
                        type="tel"
                        placeholder="+91-XXXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        City *
                      </label>
                      <Input
                        required
                        placeholder="Lucknow"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Qualification *
                      </label>
                      <Input
                        required
                        placeholder="M.Sc. (Audiology)"
                        value={formData.qualification}
                        onChange={(e) =>
                          setFormData({ ...formData, qualification: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        RCI Registration No.
                      </label>
                      <Input
                        placeholder="RCI Number"
                        value={formData.rciNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, rciNumber: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Membership Type *
                    </label>
                    <Select
                      value={formData.membershipType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, membershipType: value })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select membership type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="life">Life Member - ₹5,000</SelectItem>
                        <SelectItem value="annual">Annual Member - ₹500/year</SelectItem>
                        <SelectItem value="student">Student Member - ₹200/year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Additional Message
                    </label>
                    <Textarea
                      placeholder="Any additional information..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div>
          <h3 className="text-2xl font-bold text-upisha-navy mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white rounded-lg border px-4"
                >
                  <AccordionTrigger className="text-left font-semibold text-upisha-navy hover:text-upisha-teal">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Gallery Section ─── */
function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', 'Events', 'Workshops', 'Meetings', 'Outreach', 'Training']
  const filteredImages =
    filter === 'All' ? galleryImages : galleryImages.filter((img) => img.category === filter)

  return (
    <AnimatedSection id="gallery" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Visual Stories</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">Gallery</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Browse through our collection of photos from events, workshops, conferences, and
            community activities.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              className={
                filter === cat
                  ? 'bg-upisha-teal text-white'
                  : 'border-upisha-teal/30 text-upisha-teal hover:bg-upisha-teal-light'
              }
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map((img, i) => (
            <motion.div
              key={img.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer relative overflow-hidden rounded-xl"
              onClick={() => setSelectedImage(img.src)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <h4 className="text-white font-semibold text-sm">{img.title}</h4>
                  <Badge className="bg-white/20 text-white text-xs mt-1">{img.category}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
            <DialogHeader className="sr-only">
              <DialogTitle>Gallery Image</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Gallery"
                className="w-full max-h-[80vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedSection>
  )
}

/* ─── Contact Section ─── */
function ContactSection() {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatedSection id="contact" className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">Get in Touch</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy">Contact Us</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
            Have questions or need assistance? We&apos;re here to help. Reach out to us through any
            of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-upisha-teal/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-upisha-navy text-lg mb-6">Contact Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-upisha-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-upisha-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Office Address</h4>
                      <p className="text-sm text-gray-500">
                        Department of Audiology & Speech-Language Pathology
                        <br />
                        King George&apos;s Medical University
                        <br />
                        Lucknow, Uttar Pradesh - 226003
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-upisha-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-upisha-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone</h4>
                      <p className="text-sm text-gray-500">+91-522-456-7890</p>
                      <p className="text-sm text-gray-500">+91-522-456-7891</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-upisha-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-upisha-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Email</h4>
                      <p className="text-sm text-gray-500">info@upisha.org</p>
                      <p className="text-sm text-gray-500">secretary@upisha.org</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-upisha-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-upisha-teal" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Office Hours</h4>
                      <p className="text-sm text-gray-500">
                        Monday - Friday: 9:00 AM - 5:00 PM
                      </p>
                      <p className="text-sm text-gray-500">Saturday: 9:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-upisha-teal/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-upisha-navy text-lg mb-4">Follow Us</h3>
                <div className="flex gap-3">
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
                      className="w-10 h-10 bg-upisha-teal/10 rounded-lg flex items-center justify-center hover:bg-upisha-teal hover:text-white transition-all group"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5 text-upisha-teal group-hover:text-white" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-upisha-teal/20">
            <CardHeader>
              <CardTitle className="text-upisha-navy flex items-center gap-2">
                <Send className="h-5 w-5 text-upisha-teal" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-upisha-teal mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-upisha-navy mb-2">Message Sent!</h3>
                  <p className="text-gray-500">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Name *
                      </label>
                      <Input
                        required
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Email *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Subject *
                    </label>
                    <Input
                      required
                      placeholder="How can we help?"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, subject: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Message *
                    </label>
                    <Textarea
                      required
                      placeholder="Your message..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      rows={5}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-upisha-teal hover:bg-upisha-teal-dark text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-upisha-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-upisha-teal rounded-lg flex items-center justify-center">
                <Ear className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">UP ISHA</div>
                <div className="text-xs text-gray-400">Speech & Hearing Association</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The Uttar Pradesh Speech & Hearing Association is dedicated to advancing audiology and
              speech-language pathology in Uttar Pradesh, India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-upisha-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us', 'Documents', 'Publications', 'Professionals'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s/g, '')}`}
                    className="text-sm text-gray-400 hover:text-upisha-teal transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Membership */}
          <div>
            <h4 className="font-semibold text-upisha-gold mb-4">Membership</h4>
            <ul className="space-y-2">
              {['Join UP ISHA', 'Member Benefits', 'Life Membership', 'Student Membership'].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#join"
                      className="text-sm text-gray-400 hover:text-upisha-teal transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-upisha-gold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                KGMU, Lucknow, UP - 226003
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                +91-522-456-7890
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                info@upisha.org
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
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-upisha-teal transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-upisha-teal transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Scroll Progress Indicator ─── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-upisha-gold origin-left z-[60]"
      style={{ scaleX }}
    />
  )
}

/* ─── Back to Top Button ─── */
function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-lg flex items-center justify-center transition-colors group"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/* ─── Animated Counter ─── */
function AnimatedCounter({
  value,
  suffix = '',
  duration = 2,
}: {
  value: number
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(value)
    }
    requestAnimationFrame(animate)
  }, [isInView, value, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/* ─── Stats Section ─── */
function StatsSection() {
  return (
    <section className="py-12 md:py-16 bg-upisha-navy relative overflow-hidden">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 bg-upisha-teal/20 rounded-2xl flex items-center justify-center">
                <stat.icon className="h-7 w-7 md:h-8 md:w-8 text-upisha-teal" />
              </div>
              <div className="text-3xl md:text-5xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Webinars Section ─── */
function WebinarsSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-upisha-teal-light via-white to-upisha-gold-light">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <Badge className="bg-upisha-teal/10 text-upisha-teal mb-3">
              <PlayCircle className="h-3 w-3 mr-1" />
              Upcoming Webinars
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-upisha-navy mb-4">
              Learn from Experts
            </h2>
            <p className="text-gray-600 mb-6">
              Join our live webinar series featuring leading experts in audiology and
              speech-language pathology. All webinars are free for UP ISHA members.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Free for UP ISHA members
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Certificate of attendance
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-upisha-teal" />
                Recorded sessions available
              </div>
            </div>
            <Button className="mt-6 bg-upisha-teal hover:bg-upisha-teal-dark text-white">
              View All Webinars
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {upcomingWebinars.map((webinar, i) => (
              <motion.div
                key={webinar.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group border-l-4 border-l-upisha-teal">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-14 h-14 bg-upisha-teal/10 rounded-xl flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                        <PlayCircle className="h-7 w-7 text-upisha-teal group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-upisha-navy mb-1 group-hover:text-upisha-teal transition-colors">
                          {webinar.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">
                          Speaker: <span className="font-medium">{webinar.speaker}</span>
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-upisha-gold" />
                            {webinar.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-upisha-gold" />
                            {webinar.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-upisha-gold" />
                            {webinar.duration}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
                      >
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials Section ─── */
function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 md:py-20 bg-upisha-navy relative overflow-hidden">
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

        <div className="relative min-h-[260px] md:min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
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
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
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
    </section>
  )
}

/* ─── Partners Section ─── */
function PartnersSection() {
  return (
    <section className="py-12 md:py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Affiliated & Collaborating Organizations
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-2 text-center group cursor-pointer p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                <partner.icon className="h-6 w-6 text-upisha-teal group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs text-gray-600 font-medium leading-tight">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Main Page ─── */
export default function Home() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map((l) => l.href.slice(1))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const id = href.slice(1)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <TopBar />
      <Navbar activeSection={activeSection} onNavClick={handleNavClick} />
      <main className="flex-1">
        <HeroSection />
        <QuickLinks />
        <AnnouncementSection />
        <FeaturesSection />
        <AboutSection />
        <StatsSection />
        <DocumentsSection />
        <PublicationsSection />
        <WebinarsSection />
        <ProfessionalsSection />
        <JoinSection />
        <TestimonialsSection />
        <GallerySection />
        <PartnersSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
