'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  ChevronDown,
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
  Sun,
  Moon,
  Bell,
  Timer,
  Sparkles,
  Search,
  AlertCircle,
  Megaphone,
  Lightbulb,
  Trophy,
  MapPinned,
  Command,
  Share2,
  Printer,
  PhoneCall,
  Building,
  Mailbox,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
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
    image: '/images/avatar-president.png',
    speciality: 'Audiology',
  },
  {
    name: 'Dr. Sunita Verma',
    role: 'Vice President',
    image: '/images/avatar-vp.png',
    speciality: 'Speech-Language Pathology',
  },
  {
    name: 'Dr. Amit Mishra',
    role: 'Secretary',
    image: '/images/avatar-secretary.png',
    speciality: 'Audiology',
  },
  {
    name: 'Dr. Priya Singh',
    role: 'Treasurer',
    image: '/images/avatar-treasurer.png',
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

/* Sample professional directory data */
const sampleProfessionals = [
  {
    name: 'Dr. Rajesh Kumar Sharma',
    speciality: 'Audiology',
    city: 'Lucknow',
    qualification: 'Ph.D. (Audiology), AIISH Mysuru',
    experience: '22 years',
    setting: 'Hospital',
    rci: 'A-12345',
  },
  {
    name: 'Dr. Sunita Verma',
    speciality: 'Speech-Language Pathology',
    city: 'Lucknow',
    qualification: 'Ph.D. (SLP), KGMU',
    experience: '18 years',
    setting: 'Hospital',
    rci: 'B-23456',
  },
  {
    name: 'Dr. Amit Mishra',
    speciality: 'Audiology',
    city: 'Varanasi',
    qualification: 'M.Sc. (Audiology), AIISH',
    experience: '15 years',
    setting: 'Clinic',
    rci: 'A-34567',
  },
  {
    name: 'Dr. Priya Singh',
    speciality: 'Speech-Language Pathology',
    city: 'Kanpur',
    qualification: 'M.Sc. (SLP), AIISH',
    experience: '12 years',
    setting: 'Clinic',
    rci: 'B-45678',
  },
  {
    name: 'Dr. Vikram Pandey',
    speciality: 'Neuro-Audiology',
    city: 'Agra',
    qualification: 'Ph.D. (Neuro-Audiology), AIIMS',
    experience: '20 years',
    setting: 'Hospital',
    rci: 'A-56789',
  },
  {
    name: 'Dr. Ananya Gupta',
    speciality: 'Pediatric Audiology',
    city: 'Lucknow',
    qualification: 'M.Sc. (Audiology), KGMU',
    experience: '10 years',
    setting: 'Clinic',
    rci: 'A-67890',
  },
  {
    name: 'Dr. Meera Tiwari',
    speciality: 'Audiology',
    city: 'Lucknow',
    qualification: 'Ph.D. (Audiology), AIISH',
    experience: '25 years',
    setting: 'Hospital',
    rci: 'A-78901',
  },
  {
    name: 'Dr. Sanjay Gupta',
    speciality: 'Speech-Language Pathology',
    city: 'Varanasi',
    qualification: 'M.Sc. (SLP), AIISH',
    experience: '14 years',
    setting: 'Academic',
    rci: 'B-89012',
  },
  {
    name: 'Dr. Kavita Rathore',
    speciality: 'Speech-Language Pathology',
    city: 'Kanpur',
    qualification: 'M.Sc. (SLP), KGMU',
    experience: '11 years',
    setting: 'Clinic',
    rci: 'B-90123',
  },
  {
    name: 'Dr. Rakesh Pandey',
    speciality: 'Audiology',
    city: 'Agra',
    qualification: 'Ph.D. (Audiology), AIIMS',
    experience: '19 years',
    setting: 'Academic',
    rci: 'A-01234',
  },
  {
    name: 'Dr. Neha Saxena',
    speciality: 'Speech-Language Pathology',
    city: 'Gorakhpur',
    qualification: 'M.Sc. (SLP), AIISH',
    experience: '8 years',
    setting: 'Clinic',
    rci: 'B-11223',
  },
  {
    name: 'Dr. Arjun Yadav',
    speciality: 'Audiology',
    city: 'Allahabad',
    qualification: 'M.Sc. (Audiology), AIISH',
    experience: '13 years',
    setting: 'Hospital',
    rci: 'A-22334',
  },
]

const upCities = ['All Cities', 'Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Gorakhpur', 'Allahabad']
const specialities = ['All Specialities', 'Audiology', 'Speech-Language Pathology', 'Neuro-Audiology', 'Pediatric Audiology']

/* Events Timeline data */
const eventsTimeline = [
  {
    date: '18-20 Oct 2025',
    title: 'UP ISHACON 2025 - Annual State Conference',
    location: 'KGMU, Lucknow',
    description:
      'Three-day flagship conference featuring keynote lectures, scientific paper presentations, panel discussions, and hands-on workshops on the latest advances in audiology and speech-language pathology.',
    type: 'Conference',
    icon: Trophy,
  },
  {
    date: '25 Mar 2025',
    title: 'Workshop on Pediatric Audiology',
    location: 'Lucknow Chapter',
    description:
      'Hands-on workshop covering ABR, OAE, and behavioral audiometry for infants and young children. Limited to 30 participants.',
    type: 'Workshop',
    icon: Microscope,
  },
  {
    date: '03 Mar 2025',
    title: 'World Hearing Day Awareness Walk',
    location: 'Hazratganj, Lucknow',
    description:
      'Public awareness walk and free hearing screening camp in observance of WHO World Hearing Day 2025.',
    type: 'Outreach',
    icon: Megaphone,
  },
  {
    date: '15 Feb 2025',
    title: 'Continuing Education - Voice Disorders',
    location: 'Webinar (Online)',
    description:
      'Expert-led session on assessment and management of voice disorders across the lifespan, including latest evidence-based practices.',
    type: 'Webinar',
    icon: PlayCircle,
  },
  {
    date: '28 Jan 2025',
    title: 'Research Methodology Workshop',
    location: 'KGMU, Lucknow',
    description:
      'Two-day workshop for early-career researchers on research design, statistical analysis, and scientific writing for ASLP professionals.',
    type: 'Workshop',
    icon: GraduationCap,
  },
]

/* Member Spotlight data */
const memberSpotlights = [
  {
    name: 'Dr. Meera Tiwari',
    role: 'Senior Audiologist',
    location: 'Lucknow',
    achievement: 'Recognized for pioneering community-based newborn hearing screening program across 12 districts of UP.',
    years: '25 years',
    specialty: 'Audiology',
  },
  {
    name: 'Dr. Vikram Pandey',
    role: 'Neuro-Audiologist',
    location: 'Agra',
    achievement: 'Published 35+ peer-reviewed papers on central auditory processing disorders and traumatic brain injury.',
    years: '20 years',
    specialty: 'Neuro-Audiology',
  },
  {
    name: 'Dr. Kavita Rathore',
    role: 'Pediatric SLP',
    location: 'Kanpur',
    achievement: 'Established first free pediatric speech therapy clinic in Kanpur serving 500+ children annually.',
    years: '11 years',
    specialty: 'Speech-Language Pathology',
  },
]

/* News ticker items */
const newsTickerItems = [
  'UP ISHACON 2025 Registration Now Open — Early Bird Discount Until September 15',
  'Call for Papers: UP Journal of Speech & Hearing Vol. 12 — Submit by August 30',
  'New RCI Continuing Education Credits Now Available for UP ISHA Webinars',
  'Free Hearing Screening Camp on World Hearing Day — March 3, 2025',
  'Student Scholarship Program 2025 — Applications Open for ASLP Researchers',
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

/* ─── Reusable Section Heading ─── */
function SectionHeading({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  light = false,
  align = 'center',
}: {
  badge: string
  badgeIcon?: React.ElementType
  title: string
  subtitle?: string
  light?: boolean
  align?: 'center' | 'left'
}) {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`inline-flex items-center gap-1.5 ${
          light ? 'bg-white/10 text-white' : 'bg-upisha-teal/10 text-upisha-teal'
        } px-3 py-1.5 rounded-full text-xs font-semibold mb-3`}
      >
        {BadgeIcon && <BadgeIcon className="h-3.5 w-3.5" />}
        {badge}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-3xl md:text-4xl font-bold mb-3 ${light ? 'text-white' : 'text-upisha-navy'}`}
      >
        {title}
      </motion.h2>
      <div
        className={`h-1 w-16 bg-upisha-gold rounded-full mb-4 ${align === 'center' ? 'mx-auto' : ''}`}
      />
      {subtitle && (
        <p
          className={`max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } text-base ${light ? 'text-gray-300' : 'text-gray-600'}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ─── News Ticker ─── */
function NewsTicker() {
  return (
    <div className="bg-upisha-navy text-white py-2.5 overflow-hidden border-b border-upisha-teal/30">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 bg-upisha-gold text-upisha-navy px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
          <Megaphone className="h-3.5 w-3.5" />
          Latest
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {[...newsTickerItems, ...newsTickerItems].map((item, i) => (
              <span key={i} className="text-sm text-gray-200 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-upisha-gold" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ─── Top Bar ─── */
function TopBar() {
  return (
    <div className="bg-upisha-navy text-white text-sm py-2 border-b border-white/5">
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

/* ─── Navbar ─── */
function Navbar({
  activeSection,
  onNavClick,
  onOpenSearch,
}: {
  activeSection: string
  onNavClick: (href: string) => void
  onOpenSearch: () => void
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
          ? 'bg-white/95 dark:bg-upisha-navy/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-upisha-navy shadow-sm'
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
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-upisha-teal to-upisha-teal-dark rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
              <Ear className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-upisha-navy dark:text-white text-sm md:text-base leading-tight">
                UP ISHA
              </div>
              <div className="text-[10px] md:text-xs text-upisha-teal font-medium leading-tight">
                Speech & Hearing Association
              </div>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1)
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    onNavClick(link.href)
                  }}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-upisha-teal bg-upisha-teal-light dark:bg-upisha-teal/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-upisha-teal hover:bg-upisha-teal-light/50 dark:hover:bg-upisha-teal/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-upisha-gold rounded-full"
                    />
                  )}
                </a>
              )
            })}
          </nav>

          {/* CTA + Search + Theme Toggle + Mobile Toggle */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-upisha-navy-light dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs transition-colors"
              aria-label="Open search (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Search</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] font-mono">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
            <ThemeToggle />
            <Button
              className="hidden md:inline-flex bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-sm hover:shadow-md"
              onClick={() => onNavClick('#join')}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Join Now
            </Button>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
            className="lg:hidden overflow-hidden bg-white dark:bg-upisha-navy border-t border-gray-100 dark:border-gray-800"
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === link.href.slice(1)
                      ? 'text-upisha-teal bg-upisha-teal-light dark:bg-upisha-teal/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-upisha-teal hover:bg-gray-50 dark:hover:bg-upisha-navy-light'
                  }`}
                >
                  <ChevronRight className="h-4 w-4 opacity-50" />
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
                <Card className="text-center hover:shadow-lg transition-all duration-300 group overflow-hidden">
                  <CardContent className="pt-6 pb-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-upisha-teal/10 group-hover:border-upisha-teal transition-colors">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors">
                          <Users className="h-10 w-10 text-upisha-teal group-hover:text-white transition-colors" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-upisha-navy dark:text-white">{member.name}</h4>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('All Cities')
  const [specialityFilter, setSpecialityFilter] = useState('All Specialities')
  const [visibleCount, setVisibleCount] = useState(6)
  const [selectedProfessional, setSelectedProfessional] = useState<typeof sampleProfessionals[0] | null>(null)

  const filtered = useMemo(() => {
    return sampleProfessionals.filter((p) => {
      const matchesQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.speciality.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCity = cityFilter === 'All Cities' || p.city === cityFilter
      const matchesSpeciality =
        specialityFilter === 'All Specialities' || p.speciality === specialityFilter
      return matchesQuery && matchesCity && matchesSpeciality
    })
  }, [searchQuery, cityFilter, specialityFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setCityFilter('All Cities')
    setSpecialityFilter('All Specialities')
    setVisibleCount(6)
  }

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value)
    setVisibleCount(6)
  }

  const updateCityFilter = (value: string) => {
    setCityFilter(value)
    setVisibleCount(6)
  }

  const updateSpecialityFilter = (value: string) => {
    setSpecialityFilter(value)
    setVisibleCount(6)
  }

  const visible = filtered.slice(0, visibleCount)

  return (
    <AnimatedSection id="professionals" className="py-16 md:py-20 bg-upisha-navy relative overflow-hidden">
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative">
        <SectionHeading
          badge="Find Experts"
          badgeIcon={Users}
          title="Professionals Directory"
          subtitle="Locate qualified audiologists, speech-language pathologists, and accredited clinics across Uttar Pradesh. Search by name, city, or speciality."
          light
        />

        {/* Category Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {professionalCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-upisha-navy-light border-upisha-navy-light hover:border-upisha-teal transition-all duration-300 group hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-upisha-teal/20 rounded-2xl flex items-center justify-center group-hover:bg-upisha-teal group-hover:rotate-6 transition-all">
                    <cat.icon className="h-8 w-8 text-upisha-teal group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{cat.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{cat.description}</p>
                  <div className="text-3xl font-bold text-upisha-teal">{cat.count}</div>
                  <p className="text-xs text-gray-500">Professionals Listed</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <Card className="bg-upisha-navy-light border-upisha-navy-light mb-8">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Search className="h-5 w-5 text-upisha-teal" />
              Locate a Professional
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Search by name or qualification</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="e.g. Dr. Rajesh..."
                    value={searchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    className="bg-upisha-navy border-upisha-navy-light text-white placeholder:text-gray-500 pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">City</label>
                <Select value={cityFilter} onValueChange={updateCityFilter}>
                  <SelectTrigger className="bg-upisha-navy border-upisha-navy-light text-white">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {upCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Speciality</label>
                <Select value={specialityFilter} onValueChange={updateSpecialityFilter}>
                  <SelectTrigger className="bg-upisha-navy border-upisha-navy-light text-white">
                    <SelectValue placeholder="Select speciality" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-upisha-navy-light">
              <p className="text-sm text-gray-400">
                Showing <span className="text-white font-semibold">{visible.length}</span> of{' '}
                <span className="text-white font-semibold">{filtered.length}</span> professionals
              </p>
              {(searchQuery || cityFilter !== 'All Cities' || specialityFilter !== 'All Specialities') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-upisha-navy-light text-gray-300 hover:bg-upisha-navy-light hover:text-white"
                  onClick={resetFilters}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {visible.length === 0 ? (
          <div className="text-center py-16 bg-upisha-navy-light rounded-2xl">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-1">No professionals found</h4>
            <p className="text-sm text-gray-400">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((pro, i) => (
              <motion.div
                key={`${pro.name}-${pro.rci}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="h-full bg-upisha-navy-light border-upisha-navy-light hover:border-upisha-teal transition-all cursor-pointer group"
                  onClick={() => setSelectedProfessional(pro)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-upisha-teal to-upisha-teal-dark flex items-center justify-center text-white font-bold">
                        {pro.name.split(' ').slice(-2, -1)[0]?.[0] || pro.name[2]}
                        {pro.name.split(' ').slice(-1)[0]?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate group-hover:text-upisha-teal transition-colors">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-upisha-teal mb-2">{pro.speciality}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPinned className="h-3 w-3 text-upisha-gold" />
                            {pro.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-upisha-gold" />
                            {pro.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-upisha-gold" />
                            {pro.setting}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-upisha-navy-light flex items-center justify-between">
                      <Badge className="bg-upisha-teal/20 text-upisha-teal text-[10px]">
                        RCI: {pro.rci}
                      </Badge>
                      <span className="text-xs text-gray-400 group-hover:text-upisha-teal flex items-center gap-1 transition-colors">
                        View
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="border-upisha-teal text-upisha-teal hover:bg-upisha-teal hover:text-white"
            >
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </div>

      {/* Professional Detail Dialog */}
      <Dialog open={!!selectedProfessional} onOpenChange={(open) => !open && setSelectedProfessional(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Professional details</DialogTitle>
          </DialogHeader>
          {selectedProfessional && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-upisha-teal to-upisha-teal-dark flex items-center justify-center text-white font-bold text-xl">
                  {selectedProfessional.name.split(' ').slice(-2, -1)[0]?.[0] || selectedProfessional.name[2]}
                  {selectedProfessional.name.split(' ').slice(-1)[0]?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-upisha-navy">{selectedProfessional.name}</h3>
                  <p className="text-sm text-upisha-teal">{selectedProfessional.speciality}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Qualification</p>
                    <p className="text-sm font-medium text-gray-800">{selectedProfessional.qualification}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPinned className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">City</p>
                    <p className="text-sm font-medium text-gray-800">{selectedProfessional.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Experience & Setting</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedProfessional.experience} • {selectedProfessional.setting}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-upisha-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">RCI Registration</p>
                    <p className="text-sm font-medium text-gray-800">{selectedProfessional.rci}</p>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-6 bg-upisha-teal hover:bg-upisha-teal-dark text-white">
                <Mail className="h-4 w-4 mr-2" />
                Contact via UP ISHA
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}

/* ─── Join UP ISHA Section ─── */
function JoinSection() {
  const { toast } = useToast()
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
      toast({
        title: 'Membership type required',
        description: 'Please select a membership type before submitting.',
        variant: 'destructive',
      })
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
        toast({
          title: 'Application submitted!',
          description: 'We will review your application and contact you soon.',
        })
      } else {
        toast({
          title: 'Submission failed',
          description: 'Please try again or contact us directly.',
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
  const { toast } = useToast()
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
        toast({
          title: 'Message sent!',
          description: 'Thank you for reaching out. We will get back to you shortly.',
        })
      } else {
        toast({
          title: 'Failed to send',
          description: 'Please try again or email us directly.',
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

/* ─── Theme Toggle ─── */
function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  )

  const toggle = () => {
    document.documentElement.classList.toggle('dark')
    const nextIsDark = !isDark
    setIsDark(nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ─── Command Palette / Search Modal ─── */
function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (href: string) => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = useMemo(() => {
    return [
      ...navLinks.map((l) => ({ label: l.label, href: l.href, group: 'Pages', icon: ChevronRight })),
      { label: 'Join UP ISHA - Membership', href: '#join', group: 'Actions', icon: UserPlus },
      { label: 'Contact the Association', href: '#contact', group: 'Actions', icon: Mail },
      { label: 'Find an Audiologist', href: '#professionals', group: 'Directory', icon: Ear },
      { label: 'Find a Speech-Language Pathologist', href: '#professionals', group: 'Directory', icon: MessageSquare },
      { label: 'Browse Documents', href: '#documents', group: 'Resources', icon: FileText },
      { label: 'View Publications', href: '#publications', group: 'Resources', icon: BookOpen },
      { label: 'View Gallery', href: '#gallery', group: 'Resources', icon: Camera },
      { label: 'UP ISHACON 2025 Countdown', href: '#home', group: 'Events', icon: Timer },
      { label: 'Upcoming Webinars', href: '#about', group: 'Events', icon: PlayCircle },
    ]
  }, [])

  const filtered = useMemo(() => {
    if (!query) return allItems
    const q = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    )
  }, [query, allItems])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault()
      onNavigate(filtered[activeIndex].href)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach((item) => {
      if (!groups[item.group]) groups[item.group] = []
      groups[item.group].push(item)
    })
    return groups
  }, [filtered])

  let runningIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-upisha-navy/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, actions, resources..."
                className="flex-1 py-4 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
              <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[10px] font-mono text-gray-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group} className="mb-2">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {group}
                    </div>
                    {items.map((item) => {
                      runningIndex++
                      const idx = runningIndex
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={`${group}-${item.label}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => {
                            onNavigate(item.href)
                            onClose()
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                            isActive
                              ? 'bg-upisha-teal-light text-upisha-teal'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 font-mono">↵</kbd>
                  Select
                </span>
              </div>
              <span className="text-upisha-teal font-medium">UP ISHA</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ─── Event Countdown Timer ─── */
function CountdownTimer() {
  const targetDate = new Date('2025-10-18T09:00:00+05:30').getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const diff = Math.max(0, targetDate - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-upisha-teal to-upisha-teal-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-[10%] w-20 h-20 rounded-full border-2 border-white" />
        <div className="absolute bottom-4 right-[15%] w-32 h-32 rounded-full border border-white" />
        <div className="absolute top-1/2 left-[60%] w-16 h-16 rounded-full bg-white/20" />
      </div>
      <div className="max-w-5xl mx-auto px-4 relative">
        <div className="text-center mb-8">
          <Badge className="bg-white/20 text-white mb-3">
            <Timer className="h-3 w-3 mr-1" />
            Save the Date
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white">UP ISHACON 2025</h2>
          <p className="text-white/80 mt-2">October 18-20, 2025 • Lucknow, Uttar Pradesh</p>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-5 text-center border border-white/20"
            >
              <div className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm text-white/70 mt-1">{unit.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" className="bg-white text-upisha-teal hover:bg-white/90 font-semibold">
            Register Now
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ─── Newsletter Section ─── */
function NewsletterSection() {
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
              className="bg-white dark:bg-upisha-navy-light rounded-2xl p-6 md:p-8 shadow-xl max-w-lg mx-auto flex flex-col sm:flex-row gap-3 border border-upisha-teal/10"
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 dark:bg-upisha-navy border-gray-200 dark:border-gray-700"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-upisha-gold hover:bg-upisha-gold-dark text-white h-12 px-6 shadow-md hover:shadow-lg transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}
          <p className="text-xs text-upisha-navy/60 dark:text-gray-400 mt-4 font-medium">
            🔒 No spam. Unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── Cookie Consent Banner ─── */
function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('upisha-cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('upisha-cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const decline = () => {
    localStorage.setItem('upisha-cookie-consent', 'declined')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-[70]"
        >
          <div className="max-w-4xl mx-auto bg-white dark:bg-upisha-navy rounded-2xl shadow-2xl border-l-4 border-l-upisha-teal border border-gray-200 dark:border-gray-700 p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-upisha-teal/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-upisha-teal" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-bold text-upisha-navy dark:text-white text-base mb-1">
                We value your privacy
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, and
                personalize content. By clicking &quot;Accept All&quot;, you consent to our use of
                cookies.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={decline}
                className="text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-upisha-navy-light"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={accept}
                className="bg-upisha-teal hover:bg-upisha-teal-dark text-white text-sm shadow-md"
              >
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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

/* ─── Events Timeline Section ─── */
function EventsTimelineSection() {
  const typeColors: Record<string, string> = {
    Conference: 'bg-upisha-gold/20 text-upisha-gold border-upisha-gold/30',
    Workshop: 'bg-upisha-teal/10 text-upisha-teal border-upisha-teal/30',
    Outreach: 'bg-purple-100 text-purple-700 border-purple-200',
    Webinar: 'bg-blue-100 text-blue-700 border-blue-200',
  }

  return (
    <AnimatedSection className="py-16 md:py-20 bg-white relative">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeading
          badge="What's Coming Up"
          badgeIcon={Calendar}
          title="Events & Activities Timeline"
          subtitle="Stay informed about our upcoming conferences, workshops, webinars, and community outreach programs across Uttar Pradesh."
        />

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-upisha-teal via-upisha-gold to-upisha-teal opacity-30 md:-translate-x-1/2" />

          <div className="space-y-8">
            {eventsTimeline.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className={`relative flex items-start gap-6 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Dot marker */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 mt-6">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-upisha-teal shadow-md" />
                </div>

                {/* Content card */}
                <div className={`flex-1 ml-12 md:ml-0 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 group hover:border-upisha-teal/40">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-upisha-teal/10 flex items-center justify-center group-hover:bg-upisha-teal transition-colors shrink-0">
                            <event.icon className="h-5 w-5 text-upisha-teal group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] mb-1 ${typeColors[event.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                            >
                              {event.type}
                            </Badge>
                            <p className="text-xs text-upisha-gold font-semibold flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </p>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-upisha-navy text-lg mb-2 group-hover:text-upisha-teal transition-colors">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPinned className="h-3.5 w-3.5 text-upisha-gold" />
                        <span>{event.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Spacer for alternating layout on desktop */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button className="bg-upisha-teal hover:bg-upisha-teal-dark text-white shadow-sm hover:shadow-md">
            <Calendar className="h-4 w-4 mr-2" />
            View Full Calendar
          </Button>
        </div>
      </div>
    </AnimatedSection>
  )
}

/* ─── Member Spotlight Section ─── */
function MemberSpotlightSection() {
  return (
    <AnimatedSection className="py-16 md:py-20 bg-gradient-to-br from-upisha-teal-light via-white to-upisha-gold-light relative overflow-hidden">
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
              <Card className="h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                      <h4 className="font-bold text-upisha-navy">{member.name}</h4>
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
                    <p className="text-sm text-gray-600 italic leading-relaxed pl-5">
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
  const [searchOpen, setSearchOpen] = useState(false)

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

  // Ctrl/Cmd + K to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleNavClick = useCallback((href: string) => {
    const id = href.slice(1)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <TopBar />
      <Navbar
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <NewsTicker />
      <main className="flex-1">
        <HeroSection />
        <QuickLinks />
        <CountdownTimer />
        <AnnouncementSection />
        <FeaturesSection />
        <AboutSection />
        <StatsSection />
        <EventsTimelineSection />
        <DocumentsSection />
        <PublicationsSection />
        <WebinarsSection />
        <ProfessionalsSection />
        <MemberSpotlightSection />
        <JoinSection />
        <TestimonialsSection />
        <GallerySection />
        <NewsletterSection />
        <PartnersSection />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent />
      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavClick}
      />
    </div>
  )
}
