import { NextRequest, NextResponse } from 'next/server'
import { createPublicationSubmission, getPublicationSubmissions } from '@/lib/firestore'
import { withSecurityHeaders, sanitizeHtml, rateLimit, withCsrfProtection } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { publicationSubmissionSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = publicationSubmissionSchema.parse(body)
    const email = validated.authorEmail.toLowerCase()

    // Rate limiting - 5 submissions per hour per email
    if (!rateLimit(`pub-sub:${email}`, 5, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection (double-submit) — same pattern as /api/join and
    // /api/contact; the client (PublicationsSection) already ships the token.
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    const submission = await createPublicationSubmission({
      title: sanitizeHtml(validated.title),
      description: sanitizeHtml(validated.description),
      type: validated.type,
      authorName: sanitizeHtml(validated.authorName),
      authorEmail: email,
      abstract: validated.abstract ? sanitizeHtml(validated.abstract) : null,
      fileUrl: validated.fileUrl ? sanitizeHtml(validated.fileUrl) : null,
      status: 'pending',
    })

    return withSecurityHeaders(NextResponse.json({
      success: true,
      id: submission.id,
      message: 'Submission received! Your work is pending admin review. You will be notified once it is approved.',
    }, { status: 201 }))
  } catch (err: unknown) {
    console.error('Error creating publication submission:', err)
    if (typeof err === 'object' && err !== null && 'issues' in err) {
      const issues = (err as { issues: Array<{ message: string }> }).issues
      const message = issues?.[0]?.message || 'Invalid input data'
      return withSecurityHeaders(NextResponse.json({ error: message }, { status: 400 }))
    }
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to submit publication' }, { status: 500 }))
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const submissions = await getPublicationSubmissions()
    return withSecurityHeaders(NextResponse.json({ submissions }))
  } catch (error) {
    console.error('Error fetching publication submissions:', error)
    return withSecurityHeaders(NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 }))
  }
}