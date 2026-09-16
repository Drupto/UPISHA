import { NextRequest, NextResponse } from 'next/server'
import {
  createWebinarRegistration,
  getWebinarRegistrations,
  getWebinarRegistrationsByEmail,
  getWebinarById,
  getWebinarRegistrationCount,
} from '@/lib/firestore'
import { webinarRegistrationSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit, resetRateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = webinarRegistrationSchema.parse(body)
    const email = validated.email.toLowerCase()

    // Rate limiting - 10 attempts per hour per email (generous to avoid blocking legit users)
    if (!rateLimit(`webinar-reg:${email}`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // Duplicate registration check: same email + same webinar
    const existing = await getWebinarRegistrationsByEmail(email)
    const alreadyRegistered = existing.some((r) => r.webinarId === validated.webinarId)
    if (alreadyRegistered) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'You have already registered for this webinar.' },
        { status: 409 }
      ))
    }

    // Capacity check: enforce maxAttendees if set
    const webinar = await getWebinarById(validated.webinarId)
    if (webinar?.maxAttendees && webinar.maxAttendees > 0) {
      const count = await getWebinarRegistrationCount(validated.webinarId)
      if (count >= webinar.maxAttendees) {
        return withSecurityHeaders(NextResponse.json(
          { error: 'Sorry, this webinar has reached its maximum capacity.' },
          { status: 409 }
        ))
      }
    }

    // Determine webinar type (fall back to the submitted value, or infer from webinar record)
    const webinarType = validated.webinarType ?? webinar?.type ?? 'paid'
    const isFree = webinarType === 'free'

    // For paid webinars, a transaction number is required
    if (!isFree && !validated.transactionNumber?.trim()) {
      return withSecurityHeaders(NextResponse.json(
        { error: 'Transaction number is required for paid webinars.' },
        { status: 400 }
      ))
    }

    // Free webinars are auto-confirmed; paid webinars require admin confirmation
    const status = isFree ? 'confirmed' : 'pending'

    const registration = await createWebinarRegistration({
      fullName: sanitizeHtml(validated.fullName),
      email,
      phone: validated.phone,
      qualification: validated.qualification ? sanitizeHtml(validated.qualification) : null,
      rciCrrNumber: validated.rciCrrNumber ? sanitizeHtml(validated.rciCrrNumber) : null,
      city: sanitizeHtml(validated.city),
      webinarId: validated.webinarId,
      webinarTitle: sanitizeHtml(validated.webinarTitle),
      webinarDate: webinar?.date ?? null,
      webinarTime: webinar?.time ?? null,
      webinarType,
      transactionNumber: validated.transactionNumber ? sanitizeHtml(validated.transactionNumber) : null,
      message: validated.message ? sanitizeHtml(validated.message) : null,
      declaration: validated.declaration,
      status,
    })

    // Reset rate limit on success so a user can register for multiple webinars
    resetRateLimit(`webinar-reg:${email}`)

    const message = isFree
      ? 'Registration successful! You are now registered for this free webinar. You will receive the webinar link via email.'
      : 'Registration submitted successfully! Your registration is pending admin confirmation. You will receive an email once confirmed.'

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: registration.id,
      registrationNumber: registration.registrationNumber,
      status,
      message,
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating webinar registration:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const registrations = await getWebinarRegistrations()
    return withSecurityHeaders(NextResponse.json({ registrations }))
  } catch (error) {
    console.error('Error fetching webinar registrations:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 }))
  }
}