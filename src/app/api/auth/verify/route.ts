import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken, getAdminAuth } from '@/lib/firebase-server'
import { createUserRecord, getUserByUid } from '@/lib/firestore'

// Session cookie lifetime (L1 residual fix). Firebase caps session cookies
// at 14 days; the default is 7. Override via SESSION_COOKIE_MAX_AGE_HOURS.
const DEFAULT_SESSION_HOURS = 24 * 7
const MAX_SESSION_HOURS = 24 * 14

function sessionMaxAgeMs(): number {
  const raw = Number(process.env.SESSION_COOKIE_MAX_AGE_HOURS)
  const hours = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_HOURS
  return Math.min(hours, MAX_SESSION_HOURS) * 60 * 60 * 1000
}

export async function POST(request: NextRequest) {
  // CSRF note (re-audit Group B decision - no change required): deliberately
  // NOT CSRF-protected. This endpoint is token-bearing: it requires a valid
  // Firebase ID token in the JSON body and only 401s without one. A
  // cross-site attacker can neither read nor force-attach that token (the
  // session cookie is SameSite=Strict, so it is not sent on cross-site
  // requests either), so a CSRF check would add no protection here.
  try {
    const body = await request.json()
    const { token } = body
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    // Admin SDK verification with revocation checking (checkRevoked=true).
    const decodedToken = await verifyIdToken(token, true)

    // Ensure a user record exists in Firestore (role-based access control).
    // Default role is 'user'; existing records are preserved (merge).
    let userRecord = await getUserByUid(decodedToken.uid)
    if (!userRecord) {
      await createUserRecord({
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        role: 'user',
      })
      userRecord = await getUserByUid(decodedToken.uid)
    }

    const response = NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userRecord?.role ?? 'user',
      emailVerified: decodedToken.emailVerified,
    })

    const maxAgeMs = sessionMaxAgeMs()
    try {
      // L1 residual fix: mint an Admin SDK SESSION cookie instead of storing
      // the raw 1-hour ID token. The cookie is an opaque token verifiable
      // server-side via verifySessionCookie() (with revocation checking) and
      // outlives the ID token, so sessions no longer dead-fail at 60 minutes.
      // NOTE: createSessionCookie() only accepts ID tokens minted within the
      // last 5 minutes - clients force-refresh before posting here
      // (refreshAuthToken() -> getIdToken(true)).
      const sessionCookie = await getAdminAuth().createSessionCookie(token, {
        expiresIn: maxAgeMs,
      })
      response.cookies.set('session', sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Math.floor(maxAgeMs / 1000),
        path: '/',
      })
    } catch {
      // Fallback (e.g. token older than the 5-minute freshness window
      // createSessionCookie requires): keep the previous raw-ID-token cookie,
      // with maxAge aligned to the token's own 1-hour validity. Clients
      // re-POST here on onIdTokenChanged to mint a fresh cookie before expiry.
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60,
        path: '/',
      })
    }
    return response
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
