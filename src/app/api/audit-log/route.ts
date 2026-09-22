import { NextRequest, NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/security'
import { requireAdmin } from '@/lib/auth-helpers'
import { getAuditLogs, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/audit-log'

/**
 * Admin-only read access to the append-only action audit trail.
 *
 * GET-only by design: the audit log has no update/delete surface anywhere in
 * the application, so the trail cannot be modified through this API.
 *
 * Query params:
 *   action    — exact action match (e.g. member.approve)
 *   actorEmail — exact admin email match
 *   from / to — ISO timestamps bounding the timestamp field
 *   limit     — page size (1..MAX_PAGE_SIZE, default DEFAULT_PAGE_SIZE)
 *   pageToken — opaque cursor from the previous page's nextPageToken
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) {
    return withSecurityHeaders(auth)
  }

  try {
    const searchParams = request.nextUrl.searchParams

    const action = searchParams.get('action')?.trim() || undefined
    const actorEmail = searchParams.get('actorEmail')?.trim() || undefined
    const pageToken = searchParams.get('pageToken')?.trim() || undefined

    let from: Date | undefined
    if (searchParams.get('from')) {
      const parsed = new Date(searchParams.get('from') as string)
      if (Number.isNaN(parsed.getTime())) {
        return withSecurityHeaders(NextResponse.json({ error: 'Invalid "from" date' }, { status: 400 }))
      }
      from = parsed
    }

    let to: Date | undefined
    if (searchParams.get('to')) {
      const parsed = new Date(searchParams.get('to') as string)
      if (Number.isNaN(parsed.getTime())) {
        return withSecurityHeaders(NextResponse.json({ error: 'Invalid "to" date' }, { status: 400 }))
      }
      to = parsed
    }

    let limit: number | undefined
    if (searchParams.get('limit')) {
      const parsed = Number.parseInt(searchParams.get('limit') as string, 10)
      if (Number.isNaN(parsed) || parsed < 1 || parsed > MAX_PAGE_SIZE) {
        return withSecurityHeaders(NextResponse.json(
          { error: `Invalid "limit" — must be between 1 and ${MAX_PAGE_SIZE}` },
          { status: 400 }
        ))
      }
      limit = parsed
    }

    const page = await getAuditLogs({ action, actorEmail, from, to, limit, pageToken })

    // Audit data must never be cached or shared between admin sessions.
    return withSecurityHeaders(
      NextResponse.json(page, { headers: { 'Cache-Control': 'no-store' } })
    )
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return withSecurityHeaders(
      NextResponse.json({ error: `Failed to fetch audit logs (default limit ${DEFAULT_PAGE_SIZE})` }, { status: 500 })
    )
  }
}