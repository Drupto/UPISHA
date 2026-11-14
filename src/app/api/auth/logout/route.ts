import { NextRequest, NextResponse } from 'next/server'
import { withSecurityHeaders, withCsrfProtection, withAppCheckProtection } from '@/lib/security'
import { verifyIdToken, verifySessionCookie } from '@/lib/firebase-server'
import { logAdminAction } from '@/lib/audit-log'

/**
 * Clears the session cookie. The logout audit entry is best-effort: the
 * session token may already be expired/revoked (that is often WHY the user
 * is logging out), so verification failure must never block the cookie
 * clearing - the response is identical to the previous version.
 */
export async function POST(request: NextRequest) {
  // CSRF protection for mutating requests (prevents cross-site forced-logout).
  const csrfError = withCsrfProtection(request)
  if (csrfError) {
    return withSecurityHeaders(csrfError)
  }

  // Firebase App Check (APP_CHECK.md section 5): attestation verified alongside
  // CSRF. A failure must never trap the user in a logged-in state, so on
  // rejection we clear the session cookie on the 403 response itself
  // (fail-closed on attestation, fail-open on the session cleanup).
  const appCheckError = await withAppCheckProtection(request)
  if (appCheckError) {
    appCheckError.cookies.set('session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' })
    return appCheckError
  }

  try {
    const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const cookieToken = request.cookies.get('session')?.value
    const sessionToken = bearerToken || cookieToken
    if (sessionToken) {
      // Dual transport: Bearer = ID token; cookie = Admin SDK session cookie
      // (with a transitional raw-ID-token fallback - see auth-helpers).
      const decoded = bearerToken
        ? await verifyIdToken(bearerToken, false)
        : await verifySessionCookie(sessionToken, false).catch(() =>
            verifyIdToken(sessionToken, false)
          )
      await logAdminAction({
        action: 'auth.logout',
        resourceType: 'auth',
        resourceId: decoded.uid,
        actor: { uid: decoded.uid, email: decoded.email },
        request,
      })
    }
  } catch {
    // Token missing/invalid/expired - proceed with logout regardless.
  }

  const response = withSecurityHeaders(NextResponse.json({ success: true }))
  response.cookies.set('session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' })
  return response
}
