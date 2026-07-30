import { NextRequest, NextResponse } from 'next/server'
import { getWebinars } from '@/lib/data'
import { createWebinar } from '@/lib/firestore'
import { webinarSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const webinars = await getWebinars()
    return withSecurityHeaders(NextResponse.json({ webinars }))
  } catch (error) {
    console.error('Error fetching webinars:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch webinars' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
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
      isActive: validated.isActive,
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