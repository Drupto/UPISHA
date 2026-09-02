import { NextResponse, NextRequest } from 'next/server'

// Paths that require an authenticated admin session
const ADMIN_PATHS = ['/admin']
const MEMBER_PATHS = ['/member']

function isPathProtected(pathname: string): boolean {
  return (
    ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    MEMBER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  )
}

/**
 * Verify a Firebase ID token via the identitytoolkit REST API.
 * Edge-runtime safe: uses fetch only, no Firebase SDK imports, so this can
 * run inside middleware without pulling the client SDK into the Edge bundle.
 */
async function isValidSession(token: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey || !token) return false
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
        cache: 'no-store',
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data?.users?.[0]?.localId)
  } catch {
    // Fail closed: if verification is unavailable, deny the protected page.
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPathProtected(pathname)) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('session')?.value

  // No session cookie, or the token no longer verifies — redirect to login (N6)
  if (!sessionToken || !(await isValidSession(sessionToken))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    if (sessionToken) {
      // Clear the stale session cookie so the client stops sending it
      response.cookies.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      })
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
}