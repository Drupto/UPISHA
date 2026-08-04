import { NextResponse, NextRequest } from 'next/server'
import { verifyToken } from './firebase-admin'
import { getUserByUid } from './firestore'

export async function requireAuth(request: NextRequest) {
  const sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') || 
                       request.cookies.get('session')?.value

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decodedToken = await verifyToken(sessionToken)
    return decodedToken
  } catch {
    return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 })
  }
}

/**
 * Require an authenticated AND email-verified member user.
 * Role must be 'member' or 'admin', and the user's email must be verified.
 * Returns the decoded token on success, or a 401/403 NextResponse on failure.
 */
export async function requireVerifiedMember(request: NextRequest) {
  const auth = await requireAuth(request)
  // If requireAuth returned a NextResponse (error), propagate it
  if (auth instanceof NextResponse) {
    return auth
  }
  // auth is the decoded token object { uid, email, name, emailVerified }
  const decoded = auth as { uid: string; email: string | null; name: string | null; emailVerified: boolean }
  const userRecord = await getUserByUid(decoded.uid)
  const isMember = userRecord?.role === 'member' || userRecord?.role === 'admin'
  if (!isMember) {
    return NextResponse.json(
      { authenticated: true, error: 'Forbidden: member access required' },
      { status: 403 }
    )
  }
  if (!decoded.emailVerified) {
    return NextResponse.json(
      { authenticated: true, error: 'Email verification required' },
      { status: 403 }
    )
  }
  return decoded
}

/**
 * Require an authenticated AND authorized admin user.
 * Role is determined from the Firestore `users` collection (role-based access control).
 * Returns the decoded token on success, or a 401/403 NextResponse on failure.
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request)
  // If requireAuth returned a NextResponse (error), propagate it
  if (auth instanceof NextResponse) {
    return auth
  }
  // auth is the decoded token object { uid, email, name }
  const decoded = auth as { uid: string; email: string | null; name: string | null }
  const userRecord = await getUserByUid(decoded.uid)
  if (userRecord?.role !== 'admin') {
    return NextResponse.json(
      { authenticated: true, error: 'Forbidden: admin access required' },
      { status: 403 }
    )
  }
  return decoded
}

export function createErrorResponse(error: unknown, defaultMessage: string, status: number = 500) {
  console.error(defaultMessage, error)
  return NextResponse.json({ error: defaultMessage }, { status })
}
