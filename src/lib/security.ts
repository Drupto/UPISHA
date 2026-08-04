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

// Validate CSRF token (simplified; use next-csrf for production)
export function validateCsrfToken(request: Request): boolean {
  const token = request.headers.get('x-csrf-token')
  const sessionToken = request.headers.get('x-session-token')
  
  if (!token || !sessionToken) return false
  
  // In production, validate against session store
  return token.length > 0 && sessionToken.length > 0 && token === sessionToken
}

// Generate CSRF token (for use in forms)
export function generateCsrfToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('')
}