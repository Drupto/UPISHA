import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { retryOutboxItem } from '@/lib/email-outbox'
import { logAdminAction } from '@/lib/audit-log'
import { enforceAdminEndpointLimit } from '@/lib/admin-endpoint-guard'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return withSecurityHeaders(auth)
  const admin = auth as { uid: string; email: string | null }

  // Dedicated rate limit: guards the approval queue even against a
  // compromised or runaway admin session.
  const limited = await enforceAdminEndpointLimit(
    request,
    'email-outbox:retry',
    admin.uid
  )
  if (limited) return withSecurityHeaders(limited)

  const csrfError = withCsrfProtection(request)
  if (csrfError) return withSecurityHeaders(csrfError)

  const { id } = await params

  try {
    const result = await retryOutboxItem(id)

    if (result === 'not-found') {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Email request not found' }, { status: 404 })
      )
    }
    if (result === 'invalid-status') {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Only failed email requests can be retried.' },
          { status: 409 }
        )
      )
    }

    await logAdminAction({
      action: 'email.retry',
      resourceType: 'emailOutbox',
      resourceId: id,
      actor: admin,
      request,
    })

    return withSecurityHeaders(NextResponse.json({ success: true, status: 'approved' }))
  } catch (error) {
    console.error('Error retrying email request:', error)
    return withSecurityHeaders(
      NextResponse.json({ error: 'Failed to retry email request' }, { status: 500 })
    )
  }
}
