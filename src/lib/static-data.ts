// Static data for UP ISHA website - used as fallback when Firebase is not configured
import {
  BookOpen, Users, GraduationCap, Globe, Shield, Stethoscope, MessageSquare,
  Award, FileText, Ear, Briefcase, Activity, Calendar, Heart, Building2,
  Trophy, Microscope, Megaphone, PlayCircle, Camera, UserPlus, Star,
  MapPinned, Building, Mailbox, PhoneCall, Timer, Sparkles, Bell,
  Search, ChevronRight, Mail, MapPin, Phone, Clock, Eye, Quote,
  TrendingUp, HandHeart, Newspaper, Lightbulb, Zap
} from 'lucide-react'
import type {
  NavLink, HeroSlide, Announcement, Feature, ExecutiveMember, Document,
  Publication, ProfessionalCategory, Professional, MembershipPlan, GalleryImage,
  FAQ, Stat, Testimonial, Partner, Webinar, TimelineEvent, MemberSpotlight
} from '@/lib/types'

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About Us', href: '#about' },
  { label: 'Documents', href: '#documents' },
  { label: 'Publications', href: '#publications' },
  // { label: 'Professionals', href: '#professionals' }, // Commented out - can be re-enabled when professional directory is ready
  { label: 'Webinars', href: '/webinars' },
  { label: 'Join UP ISHA', href: '#join' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact Us', href: '#contact' },
]

