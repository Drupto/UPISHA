import { NextRequest, NextResponse } from 'next/server'
import { createContactMessage, getContactMessages } from '@/lib/firestore'
import { contactSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`contact:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

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
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const messages = await getContactMessages()
    return withSecurityHeaders(NextResponse.json({ messages }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 }))
  }
}
