import { NextResponse } from 'next/server'
import { registerUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json()
    if (!email || !password || !displayName) return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 })

    const { user, token } = await registerUser(email, password, displayName)
    return NextResponse.json({ user: { uid: user.uid, email: user.email, displayName: user.displayName }, token })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 })
  }
}