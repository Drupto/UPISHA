import { NextRequest, NextResponse } from 'next/server'
import { upsertNewsletterSubscriber, getNewsletterSubscribers } from '@/lib/firestore'
import { newsletterSchema } from '@/lib/validations'
import { withSecurityHeaders, withAppCheckProtection } from '@/lib/security'
import { publicFormsDisabledResponse, enforcePublicEndpointLimit } from '@/lib/public-endpoint-guard'
import { requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = newsletterSchema.parse(body)

    // Operator kill switch + distributed per-IP/global/email limits.
    const disabled = publicFormsDisabledResponse()
    if (disabled) return disabled
    const limited = await enforcePublicEndpointLimit(request, 'newsletter', {
      perIp: 10,
      global: 100,
      email: validated.email,
      perEmail: 5,
    })
    if (limited) return limited

    // This is a public, unauthenticated form — no CSRF protection needed
    // (there is no authenticated session to protect). CSRF protection is
    // applied to authenticated/admin state-changing routes instead.
    // Firebase App Check IS applied (APP_CHECK.md §5): it is the bot/mail-
    // bombing defense here. Monitor logs-and-allows; enforce 403s.
    const appCheckError = await withAppCheckProtection(request)
    if (appCheckError) return withSecurityHeaders(appCheckError)

    await upsertNewsletterSubscriber(validated.email.toLowerCase())

    // Do not return the subscriber's email as the ID (L2).
    return withSecurityHeaders(NextResponse.json({ success: true }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error subscribing to newsletter:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const { subscribers, count } = await getNewsletterSubscribers()
    return withSecurityHeaders(NextResponse.json({ subscribers, count }))
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 }))
  }
}