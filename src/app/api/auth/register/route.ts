import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { withSecurityHeaders, withCsrfProtection, withAppCheckProtection } from '@/lib/security'
import { checkRateLimitStrict } from '@/lib/firestore-rate-limit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)
    
    // Rate limiting — distributed (Firestore transactions): shared across
    // serverless instances, unlike the legacy in-memory limiter
    // (H3 residual), fail-closed: a Firestore outage fails registrations
    // closed (503) rather than opening a mass-account-creation window.
    let rate: { allowed: boolean; remaining: number; resetTime: number }
    try {
      rate = await checkRateLimitStrict(`register:${validated.email}`, 3, 60 * 60 * 1000)
    } catch (limiterError) {
      // Same shape as the login guard: keep the limiter outage an honest
      // 503 and out of the generic outer catch below.
      console.error('Register rate limiter unavailable:', limiterError)
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again shortly.' },
          { status: 503, headers: { 'Retry-After': '30' } }
        )
      )
    }
    if (!rate.allowed) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

    // Firebase App Check (APP_CHECK.md §5): bot defense for mass account
    // creation. Verified before hitting Firebase Auth. Monitor
    // logs-and-allows; enforce 403s.
    const appCheckError = await withAppCheckProtection(request)
    if (appCheckError) return withSecurityHeaders(appCheckError)

    const { user } = await registerUser(validated.email, validated.password, validated.displayName)
    // Do NOT return the token in the response body (H2).
    const response = withSecurityHeaders(NextResponse.json({ 
      user: { uid: user.uid, email: user.email, displayName: user.displayName }, 
    }))
    return response
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    const error = err as { code?: string; message?: string }
    // Return a generic message to prevent email enumeration (H5).
    // Do not reveal whether the email is already registered.
    return withSecurityHeaders(NextResponse.json({ error: 'Registration failed' }, { status: 500 }))
  }
}
