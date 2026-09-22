import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements as fetchAnnouncements } from '@/lib/data'
import { createAnnouncement } from '@/lib/firestore'
import { announcementSchema } from '@/lib/validations'
import { withSecurityHeaders, withCacheHeaders, sanitizeHtml, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public endpoint
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'anonymous'
    
    if (!rateLimit(`announcements:${ip}`, 30, 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const announcements = await fetchAnnouncements()
    return withCacheHeaders(withSecurityHeaders(NextResponse.json({ announcements })))
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection
  const csrfError = withCsrfProtection(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const validated = announcementSchema.parse(body)

    if (!rateLimit(`announcement:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const announcement = await createAnnouncement({
      title: sanitizeHtml(validated.title),
      date: validated.date,
      type: sanitizeHtml(validated.type),
      content: validated.content ? sanitizeHtml(validated.content) : null,
      isActive: validated.isActive,
    })

    await logAdminAction({
      action: 'announcement.create',
      resourceType: 'announcement',
      resourceId: announcement.id,
      actor: admin,
      request,
      details: { title: validated.title, type: validated.type },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: announcement.id,
      message: 'Announcement created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating announcement:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 }))
  }
}