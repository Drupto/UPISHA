import { NextRequest, NextResponse } from 'next/server'
import { createTeachRequest, getTeachRequests } from '@/lib/firestore'
import { teachRequestSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = teachRequestSchema.parse(body)

    // Rate limiting (same policy as the contact endpoint)
    if (!rateLimit(`teach:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    await createTeachRequest({
      name: validated.name,
      email: validated.email,
      phone: validated.phone,
      qualification: validated.qualification,
      expertise: validated.expertise,
      topic: validated.topic,
      experience: validated.experience,
      format: validated.format,
      city: validated.city || null,
      links: validated.links || null,
      message: validated.message || null,
      status: 'new',
      isRead: false,
    })

    return withSecurityHeaders(NextResponse.json({ success: true }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating teach request:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit request' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const requests = await getTeachRequests()
    return withSecurityHeaders(NextResponse.json({ requests }))
  } catch (error) {
    console.error('Error fetching teach requests:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch teach requests' }, { status: 500 }))
  }
}