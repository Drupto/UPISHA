import { NextRequest, NextResponse } from 'next/server'
import { getEvents as fetchEvents } from '@/lib/data'
import { createEvent } from '@/lib/firestore'
import { eventSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET() {
  try {
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