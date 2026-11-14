import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { rejectOutboxItem } from '@/lib/email-outbox'
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
    'email-outbox:reject',
    admin.uid
  )
  if (limited) return withSecurityHeaders(limited)

  const csrfError = withCsrfProtection(request)
  if (csrfError) return withSecurityHeaders(csrfError)

  const { id } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const reason = String(body?.reason ?? '').trim()
    if (reason.length < 3 || reason.length > 500) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'A rejection reason (3-500 characters) is required.' },
          { status: 400 }
        )
      )
    }

    const result = await rejectOutboxItem(
      id,
      { uid: admin.uid, email: admin.email },
      reason
    )

    if (result === 'not-found') {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Email request not found' }, { status: 404 })
      )
    }
    if (result === 'invalid-status') {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Only pending email requests can be rejected.' },
          { status: 409 }
        )
      )
    }

    await logAdminAction({
      action: 'email.reject',
      resourceType: 'emailOutbox',
      resourceId: id,
      actor: admin,
      request,
      details: { reason },
    })

    return withSecurityHeaders(NextResponse.json({ success: true, status: 'rejected' }))
  } catch (error) {
    console.error('Error rejecting email request:', error)
    return withSecurityHeaders(
      NextResponse.json({ error: 'Failed to reject email request' }, { status: 500 })
    )
  }
}
