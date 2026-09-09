import { NextResponse, NextRequest } from 'next/server'

// Rate limiting store with periodic cleanup to prevent memory leaks.
// Note: In production on serverless, use Redis/Vercel KV for distributed state.
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
let lastCleanup = Date.now()
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

export function rateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  // Periodically purge expired entries to bound memory usage
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, record] of rateLimitStore) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
    lastCleanup = now
  }

  const record = rateLimitStore.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Extract a stable identifier for rate limiting from a request.
 * Uses the client IP when available (via proxy headers) and falls back
 * to a static key. This prevents user-controlled email from being the
 * sole rate-limit key (H3).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

// Reset the rate limit counter for an identifier (e.g. after a successful registration)
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

// Security headers middleware
// In dev, keep 'unsafe-eval'/'unsafe-inline' so Next.js HMR and inline
// bootstrap scripts work. In production, serve the strict CSP.
const isProduction = process.env.NODE_ENV === 'production'

const strictCsp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com wss://firestore.googleapis.com wss://*.firebaseio.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"

const devCsp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com wss://firestore.googleapis.com wss://*.firebaseio.com; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"

export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Content-Security-Policy', isProduction ? strictCsp : devCsp)

  return response
}

/**
 * Platform-agnostic CDN cache headers for public, read-only API responses.
 * Relies purely on standard HTTP Cache-Control semantics, so it works
 * identically on Netlify, Firebase Hosting, Vercel, or self-hosted.
 */
export function withCacheHeaders(response: NextResponse, sMaxAge = 60): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${sMaxAge}, stale-while-revalidate=300`
  )
  return response
}

// Sanitize HTML to prevent XSS.
// Unicode escapes avoid the editor/formatter decoding the entities.
export function sanitizeHtml(input: string): string {
  if (!input) return input
  const map: Record<string, string> = {
    '&': '\u0026amp;',
    '<': '\u0026lt;',
    '>': '\u0026gt;',
    '"': '\u0026quot;',
    "'": '\u0026#039;'
  }
  return input.replace(/[&<>"']/g, c => map[c])
}

// Validate CSRF token using the Double Submit Cookie pattern:
// The token must be present in BOTH the x-csrf-token header AND the csrf-token cookie,
// and they must match. This prevents CSRF attacks because an attacker cannot set
// cookies on the victim's domain nor read the cookie value to forge the header.
export function validateCsrfToken(request: Request): boolean {
  const token = request.headers.get('x-csrf-token')
  const cookieHeader = request.headers.get('cookie') || ''

  // Extract csrf-token from cookie header
  const csrfCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('csrf-token='))
    ?.split('=')[1]

  if (!token || !csrfCookie) return false

  // Compare the header token with the cookie token
  return token.length > 0 && token === csrfCookie
}

// Generate CSRF token (for use in forms)
export function generateCsrfToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')
}

// CSRF protection middleware for POST/PUT/DELETE endpoints
export function withCsrfProtection(request: Request): NextResponse | null {
  // Check if request has valid CSRF token
  if (!validateCsrfToken(request)) {
    return withSecurityHeaders(NextResponse.json(
      { error: 'Missing or invalid csrf token' },
      { status: 403 }
    ))
  }

  return null // Continue with request
}