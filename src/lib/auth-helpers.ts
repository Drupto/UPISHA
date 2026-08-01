import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { verifyToken } from './firebase-admin'

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
 * Get the list of admin emails from the ADMIN_EMAILS env var.
 * Format: comma-separated list of email addresses.
 * Example: ADMIN_EMAILS=admin@upisha.org,admin2@upisha.org
 */
export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Check if a given email is in the admin allowlist.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const admins = getAdminEmails()
  if (admins.length === 0) return false
  return admins.includes(email.toLowerCase())
}

/**
 * Require an authenticated AND authorized admin user.
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
  if (!isAdminEmail(decoded.email)) {
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
