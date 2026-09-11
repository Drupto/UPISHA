import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken } from '@/lib/firebase-server'
import { createUserRecord, getUserByUid } from '@/lib/firestore'

export async function POST(request: NextRequest) {
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

    // Reduced session lifetime and secure cookie settings
    const response = NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userRecord?.role ?? 'user',
      emailVerified: decodedToken.emailVerified,
    })
    // Session cookie = the raw ID token. maxAge must not exceed the token's
    // own validity (Firebase ID tokens expire after exactly 1 hour), else the
    // cookie outlives its validity: protected pages would pass middleware
    // (presence-only check) but 401 at the API layer. Clients should re-POST
    // here on onIdTokenChanged to mint a fresh cookie before expiry.
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // aligned with the 1-hour ID token lifetime
      path: '/'
    })
    return response
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
