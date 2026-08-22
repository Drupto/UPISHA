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
 * Server-side route protection for admin and member pages.
 * Verifies the presence of the httpOnly session cookie. Full role
 * verification (admin vs member) is enforced by the API routes via
 * requireAdmin()/requireVerifiedMember() and the Firestore rules.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isPathProtected(pathname)) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('session')?.value

  // No session cookie — redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session cookie present — allow the request through.
  // The API routes and Firestore rules enforce the actual role.
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
}