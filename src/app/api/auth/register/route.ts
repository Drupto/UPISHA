import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit, withCsrfProtection } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)
    
    // Rate limiting
    if (!rateLimit(`register:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 }))
    }

    // CSRF protection
    const csrfError = withCsrfProtection(request)
    if (csrfError) return csrfError

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
