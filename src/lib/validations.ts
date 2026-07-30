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

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type JoinInput = z.infer<typeof joinSchema>
export type NewsletterInput = z.infer<typeof newsletterSchema>