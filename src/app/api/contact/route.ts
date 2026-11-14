import { NextRequest, NextResponse } from 'next/server'
import { createContactMessage, getContactMessages } from '@/lib/firestore'
import { enqueueEmail } from '@/lib/email-outbox'
import { contactSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit, withCsrfProtection, withAppCheckProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { publicFormsDisabledResponse, enforcePublicEndpointLimit } from '@/lib/public-endpoint-guard'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = contactSchema.parse(body)

    // Operator kill switch + distributed per-IP/global/email limits.
    const disabled = publicFormsDisabledResponse()
    if (disabled) return disabled
    const limited = await enforcePublicEndpointLimit(request, 'contact', {
      perIp: 5,
      global: 100,
      email: validated.email,
      perEmail: 3,
    })
    if (limited) return limited

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    // Firebase App Check (APP_CHECK.md §5): primary bot defense for this
    // public form. Cheap checks first (rate limit, CSRF, body validation
    // above); attestation verified before the Firestore write. Monitor
    // logs-and-allows; enforce 403s.
    const appCheckError = await withAppCheckProtection(request)
    if (appCheckError) return appCheckError

    const message = await createContactMessage({
      name: validated.name,
      email: validated.email,
      subject: validated.subject,
      message: validated.message,
    })

    // Approval gate: queue the acknowledgment for an admin decision. No email
    // is sent directly from this public endpoint.
    try {
      await enqueueEmail({
        dedupeKey: `contact-ack:${message.id}`,
        template: 'contact-ack',
        to: { email: validated.email, name: validated.name },
        templateData: {
          name: validated.name,
          subject: validated.subject,
          message: validated.message,
          ticketNumber: message.id.slice(0, 8).toUpperCase(),
        },
        source: { collection: 'contactMessages', id: message.id },
        requestedBy: { type: 'public' },
      })
    } catch (queueError) {
      console.error('Failed to queue contact acknowledgment:', queueError)
    }

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
