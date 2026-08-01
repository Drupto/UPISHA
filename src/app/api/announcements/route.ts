import { NextRequest, NextResponse } from 'next/server'
import { getAnnouncements, createAnnouncement } from '@/lib/firestore'
import { announcementSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const announcements = await getAnnouncements()
    return withSecurityHeaders(NextResponse.json({ announcements }))
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