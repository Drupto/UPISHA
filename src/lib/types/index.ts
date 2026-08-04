import type { LucideIcon } from 'lucide-react'

export interface NavLink {
  label: string
  href: string
}

export interface HeroSlide {
  image: string
  title: string
  subtitle: string
  cta: string
  ctaLink: string
}

export interface Announcement {
  id?: string
  date: string
  title: string
  type: string
  content?: string | null
  isActive?: boolean
}

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

export interface ExecutiveMember {
  name: string
  role: string
  image: string
  speciality: string
}

export interface Document {
  title: string
  description: string
  category: string
  icon: LucideIcon
  downloadCount?: number
}

export interface Publication {
  title: string
  description: string
  type: string
  icon: LucideIcon
}

export interface ProfessionalCategory {
  title: string
  description: string
  icon: LucideIcon
  count: string
}

export interface Professional {
  name: string
  speciality: string
  city: string
  qualification: string
  experience: string
  setting: string
  rci: string
}

export interface MembershipPlan {
  type: string
  price: string
  description: string
  features: string[]
  popular: boolean
}

export interface GalleryImage {
  src: string
  title: string
  category: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface Stat {
  value: number
  suffix: string
  label: string
  icon: LucideIcon
}

export interface Testimonial {
  name: string
  role: string
  content: string
  rating: number
}

export interface Partner {
  name: string
  icon: LucideIcon
}

export interface Webinar {
  id?: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  isActive?: boolean
  maxAttendees?: number | null
  registrationCount?: number
}

export interface TimelineEvent {
  id?: string
  date: string
  title: string
  location: string
  description: string
  type: string
  icon: LucideIcon
  time: string
  speakers: string[]
  registrationLink: string
  isActive?: boolean
}

export interface MemberSpotlight {
  name: string
  role: string
  location: string
  achievement: string
  years: string
  specialty: string
}

export interface MemberFormData {
  fullName: string
  email: string
  phone: string
  qualification: string
  rciNumber: string
  membershipType: string
  city: string
  message: string
  address: string
  registrationDate: string
  declaration: boolean
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface NewsletterFormData {
  email: string
}

// Firestore document types
export interface MemberDoc {
  id?: string
  fullName: string
  email: string
  phone: string
  qualification: string
  rciNumber?: string | null
  membershipType: string
  city: string
  message?: string | null
  transactionNumber?: string | null
  address?: string | null
  photoUrl?: string | null
  rciCertificateUrl?: string | null
  registrationDate?: string | null
  declaration?: boolean | null
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface ContactMessageDoc {
  id?: string
  name: string
  email: string
  subject: string
  message: string
  isRead?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface AnnouncementDoc {
  id?: string
  title: string
  date: string
  type: string
  content?: string | null
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface EventDoc {
  id?: string
  title: string
  date: string
  location: string
  description?: string | null
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface NewsletterSubscriberDoc {
  id?: string
  email: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface NewsletterCampaignDoc {
  id?: string
  title: string
  subject: string
  content: string
  status: 'draft' | 'sent'
  sentAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ProfessionalDoc {
  id?: string
  name: string
  speciality: string
  city: string
  qualification: string
  experience: string
  setting: string
  rci: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Webinar-related types
export interface WebinarDoc {
  id?: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  isActive?: boolean
  maxAttendees?: number | null
  createdAt?: Date
  updatedAt?: Date
}

export interface WebinarRegistrationFormData {
  fullName: string
  email: string
  phone: string
  qualification: string
  city: string
  webinarId: string
  webinarTitle: string
  transactionNumber: string
  message: string
  declaration: boolean
}

export interface WebinarRegistrationDoc {
  id?: string
  fullName: string
  email: string
  phone: string
  qualification?: string | null
  city: string
  webinarId: string
  webinarTitle: string
  transactionNumber?: string | null
  message?: string | null
  declaration: boolean
  status?: 'pending' | 'confirmed' | 'rejected'
  createdAt?: Date
  updatedAt?: Date
}
