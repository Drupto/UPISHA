import { NextRequest, NextResponse } from 'next/server'
import { verifyIdToken, verifySessionCookie } from '@/lib/firebase-server'
import { getUserByUid, getMemberByUid } from '@/lib/firestore'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) return NextResponse.json({ authenticated: false }, { status: 401 })

    // The session cookie may be either an Admin SDK SESSION cookie (minted by
    // /api/auth/verify - L1 residual fix) or, transitionally, a raw ID token
    // from a pre-deploy session. verifySessionCookie() rejects ID tokens and
    // verifyIdToken() is the fallback; both enforce revocation checking.
    const decodedToken = await verifySessionCookie(sessionToken, true).catch(() =>
      verifyIdToken(sessionToken, true)
    )
    const userRecord = await getUserByUid(decodedToken.uid)

    // Fetch member approval status (only for member role)
    let memberStatus: string | null = null
    if (userRecord?.role === 'member') {
      const member = await getMemberByUid(decodedToken.uid)
      memberStatus = member?.status ?? null
    }

    return NextResponse.json({
      authenticated: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: userRecord?.role ?? 'user',
      emailVerified: decodedToken.emailVerified,
      memberStatus,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
