/**
 * Dedicated rate limiting for admin API endpoints.
 *
 * Admin routes already sit behind `requireAdmin` + CSRF + audit logging; this
 * adds a Firestore-backed, fail-closed throttle keyed by admin UID + IP so a
 * compromised or runaway admin session cannot hammer sensitive endpoints
 * (e.g. the email approval queue) at automation speed.
 *
 * SERVER ONLY.
 */

import { NextResponse } from 'next/server'
import { withSecurityHeaders } from '@/lib/security'
import { checkRateLimitStrict, getClientIp } from '@/lib/firestore-rate-limit'

const DEFAULT_LIMIT = 30
const DEFAULT_WINDOW_MS = 5 * 60 * 1000

/**
 * Returns a 429/503 response when the admin should be throttled, else null.
 * Fail-closed: a limiter outage blocks the action instead of opening the tap.
 */
export async function enforceAdminEndpointLimit(
  request: Request,
  action: string,
  adminUid: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<NextResponse | null> {
  const ip = getClientIp(request.headers)
  const safeAction = action.replace(/[^a-z0-9:-]/gi, '-').toLowerCase()

  try {
    const check = await checkRateLimitStrict(
      `admin:${safeAction}:${adminUid}:${ip}`,
      limit,
      windowMs
    )
    if (!check.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Too many admin actions. Please slow down.' },
          { status: 429, headers: { 'Retry-After': '300' } }
        )
      )
    }
    return null
  } catch (error) {
    console.error(`Admin endpoint limiter unavailable for ${action}:`, error)
    return withSecurityHeaders(
      NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again shortly.' },
        { status: 503, headers: { 'Retry-After': '30' } }
      )
    )
  }
}
