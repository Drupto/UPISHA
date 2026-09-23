import { NextRequest, NextResponse } from 'next/server'
import { createNewsletterCampaign, getNewsletterCampaigns } from '@/lib/firestore'
import { newsletterCampaignSchema } from '@/lib/validations'
import { withSecurityHeaders, sanitizeHtml, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAdminAction } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const campaigns = await getNewsletterCampaigns()
    return withSecurityHeaders(NextResponse.json({ campaigns }))
  } catch (error) {
    console.error('Error fetching newsletter campaigns:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 }))
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // CSRF protection for mutating requests (parity with the certificates [id]
  // endpoints).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    const body = await request.json()
    const validated = newsletterCampaignSchema.parse(body)

    if (!rateLimit(`newsletter-campaign:create`, 10, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 }))
    }

    const campaign = await createNewsletterCampaign({
      title: sanitizeHtml(validated.title),
      subject: sanitizeHtml(validated.subject),
      content: sanitizeHtml(validated.content),
      status: validated.status,
    })

    await logAdminAction({
      action: 'campaign.create',
      resourceType: 'newsletterCampaign',
      resourceId: campaign.id,
      actor: admin,
      request,
      details: { title: validated.title, subject: validated.subject, status: validated.status },
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: campaign.id,
      message: 'Newsletter campaign created successfully',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating newsletter campaign:', err)
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 }))
  }
}