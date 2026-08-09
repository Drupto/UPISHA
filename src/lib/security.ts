import { NextResponse } from 'next/server'

// Rate limiting store (in-memory for demo; use Redis/Vercel KV for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
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

// Reset the rate limit counter for an identifier (e.g. after a successful registration)
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier)
}

// Security headers middleware
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://*.googleapis.com wss://firestore.googleapis.com wss://*.firebaseio.com;")
  
  return response
}

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  if (!input) return input
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
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
