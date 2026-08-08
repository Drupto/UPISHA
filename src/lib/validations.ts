import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

export const joinSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number'),
  qualification: z.string().min(2, 'Qualification is required').max(200),
  rciNumber: z.string().optional().nullable(),
  membershipType: z.string().min(2, 'Membership type is required'),
  city: z.string().min(2, 'City is required').max(100),
  transactionNumber: z.string().min(2, 'Transaction number is required').max(100),
  message: z.string().max(5000).optional().nullable(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500),
  photoUrl: z.string().optional().nullable(),
  rciCertificateUrl: z.string().optional().nullable(),
  registrationDate: z.string().optional().nullable(),
  declaration: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration to submit',
  }),
})

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number').optional(),
  qualification: z.string().min(2, 'Qualification is required').max(200).optional(),
  rciNumber: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required').max(100).optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(500).optional(),
  photoUrl: z.string().optional().nullable(),
  rciCertificateUrl: z.string().optional().nullable(),
  registrationDate: z.string().optional().nullable(),
})

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const newsletterCampaignSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(20000),
  status: z.enum(['draft', 'sent']).optional().default('draft'),
})

export const webinarRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number'),
  qualification: z.string().max(200).optional().nullable(),
  city: z.string().min(2, 'City is required').max(100),
  webinarId: z.string().min(1, 'Webinar selection is required'),
  webinarTitle: z.string().min(1, 'Webinar title is required'),
  transactionNumber: z.string().min(2, 'Transaction number is required').max(100),
  message: z.string().max(5000).optional().nullable(),
  declaration: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration to submit',
  }),
})

export const webinarSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  speaker: z.string().min(2, 'Speaker name must be at least 2 characters').max(100),
  duration: z.string().min(1, 'Duration is required'),
  description: z.string().max(2000).optional().nullable(),
  registrationLink: z.string().url('Invalid URL').optional().nullable(),
  isActive: z.boolean().optional().default(true),
  maxAttendees: z.number().int().positive().optional().nullable(),
})

export const eventSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  date: z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(200),
  description: z.string().max(5000).optional().nullable(),
  type: z.string().max(100).optional().nullable(),
  time: z.string().max(100).optional().nullable(),
  speakers: z.array(z.string()).optional().nullable(),
  icon: z.any().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  countdownEnabled: z.boolean().optional().default(false),
  countdownDate: z.string().optional().nullable(),
  badgeLabel: z.string().max(100).optional().nullable(),
  registrationLink: z.string().max(500).optional().nullable(),
  registrationLabel: z.string().max(100).optional().nullable(),
})

export const announcementSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(2, 'Type must be at least 2 characters').max(100),
  content: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const publicationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  type: z.enum(['Journal', 'Monograph', 'Research']),
  author: z.string().max(200).optional().nullable(),
  fileUrl: z.string().max(1000).optional().nullable(),
  link: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

export const publicationSubmissionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  type: z.enum(['Journal', 'Monograph', 'Research']),
  authorName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  authorEmail: z.string().email('Invalid email address'),
  abstract: z.string().max(5000).optional().nullable(),
  fileUrl: z.string().max(1000).optional().nullable(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type JoinInput = z.infer<typeof joinSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>
export type WebinarRegistrationInput = z.infer<typeof webinarRegistrationSchema>
export type WebinarInput = z.infer<typeof webinarSchema>
export type EventInput = z.infer<typeof eventSchema>
export type AnnouncementInput = z.infer<typeof announcementSchema>
export type PublicationInput = z.infer<typeof publicationSchema>
export type PublicationSubmissionInput = z.infer<typeof publicationSubmissionSchema>
