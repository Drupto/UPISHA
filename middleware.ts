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

// ---------------------------------------------------------------------------
// Content-Security-Policy (M1 residual fix - nonce-based production CSP)
//
// The page-level CSP is owned by this middleware so a per-request nonce can
// be minted and propagated: Next.js reads the CSP header we set on the
// REQUEST (via NextResponse.next({ request: { headers } })) and stamps the
// nonce onto every <script> it renders - including its inline bootstrap
// scripts and inline next/script blocks (the consent-gated GA4 snippet).
// 'strict-dynamic' lets trusted (nonced) scripts load their own dependencies
// (gtag.js injected after consent, reCAPTCHA enterprise.js injected by the
// App Check SDK). The host allowlist is kept as a fallback for CSP2-only
// browsers, which ignore 'strict-dynamic'.
//
// Keep the reCAPTCHA origins in sync with src/lib/security.ts (API-response
// CSP) - see APP_CHECK.md section 4. API routes keep their own
// withSecurityHeaders() CSP; those responses are JSON and never run scripts.
// In development, Next.js HMR needs 'unsafe-eval'/'unsafe-inline', so the
// dev CSP is served without a nonce.
// ---------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production'

// reCAPTCHA Enterprise endpoints required by Firebase App Check.
const recaptchaScriptSrc = 'https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/'
const recaptchaConnectSrc = 'https://www.google.com/recaptcha/'
const recaptchaFrameSrc = 'https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/'

function buildCsp(nonce: string): string {
  const scriptSrc = isProduction
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com ${recaptchaScriptSrc}`
    : `'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com ${recaptchaScriptSrc}`

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com`,
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com ${recaptchaConnectSrc} wss://firestore.googleapis.com wss://*.firebaseio.com`,
    `font-src 'self' data:`,
    `frame-src https://www.openstreetmap.org ${recaptchaFrameSrc}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Per-request nonce for the production CSP (crypto.randomUUID is available
  // in the edge runtime; a UUID is a valid CSP nonce string).
  const nonce = crypto.randomUUID()
  const csp = buildCsp(nonce)

  // Hand the CSP to Next.js on the REQUEST so it can stamp the nonce onto the
  // scripts it renders (documented middleware CSP pattern).
  const requestHeaders = new Headers(request.headers)
  if (isProduction) {
    requestHeaders.set('Content-Security-Policy', csp)
  }

  let response: NextResponse

  if (isPathProtected(pathname)) {
    const sessionToken = request.cookies.get('session')?.value

    // No session cookie - redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      response = NextResponse.redirect(loginUrl)
    } else {
      // Session cookie present - allow the request through.
      // The API routes and Firestore rules enforce the actual role.
      response = NextResponse.next({ request: { headers: requestHeaders } })
    }
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  // The CSP nonce must cover every page. API routes are excluded (they set
  // their own headers via withSecurityHeaders()); static assets never run
  // scripts and are skipped to avoid needless edge invocations.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
}
