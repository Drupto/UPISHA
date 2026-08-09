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
  id?: string
  src: string
  title: string
  category: string
  isActive?: boolean
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
  id?: string
  name: string
  role: string
  content: string
  rating: number
  isActive?: boolean
}

export interface Partner {
  name: string
  icon: LucideIcon
}

export type WebinarType = 'paid' | 'free'

export interface Webinar {
  id?: string
  title: string
  date: string
  time: string
  speaker: string
  duration: string
  description?: string | null
  registrationLink?: string | null
  meetingLink?: string | null
  type?: WebinarType
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
  countdownEnabled?: boolean
  countdownDate?: string | null
  badgeLabel?: string | null
  registrationLabel?: string | null
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
  course?: string | null
  currentYear?: string | null
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
  type?: string
  time?: string
  speakers?: string[]
  icon?: unknown
  isActive?: boolean
  countdownEnabled?: boolean
  countdownDate?: string | null
  badgeLabel?: string | null
  registrationLink?: string | null
  registrationLabel?: string | null
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
  meetingLink?: string | null
  type?: WebinarType
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
  webinarType?: WebinarType
  transactionNumber?: string | null
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
  webinarType?: WebinarType
  transactionNumber?: string | null
  message?: string | null
  declaration: boolean
  status?: 'pending' | 'confirmed' | 'rejected'
  createdAt?: Date
  updatedAt?: Date
}

export interface TestimonialDoc {
  id?: string
  name: string
  role: string
  content: string
  rating: number
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface GalleryImageDoc {
  id?: string
  src: string
  title: string
  category: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

// Publication-related types
export interface PublicationDoc {
  id?: string
  title: string
  description: string
  type: 'Journal' | 'Monograph' | 'Research'
  author?: string | null
  fileUrl?: string | null
  link?: string | null
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface PublicationSubmissionDoc {
  id?: string
  title: string
  description: string
  type: 'Journal' | 'Monograph' | 'Research'
  authorName: string
  authorEmail: string
  abstract?: string | null
  fileUrl?: string | null
  status: 'pending' | 'approved' | 'rejected'
  createdAt?: Date
  updatedAt?: Date
}

// Certificate-related types
export type CertificateAccountType = 'life' | 'annual' | 'student' | 'all'

export interface CertificateTextBlock {
  id: string
  content: string
  fontSize: number
  fontWeight: 'normal' | 'bold' | 'semibold'
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  color: string
  marginTop: number
  marginBottom: number
}

export interface CertificateTemplateDoc {
  id?: string
  name: string
  accountType: CertificateAccountType
  title: string
  subtitle: string
  textBlocks: CertificateTextBlock[]
  footerText: string
  logoUrl?: string | null
  signatureUrl?: string | null
  stampUrl?: string | null
  backgroundUrl?: string | null
  borderColor: string
  accentColor: string
  fontFamily: 'serif' | 'sans-serif' | 'cursive'
  isActive?: boolean
  isDefault?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CertificateDoc {
  id?: string
  templateId: string
  memberId: string
  memberUid: string
  memberName: string
  membershipType: string
  qualification?: string | null
  certificateNumber: string
  issueDate: string
  status?: 'issued' | 'revoked'
  createdAt?: Date
  updatedAt?: Date
}
