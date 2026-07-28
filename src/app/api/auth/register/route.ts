import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { withSecurityHeaders, rateLimit } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)
    
    // Rate limiting
    if (!rateLimit(`register:${validated.email}`, 3, 60 * 60 * 1000)) {
      return withSecurityHeaders(NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 }))
    }

    const { user, token } = await registerUser(validated.email, validated.password, validated.displayName)
    const response = withSecurityHeaders(NextResponse.json({ 
      user: { uid: user.uid, email: user.email, displayName: user.displayName }, 
      token 
    }))
    return response
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'ZodError') {
      return withSecurityHeaders(NextResponse.json({ error: 'Invalid input data' }, { status: 400 }))
    }
    const error = err as { code?: string; message?: string }
    if (error.code === 'auth/email-already-in-use') {
      return withSecurityHeaders(NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 }))
    }
    return withSecurityHeaders(NextResponse.json({ error: 'Registration failed' }, { status: 500 }))
  }
}
