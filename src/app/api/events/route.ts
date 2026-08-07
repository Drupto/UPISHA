import { NextRequest, NextResponse } from 'next/server'
import { getEvents as fetchEvents } from '@/lib/data'
import { createEvent } from '@/lib/firestore'
import { eventSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`events:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const events = await fetchEvents()
    return withSecurityHeaders(NextResponse.json({ events }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const validated = eventSchema.parse(body)

    if (!rateLimit(`event:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const event = await createEvent({
      title: sanitizeHtml(validated.title),
      date: validated.date,
      location: sanitizeHtml(validated.location),
      description: validated.description ? sanitizeHtml(validated.description) : null,
      isActive: validated.isActive,
      countdownEnabled: validated.countdownEnabled,
      countdownDate: validated.countdownDate,
      badgeLabel: validated.badgeLabel ? sanitizeHtml(validated.badgeLabel) : null,
      registrationLink: validated.registrationLink,
      registrationLabel: validated.registrationLabel ? sanitizeHtml(validated.registrationLabel) : null,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: event.id,
      message: 'Event created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating event:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create event' }, { status: 500 }))
  }
}