import { NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const { user, token } = await loginUser(email, password)
    return NextResponse.json({ user: { uid: user.uid, email: user.email, displayName: user.displayName }, token })
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string }
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 })
  }
}