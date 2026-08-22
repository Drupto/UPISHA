import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit, getClientIp } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = loginSchema.parse(body)
    
    // Rate limiting — use IP + email to prevent bypass via email change (H3)
    const clientIp = getClientIp(request)
    const clientId = `${clientIp}:${validated.email}`
    if (!rateLimit(`login:${clientId}`, 5, 15 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 }))
    }

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
