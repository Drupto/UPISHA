import { NextRequest, NextResponse } from 'next/server'
import { getWebinars } from '@/lib/data'
import { createWebinar, getWebinarRegistrationCount } from '@/lib/firestore'
import { webinarSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`webinars:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const webinars = await getWebinars()
    // Attach registration counts for capacity display
    const webinarsWithCounts = await Promise.all(
      webinars.map(async (w) => {
        if (!w.id) return w
        try {
          const count = await getWebinarRegistrationCount(w.id)
          return { ...w, registrationCount: count }
        } catch {
          return w
        }
      })
    )
    return withSecurityHeaders(NextResponse.json({ webinars: webinarsWithCounts }))
  } catch (error) {
    console.error('Error fetching webinars:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const body = await request.json()
    const validated = webinarSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`webinar:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const webinar = await createWebinar({
      title: sanitizeHtml(validated.title),
      date: validated.date,
      time: validated.time,
      speaker: sanitizeHtml(validated.speaker),
      duration: validated.duration,
      description: validated.description ? sanitizeHtml(validated.description) : null,
      registrationLink: validated.registrationLink ? sanitizeHtml(validated.registrationLink) : null,
      meetingLink: validated.meetingLink ? sanitizeHtml(validated.meetingLink) : null,
      type: validated.type ?? 'paid',
      isActive: validated.isActive,
      maxAttendees: validated.maxAttendees ?? null,
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: webinar.id,
      message: 'Webinar created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating webinar:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create webinar' }, { status: 500 }))
  }
}
