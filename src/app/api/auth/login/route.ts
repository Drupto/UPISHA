import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { withSecurityHeaders, getClientIp, withCsrfProtection, withAppCheckProtection } from '@/lib/security'
import { checkRateLimitStrict } from '@/lib/firestore-rate-limit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = loginSchema.parse(body)
    
    // Rate limiting — use IP + email to prevent bypass via email change (H3).
    // Distributed (Firestore transactions): shared across serverless
    // instances, unlike the legacy in-memory limiter (H3 residual),
    // fail-closed: a Firestore outage fails logins closed (503) rather than
    // opening a brute-force window during the outage.
    const clientIp = getClientIp(request)
    const clientId = `${clientIp}:${validated.email}`
    let rate: { allowed: boolean; remaining: number; resetTime: number }
    try {
      rate = await checkRateLimitStrict(`login:${clientId}`, 5, 15 * 60 * 1000)
    } catch (limiterError) {
      // checkRateLimitStrict() throws when Firestore is unavailable (its
      // fail-closed contract). Catch it here so it never reaches the outer
      // catch below, which would mask the outage as "Invalid email or
      // password" (401/500) — indistinguishable from a wrong password.
      // An honest 503 (fail-closed; no credential check was performed)
      // tells the caller to retry shortly.
      console.error('Login rate limiter unavailable:', limiterError)
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again shortly.' },
          { status: 503, headers: { 'Retry-After': '30' } }
        )
      )
    }
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection (defense-in-depth): no client currently calls this
    // route (login goes through the Firebase client SDK + /api/auth/verify),
    // but if it is ever wired up it must not be cross-site callable
    // (login CSRF would let an attacker log the victim into a
    // attacker-controlled account).
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    // Firebase App Check (APP_CHECK.md §5): bot defense for credential
    // stuffing on this endpoint. Verified before hitting Firebase Auth.
    // Monitor logs-and-allows; enforce 403s.
    const appCheckError = await withAppCheckProtection(request)
    if (appCheckError) return withSecurityHeaders(appCheckError)

    const { user } = await loginUser(validated.email, validated.password)
    // Do NOT return the token in the response body (H2).
    // The client calls /api/auth/verify with the token to establish the
    // httpOnly session cookie.
    const response = withSecurityHeaders(NextResponse.json({ 
      user: { uid: user.uid, email: user.email, displayName: user.displayName }, 
    }))
    return response
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    const error = err as { code?: string; message?: string }
    const status = error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 401 : 500
    return withSecurityHeaders(NextResponse.json({ error: 'Invalid email or password' }, { status }))
  }
}
