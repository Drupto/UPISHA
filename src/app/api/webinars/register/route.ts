import { NextRequest, NextResponse } from 'next/server'
import { createWebinarRegistration, getWebinarRegistrations } from '@/lib/firestore'
import { webinarRegistrationSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = webinarRegistrationSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`webinar-reg:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    const registration = await createWebinarRegistration({
      fullName: sanitizeHtml(validated.fullName),
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      qualification: validated.qualification ? sanitizeHtml(validated.qualification) : null,
      city: sanitizeHtml(validated.city),
      webinarId: validated.webinarId,
      webinarTitle: sanitizeHtml(validated.webinarTitle),
      transactionNumber: sanitizeHtml(validated.transactionNumber),
      message: validated.message ? sanitizeHtml(validated.message) : null,
      declaration: validated.declaration,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: registration.id,
      message: 'Registration successful! You will receive a confirmation email shortly.',
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
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const registrations = await getWebinarRegistrations()
    return withSecurityHeaders(NextResponse.json({ registrations }))
  } catch (error) {
    console.error('Error fetching webinar registrations:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 }))
  }
}