export const heroSlides: HeroSlide[] = [
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

export const announcements: Announcement[] = [
  { date: '15 Mar 2026', title: 'UP ISHA Annual Conference 2026 - Registration Open', type: 'Event' },
  { date: '28 Feb 2026', title: 'Call for Papers - UP Journal of Speech & Hearing', type: 'Publication' },
  { date: '10 Feb 2026', title: 'Workshop on Pediatric Audiology - Lucknow Chapter', type: 'Workshop' },
  { date: '25 Jan 2026', title: 'New Membership Benefits for 2026 Announced', type: 'Announcement' },
  { date: '15 Jan 2026', title: 'Republic Day Special Webinar on Hearing Health', type: 'Webinar' },
]

export const features: Feature[] = [
  { icon: BookOpen, title: 'UP ISHA Newsletter', description: 'Stay updated with activities, events, and developments from the Uttar Pradesh Speech & Hearing Association.' },
  { icon: Users, title: 'Executive Council', description: 'Meet the dedicated team of professionals governing UP ISHA and guiding its mission forward.' },
  { icon: GraduationCap, title: 'Webinars & Workshops', description: 'Access recordings and schedules of professional development webinars and hands-on workshops.' },
  { icon: Globe, title: 'Regional Chapters', description: 'UP ISHA has chapters across Lucknow, Varanasi, Agra, Kanpur, and other major cities in Uttar Pradesh.' },
]

export const executiveCouncil: ExecutiveMember[] = [
  { name: 'Mr. Bhupendra Kumar Mishra', role: 'President', image: '/images/President.jpeg', speciality: 'Audiology' },
  { name: 'Mr. Priyaveer Chauhan', role: 'Secretary', image: '/images/Secretary.jpeg', speciality: 'Audiologist & Cochlear Implant Specialist' },
  { name: 'Mohd. Kamran Farooq Khan', role: 'Vice President', image: '/images/VIcePresident.png', speciality: 'Speech-Language Pathology' },
  { name: 'Dr. Sankalp Shukla', role: 'Treasurer', image: '/images/Treasurer.png', speciality: 'Speech-Language Pathology' },
  { name: 'Ms. Sneha Bansal', role: 'Member', image: '/images/MsSnehaBansal.png', speciality: 'Neuro-Audiology' },
  { name: 'Mr. Shiv Shanker Dwivedi', role: 'Member', image: '/images/MrShivShankerDwivedi.png', speciality: 'Pediatric Audiology' },
  { name: 'Mr. Lavkush Mishra', role: 'Member', image: '/images/LavkushMishraMember.png', speciality: '' },
]

export const documents: Document[] = [
  { title: 'UP ISHA Constitution & Bye-Laws', description: 'Official constitution and bye-laws governing the association', category: 'Governance', icon: Shield },
  { title: 'Scope of Practice - Audiology', description: 'Defined scope of practice for audiologists in Uttar Pradesh', category: 'Practice', icon: Stethoscope },
  { title: 'Scope of Practice - Speech-Language Pathology', description: 'Defined scope of practice for SLPs in Uttar Pradesh', category: 'Practice', icon: MessageSquare },
  { title: 'Code of Ethics', description: 'Professional code of ethics for all UP ISHA members', category: 'Governance', icon: Award },
  { title: 'RCI Guidelines & Notifications', description: 'Rehabilitation Council of India regulatory mandates', category: 'Regulatory', icon: FileText },
  { title: 'Clinical Practice Guidelines', description: 'Evidence-based guidelines for clinical practice', category: 'Practice', icon: BookOpen },
]

export const publications: Publication[] = [
  { title: 'UP Journal of Speech & Hearing', description: 'The official peer-reviewed journal of UP ISHA featuring research articles, case studies, and reviews.', type: 'Journal', icon: BookOpen },
]

export const professionalCategories: ProfessionalCategory[] = [
  { title: 'Audiology', description: 'Find qualified audiologists across Uttar Pradesh', icon: Ear, count: '250+' },
  { title: 'Speech-Language Pathology', description: 'Connect with certified speech-language pathologists', icon: MessageSquare, count: '300+' },
  { title: 'Clinic Accreditation', description: 'Locate accredited speech and hearing clinics', icon: Briefcase, count: '100+' },
  { title: 'Academic Programs', description: 'Universities offering ASLP programs in UP', icon: GraduationCap, count: '15+' },
]

export const membershipBenefits: string[] = [
  'Access to professional development webinars and workshops',
  'Subscription to UP Journal of Speech & Hearing',
  'Networking opportunities with professionals across UP',
  'Discounted registration for UP ISHA conferences',
  'Access to clinical practice guidelines and resources',
  'Voting rights in association elections',
  'Professional liability insurance guidance',
  'Career advancement and job opportunity notifications',
]

export const membershipTypes: MembershipPlan[] = [
  { type: 'Life Member', price: '₹3,500', description: 'One-time payment for lifetime membership', features: ['All standard benefits', 'Voting rights', 'Conference discounts', 'Journal access', 'Professional Support'], popular: true },
  { type: 'Annual Member', price: '₹1,000/year', description: 'Annual renewable membership', features: ['Standard benefits', 'Journal access', 'Webinar access', 'Networking', 'Professional Support'], popular: false },
  { type: 'Student Member', price: '₹500/year', description: 'For current ASLP students in UP', features: ['Student benefits', 'Mentorship program', 'Workshop access', 'Career guidance', 'Professional Support'], popular: false },
]

// Membership fee amounts (in INR) used for auto-generating receipts
export const membershipFees: Record<string, number> = {
  life: 3500,
  annual: 1000,
  student: 500,
}

export const galleryImages: GalleryImage[] = [
  { src: '/images/hero-1.png', title: 'Annual Conference 2024', category: 'Events' },
  { src: '/images/hero-2.png', title: 'Pediatric Workshop', category: 'Workshops' },
  { src: '/images/hero-3.png', title: 'Executive Council Meeting', category: 'Meetings' },
  { src: '/images/professionals.png', title: 'World Hearing Day 2024', category: 'Events' },
  { src: '/images/about-illustration.png', title: 'Audiology Awareness Camp', category: 'Outreach' },
  { src: '/images/gallery-cover.png', title: 'SLP Training Session', category: 'Training' },
  { src: '/images/hero-1.png', title: 'UP ISHACON Inaugural Ceremony', category: 'Conferences' },
  { src: '/images/hero-2.png', title: 'School Screening Program', category: 'Outreach' },
  { src: '/images/hero-3.png', title: 'Annual General Body Meeting', category: 'Meetings' },
  { src: '/images/professionals.png', title: 'International Day of Persons with Disabilities', category: 'Events' },
  { src: '/images/about-illustration.png', title: 'Hearing Aid Fitting Workshop', category: 'Workshops' },
  { src: '/images/gallery-cover.png', title: 'Student Research Symposium', category: 'Training' },
]

export const faqItems: FAQ[] = [
  { question: 'Who can join UP ISHA?', answer: 'Any professional with a recognized qualification in Audiology and/or Speech-Language Pathology, registered with RCI, and residing or working in Uttar Pradesh is eligible for membership. Students currently enrolled in recognized ASLP programs can apply for student membership.' },
  { question: 'What are the benefits of UP ISHA membership?', answer: 'UP ISHA members enjoy access to professional development webinars, subscription to our journal, networking opportunities, conference discounts, clinical guidelines, voting rights, and career support among many other benefits.' },
  { question: 'How do I find a qualified audiologist or SLP in UP?', answer: 'Use our "Locate a Professional" directory to search for RCI-registered audiologists and speech-language pathologists in Uttar Pradesh. You can search by city, speciality, and practice setting.' },
  { question: 'Does UP ISHA organize continuing education programs?', answer: 'Yes, UP ISHA regularly organizes webinars, workshops, and conferences for continuing education. Check our events calendar and announcements section for upcoming programs.' },
  { question: 'How can I contribute to the UP Journal of Speech & Hearing?', answer: 'We welcome research articles, case studies, and reviews. Please refer to our "Guidelines to Authors" section in the Publications tab for detailed submission guidelines.' },
]

export const stats: Stat[] = [
  { value: 550, suffix: '+', label: 'Active Members', icon: Users },
  { value: 2, suffix: '+', label: 'Years of Service', icon: Activity },
  { value: 15, suffix: '+', label: 'Regional Chapters', icon: Globe },
  { value: 50, suffix: '+', label: 'Annual Events', icon: Calendar },
]

export const testimonials: Testimonial[] = [
  { name: 'Dr. Meera Tiwari', role: 'Senior Audiologist, Lucknow', content: 'UP ISHA has been instrumental in my professional growth. The webinars and conferences have kept me updated with the latest advancements in audiology. The networking opportunities are invaluable.', rating: 5 },
  { name: 'Dr. Sanjay Gupta', role: 'Speech-Language Pathologist, Varanasi', content: 'Being a member of UP ISHA has connected me with a wonderful community of professionals. The journal provides excellent research insights, and the workshops are truly enriching.', rating: 5 },
  { name: 'Dr. Kavita Rathore', role: 'Pediatric SLP, Kanpur', content: 'The association has given me a platform to contribute to the field. The mentoring program and clinical guidelines have significantly improved my practice. Highly recommended!', rating: 5 },
  { name: 'Dr. Rakesh Pandey', role: 'Academic Researcher, Agra', content: 'UP ISHA publications are of exceptional quality. The peer-review process is rigorous, and the journal has helped me share my research with a wider audience across the state.', rating: 5 },
]

export const partners: Partner[] = [
  { name: 'Rehabilitation Council of India', icon: Shield },
  { name: 'All India Institute of Speech & Hearing', icon: Ear },
  { name: "King George's Medical University", icon: Building2 },
  { name: 'AIIMS Delhi', icon: Stethoscope },
  { name: 'Indian Speech-Language & Hearing Association', icon: Globe },
  { name: 'WHO India', icon: Heart },
]

export const upcomingWebinars: Webinar[] = [
  { title: 'Advanced Audiological Assessment in Pediatric Population', date: '2026-03-25', time: '4:00 PM IST', speaker: 'Dr. Anita Deshpande', duration: '90 min', type: 'free' },
  { title: 'Tele-Practice in Speech-Language Pathology', date: '2026-04-08', time: '5:00 PM IST', speaker: 'Dr. Manoj Kumar', duration: '60 min', type: 'paid' },
  { title: 'Cochlear Implant Rehabilitation: Best Practices', date: '2026-04-22', time: '4:30 PM IST', speaker: 'Dr. Sunita Verma', duration: '75 min', type: 'free' },
]

export const sampleProfessionals: Professional[] = [
  { name: 'Dr. Rajesh Kumar Sharma', speciality: 'Audiology', city: 'Lucknow', qualification: 'Ph.D. (Audiology), AIISH Mysuru', experience: '22 years', setting: 'Hospital', rci: 'A-12345' },
  { name: 'Dr. Sunita Verma', speciality: 'Speech-Language Pathology', city: 'Lucknow', qualification: 'Ph.D. (SLP), KGMU', experience: '18 years', setting: 'Hospital', rci: 'B-23456' },
  { name: 'Dr. Amit Mishra', speciality: 'Audiology', city: 'Varanasi', qualification: 'M.Sc. (Audiology), AIISH', experience: '15 years', setting: 'Clinic', rci: 'A-34567' },
  { name: 'Dr. Priya Singh', speciality: 'Speech-Language Pathology', city: 'Kanpur', qualification: 'M.Sc. (SLP), AIISH', experience: '12 years', setting: 'Clinic', rci: 'B-45678' },
  { name: 'Dr. Vikram Pandey', speciality: 'Neuro-Audiology', city: 'Agra', qualification: 'Ph.D. (Neuro-Audiology), AIIMS', experience: '20 years', setting: 'Hospital', rci: 'A-56789' },
  { name: 'Dr. Ananya Gupta', speciality: 'Pediatric Audiology', city: 'Lucknow', qualification: 'M.Sc. (Audiology), KGMU', experience: '10 years', setting: 'Clinic', rci: 'A-67890' },
  { name: 'Dr. Meera Tiwari', speciality: 'Audiology', city: 'Lucknow', qualification: 'Ph.D. (Audiology), AIISH', experience: '25 years', setting: 'Hospital', rci: 'A-78901' },
  { name: 'Dr. Sanjay Gupta', speciality: 'Speech-Language Pathology', city: 'Varanasi', qualification: 'M.Sc. (SLP), AIISH', experience: '14 years', setting: 'Academic', rci: 'B-89012' },
  { name: 'Dr. Kavita Rathore', speciality: 'Speech-Language Pathology', city: 'Kanpur', qualification: 'M.Sc. (SLP), KGMU', experience: '11 years', setting: 'Clinic', rci: 'B-90123' },
  { name: 'Dr. Rakesh Pandey', speciality: 'Audiology', city: 'Agra', qualification: 'Ph.D. (Audiology), AIIMS', experience: '19 years', setting: 'Academic', rci: 'A-01234' },
  { name: 'Dr. Neha Saxena', speciality: 'Speech-Language Pathology', city: 'Gorakhpur', qualification: 'M.Sc. (SLP), AIISH', experience: '8 years', setting: 'Clinic', rci: 'B-11223' },
  { name: 'Dr. Arjun Yadav', speciality: 'Audiology', city: 'Allahabad', qualification: 'M.Sc. (Audiology), AIISH', experience: '13 years', setting: 'Hospital', rci: 'A-22334' },
]

export const upCities: string[] = ['All Cities', 'Lucknow', 'Varanasi', 'Kanpur', 'Agra', 'Gorakhpur', 'Allahabad']
export const specialities: string[] = ['All Specialities', 'Audiology', 'Speech-Language Pathology', 'Neuro-Audiology', 'Pediatric Audiology']

export const eventsTimeline: TimelineEvent[] = [
  { date: '18-20 Oct 2026', title: 'UP ISHACON 2026 - Annual State Conference', location: 'KGMU, Lucknow', description: 'Three-day flagship conference featuring keynote lectures, scientific paper presentations, panel discussions, and hands-on workshops on the latest advances in audiology and speech-language pathology.', type: 'Conference', icon: Trophy, time: '9:00 AM - 5:00 PM', speakers: ['Dr. Rajesh Sharma', 'Dr. Sunita Verma', 'Dr. Amit Mishra'], registrationLink: '#join', countdownEnabled: true, countdownDate: '2026-10-18T09:00:00+05:30', badgeLabel: 'Save the Date', registrationLabel: 'Register Now' },
  { date: '25 Mar 2026', title: 'Workshop on Pediatric Audiology', location: 'Lucknow Chapter', description: 'Hands-on workshop covering ABR, OAE, and behavioral audiometry for infants and young children. Limited to 30 participants.', type: 'Workshop', icon: Microscope, time: '10:00 AM - 4:00 PM', speakers: ['Dr. Ananya Gupta', 'Dr. Meera Tiwari'], registrationLink: '#join' },
  { date: '03 Mar 2026', title: 'World Hearing Day Awareness Walk', location: 'Hazratganj, Lucknow', description: 'Public awareness walk and free hearing screening camp in observance of WHO World Hearing Day 2026.', type: 'Outreach', icon: Megaphone, time: '8:00 AM - 1:00 PM', speakers: ['Dr. Vikram Pandey', 'Dr. Kavita Rathore'], registrationLink: '#join' },
  { date: '15 Feb 2026', title: 'Continuing Education - Voice Disorders', location: 'Webinar (Online)', description: 'Expert-led session on assessment and management of voice disorders across the lifespan, including latest evidence-based practices.', type: 'Webinar', icon: PlayCircle, time: '4:00 PM - 6:00 PM IST', speakers: ['Dr. Neha Saxena', 'Dr. Arjun Yadav'], registrationLink: '#join' },
  { date: '28 Jan 2026', title: 'Research Methodology Workshop', location: 'KGMU, Lucknow', description: 'Two-day workshop for early-career researchers on research design, statistical analysis, and scientific writing for ASLP professionals.', type: 'Workshop', icon: GraduationCap, time: '9:30 AM - 4:30 PM', speakers: ['Dr. Rakesh Pandey', 'Dr. Sanjay Gupta'], registrationLink: '#join' },
]

export const memberSpotlights: MemberSpotlight[] = [
  { name: 'Dr. Meera Tiwari', role: 'Senior Audiologist', location: 'Lucknow', achievement: 'Recognized for pioneering community-based newborn hearing screening program across 12 districts of UP.', years: '25 years', specialty: 'Audiology' },
  { name: 'Dr. Vikram Pandey', role: 'Neuro-Audiologist', location: 'Agra', achievement: 'Published 35+ peer-reviewed papers on central auditory processing disorders and traumatic brain injury.', years: '20 years', specialty: 'Neuro-Audiology' },
  { name: 'Dr. Kavita Rathore', role: 'Pediatric SLP', location: 'Kanpur', achievement: 'Established first free pediatric speech therapy clinic in Kanpur serving 500+ children annually.', years: '11 years', specialty: 'Speech-Language Pathology' },
]

export const newsTickerItems: string[] = [
  'UP ISHACON 2026 Registration Now Open — Early Bird Discount Until September 15',
  'Call for Papers: UP Journal of Speech & Hearing Vol. 12 — Submit by August 30',
  'New RCI Continuing Education Credits Now Available for UP ISHA Webinars',
  'Free Hearing Screening Camp on World Hearing Day — March 3, 2026',
  'Student Scholarship Program 2026 — Applications Open for ASLP Researchers',
]

export const documentDownloads: number[] = [342, 567, 1289, 456, 891, 723]
