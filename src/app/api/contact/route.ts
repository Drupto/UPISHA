import { NextRequest, NextResponse } from 'next/server'
import { createContactMessage, getContactMessages } from '@/lib/firestore'
import { contactSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`contact:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    await createContactMessage({
      name: validated.name,
      email: validated.email,
      subject: validated.subject,
      message: validated.message,
    })

    return withSecurityHeaders(NextResponse.json({ success: true }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating contact message:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to send message' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const messages = await getContactMessages()
    return withSecurityHeaders(NextResponse.json({ messages }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 }))
  }
}
