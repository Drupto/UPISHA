import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { withSecurityHeaders } from '@/lib/security'
import { listOutboxItems } from '@/lib/email-outbox'
import { EMAIL_OUTBOX_STATUSES } from '@/lib/email-outbox-types'
import type { EmailOutboxStatus } from '@/lib/email-outbox-types'
import { enforceAdminEndpointLimit } from '@/lib/admin-endpoint-guard'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }
  const admin = auth as { uid: string; email: string | null }

  // Dedicated rate limit: guards the approval queue even against a
  // compromised or runaway admin session.
  const limited = await enforceAdminEndpointLimit(
    request,
    'email-outbox:list',
    admin.uid,
    120
  )
  if (limited) return withSecurityHeaders(limited)

  const statusParam = request.nextUrl.searchParams.get('status')
  const status =
    statusParam && EMAIL_OUTBOX_STATUSES.includes(statusParam as EmailOutboxStatus)
      ? (statusParam as EmailOutboxStatus)
      : undefined
  const limitParam = Number(request.nextUrl.searchParams.get('limit') ?? '100')
  const limit = Number.isFinite(limitParam) ? limitParam : 100

  try {
    const items = await listOutboxItems({ status, limit })
    return withSecurityHeaders(NextResponse.json({ items, count: items.length }))
  } catch (error) {
    console.error('Error listing email outbox:', error)
    return withSecurityHeaders(
      NextResponse.json({ error: 'Failed to load email approvals' }, { status: 500 })
    )
  }
}
