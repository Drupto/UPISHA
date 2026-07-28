import { NextRequest, NextResponse } from 'next/server'
import { upsertNewsletterSubscriber, getNewsletterSubscribers } from '@/lib/firestore'
import { newsletterSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit } from '@/lib/security'
import { requireAuth } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = newsletterSchema.parse(body)

    // Rate limiting
    if (!rateLimit(`newsletter:${validated.email}`, 5, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    const subscriber = await upsertNewsletterSubscriber(validated.email.toLowerCase())

    return withSecurityHeaders(NextResponse.json({ success: true, id: subscriber.id }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error subscribing to newsletter:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request)
  if ('status' in auth && auth.status === 401) {
    return withSecurityHeaders(auth as NextResponse)
  }

  try {
    const { subscribers, count } = await getNewsletterSubscribers()
    return withSecurityHeaders(NextResponse.json({ subscribers, count }))
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 }))
  }
}
