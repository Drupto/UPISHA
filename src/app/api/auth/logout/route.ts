import { NextRequest, NextResponse } from 'next/server'
import { withSecurityHeaders, withCsrfProtection } from '@/lib/security'
import { verifyIdToken } from '@/lib/firebase-server'
import { logAdminAction } from '@/lib/audit-log'

/**
 * Clears the session cookie. The logout audit entry is best-effort: the
 * session token may already be expired/revoked (that is often WHY the user
 * is logging out), so verification failure must never block the cookie
 * clearing — the response is identical to the previous version.
 */
export async function POST(request: NextRequest) {
  // CSRF protection for mutating requests (prevents cross-site forced-logout).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  try {
    const sessionToken =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('session')?.value
    if (sessionToken) {
      const decoded = await verifyIdToken(sessionToken, false)
      await logAdminAction({
        action: 'auth.logout',
        resourceType: 'auth',
        resourceId: decoded.uid,
        actor: { uid: decoded.uid, email: decoded.email },
        request,
      })
    }
  } catch {
    // Token missing/invalid/expired — proceed with logout regardless.
  }

  const response = withSecurityHeaders(NextResponse.json({ success: true }))
  response.cookies.set('session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' })
  return response
}
